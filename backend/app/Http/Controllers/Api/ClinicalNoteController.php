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
            'template_id' => 'nullable|exists:clinical_templates,id',
            'note_type' => 'required|in:SOAP,PROGRESS,DISCHARGE,TEMPLATE',
            'content' => 'required', // Can be string or array
            'status' => 'sometimes|in:DRAFT,SIGNED',
        ]);

        $validated['author_id'] = $request->user()->id;

        return ClinicalNote::create($validated);
    }

    public function show($id)
    {
        $note = ClinicalNote::findOrFail($id);
        $this->authorize('view', $note);
        return $note->load(['patient', 'author', 'amendments.actor', 'template']);
    }

    public function update(Request $request, $id)
    {
        $note = ClinicalNote::findOrFail($id);
        $this->authorize('update', $note);

        $validated = $request->request->all(); // Use all since content can be array or string

        // CDIM Rule 2.1: No Silent Overwrites
        if (!isset($validated['amendment_reason']) || empty($validated['amendment_reason'])) {
            return response()->json(['error' => 'Amendment reason is required.'], 422);
        }

        // CDIM Rule 2.1: No Silent Overwrites
        $note->recordAmendment($validated, $validated['amendment_reason']);

        return $note->load(['patient', 'author']);
    }
}
