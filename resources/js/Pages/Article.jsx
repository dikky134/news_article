import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Article({articles = [], filters = {}, categories = [], featuredArticles = [] }) 
{   
    const hasFeatured = featuredArticles && featuredArticles.length > 0;
    const filteredArticles = hasFeatured 
        ? articles.filter(art => art.id !== featuredArticles[0].id)
        : articles;

    const INITIAL_COUNT = 7;
    const LOAD_COUNT = 6;

    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
    const [scrollProgress, setScrollProgress] = useState(0);

    const [ selectedDate, setSelectedDate ] = useState(filters.date || '');

    const featuredArticle = filteredArticles[0];
    const sideArticles = filteredArticles.slice(1, 4);

    const bottomArticles = filteredArticles.slice(4);

    const visibleBottomArticles = bottomArticles.slice(
        0,
        Math.max(visibleCount - 4, 0)
    );

    useEffect(() => {
        setVisibleCount(INITIAL_COUNT);
    }, [articles]);

    useEffect(() => {
        setSelectedDate(filters.date || '');
    }, [filters.date]);

    useEffect(() => {
        const handleScroll = () => {
            const total =
                document.documentElement.scrollHeight - window.innerHeight;
            if (total <= 0) {
                setScrollProgress(0);
                return;
            }
            setScrollProgress((window.scrollY / total) * 100);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    console.log("Filters aktif:", filters);
    console.log("Jumlah artikel diterima:", articles.length);
    
    // --- LOGIKA FILTER UMUM ---
    const handleFilterChange = (key, value) => {
        let newFilters = { ...filters };

        if (key === 'RESET_ALL') {
            newFilters = {};
        } else if (!value || value === '') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }

        router.get('/articles', newFilters, { 
            preserveState: false, 
            replace: true 
        });
    };

    // --- LOGIKA KHUSUS KLIK KATEGORI (MENGHAPUS LOGIKA PENCARIAN) ---
    const handleCategoryClick = (categorySlug) => {
        router.get('/articles', {
            category: categorySlug || '',
            search: '',
            date: filters.date || null,
            _t: Date.now()
        }, {
            preserveState: false,
            replace: true
        });
    };

    // --- FUNGSI PEMBANTU UNTUK RESOLUSI URL GAMBAR ---
    const getThumbnailUrl = (thumbnailPath) => {
        if (!thumbnailPath) return '';

        if (
            thumbnailPath.startsWith('http://') ||
            thumbnailPath.startsWith('https://')
        ) {
            return thumbnailPath;
        }

        console.log("visibleCount =", visibleCount);
        return `https://ocxvxbjimyqcgndxvnsk.supabase.co/storage/v1/object/public/article-images/${thumbnailPath.replace('thumbnails/', '')}`;
    };

    return (
        <MainLayout activePage={(typeof filters.category === 'object' ? filters.category?.slug : filters.category) || "articles"}>
            <Head title="Articles | The Modern Broadsheet" />

            {/* Reading Progress Bar */}
            <div 
                className="fixed top-0 left-0 h-[2px] bg-secondary dark:bg-amber-500 z-[100] transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            <main className="max-w-content-max-width mx-auto px-margin-edge py-16 bg-surface dark:bg-[#121212] dark:text-on-secondary border-outline-variant dark:border-zinc-800">
                {/* Page Header */}
                <header className="mb-12 border-b border-outline-variant pb-8">
                    {/* Header Top Section */}
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <span className="font-label-caps text-secondary dark:text-amber-500 block mb-4 uppercase tracking-[0.3em] text-[12px]">
                                Archive Edition â€” {new Date().getFullYear()}
                            </span>
                            <h1 className="font-display-xl text-headline-lg md:text-6xl max-w-4xl leading-tight uppercase italic">
                                {filters.category 
                                    ? (typeof filters.category === 'object' 
                                        ? filters.category.name 
                                        : filters.category.replace(/-/g, ' '))
                                    : "The Newsroom"
                                }
                            </h1>
                        </div>
                        <div className="hidden md:block text-right">
                            <span className="font-display-md text-4xl block">{articles.length}</span>
                            <span className="font-label-caps text-[10px] opacity-50 uppercase">Stories Found</span>
                        </div>
                    </div>

                    {/* --- FILTER UI --- */}
                    <div className="space-y-8">
                        {/* Category Pills */}
                        <div className="flex flex-col gap-4">
                            <span className="font-label-caps text-[10px] opacity-40 uppercase tracking-widest">Select Category</span>
                            {(() => {
                                const sortedCategories = categories 
                                    ? [...categories].sort((a, b) => a.name.localeCompare(b.name)) 
                                    : [];
                                return (
                                    <>
                                        {/* 1. TAMPILAN MOBILE */}
                                        <div className="block md:hidden w-full">
                                            <select
                                                value={filters.category || ''}
                                                // ðŸ’¡ Diubah menggunakan handleCategoryClick
                                                onChange={(e) => handleCategoryClick(e.target.value)}
                                                className="w-full bg-surface dark:bg-[#1e1e1e] border border-outline-variant dark:border-zinc-800 px-4 py-3 font-label-caps text-[12px] uppercase tracking-wider text-primary dark:text-white focus:outline-none focus:border-primary dark:focus:border-amber-500 rounded-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_auto] bg-[right_16px_center] bg-no-repeat"
                                            >
                                                <option value="">ALL TOPICS</option>
                                                {sortedCategories.map((cat) => (
                                                    <option key={cat.id} value={cat.slug}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* 2. TAMPILAN DESKTOP */}
                                        <div className="hidden md:flex flex-wrap gap-2">
                                            <button
                                                // ðŸ’¡ Diubah menggunakan handleCategoryClick
                                                onClick={() => handleCategoryClick('')}
                                                className={`px-5 py-2 font-label-caps text-[11px] border transition-all duration-300 ${
                                                    !filters.category 
                                                        ? 'bg-primary dark:bg-on-secondary text-white dark:text-primary border-primary' 
                                                        : 'border-outline-variant hover:border-secondary dark:hover:border-amber-500'
                                                }`}
                                            >
                                                ALL TOPICS
                                            </button>

                                            {sortedCategories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    // ðŸ’¡ Diubah menggunakan handleCategoryClick
                                                    onClick={() => handleCategoryClick(cat.slug)}
                                                    className={`px-5 py-2 font-label-caps text-[11px] border transition-all duration-300 uppercase ${
                                                        filters.category === cat.slug 
                                                            ? 'bg-primary dark:bg-on-secondary text-white dark:text-primary border-primary' 
                                                            : 'border-outline-variant hover:border-secondary dark:hover:border-amber-500'
                                                    }`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Custom Date Input */} 
                        <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/30 dark:border-zinc-800">
                            <span className="font-label-caps text-[10px] opacity-40 dark:opacity-60 uppercase tracking-widest dark:text-zinc-400">
                                Filter by Specific Date
                            </span>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <label className="font-label-caps text-[11px] text-60 uppercase dark:text-zinc-300">
                                        Date:
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            const targetDate = e.target.value;
                                            setSelectedDate(targetDate);
                                            handleFilterChange('date', targetDate);
                                        }}
                                        className="border border-outline-variant dark:border-zinc-700 px-3 py-1.5 text-xs font-body-md text-slate-800 dark:text-white focus:outline-secondary bg-transparent [color-scheme:light] dark:[color-scheme:dark]"
                                    />
                                </div>

                                {filters.date && typeof filters.date === 'string' && filters.date !== '' && (
                                    <button
                                        onClick={() => handleFilterChange('date', '')}
                                        className="font-label-caps text-[10px] bg-error-container text-red-600 dark:bg-red-950/40 dark:text-red-400 px-3 py-1.5 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors uppercase tracking-wider cursor-pointer"
                                    >
                                        Clear Date
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                        {/* Featured Large Card */}
                        {featuredArticle && (
                            <article className="md:col-span-8 group cursor-pointer">
                                <Link href={`/articles/${featuredArticle.slug}`}>
                                    <div className="relative overflow-hidden border border-outline-variant/30 mb-6 aspect-[16/9] bg-surface-container">
                                        <img 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105" 
                                            src={getThumbnailUrl(featuredArticle.thumbnail)} 
                                            alt={featuredArticle.title}
                                        />
                                        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
                                            <span className="bg-secondary dark:bg-amber-500 text-on-secondary font-label-caps text-xs px-2.5 py-1 md:px-3 md:shadow-lg uppercase">
                                                LATEST
                                            </span>
                                        </div>
                                    </div>
                                    <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-2 py-1 inline-block mb-3 uppercase">
                                        {featuredArticle.category?.name || 'Uncategorized'}
                                    </span>
                                    <h2 className="font-headline-md text-headline-md md:font-headline-lg md:text-headline-lg mb-4 group-hover:text-secondary dark:group-hover:text-amber-500 transition-colors uppercase leading-tight">
                                        {featuredArticle.title}
                                    </h2>
                                    <p className="font-body-lg text-body-lg mb-6 line-clamp-2 max-w-3xl text-on-surface-variant dark:text-on-primary-container text-justify">
                                        {featuredArticle.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-primary dark:text-on-secondary font-label-caps text-label-caps uppercase tracking-widest">
                                        <span>Read Full Story</span>
                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </div>
                                </Link>
                            </article>
                        )}

                        {/* Side Bento Column */}
                        <div className="md:col-span-4 flex flex-col gap-gutter border-l-0 md:border-l border-outline-variant pl-0 md:pl-gutter pb-6 md:pb-0 border-b md:border-b-0 mb-6 md:mb-0">
                            {sideArticles.map((item) => (
                                <article key={item.id} className="group cursor-pointer border-b border-outline-variant pb-6">
                                    <Link href={`/articles/${item.slug}`}>
                                        <div className="block md:hidden relative overflow-hidden border border-outline-variant/30 mb-4 aspect-[16/9] bg-surface-container">
                                            <img 
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105" 
                                                src={getThumbnailUrl(item.thumbnail)} 
                                                alt={item.title}
                                            />
                                        </div>

                                        <span className="font-label-caps text-label-caps text-secondary dark:text-amber-500 mb-2 block uppercase font-bold">
                                            {item.category?.name}
                                        </span>
                                        <h3 className="font-headline-md text-headline-md mb-2 group-hover:text-secondary dark:group-hover:text-amber-500 transition-colors leading-tight uppercase">
                                            {item.title}
                                        </h3>
                                        <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-primary-container mb-4 line-clamp-2">
                                            {item.excerpt}
                                        </p>
                                        <span className="font-label-caps text-[10px] text-outline uppercase">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </Link>
                                </article>
                            ))}
                        </div>

                        {/* Lower Grid Row */}
                        {visibleBottomArticles.map((item) => (
                            <article key={item.id} className="md:col-span-4 group cursor-pointer mt-8">
                                <Link href={`/articles/${item.slug}`}>
                                    <div className="aspect-[16/9] md:aspect-square border border-outline-variant/30 mb-6 overflow-hidden bg-surface-container">
                                        <img 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                                            src={getThumbnailUrl(item.thumbnail)} 
                                            alt={item.title}
                                        />
                                    </div>
                                    <span className="font-label-caps text-label-caps text-secondary dark:text-amber-500 mb-2 block uppercase font-bold">
                                        {item.category?.name}
                                    </span>
                                    <h3 className="font-headline-md text-headline-md mb-3 group-hover:text-secondary dark:group-hover:text-amber-500 transition-colors uppercase leading-tight">
                                        {item.title}
                                    </h3>
                                    <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-primary-container mb-6 line-clamp-3">
                                        {item.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-primary dark:text-on-secondary font-label-caps text-label-caps uppercase tracking-widest font-bold">
                                        <span>Read More</span>
                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center border border-dashed border-outline-variant">
                        <p className="font-display-md text-on-surface-variant">No articles found in this landscape.</p>
                        <button 
                            onClick={() => handleFilterChange('RESET_ALL', '')} 
                            className="text-secondary dark:text-amber-500 font-label-caps mt-4 inline-block underline cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {articles.length > 0 && (
                    <div className="mt-24 border-t border-outline-variant py-12 flex justify-between items-center">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">
                            Showing {Math.min(visibleCount, filteredArticles.length)} of {filteredArticles.length} Articles
                        </span>
                        <div className="flex gap-4">
                            <button
                                onClick={() =>
                                    setVisibleCount(prev =>
                                        Math.max(INITIAL_COUNT, prev - LOAD_COUNT)
                                    )
                                }
                                disabled={visibleCount <= INITIAL_COUNT}
                                className={`border border-outline px-8 py-3 font-label-caps text-label-caps hover:bg-surface-container dark:hover:text-primary transition-colors font-bold uppercase ${
                                    visibleCount <= INITIAL_COUNT
                                        ? "opacity-40 cursor-not-allowed"
                                        : "hover:bg-surface-container cursor-pointer"
                                }`}
                            >
                                Previous
                            </button>

                            <button
                                onClick={() =>
                                    setVisibleCount(prev =>
                                        Math.min(filteredArticles.length + 4, prev + LOAD_COUNT)
                                    )
                                }
                                disabled={visibleCount >= filteredArticles.length + 4}
                                className={`bg-primary dark:bg-on-secondary text-on-primary dark:text-primary px-8 py-3 font-label-caps text-label-caps hover:bg-secondary dark:hover:bg-amber-500 transition-colors font-bold uppercase ${
                                    visibleCount >= filteredArticles.length + 4
                                        ? "opacity-40 cursor-not-allowed"
                                        : "bg-primary text-white hover:bg-secondary cursor-pointer"
                                }`}
                            >
                                Load More
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </MainLayout>
    );
}