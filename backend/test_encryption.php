<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

use App\Models\Message;
use App\Models\User;
use App\Models\Conversation;

// Ensure we have a conversation
$conv = Conversation::first();
if (!$conv) {
    echo "No conversation found.\n";
    exit;
}

$user = User::where('id', 6)->first(); // Sarah
auth()->login($user);

$content = "Secret clinical note at " . now();
$msg = Message::create([
    'tenant_id' => $conv->tenant_id,
    'conversation_id' => $conv->id,
    'sender_id' => $user->id,
    'content' => $content
]);

echo "Message created ID: " . $msg->id . "\n";
echo "Plain content: " . $content . "\n";

// Check raw database content
$raw = DB::table('messages')->where('id', $msg->id)->first();
echo "Raw DB content: " . $raw->content . "\n";

if (strpos($raw->content, "Secret clinical note") === false) {
    echo "SUCCESS: Content is encrypted in DB!\n";
} else {
    echo "FAILURE: Content is plain text in DB!\n";
}

// Check if decryption works
$fetched = Message::find($msg->id);
echo "Fetched content: " . $fetched->content . "\n";

if ($fetched->content === $content) {
    echo "SUCCESS: Decryption works!\n";
} else {
    echo "FAILURE: Decryption failed!\n";
}
