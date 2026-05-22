import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function MainLayout({ children, activePage, categories = [] }) {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme === 'dark';
            
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

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

    const toggleTheme = () => setIsDark(!isDark);
    
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const { auth } = usePage().props;

    const { data, setData } = useForm({
        search: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();

        // Gunakan 'get' dari useForm atau router
        router.get(route('articles.index'), 
            { search: data.search }, 
            { 
                preserveState: true, 
                replace: true 
            }
        );
    };

    // Gunakan categories dari props jika ada, jika tidak pakai list default
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
        <div className="min-h-screen bg-background text-on-background font-body-md">
            {/* Header / Navbar */}
            <header className="bg-surface border-b border-outline-variant dark:border-b dark:border-on-secondary dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800">
                <div className="flex justify-between items-center w-full px-margin-edge max-w-content-max-width mx-auto">
                    
                    {/* Logo */}
                    <div className="font-display-xl text-headline-md font-bold tracking-tighter py-6">
                        <Link href="/">The Modern Broadsheet</Link>
                    </div>

                    {/* Navigasi Utama */}
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
                        
                    {/* Search */}
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
                        {auth.user ? (
                        <>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-secondary dark:text-amber-500 uppercase tracking-widest">
                                    {auth.user.role} {/* Akan muncul 'admin' atau 'reader' */}
                                </span>
                                <span className="text-sm font-medium uppercase tracking-tighter italic">
                                    {auth.user.name}
                                </span>
                            </div>

                            {/* Tombol Tulis Artikel HANYA untuk Admin */}
                            {auth.user.role === 'admin' && (
                                <Link 
                                    href={route('articles.create')} 
                                    className="bg-primary text-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-black/80 transition-all"
                                >
                                    + Write Story
                                </Link>
                            )}

                            <Link 
                                href={route('logout')} 
                                method="post" 
                                as="button" 
                                className="..."
                            >
                                Logout
                            </Link>
                        </>
                    ) : (
                        <Link href={route('login')} className="font-bold text-[11px] tracking-widest uppercase italic">
                            Sign In
                        </Link>
                    )}
                    {/* Menu & Tombol Pengubah Tema */}
                        <div className="flex items-center gap-6">
                            {/* Tombol Tema dengan Conditional Rendering Icon */}
                            <button 
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-surface-container dark:hover:bg-zinc-800 transition-colors duration-200 text-on-surface-variant dark:text-gray-300 cursor-pointer flex items-center justify-center"
                                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                <span className="material-symbols-outlined text-[22px]">
                                    {isDark ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Click Overlay */}
            {isCategoryOpen && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsCategoryOpen(false)}></div>
            )}

            {/* MAIN CONTENT AREA */}
            <main className="min-h-[60vh] bg-surface dark:bg-[#121212]">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-on-secondary w-full px-margin-edge py-16 flex flex-col items-center border-t border-outline-variant bg-surface-container-lowest mt-0,5">
                <div className="max-w-content-max-width w-full flex flex-col items-center text-center">
                    <div className="font-display-xl text-headline-md mb-8">The Modern Broadsheet</div>
                    <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-12">
                        {['Privacy Policy', 'Terms of Service', 'Contact Us', 'Newsletter'].map(link => (
                            <a key={link} className="font-label-caps text-label-caps hover:underline hover:text-secondary transition-all" href="#">
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