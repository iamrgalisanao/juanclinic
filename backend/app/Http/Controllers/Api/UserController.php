<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of users/doctors.
     */
    public function index()
    {
        return User::where('id', '!=', auth()->id())->get();
    }
}
