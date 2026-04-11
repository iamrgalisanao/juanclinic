<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmation - JuanClinic</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: white; padding: 3rem; border-radius: 2rem; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); max-width: 400px; text-align: center; }
        .icon { font-size: 3rem; margin-bottom: 1.5rem; }
        .success { color: #22c55e; }
        .error { color: #ef4444; }
        h1 { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #0f172a; }
        p { color: #64748b; font-size: 0.875rem; line-height: 1.6; }
        .brand { margin-top: 2rem; font-size: 0.75rem; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.2em; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon {{ $success ? 'success' : 'error' }}">
            {{ $success ? '✓' : '!' }}
        </div>
        <h1>{{ $success ? 'Confirmed' : 'Notice' }}</h1>
        <p>{{ $message }}</p>
        
        @if($success && isset($appointment))
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; text-align: left;">
                <p style="margin: 0; font-weight: 800; color: #475569;">{{ $appointment->appointment_date->format('l, F j, Y') }}</p>
                <p style="margin: 0; color: #94a3b8;">{{ $appointment->start_time }} @ {{ $appointment->branch->name }}</p>
            </div>
        @endif

        <div class="brand">JuanClinic HIS</div>
    </div>
</body>
</html>
