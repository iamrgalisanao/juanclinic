import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    // Adding authorization headers for private channels
    authEndpoint: 'http://localhost:8001/broadcasting/auth',
    auth: {
        headers: {
            // This will be set dynamically via handleSetEchoHeader
            'X-Simulated-User': localStorage.getItem('simulated_user_email') || ''
        }
    }
});

export const setEchoAuthHeader = (email) => {
    echo.options.auth.headers['X-Simulated-User'] = email;
    localStorage.setItem('simulated_user_email', email);
};

export default echo;
