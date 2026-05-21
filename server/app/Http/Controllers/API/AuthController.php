<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!auth()->attempt($credentials)) {
            return response()->json([
                'message' => 'अमान्य क्रेडेंशियल' // Invalid credentials
            ], 401);
        }

        $user = auth()->user();

        if ($user->role !== 'admin' && $user->role !== 'editor') {
            auth()->logout();
            return response()->json([
                'message' => 'अनधिकृत पहुंच! केवल एडमिन लॉगिन कर सकते हैं।' // Unauthorized! Only admins/editors can log in.
            ], 403);
        }

        $token = $user->createToken('admin_auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'सफलतापूर्वक लॉगिन किया गया'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'सफलतापूर्वक लॉगआउट किया गया'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
