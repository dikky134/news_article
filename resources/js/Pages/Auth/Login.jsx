import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    // 1. Menggunakan Inertia Form Helper
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // 2. Handler untuk Submit Form
    const handleSubmit = (e) => {
        e.preventDefault();
        // Mengirim data POST ke route 'login' Laravel
        post('/login');
    };

    return (
        <>
            <Head title="Sign In - The Modern Broadsheet" />
            
            {/* Google Material Symbols Link */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <div className="bg-background text-on-background flex flex-col min-h-screen font-['Work_Sans',sans-serif]">
                {/* Hero/Background Contextual Visual */}
                <div className="fixed inset-0 z-0 opacity-5 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
                </div>

                {/* Main Content */}
                <main className="flex-grow flex items-center justify-center relative z-10 px-[48px] py-[80px]">
                    <div className="w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant p-10 shadow-sm transition-all duration-300">
                        
                        {/* Branding Header */}
                        <div className="text-center mb-12">
                            <h1 className="font-['Newsreader'] text-[28px] font-bold tracking-tighter text-primary">
                                The Modern Broadsheet
                            </h1>
                            <div className="h-px w-12 bg-secondary mx-auto mt-6"></div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Input Email */}
                            <div>
                                <label className="text-[12px] font-bold tracking-[0.05em] text-on-surface-variant block mb-2" htmlFor="email">
                                    EMAIL ADDRESS
                                </label>
                                <input 
                                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-[16px] text-on-surface transition-colors" 
                                    id="email" 
                                    type="email"
                                    name="email" 
                                    placeholder="name@domain.com"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-secondary text-xs mt-1 italic">{errors.email}</p>
                                )}
                            </div>

                            {/* Input Password */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[12px] font-bold tracking-[0.05em] text-on-surface-variant" htmlFor="password">
                                        PASSWORD
                                    </label>
                                    <Link className="text-[10px] font-bold tracking-[0.05em] text-secondary hover:underline transition-all" href="#">
                                        FORGOT PASSWORD?
                                    </Link>
                                </div>
                                <input 
                                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-[16px] text-on-surface transition-colors" 
                                    id="password" 
                                    type="password"
                                    name="password" 
                                    placeholder="••••••••" 
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-secondary text-xs mt-1 italic">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me Checkbox */}
                            <div className="flex items-center">
                                <input 
                                    className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" 
                                    id="remember" 
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                />
                                <label className="ml-2 text-on-surface-variant text-sm" htmlFor="remember">
                                    Remember me for 30 days
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button 
                                className="w-full bg-primary text-on-primary py-4 text-[12px] font-bold tracking-widest hover:bg-on-surface-variant active:opacity-80 transition-all duration-300 disabled:opacity-50" 
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? 'SIGNING IN...' : 'SIGN IN'}
                            </button>
                        </form>

                        {/* Social Divider */}
                        <div className="relative my-8 text-center">
                            <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-outline-variant"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-surface-container-lowest px-4 text-[12px] font-bold tracking-[0.05em] text-on-surface-variant">
                                    OR CONTINUE WITH
                                </span>
                            </div>
                        </div>

                        {/* Social Logins */}
                        <div class="grid grid-cols-2 gap-4">
                            {/* Tombol Google */}
                            <a href="/auth/google" class="flex items-center justify-center gap-2 border border-outline-variant py-3 px-4 hover:bg-surface-container transition-colors font-body-md text-on-surface">
                                <span className="material-symbols-outlined text-[18px]">public</span>
                                <span>Google</span>
                            </a>

                            {/* Tombol Apple */}
                            <a href="/auth/apple" class="flex items-center justify-center gap-2 border border-outline-variant py-3 px-4 hover:bg-surface-container transition-colors font-body-md text-on-surface">
                                <span className="material-symbols-outlined text-[18px]">ios</span>
                                <span>Apple</span>
                            </a>
                        </div>

                        {/* Signup Link */}
                        <div className="mt-10 text-center">
                            <p className="text-on-surface-variant text-sm">
                                New to the broadsheet? 
                                <Link className="text-primary font-bold hover:underline decoration-secondary decoration-2 underline-offset-4 ml-1" href="/register">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}