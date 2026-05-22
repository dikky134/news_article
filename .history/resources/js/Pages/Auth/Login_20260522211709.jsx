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
        post('/login');
    };

    return (
        <>
            <Head title="Sign In - The Modern Broadsheet" />
            
            {/* Google Material Symbols Link */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            {/* Container Utama: 
                - Mode Terang: Latar belakang abu-abu sangat terang (bg-slate-50/50), teks gelap (text-zinc-900)
                - Mode Gelap: Latar belakang hitam pekat khas koran malam (dark:bg-[#0f0f10]), teks terang (dark:text-zinc-100)
            */}
            <div className="bg-slate-50/50 dark:bg-[#0f0f10] text-zinc-900 dark:text-zinc-100 flex flex-col min-h-screen font-['Work_Sans',sans-serif] transition-colors duration-300">
                
                {/* Dot Grid Background Visual */}
                <div className="fixed inset-0 z-0 opacity-5 dark:opacity-[0.02] pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                </div>

                {/* Main Content */}
                <main className="flex-grow flex items-center justify-center relative z-10 px-6 py-16 lg:px-[48px] lg:py-[80px]">
                    
                    {/* Kotak Card Utama:
                        - Mode Terang: Background putih murni, border abu-abu tipis (border-zinc-200)
                        - Mode Gelap: Background abu-abu gelap (dark:bg-[#161617]), border gelap (dark:border-zinc-800)
                    */}
                    <div className="w-full max-w-[440px] bg-white dark:bg-[#161617] border border-zinc-200 dark:border-zinc-800 p-8 lg:p-10 shadow-sm transition-all duration-300">
                        
                        {/* Branding Header */}
                        <div className="text-center mb-12">
                            <h1 className="font-['Newsreader'] text-[28px] lg:text-[32px] font-bold tracking-tighter text-zinc-950 dark:text-zinc-50">
                                The Modern Broadsheet
                            </h1>
                            <div className="h-[2px] w-12 bg-red-700 dark:bg-amber-600 mx-auto mt-5"></div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Input Email */}
                            <div>
                                <label className="text-[11px] font-bold tracking-[0.05em] text-zinc-500 dark:text-zinc-400 block mb-2" htmlFor="email">
                                    EMAIL ADDRESS
                                </label>
                                <input 
                                    className={`w-full bg-transparent border-0 border-b py-2 text-[16px] text-zinc-900 dark:text-zinc-100 focus:ring-0 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors ${
                                        errors.email 
                                            ? 'border-red-500 bg-red-50/50 dark:bg-red-950/10 px-2' 
                                            : 'border-zinc-300 dark:border-zinc-700'
                                    }`} 
                                    id="email" 
                                    type="email"
                                    name="email" 
                                    placeholder="name@domain.com"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-1 italic font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* Input Password */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[11px] font-bold tracking-[0.05em] text-zinc-500 dark:text-zinc-400" htmlFor="password">
                                        PASSWORD
                                    </label>
                                    <Link className="text-[11px] font-bold tracking-[0.05em] text-red-700 dark:text-red-400 hover:underline transition-all" href="#">
                                        FORGOT PASSWORD?
                                    </Link>
                                </div>
                                <input 
                                    className={`w-full bg-transparent border-0 border-b py-2 text-[16px] text-zinc-900 dark:text-zinc-100 focus:ring-0 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors ${
                                        errors.password 
                                            ? 'border-red-500 px-2' 
                                            : 'border-zinc-300 dark:border-zinc-700'
                                    }`} 
                                    id="password" 
                                    type="password"
                                    name="password" 
                                    placeholder="••••••••" 
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-1 italic font-medium">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me Checkbox */}
                            <div className="flex items-center">
                                <input 
                                    className="w-4 h-4 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 rounded focus:ring-0 bg-transparent cursor-pointer" 
                                    id="remember" 
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                />
                                <label className="ml-2 text-zinc-600 dark:text-zinc-400 text-sm select-none cursor-pointer" htmlFor="remember">
                                    Remember me for 30 days
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button 
                                className="w-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 py-4 text-[12px] font-bold tracking-widest hover:bg-red-700 dark:hover:bg-amber-500 dark:hover:text-zinc-900 transition-colors duration-300 disabled:opacity-50 cursor-pointer" 
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? 'SIGNING IN...' : 'SIGN IN'}
                            </button>
                        </form>

                        {/* Social Divider */}
                        <div className="relative my-8 text-center">
                            <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white dark:bg-[#161617] px-4 text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
                                    OR CONTINUE WITH
                                </span>
                            </div>
                        </div>

                        {/* Social Logins */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Tombol Google */}
                            <a href="/auth/google" className="flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700 py-3 px-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                <span className="material-symbols-outlined text-[18px]">public</span>
                                <span>Google</span>
                            </a>

                            {/* Tombol Apple */}
                            <a href="/auth/apple" className="flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700 py-3 px-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                <span className="material-symbols-outlined text-[18px]">ios</span>
                                <span>Apple</span>
                            </a>
                        </div>

                        {/* Signup Link */}
                        <div className="mt-10 text-center">
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                New to the broadsheet? 
                                <Link className="text-zinc-900 dark:text-zinc-100 font-bold hover:underline decoration-red-700 dark:decoration-amber-500 decoration-2 underline-offset-4 ml-1" href="/register">
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