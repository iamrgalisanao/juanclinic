<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index()
    {
        return \App\Models\Patient::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_external_id' => 'nullable|string',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'dob' => 'required|date',
            'gender' => 'required|in:M,F,O',
            'contact' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        return \App\Models\Patient::create($validated);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
