import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Article({ articles = [], filters = [], categories = [] }) {
    // Logika pemisahan artikel untuk desain Bento
    const featuredArticle = articles[0]; // Artikel paling baru (Besar)
    const sideArticles = articles.slice(1, 4); // Artikel posisi 2 & 3
    const bottomArticles = articles.slice(4); // Sisa artikel

    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (totalScroll > 0) {
                const currentScroll = window.scrollY;
                const progress = (currentScroll / totalScroll) * 100;
                setScrollProgress(progress);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    console.log("Filters aktif:", filters);
    console.log("Jumlah artikel diterima:", articles.length);
    
    // Logika Filter
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        if (!value) delete newFilters[key];
        router.get('/articles', newFilters, { preserveState: true });
    };

    return (
        <MainLayout activePage={filters.category || "articles"}>
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
                                Archive Edition — {new Date().getFullYear()}
                            </span>
                            <h1 className="font-display-xl text-headline-lg md:text-6xl max-w-4xl leading-tight uppercase italic">
                                {filters.category ? filters.category.replace(/-/g, ' ') : "The Newsroom"}
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
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleFilterChange('category', '')}
                                    className={`px-5 py-2 font-label-caps text-[11px] border transition-all duration-300 ${!filters.category ? 'bg-primary dark:bg-on-secondary text-white dark:text-primary border-primary' : 'border-outline-variant hover:border-amber-500'}`}
                                >
                                    ALL TOPICS
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleFilterChange('category', cat.slug)}
                                        className={`px-5 py-2 font-label-caps text-[11px] border transition-all duration-300 uppercase ${filters.category === cat.slug ? 'bg-primary dark:bg-on-secondary text-white dark:text-primary border-primary' : 'border-outline-variant hover:border-amber-500'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Date Input (Satu Tanggal Spesifik) */} 
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
                                        value={(typeof filters.date === 'string') ? filters.date : ''}
                                        onChange={(e) => handleFilterChange('date', e.target.value)}
                                        className="border border-outline-variant dark:border-zinc-700 px-3 py-1.5 text-xs font-body-md text-slate-800 dark:text-white focus:outline-secondary bg-transparent [color-scheme:light] dark:[color-scheme:dark]"
                                    />
                                </div>

                                {/* Tombol Reset Tanggal */}
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
                                            src={featuredArticle.thumbnail || 'https://via.placeholder.com/800x450'} 
                                            alt={featuredArticle.title}
                                        />
                                    </div>
                                    <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-2 py-1 inline-block mb-3 uppercase">
                                        {featuredArticle.category?.name || 'Uncategorized'}
                                    </span>
                                    <h2 className="font-headline-lg text-headline-lg mb-4 group-hover:text-amber-500 transition-colors uppercase">
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
                        <div className="md:col-span-4 flex flex-col gap-gutter">
                            {sideArticles.map((item) => (
                                <article key={item.id} className="group cursor-pointer border-b border-outline-variant pb-6">
                                    <Link href={`/articles/${item.slug}`}>
                                        <span className="font-label-caps text-label-caps text-secondary dark:text-amber-500 mb-2 block uppercase font-bold">
                                            {item.category?.name}
                                        </span>
                                        <h3 className="font-headline-md text-headline-md mb-2 group-hover:text-amber-500 transition-colors leading-tight uppercase">
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
                        {bottomArticles.map((item) => (
                            <article key={item.id} className="md:col-span-4 group cursor-pointer mt-8">
                                <Link href={`/articles/${item.slug}`}>
                                    <div className="aspect-square border border-outline-variant/30 mb-6 overflow-hidden bg-surface-container">
                                        <img 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                                            src={item.thumbnail || 'https://via.placeholder.com/400x400'} 
                                            alt={item.title}
                                        />
                                    </div>
                                    <span className="font-label-caps text-label-caps text-secondary dark:text-amber-500 mb-2 block uppercase font-bold">
                                        {item.category?.name}
                                    </span>
                                    <h3 className="font-headline-md text-headline-md mb-3 group-hover:text-amber-500 transition-colors uppercase">
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
                            onClick={() => {
                                handleFilterChange('date', '');
                                handleFilterChange('category', '');
                                handleFilterChange('search', '');
                            }} 
                            className="text-secondary font-label-caps mt-4 inline-block underline cursor-pointer"
                        >
                            Clear filter
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {articles.length > 0 && (
                    <div className="mt-24 border-t border-outline-variant py-12 flex justify-between items-center">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">
                            Showing {articles.length} Articles
                        </span>
                        <div className="flex gap-4">
                            <button className="border border-outline px-8 py-3 font-label-caps text-label-caps hover:bg-surface-container dark:hover:text-primary transition-colors font-bold uppercase">
                                Previous
                            </button>
                            <button className="bg-primary dark:bg-on-secondary text-on-primary px-8 py-3 font-label-caps text-label-caps hover:bg-secondary dark:hover:bg-amber-500 transition-colors font-bold uppercase">
                                Load More
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </MainLayout>
    );
}