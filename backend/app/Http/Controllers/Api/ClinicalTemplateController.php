<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicalTemplate;
use Illuminate\Http\Request;

class ClinicalTemplateController extends Controller
{
    public function index()
    {
        return ClinicalTemplate::where('is_active', true)->get();
    }
}
