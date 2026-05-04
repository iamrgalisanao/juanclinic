import React, { useState } from 'react';
import { login } from '../services/api';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            const data = await login(credentials);
            onLoginSuccess(data.user, data.token, data.tenant);
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: 'An unexpected connection error occurred.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center md:p-6 p-4 relative overflow-hidden bg-slate-900">
            {/* Background Image / Overlay */}
            <div
                className="absolute inset-0 opacity-40 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] hover:scale-110"
                style={{ backgroundImage: 'url("/juanclinic-bg-desktop-1920x1080.jpg")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/40 to-transparent" />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-lg md:px-0 px-2 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="md:mb-12 mb-8 text-center">
                    <div className="md:w-20 md:h-20 w-16 h-16 bg-his-green-500 rounded-3xl flex items-center justify-center text-white mx-auto md:mb-6 mb-4 shadow-2xl shadow-his-green-500/20">
                        <svg className="md:w-12 md:h-12 w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" /></svg>
                    </div>
                    <h1 className="md:text-5xl text-3xl font-black text-white tracking-tighter uppercase italic">JUAN CLINIC</h1>
                    <p className="text-his-green-500 font-bold md:text-sm text-[10px] tracking-[0.4em] md:mt-3 mt-2 uppercase">Health Information System</p>
                </div>

                <div className="bg-white/10 backdrop-blur-3xl md:rounded-[3rem] rounded-[2rem] md:p-12 p-8 border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="md:space-y-8 space-y-6">
                        {errors.general && (
                            <div className="p-4 bg-rose-500/20 border border-rose-500/20 rounded-2xl text-rose-200 text-xs font-bold text-center animate-in shake duration-500 italic">
                                {errors.general}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Credential</label>
                            <input
                                type="email"
                                required
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                className={`w-full md:px-8 px-6 md:py-5 py-4 bg-white/5 border ${errors.email ? 'border-rose-500' : 'border-white/10'} rounded-2xl text-white font-bold focus:bg-white/10 focus:border-his-green-500 transition-all outline-none placeholder:text-slate-600`}
                                placeholder="name@organization.com"
                            />
                            {errors.email && <p className="text-[10px] font-bold text-rose-400 ml-1 italic">{errors.email[0]}</p>}
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Encrypted Password</label>
                            <input
                                type="password"
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className={`w-full md:px-8 px-6 md:py-5 py-4 bg-white/5 border ${errors.password ? 'border-rose-500' : 'border-white/10'} rounded-2xl text-white font-bold focus:bg-white/10 focus:border-his-green-500 transition-all outline-none placeholder:text-slate-600`}
                                placeholder="••••••••"
                            />
                            <div className="absolute md:right-6 right-5 md:top-11 top-10 text-slate-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            {errors.password && <p className="text-[10px] font-bold text-rose-400 ml-1 italic">{errors.password[0]}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:py-6 py-4 bg-his-green-500 text-white text-xs font-black rounded-3xl hover:bg-his-green-400 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.3em] shadow-2xl shadow-his-green-500/20 group relative overflow-hidden"
                        >
                            <span className={loading ? 'opacity-0' : 'relative z-10'}>Authorize Session</span>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </button>

                        <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                            <a href="#" className="hover:text-his-green-500 transition-colors">Request Access</a>
                            <a href="#" className="hover:text-his-green-500 transition-colors">Credential Recovery</a>
                        </div>
                    </form>
                </div>

                <div className="md:mt-12 mt-8 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] space-y-1">
                    <p>© 2026 JUAN CLINIC • High Assurance HIS</p>
                    <p className="text-slate-700">ISO 27001 • RA 10173 COMPLIANT</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
