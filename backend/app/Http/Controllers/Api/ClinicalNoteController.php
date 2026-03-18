<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicalNote;
use Illuminate\Http\Request;

class ClinicalNoteController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ClinicalNote::class);
        return ClinicalNote::with(['patient', 'author'])->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', ClinicalNote::class);

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'note_type' => 'required|in:SOAP,PROGRESS,DISCHARGE',
            'content' => 'required|string',
            'status' => 'sometimes|in:DRAFT,SIGNED',
        ]);

        $validated['author_id'] = $request->user()->id;

        return ClinicalNote::create($validated);
    }

    public function show($id)
    {
        $note = ClinicalNote::findOrFail($id);
        $this->authorize('view', $note);
        return $note->load(['patient', 'author', 'amendments.actor']);
    }

    public function update(Request $request, $id)
    {
        $note = ClinicalNote::findOrFail($id);
        $this->authorize('update', $note);

        $validated = $request->validate([
            'content' => 'sometimes|string',
            'status' => 'sometimes|in:DRAFT,SIGNED',
            'amendment_reason' => 'required|string|max:255',
        ]);

        // CDIM Rule 2.1: No Silent Overwrites
        $note->recordAmendment($validated, $validated['amendment_reason']);

        return $note->load(['patient', 'author']);
    }
}
