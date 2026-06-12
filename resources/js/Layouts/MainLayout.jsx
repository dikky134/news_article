import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import EditorialSkeleton from '@/Pages/EditorialSkeleton';
import axios from 'axios';

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

        const unbindStart = router.on('start', startProgress);
        const unbindFinish = router.on('finish', endProgress);

        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    const toggleTheme = () => setIsDark(!isDark);
    
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    const getRoleName = (roleData) => {
        if (!roleData) return '';
        if (typeof roleData === 'object') {
            return roleData.name || '';
        }
        return roleData;
    };

    const { data, setData } = useForm({
        search: '',
    });
    
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        if (!data.search.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        setIsSearching(true);
        setShowDropdown(true);

        const delaySearchTimer = setTimeout(() => {
            axios.get(`/api/articles/search?q=${data.search}`)
                .then(response => {
                    setSearchResults(response.data);
                    setIsSearching(false);
                })
                .catch(error => {
                    console.error("Pencarian global gagal:", error);
                    setIsSearching(false);
                });
        }, 300);

        return () => clearTimeout(delaySearchTimer);
    }, [data.search]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setShowDropdown(false);
        setIsMobileMenuOpen(false); // Tutup menu mobile jika menekan Enter
        router.get(route('articles.index'), 
            { search: data.search }, 
            { 
                preserveState: true, 
                replace: true 
            }
        );
    };

    return (
        <div className="w-full min-h-screen overflow-x-hidden bg-background text-on-background font-body-md bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800">
            
            {/* Header / Navbar */}
            <header className="w-full bg-surface border-b border-outline-variant dark:border-b dark:border-on-secondary dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800 relative z-50">
                <div className="flex justify-between items-center w-full px-4 md:px-margin-edge max-w-content-max-width mx-auto">
                    
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
                        
                        {/* INPUT LIVE SEARCH DESKTOP */}
                        <div ref={searchContainerRef} className="hidden lg:block relative">
                            <form onSubmit={handleSearch}>
                                <input 
                                    className="bg-transparent border-b border-outline px-2 py-1 focus:outline-none focus:border-primary text-body-md w-32 focus:w-48 transition-all dark:border-zinc-700 dark:focus:border-amber-500" 
                                    placeholder="Search..." 
                                    type="text"
                                    value={data.search}
                                    onChange={e => setData('search', e.target.value)}
                                    onFocus={() => data.search.trim() && setShowDropdown(true)}
                                />
                                {isSearching && (
                                    <span className="absolute right-2 top-1.5 text-[10px] text-zinc-400 animate-pulse font-mono">...</span>
                                )}
                            </form>

                            {/* DROPDOWN OVERLAY HASIL PENCARIAN DESKTOP */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white dark:bg-zinc-900 border border-outline-variant dark:border-zinc-800 shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 rounded-sm">
                                    {searchResults.length === 0 ? (
                                        <div className="p-4 text-xs text-zinc-500 italic text-center">
                                            No results found for "{data.search}"
                                        </div>
                                    ) : (
                                        searchResults.map((result) => (
                                            <Link 
                                                key={result.id} 
                                                href={`/articles/${result.id}/edit`} 
                                                onClick={() => setShowDropdown(false)}
                                                className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-left block w-full group"
                                            >
                                                <div className="truncate">
                                                    <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-secondary dark:group-hover:text-amber-500 transition truncate">
                                                        {result.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">
                                                            {result.category?.name || 'Uncategorized'}
                                                        </span>
                                                        <span className={`text-[8px] font-mono px-1 border uppercase tracking-wider ${
                                                            result.status === 'published' 
                                                                ? 'border-green-200 text-green-600 bg-green-50 dark:border-green-950/50 dark:text-green-400 dark:bg-green-950/20' 
                                                                : 'border-amber-200 text-amber-600 bg-amber-50 dark:border-amber-950/50 dark:text-amber-400 dark:bg-amber-950/20'
                                                        }`}>
                                                            {result.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="material-symbols-outlined text-[14px] text-zinc-400 group-hover:translate-x-0.5 transition-transform">
                                                    arrow_forward_ios
                                                </span>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Area Otentikasi User (Desktop Only) */}
                        <div className="hidden md:flex items-center gap-6">
                            {user ? (
                            <>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-secondary dark:text-amber-500 uppercase tracking-widest">
                                        {getRoleName(user.role)}
                                    </span>
                                    <span className="text-sm font-medium uppercase tracking-tighter italic">
                                        {user.name}
                                    </span>
                                </div>

                                {getRoleName(user.role) === 'admin' && (
                                    <Link 
                                        href="/create" 
                                        className="bg-primary dark:bg-on-secondary text-white dark:text-primary px-4 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-secondary dark:hover:bg-amber-500 transition-all"
                                    >
                                        + Write Story
                                    </Link>
                                )}

                                <Link 
                                    href={route('logout')} 
                                    method="post" 
                                    as="button" 
                                    className="text-sm font-medium hover:text-red-600 transition-colors cursor-pointer"
                                >
                                    Logout
                                </Link>
                            </>
                            ) : (
                                <a 
                                    href="/login"
                                    className="font-bold text-[11px] hover:text-secondary dark:hover:text-amber-500 tracking-widest uppercase italic cursor-pointer"
                                >
                                    Sign In
                                </a>
                            )}
                        </div>

                        {/* Menu & Tombol Pengubah Tema */}
                        <div className="flex items-center gap-4">
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

                {/* Panel Menu Drop-Down Mobile */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-surface dark:bg-[#121212] border-b border-outline-variant dark:border-zinc-800 px-6 py-6 shadow-xl space-y-4 z-50">
                        
                        {/* FORM SEARCH UTK MOBILE */}
                        <div className="relative w-full mb-4">
                            <form onSubmit={handleSearch}>
                                <input 
                                    className="w-full bg-transparent border-b border-outline px-2 py-2 focus:outline-none focus:border-primary text-body-md dark:border-zinc-700 dark:text-white" 
                                    placeholder="Search articles..." 
                                    type="text"
                                    value={data.search}
                                    onChange={e => setData('search', e.target.value)}
                                    onFocus={() => data.search.trim() && setShowDropdown(true)}
                                />
                                {isSearching && (
                                    <span className="absolute right-2 top-3 text-[10px] text-zinc-400 animate-pulse font-mono">...</span>
                                )}
                            </form>

                            {/* DROPDOWN OVERLAY HASIL PENCARIAN MOBILE */}
                            {showDropdown && (
                                <div className="absolute left-0 right-0 mt-2 w-full bg-white dark:bg-zinc-900 border border-outline-variant dark:border-zinc-800 shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 rounded-sm">
                                    {searchResults.length === 0 ? (
                                        <div className="p-4 text-xs text-zinc-500 italic text-center">
                                            No results found for "{data.search}"
                                        </div>
                                    ) : (
                                        searchResults.map((result) => (
                                            <Link 
                                                key={result.id} 
                                                href={`/articles/${result.id}/edit`} 
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-800 transition flex items-center justify-between gap-3 text-left block w-full group"
                                            >
                                                <div className="truncate">
                                                    <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-secondary dark:group-hover:text-amber-500 transition truncate">
                                                        {result.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">
                                                            {result.category?.name || 'Uncategorized'}
                                                        </span>
                                                        <span className={`text-[8px] font-mono px-1 border uppercase tracking-wider ${
                                                            result.status === 'published' 
                                                                ? 'border-green-200 text-green-600 bg-green-50 dark:border-green-950/50 dark:text-green-400 dark:bg-green-950/20' 
                                                                : 'border-amber-200 text-amber-600 bg-amber-50 dark:border-amber-950/50 dark:text-amber-400 dark:bg-amber-950/20'
                                                        }`}>
                                                            {result.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="material-symbols-outlined text-[14px] text-zinc-400">
                                                    arrow_forward_ios
                                                </span>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* LINK NAVIGASI UTAMA MOBILE */}
                        <div className="flex flex-col gap-3 font-medium">
                            <Link 
                                href="/" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`py-2 border-b border-zinc-100 dark:border-zinc-900 ${activePage === 'home' ? 'text-secondary dark:text-amber-500' : 'text-primary dark:text-white'}`}
                            >
                                Home
                            </Link>
                            
                            {['articles', 'trending', 'about'].map((item) => (
                                <Link 
                                    key={item}
                                    href={item === 'articles' ? route('articles.index') : `/${item}`} 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`py-2 border-b border-zinc-100 dark:border-zinc-900 capitalize ${activePage === item ? 'text-secondary dark:text-amber-500' : 'text-primary dark:text-white'}`}
                                >
                                    {item}
                                </Link>
                            ))}

                            {/* AUTHENTICATION LINKS UNTUK MOBILE */}
                            {user ? (
                                <div className="pt-2 space-y-3">
                                    <div className="text-xs text-zinc-400">
                                        Signed in as <span className="font-bold text-primary dark:text-white">{user.name}</span> ({getRoleName(user.role)})
                                    </div>
                                    {getRoleName(user.role) === 'admin' && (
                                        <Link 
                                            href="/create" 
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block text-center bg-primary dark:bg-zinc-800 text-white p-2 text-xs font-bold uppercase tracking-wider"
                                        >
                                            + Write Story
                                        </Link>
                                    )}
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full text-left py-2 text-red-600 font-medium"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            ) : (
                                <Link 
                                    href="/login" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-center border border-primary dark:border-zinc-700 py-2 text-xs font-bold uppercase tracking-wider mt-2"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Click Overlay */}
            {isCategoryOpen && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsCategoryOpen(false)}></div>
            )}

            {/* Main Content Area */}
            <main className="w-full overflow-x-hidden max-w-content-max-width mx-auto px-4 md:px-margin-edge py-12 min-h-[60vh] bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800">
                {isPageLoading ? (
                    <EditorialSkeleton />
                ) : (
                    children
                )}
            </main>

            {/* Footer */}
            <footer className="w-full bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-on-secondary px-margin-edge py-16 flex flex-col items-center border-t border-outline-variant bg-surface-container-lowest m-0">
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