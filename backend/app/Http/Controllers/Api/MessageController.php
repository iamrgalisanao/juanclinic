<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\MessageSent;

class MessageController extends Controller
{
    /**
     * Display a listing of conversations (threads).
     */
    public function index()
    {
        return auth()->user()->conversations()
            ->with([
                'users',
                'messages' => function ($q) {
                    $q->latest()->limit(1);
                }
            ])
            ->get()
            ->map(function ($conv) {
                $lastMsg = $conv->messages->first();
                $otherUser = $conv->type === 'DM'
                    ? $conv->users->where('id', '!=', auth()->id())->first()
                    : null;

                return [
                    'id' => $conv->id,
                    'name' => $conv->type === 'DM' ? ($otherUser->name ?? 'Deleted User') : $conv->name,
                    'type' => $conv->type,
                    'avatar' => $conv->type === 'DM'
                        ? (isset($otherUser) ? collect(explode(' ', $otherUser->name))->map(fn($n) => $n[0])->join('') : '?')
                        : 'GP',
                    'role' => $conv->type === 'DM' ? ($otherUser->role ?? '') : 'GROUP',
                    'last_message' => $lastMsg->content ?? 'No messages yet',
                    'last_message_at' => $lastMsg->created_at ?? $conv->created_at,
                    'unread_count' => $conv->messages()
                        ->where('sender_id', '!=', auth()->id())
                        ->where(function ($q) use ($conv) {
                            if ($conv->pivot->last_read_at) {
                                $q->where('created_at', '>', $conv->pivot->last_read_at);
                            }
                        })
                        ->count(),
                ];
            })
            ->sortByDesc('last_message_at')
            ->values();
    }

    /**
     * Display message history for a conversation.
     */
    public function show($id)
    {
        $conversation = auth()->user()->conversations()->findOrFail($id);

        // Update last read
        $conversation->users()->updateExistingPivot(auth()->id(), ['last_read_at' => now()]);

        return $conversation->messages()->with('sender')->oldest()->get();
    }

    /**
     * Store a newly created message.
     */
    public function store(Request $request)
    {
        $request->validate([
            'conversation_id' => 'nullable|exists:conversations,id',
            'receiver_id' => 'nullable|exists:users,id', // For starting DMs from staff list
            'content' => 'required|string',
        ]);

        /** @var \App\Models\User $user */
        $user = auth()->user();
        $tenant = app('tenant');
        $conversationId = $request->conversation_id;

        // If a conversation_id is provided, ensure the sender is a participant.
        if ($conversationId) {
            $user->conversations()->findOrFail($conversationId);
        }

        // If no conversation_id, but receiver_id is present (DM discovery)
        if (!$conversationId && $request->receiver_id) {
            User::where('id', $request->receiver_id)
                ->where('tenant_id', $tenant->id)
                ->firstOrFail();

            $participants = [auth()->id(), $request->receiver_id];
            sort($participants);

            $conversation = Conversation::where('type', 'DM')
                ->where('tenant_id', $tenant->id)
                ->whereHas('users', function ($q) use ($participants) {
                    $q->whereIn('user_id', $participants);
                }, '=', 2)
                ->first();

            if (!$conversation) {
                $conversation = Conversation::create([
                    'type' => 'DM'
                ]);
                $conversation->users()->attach($participants);
            }
            $conversationId = $conversation->id;
        }

        if (!$conversationId) {
            return response()->json(['message' => 'Conversation or Receiver required'], 422);
        }

        $message = Message::create([
            'sender_id' => Auth::id(),
            'conversation_id' => $conversationId,
            'content' => $request->content,
        ]);

        // Broadcast the message instantly
        broadcast(new MessageSent($message->load('sender')))->toOthers();

        return response()->json($message, 201);
    }

    /**
     * Create a new group conversation.
     */
    public function createGroup(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        /** @var \App\Models\User $user */
        $user = auth()->user();
        $tenant = app('tenant');

        $participants = array_unique(array_merge($request->user_ids, [$user->id]));

        // Ensure all participants belong to the active tenant to prevent cross-tenant conversations.
        $validParticipantCount = User::whereIn('id', $participants)
            ->where('tenant_id', $tenant->id)
            ->count();
        if ($validParticipantCount !== count($participants)) {
            return response()->json(['message' => 'All participants must belong to the active tenant.'], 422);
        }

        $conversation = Conversation::create([
            'name' => $request->name,
            'type' => 'GROUP'
        ]);

        $conversation->users()->attach($participants);

        return response()->json($conversation, 201);
    }
}
