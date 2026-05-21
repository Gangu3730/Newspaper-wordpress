<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\NewsController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\AdvertisementController;

// Public endpoints
Route::post('/login', [AuthController::class, 'login']);

Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{slug}', [NewsController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/advertisements', [AdvertisementController::class, 'index']);

// Protected admin endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // News administration
    Route::post('/news', [NewsController::class, 'store']);
    Route::put('/news/{id}', [NewsController::class, 'update']);
    Route::delete('/news/{id}', [NewsController::class, 'destroy']);

    // Categories administration
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Advertisements administration
    Route::post('/advertisements', [AdvertisementController::class, 'store']);
    Route::put('/advertisements/{id}', [AdvertisementController::class, 'update']);
    Route::delete('/advertisements/{id}', [AdvertisementController::class, 'destroy']);
});
