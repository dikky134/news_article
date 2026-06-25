import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import EditorialSkeleton from '@/Pages/EditorialSkeleton';
import axios from 'axios';

export default function MainLayout({ children, activePage, categories = [] }) {
    // Fungsi: Mengelola state visibilitas (buka/tutup) menu navigasi pada tampilan perangkat seluler
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [openMenu, setOpenMenu] = useState(false);
    
    // Fungsi: Menginisialisasi dan menyimpan preferensi tema (Terang/Gelap) dari penyimpanan lokal browser
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Fungsi: Mengelola state untuk mengaktifkan antarmuka memuat (loading) saat berpindah halaman
    const [isPageLoading, setIsPageLoading] = useState(false);

    // Fungsi: Menerapkan kelas CSS 'dark' ke elemen root HTML agar mode gelap Tailwind aktif
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

    // Fungsi: Mengaitkan event listener Inertia.js untuk mendeteksi awal dan akhir perpindahan halaman
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

    // Fungsi: Membalikkan nilai boolean tema untuk beralih antara mode Terang dan Gelap
    const toggleTheme = () => setIsDark(!isDark);
    
    // Fungsi: Mengelola state visibilitas pop-up kategori menu
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    
    // Fungsi: Menarik data identitas otentikasi pengguna yang dibagikan secara global dari backend
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    // Fungsi: Mengamankan ekstraksi string nama peran pengguna untuk menghindari error jika data tidak tersedia
    const getRoleName = (roleData) => {
        if (!roleData) return '';
        if (typeof roleData === 'object') {
            return roleData.name || '';
        }
        return roleData;
    };

    // Fungsi: Menginisialisasi state formulir khusus untuk komponen mesin pencari (search bar)
    const { data, setData } = useForm({ search: '' });
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchContainerRef = useRef(null);

    // Fungsi: Memproses penelusuran API secara real-time dengan menunda eksekusi (debounce) selama 300ms
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

    // Fungsi: Menutup kotak hasil pencarian secara otomatis jika pengguna mengklik area luar elemen
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fungsi: Mengarahkan pengguna menuju halaman indeks artikel menggunakan query pencarian saat form di-submit
    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setShowDropdown(false);
        setIsMobileMenuOpen(false);
        router.get('/articles', 
            { search: data.search }, 
            { preserveState: true, replace: true }
        );
    };

    return (
        <div className="w-full min-h-screen overflow-x-hidden bg-background text-on-background font-body-md bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800">
            
            {/* Fungsi: Kerangka utama header website yang posisinya ditetapkan paling atas (z-50) */}
            <header className="w-full bg-surface border-b border-outline-variant dark:border-b dark:border-on-secondary dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800 relative z-50">
                <div className="flex justify-between items-center w-full px-4 md:px-margin-edge max-w-content-max-width mx-auto h-20">
                    
                    {/* Fungsi: Menampilkan tipografi logo website, diamankan dari penyusutan dengan flex-shrink-0 */}
                    <div className="font-display-xl text-headline-md font-bold tracking-tighter flex-shrink-0 pr-2">
                        <Link href="/">The Modern Broadsheet</Link>
                    </div>

                    {/* Fungsi: Barisan tautan navigasi menu utama yang hanya tampil pada layar besar (Desktop) */}
                    <nav className="hidden lg:flex items-center gap-8 h-full pl-4 pr-4">
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
                                href={`/${item}`} 
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
                        
                    {/* Fungsi: Membungkus elemen search, info akun, dan kontrol UI secara horizontal sejajar tanpa menumpuk */}
                    <div className="flex items-center gap-4 py-6 whitespace-nowrap">
                        
                        {/* Fungsi: Menampilkan kotak input formulir pencarian artikel */}
                        <div ref={searchContainerRef} className="hidden lg:block relative flex-shrink-0">
                            <form onSubmit={handleSearch}>
                                <input 
                                    className="bg-transparent border-b border-outline px-2 py-1 focus:outline-none focus:border-primary text-xs w-20 xl:w-48 transition-all dark:border-zinc-700 dark:focus:border-amber-500" 
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

                            {/* Fungsi: Menampilkan hasil pencarian prediktif dalam kotak melayang (dropdown) */}
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
                                                href={`/articles/${result.slug}`} 
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

                        {/* Fungsi: Menyusun tata letak status akun dan identitas pengguna khusus perangkat Desktop */}
                        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
                            {user ? (
                                <div className="relative">
                                    {/* Tombol Dropdown */}
                                    <button
                                        onClick={() => setOpenMenu(!openMenu)}
                                        className="flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                    >
                                        {user.role_id === 3 ? (
                                            <span className="text-[8px] font-bold bg-secondary dark:bg-amber-600 text-on-secondary dark:text-primary px-1.5 py-0.5 rounded uppercase">
                                                Super Admin
                                            </span>
                                        ) : user.role_id === 1 ? (
                                            <span className="text-[8px] font-bold bg-secondary dark:bg-amber-500 text-on-secondary dark:text-primary px-1.5 py-0.5 rounded uppercase">
                                                Admin
                                            </span>
                                        ) : null}

                                        <span className="text-sm font-medium">
                                            {user.name}
                                        </span>

                                        <svg
                                            className={`w-4 h-4 transition-transform ${openMenu ? "rotate-180" : ""}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {/* Isi Dropdown */}
                                    {openMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-50">

                                            {user.role_id === 3 && (
                                                <>
                                                    <Link
                                                        href="/admin/users"
                                                        className="block px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    >
                                                        Kelola User
                                                    </Link>

                                                    <Link
                                                        href="/admin/suggestions"
                                                        className="block px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    >
                                                        Inbox Saran
                                                    </Link>
                                                </>
                                            )}

                                            {[1, 3].includes(user.role_id) && (
                                                <Link
                                                    href="/create"
                                                    className="block px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                >
                                                    + Write Story
                                                </Link>
                                            )}

                                            <div className="border-t border-zinc-200 dark:border-zinc-700" />

                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="block w-full text-left px-4 py-3 text-red-600 dark:text-amber-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                Logout
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <a
                                    href="/login"
                                    className="font-bold text-[11px] hover:text-secondary dark:hover:text-amber-500 tracking-widest uppercase italic cursor-pointer pl-4 border-l border-zinc-300 dark:border-zinc-700"
                                >
                                    Sign In
                                </a>
                            )}
                        </div>

                        {/* Fungsi: Menyematkan tombol kendali penyesuaian tema visual dan tuas buka-tutup navigasi seluler */}
                        <div className="flex items-center gap-1 pl-2">
                            <button 
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-surface-container dark:hover:bg-zinc-800 transition-colors duration-200 text-on-surface-variant dark:text-gray-300 cursor-pointer flex items-center justify-center"
                                type="button"
                                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {isDark ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                type="button"
                                className="lg:hidden p-2 text-primary dark:text-white focus:outline-none cursor-pointer flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-[24px]">
                                    {isMobileMenuOpen ? 'close' : 'menu'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fungsi: Merender keseluruhan tautan navigasi website di dalam kerangka dropdown khusus ukuran smartphone */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-surface dark:bg-[#121212] border-b border-outline-variant dark:border-zinc-800 px-6 py-6 shadow-xl space-y-4 z-50">
                        
                        {/* Fungsi: Menyediakan modul formulir penelusuran versi vertikal */}
                        <div className="relative w-full mb-4">
                            <form onSubmit={handleSearch}>
                                <input 
                                    className="w-full bg-transparent border-b border-outline px-2 py-2 text-sm dark:border-zinc-700 dark:text-white" 
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

                            {/* Fungsi: Menampilkan blok hasil penelusuran secara dinamis */}
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
                                                href={`/articles/${result.slug}`} 
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

                        {/* Fungsi: Menyusun daftar perlintasan akses halaman utama secara bersusun */}
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
                                    href={`/${item}`} 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`py-2 border-b border-zinc-100 dark:border-zinc-900 capitalize ${activePage === item ? 'text-secondary dark:text-amber-500' : 'text-primary dark:text-white'}`}
                                >
                                    {item}
                                </Link>
                            ))}

                            {/* Fungsi: Mendeklarasikan identitas profil maupun kontrol pengelolaan sesi login pengguna perangkat bergerak */}
                            {user ? (
                                <div className="pt-2 space-y-3">
                                    <div className="text-xs text-zinc-400">
                                        Signed in as <span className="font-bold text-primary dark:text-white">{user.name}</span> ({user.role_id === 3 ? 'Super Admin' : user.role_id === 1 ? 'Admin' : 'User'})
                                    </div>
                                    
                                    {/* Fungsi: Memisahkan aksesibilitas pengelolaan sistem spesifik untuk hierarki puncak (Super Admin) */}
                                    {user.role_id === 3 && (
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <Link 
                                                href="/admin/users" 
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block text-center bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 p-2 text-[10px] font-bold uppercase tracking-wider"
                                            >
                                                Kelola User
                                            </Link>
                                            <Link 
                                                href="/admin/suggestions" 
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block text-center bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 p-2 text-[10px] font-bold uppercase tracking-wider"
                                            >
                                                Inbox Saran
                                            </Link>
                                        </div>
                                    )}

                                    {/* Fungsi: Menempatkan rute pelemparan halaman penulisan artikel */}
                                    {[1, 3].includes(user.role_id) && (
                                        <Link 
                                            href="/create" 
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block text-center bg-primary dark:bg-zinc-800 text-white p-2 text-xs font-bold uppercase tracking-wider"
                                        >
                                            + Write Story
                                        </Link>
                                    )}
                                    
                                    {/* Fungsi: Menyediakan tuas pemutusan rantai sesi autentikasi */}
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full text-left py-2 text-red-600 dark:text-amber-600 font-medium"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            ) : (
                                /* Fungsi: Menyediakan rute gerbang masuk sistem khusus pengguna perangkat seluler */
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

            {/* Fungsi: Meredupkan area latar belakang manakala interaksi dialog kategori difungsikan */}
            {isCategoryOpen && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsCategoryOpen(false)}></div>
            )}

            {/* Fungsi: Merancang wadah utama perepresentasi konten fleksibel di antara bilah navigasi dan catatan kaki */}
            <main className="w-full overflow-x-hidden max-w-content-max-width mx-auto px-4 md:px-margin-edge py-12 min-h-[60vh] bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800">
                {isPageLoading ? (
                    <EditorialSkeleton />
                ) : (
                    children
                )}
            </main>

            {/* Fungsi: Mengkonstruksi wilayah penutup halaman sebagai media penampil hak kepemilikan komersial */}
            <footer className="w-full bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-on-secondary px-margin-edge py-16 flex flex-col items-center border-t border-outline-variant bg-surface-container-lowest m-0">
                <div className="max-w-content-max-width w-full flex flex-col items-center text-center">
                    <div className="font-display-xl text-headline-md mb-8">The Modern Broadsheet</div>
                    <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-8">
                        {['Privacy Policy', 'Terms of Service', 'Contact Us', 'Newsletter'].map(link => (
                            <a key={link} className="font-label-caps text-label-caps hover:underline hover:text-secondary dark:hover:text-amber-500 transition-all" href="#">
                                {link}
                            </a>
                        ))}
                    </nav>

                    {/* Fungsi: Membukakan gerbang dialog penyaluran opini publik khusus pengguna terotentikasi */}
                    {user && (
                        <div className="mb-12">
                            <Link 
                                href="/suggestions/create" 
                                className="font-label-caps text-[11px] border border-secondary dark:border-amber-500 text-secondary dark:text-amber-500 px-4 py-2 hover:bg-secondary hover:text-white dark:hover:bg-amber-500 dark:hover:text-black transition-colors"
                            >
                                Kirim Saran & Masukan
                            </Link>
                        </div>
                    )}
                    
                    <div className="font-body-md text-sm">
                        © 2026 The Modern Broadsheet. All editorial rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}