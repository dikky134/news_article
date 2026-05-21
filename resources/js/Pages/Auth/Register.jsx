import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '', // Tetap ditambahkan sebagai hidden safety guard standar Laravel
        terms: false,
    });

    // Menangani pembersihan password jika proses registrasi gagal
    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    // State interaktif untuk pergerakan halus latar belakang dot-matrix
    const [bgPosition, setBgPosition] = useState('0px 0px');

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            setBgPosition(`${x * 10}px ${y * 10}px`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // State tracking interaksi fokus input untuk memicu perubahan warna label
    const [focusedInput, setFocusedInput] = useState('');

    const submit = (e) => {
        e.preventDefault();
        // Menyamakan password_confirmation secara otomatis agar validasi laravel sukses
        data.password_confirmation = data.password;
        post(route('register'));
    };

    return (
        <div 
            className="flex flex-col min-h-screen text-on-surface select-none transition-all duration-300"
            style={{
                backgroundColor: '#f8f9fa',
                backgroundImage: 'radial-gradient(#c6c6ca 0.5px, transparent 0.5px)',
                backgroundSize: '24px 24px',
                backgroundPosition: bgPosition
            }}
        >
            <Head title="Join the Broadsheet | The Modern Broadsheet" />

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center px-6 md:px-12 py-16">
                <div className="w-full max-w-[480px] bg-white border border-outline-variant p-10 md:p-12 shadow-sm transition-transform duration-500">
                    
                    {/* Branding */}
                    <div className="text-center mb-10">
                        <Link href="/" className="font-display-xl text-[28px] font-bold tracking-tighter text-primary uppercase font-serif">
                            The Modern Broadsheet
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-serif font-semibold text-on-surface mb-2">Join the Broadsheet</h1>
                        <p className="text-sm text-on-surface-variant font-sans">Start your journey into high-fidelity journalism.</p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* Full Name Input */}
                        <div className="space-y-1">
                            <label 
                                className={`text-[12px] font-bold tracking-wider uppercase block transition-colors duration-200 ${
                                    focusedInput === 'name' ? 'text-black' : 'text-on-surface-variant'
                                }`} 
                                htmlFor="name"
                            >
                                Full Name
                            </label>
                            <input 
                                className="w-full px-0 py-3 bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-black focus:ring-0 transition-colors text-base shadow-none outline-none"
                                id="name" 
                                name="name" 
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                onFocus={() => setFocusedInput('name')}
                                onBlur={() => setFocusedInput('')}
                                placeholder="Enter your full name" 
                                required 
                                type="text"
                            />
                            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                        </div>

                        {/* Email Address Input */}
                        <div className="space-y-1">
                            <label 
                                className={`text-[12px] font-bold tracking-wider uppercase block transition-colors duration-200 ${
                                    focusedInput === 'email' ? 'text-black' : 'text-on-surface-variant'
                                }`} 
                                htmlFor="email"
                            >
                                Email Address
                            </label>
                            <input 
                                className="w-full px-0 py-3 bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-black focus:ring-0 transition-colors text-base shadow-none outline-none"
                                id="email" 
                                name="email" 
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput('')}
                                placeholder="you@example.com" 
                                required 
                                type="email"
                            />
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                            <label 
                                className={`text-[12px] font-bold tracking-wider uppercase block transition-colors duration-200 ${
                                    focusedInput === 'password' ? 'text-black' : 'text-on-surface-variant'
                                }`} 
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <input 
                                className="w-full px-0 py-3 bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-black focus:ring-0 transition-colors text-base shadow-none outline-none"
                                id="password" 
                                name="password" 
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput('')}
                                placeholder="••••••••" 
                                required 
                                type="password"
                            />
                            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                        </div>

                        {/* Terms & Conditions Checkbox */}
                        <div className="flex items-start gap-3 py-2">
                            <input 
                                className="mt-1 h-4 w-4 rounded-sm border-gray-300 text-black focus:ring-0 cursor-pointer"
                                id="terms" 
                                name="terms" 
                                checked={data.terms}
                                onChange={(e) => setData('terms', e.target.checked)}
                                required 
                                type="checkbox"
                            />
                            <label className="text-[13px] leading-tight text-on-surface-variant cursor-pointer select-none" htmlFor="terms">
                                By creating an account, I agree to the{' '}
                                <a className="text-black underline underline-offset-2 hover:text-red-700 transition-colors" href="#">Terms and Conditions</a>
                                {' '}and{' '}
                                <a className="text-black underline underline-offset-2 hover:text-red-700 transition-colors" href="#">Privacy Policy</a>.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button 
                            disabled={processing}
                            className="w-full bg-black text-white py-4 text-xs font-bold tracking-wider hover:bg-gray-800 transition-all active:scale-[0.98] shadow-sm uppercase disabled:opacity-50"
                            type="submit"
                        >
                            {processing ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-outline-variant"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-xs tracking-wider text-on-surface-variant">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 border border-outline-variant py-3 px-4 hover:bg-gray-50 transition-colors text-sm text-on-surface">
                            <span className="material-symbols-outlined text-[18px]">public</span>
                            <span>Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 border border-outline-variant py-3 px-4 hover:bg-gray-50 transition-colors text-sm text-on-surface">
                            <span className="material-symbols-outlined text-[18px]">ios</span>
                            <span>Apple</span>
                        </button>
                    </div>

                    {/* Footer Redirect Link */}
                    <div className="mt-10 text-center">
                        <p className="text-sm text-on-surface-variant">
                            Already have an account?{' '}
                            <Link 
                                href={route('login')} 
                                className="text-red-700 font-bold hover:underline underline-offset-4 ml-1 transition-all"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}