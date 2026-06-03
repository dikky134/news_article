import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import EditorialSkeleton from '@/Pages/EditorialSkeleton';

export default function MainLayout({ children, activePage, categories = [] }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme === 'dark';
            
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    const [isPageLoading, setIsPageLoading] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    useEffect(() => {
        const startProgress = () => setIsPageLoading(true);
        const endProgress = () => setIsPageLoading(false);

        // Mendaftarkan event dan menyimpan fungsi pembersihnya
        const unbindStart = router.on('start', startProgress);
        const unbindFinish = router.on('finish', endProgress);

        // Bersihkan event listener saat komponen tidak lagi digunakan (unmount)
        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    const toggleTheme = () => setIsDark(!isDark);
    
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const { auth = {} } = usePage().props;

    const { data, setData } = useForm({
        search: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(route('articles.index'), 
            { search: data.search }, 
            { 
                preserveState: true, 
                replace: true 
            }
        );
    };

    const categoriesList = categories.length > 0 ? categories : [
        { id: 1, name: 'Economics', slug: 'economics' },
        { id: 2, name: 'Science', slug: 'science' },
        { id: 3, name: 'Culture', slug: 'culture' },
        { id: 4, name: 'Technology', slug: 'technology' },
        { id: 5, name: 'Workplace', slug: 'workplace' },
        { id: 6, name: 'Geopolitics', slug: 'geopolitics' },
        { id: 7, name: 'Education', slug: 'education' },
        { id: 8, name: 'Art & Design', slug: 'art & Design'}
    ];

    return (
        <div className="min-h-screen bg-background text-on-background font-body-md bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800">
            {/* Header / Navbar */}
            <header className="bg-surface border-b border-outline-variant dark:border-b dark:border-on-secondary dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800 relative z-50">
                <div className="flex justify-between items-center w-full px-margin-edge max-w-content-max-width mx-auto">
                    
                    {/* Logo */}
                    <div className="font-display-xl text-headline-md font-bold tracking-tighter py-6">
                        <Link href="/">The Modern Broadsheet</Link>
                    </div>

                    {/* Navigasi Utama (Desktop Only) */}
                    <nav className="hidden md:flex items-center gap-8 h-full">
                        <Link 
                            href="/" 
                            className={`relative py-6 transition-colors font-medium flex items-center group ${
                                activePage === 'home' 
                                    ? 'text-secondary dark:text-amber-500' 
                                    : 'text-slate-700 hover:text-secondary dark:text-on-secondary dark:hover:text-amber-500'
                            }`}
                        >
                            <span className={`pb-1 ${
                                activePage === 'home' 
                                    ? 'border-b-2 border-secondary dark:border-amber-500' 
                                    : 'group-hover:border-b-2 group-hover:border-secondary dark:group-hover:border-amber-500'
                            }`}>
                                Home
                            </span>
                        </Link>

                        {/* Nav Links */}
                        {['articles', 'trending', 'about'].map((item) => (
                            <Link 
                                key={item}
                                href={item === 'articles' ? route('articles.index') : `/${item}`} 
                                className={`relative py-6 transition-colors font-medium flex items-center group ${
                                    activePage === item 
                                        ? 'text-secondary dark:text-amber-500' 
                                        : 'text-primary hover:text-secondary dark:text-on-secondary dark:hover:text-amber-500'
                                }`}
                            >
                                <span className={`pb-1 capitalize ${
                                    activePage === item 
                                        ? 'border-b-2 border-secondary dark:border-amber-500' 
                                        : 'group-hover:border-b-2 group-hover:border-secondary dark:group-hover:border-amber-500'
                                }`}>
                                    {item}
                                </span>
                            </Link>
                        ))}
                    </nav>
                        
                    {/* Search & Actions (Kanan) */}
                    <div className="flex items-center gap-6 py-6">
                        <form onSubmit={handleSearch} className="hidden lg:block relative">
                            <input 
                                className="bg-transparent border-b border-outline px-2 py-1 focus:outline-none focus:border-primary text-body-md w-32 focus:w-48 transition-all" 
                                placeholder="Search..." 
                                type="text"
                                value={data.search}
                                onChange={e => setData('search', e.target.value)}
                            />
                        </form>

                        {/* Area Otentikasi Toko/User (Desktop Only) */}
                        <div className="hidden md:flex items-center gap-6">
                            {auth.user ? (
                                <>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-secondary dark:text-amber-500 uppercase tracking-widest">
                                            {auth.user.role}
                                        </span>
                                        <span className="text-sm font-medium uppercase tracking-tighter italic">
                                            {auth.user.name}
                                        </span>
                                    </div>

                                    {auth.user.role === 'admin' && (
                                        <Link 
                                            href={route('articles.create')} 
                                            className="bg-primary dark:bg-on-secondary text-white dark:text-primary px-4 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-amber-500 transition-all"
                                        >
                                            + Write Story
                                        </Link>
                                    )}

                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button" 
                                        className="text-sm font-medium hover:text-red-600 transition-colors"
                                    >
                                        Logout
                                    </Link>
                                </>
                            ) : (
                                <button 
                                    onClick={() => router.visit('/login')} 
                                    className="font-bold text-[11px] hover:text-secondary dark:hover:text-amber-500 tracking-widest uppercase italic cursor-pointer text-left"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>

                        {/* Menu & Tombol Pengubah Tema (Selalu Muncul) */}
                        <div className="flex items-center gap-4">
                            {/* Toggle Dark Mode */}
                            <button 
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-surface-container dark:hover:bg-zinc-800 transition-colors duration-200 text-on-surface-variant dark:text-gray-300 cursor-pointer flex items-center justify-center"
                                type="button"
                                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                <span className="material-symbols-outlined text-[22px]">
                                    {isDark ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>

                            {/* TOMBOL MENU MOBILE (Hanya Muncul di Layar Kecil) */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                type="button"
                                className="md:hidden p-2 text-primary dark:text-white focus:outline-none cursor-pointer flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-[26px]">
                                    {isMobileMenuOpen ? 'close' : 'menu'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* PANEL MENU DROP-DOWN MOBILE */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-surface dark:bg-[#121212] border-b border-outline-variant dark:border-zinc-800 px-6 py-6 shadow-xl space-y-4 animate-fade-in-down z-50">
                        {/* Search Bar Mobile */}
                        <form onSubmit={handleSearch} className="relative w-full mb-4">
                            <input 
                                className="w-full bg-transparent border-b border-outline px-2 py-2 focus:outline-none focus:border-primary text-body-md" 
                                placeholder="Search articles..." 
                                type="text"
                                value={data.search}
                                onChange={e => setData('search', e.target.value)}
                            />
                        </form>

                        {/* Links Navigasi */}
                        <div className="flex flex-col gap-3 font-medium">
                            <Link href="/" className="py-2 text-primary dark:text-white border-b border-zinc-100 dark:border-zinc-900">Home</Link>
                            <Link href={route('articles.index')} className="py-2 text-primary dark:text-white border-b border-zinc-100 dark:border-zinc-900">Articles</Link>
                            <Link href="/trending" className="py-2 text-primary dark:text-white border-b border-zinc-100 dark:border-zinc-900">Trending</Link>
                            <Link href="/about" className="py-2 text-primary dark:text-white border-b border-zinc-100 dark:border-zinc-900">About</Link>
                        </div>

                        {/* Status Login / Aksi Mobile */}
                        <div className="pt-4 border-t border-outline-variant dark:border-zinc-800">
                            {auth.user ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-900 p-3 rounded">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-secondary">{auth.user.role}</span>
                                            <span className="text-sm italic">{auth.user.name}</span>
                                        </div>
                                    </div>
                                    {auth.user.role === 'admin' && (
                                        <Link 
                                            href={route('articles.create')} 
                                            className="bg-primary dark:bg-secondary text-on-primary px-6 py-2 font-label-caps text-label-caps hover:bg-on-surface-variant transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit_note</span>
                                            Create Article
                                        </Link>
                                    )}
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button" 
                                        className="w-full text-center text-sm font-bold text-red-600 dark:text-red-400 py-2 border border-red-200 dark:border-red-950/50"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => {
                                        setIsMobileMenuOpen(false); // Tutup menu mobile terlebih dahulu
                                        router.visit('/login');
                                    }} 
                                    className="block w-full text-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 text-xs font-bold tracking-widest uppercase italic cursor-pointer"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Click Overlay */}
            {isCategoryOpen && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsCategoryOpen(false)}></div>
            )}

            {/* MAIN CONTENT AREA */}
            <main className="max-w-content-max-width mx-auto px-margin-edge py-12 min-h-[60vh] bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800">
                {isPageLoading ? (
                    /* Saat Inertia.js sedang menarik data halaman baru, tampilkan koran tiruan */
                    <EditorialSkeleton />
                ) : (
                    /* Ketika selesai, otomatis render halaman aslinya */
                    children
                )}
            </main>

            {/* Footer */}
            <footer className="bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-on-secondary w-full px-margin-edge py-16 flex flex-col items-center border-t border-outline-variant bg-surface-container-lowest mt-0.5">
                <div className="max-w-content-max-width w-full flex flex-col items-center text-center">
                    <div className="font-display-xl text-headline-md mb-8">The Modern Broadsheet</div>
                    <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-12">
                        {['Privacy Policy', 'Terms of Service', 'Contact Us', 'Newsletter'].map(link => (
                            <a key={link} className="font-label-caps text-label-caps hover:underline hover:text-secondary dark:hover:text-amber-500 transition-all" href="#">
                                {link}
                            </a>
                        ))}
                    </nav>
                    <div className="font-body-md text-sm">
                        © 2026 The Modern Broadsheet. All editorial rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}