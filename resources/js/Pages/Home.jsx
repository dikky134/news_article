import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Home({ mainHighlight, sideHighlights = [], featuredArticles = [] }) {
    console.log('Main:', mainHighlight);
    console.log('Sides:', sideHighlights);
    

    const hasFeatured = featuredArticles?.length > 0;
    const featuredArticle = featuredArticles?.[0];
    const otherFeatured = featuredArticles?.slice(1);

    const articlePages = () => {
        router.get(route('articles.index'));
    };
    console.log('featuredArticles:', featuredArticles);

    const [scrollProgress, setScrollProgress] = useState(0);
    
    // State untuk UI Modal/Popover Link Modern
    const [linkModal, setLinkModal] = useState({
        show: false,
        url: '',
        range: null // Menyimpan posisi seleksi teks kursor
    });

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
    
    const calculateMinRead = (item) => {
        if (!item) return "1 MIN READ";

        if (item.min_read && String(item.min_read).toUpperCase().includes('MIN')) {
            return item.min_read.toUpperCase();
        }

        if (item.min_read && !isNaN(item.min_read)) {
            return `${item.min_read} MIN READ`;
        }

        const textToEstimate = `${item.title || ''} ${item.excerpt || ''} ${item.content || ''}`;
        const wordsCount = textToEstimate.trim().split(/\s+/).filter(word => word.length > 0).length;

        const minutes = Math.max(1, Math.ceil(wordsCount / 200));
        return `${minutes} MIN READ`;
    };

    const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return '/images/default.jpg';

    if (
        thumbnailPath.startsWith('http://') ||
        thumbnailPath.startsWith('https://')
    ) {
        return thumbnailPath;
    }

    return `https://ocxvxbjimyqcgndxvnsk.supabase.co/storage/v1/object/public/article-images/${thumbnailPath.replace('thumbnails/', '')}`;
};

    return (
        <MainLayout activePage="home">
            <Head title="Home | The Modern Broadsheet" />

            {/* Reading Progress Bar */}
            <div 
                className="fixed top-0 left-0 h-[2px] bg-secondary dark:bg-amber-500 z-[100] transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            <main className="max-w-content-max-width mx-auto px-margin-edge bg-surface dark:bg-[#121212] dark:text-white border-outline-variant dark:border-zinc-800">
                {/* Hero Section */}
                <section className="py-section-gap grid grid-cols-12 gap-gutter items-center border-b border-outline-variant">
                    <div className="col-span-12 lg:col-span-7">
                        <span className="font-label-caps text-label-caps text-secondary dark:text-amber-500 mb-4 block tracking-[0.3em] font-bold">
                            ESTABLISHED 2024
                        </span>

                        <h2 className="font-headline-lg text-headline-lg md:text-headline-xl mb-4 font-bold leading-[1.2] tracking-normal">
                            A premier source for deep-dive journalism and breaking news, curated for the modern reader.
                        </h2>
                                                
                        <p className="font-body-sm text-body-sm max-w-md mb-6 leading-relaxed opacity-80">
                            Investigating the stories that shape our world with intellectual rigor and uncompromising clarity. We bring you the pulse of global affairs, technology, and culture.
                        </p>
                        
                        <div className="flex gap-4">
                            <button
                                className="bg-zinc-900 text-white dark:bg-on-secondary dark:text-zinc-900 px-8 py-4 font-label-caps text-label-caps hover:bg-secondary dark:hover:bg-amber-500 transition-colors duration-300 uppercase tracking-widest font-bold cursor-pointer">
                                Read Today's Edition
                            </button>
                            <button
                                onClick={articlePages}
                                className="border border-zinc-700 text-zinc-700 dark:border-zinc-300 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-on-secondary dark:hover:text-primary transition-colors duration-300 px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest font-bold cursor-pointer">
                                Read Article
                            </button>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5 relative">
                        <div className="aspect-[4/5] bg-surface-container overflow-hidden">
                            <img 
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM_GAQ7x8MUZPecjbvDZDMGaQtTvfvxWY9IqixWqNIH2zE-5BF1VMSd8n1qMfP76cvhHf7rrba3GByLgErIUy5TUTFVPF0FzFv76YZJ_rkKFBzNxAdZL14hoym_wvCLeDK8QOzk5pUkRqYFsQ8_3lv_qdQZiH1VyNev6xb6MoG525Ovbhm0OLaEbqpA5v4HxT4FAxXoOo5IEOkCoww-cCShTVBGhceNFM8hnNppSXChQCXPPZ5p5T6fh_bW7rugJMYM6vX5TCTl9cZ" 
                                alt="Editorial architectural space"
                            />
                        </div>
                        {/* Floating Choice Box */}
                        <div className="absolute bottom-2 left-2 xl:-bottom-6 xl:-left-6 bg-surface dark:bg-primary p-3 xl:p-6 shadow-sm border border-outline-variant max-w-[170px] xl:max-w-[240px]">
                            <span className="font-label-caps text-[8px] xl:text-[10px] text-secondary dark:text-amber-500 font-bold uppercase tracking-[0.15em] xl:tracking-[0.2em]">
                                EDITORIAL CHOICE
                            </span>
                            <p className="text-primary dark:text-on-secondary font-display-xl text-[12px] xl:text-[18px] mt-1 xl:mt-2 italic leading-tight font-semibold">
                                "The architecture of modern truth requires a new lens."
                            </p>
                        </div>
                    </div>
                </section>
                {hasFeatured && (
                        <div className="mb-16 border-4 border-double border-outline-variant dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-900/30 group">
                            <Link
                                href={`/articles/${featuredArticle.slug}`}
                                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                            >
                                <div className="md:col-span-7 aspect-[16/9] overflow-hidden border border-outline-variant/30 bg-surface-container">
                                    <img
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-102"
                                        src={getThumbnailUrl(featuredArticle.thumbnail)}
                                        alt={featuredArticle.title}
                                    />
                                </div>

                                <div className="md:col-span-5 flex flex-col justify-center">
                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.25em] mb-3 block">
                                        ✦ Editor's Choice / Headline
                                    </span>

                                    <h2 className="font-display-xl text-3xl md:text-4xl font-serif mb-4 uppercase leading-tight">
                                        {featuredArticle.title}
                                    </h2>

                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 line-clamp-3 text-justify">
                                        {featuredArticle.excerpt}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    )}
                {otherFeatured?.length > 0 && (
                    <section className="pb-section-gap">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {otherFeatured.map((article) => (
                                <article
                                    key={article.id}
                                    className="group cursor-pointer"
                                >
                                    <Link href={`/articles/${article.slug}`}>
                                        <div className="aspect-[16/9] overflow-hidden border border-outline-variant/30 bg-surface-container mb-4">
                                            <img
                                                src={getThumbnailUrl(article.thumbnail)}
                                                alt={article.title}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                            />
                                        </div>

                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] block mb-2">
                                            Featured Story
                                        </span>

                                        <h3 className="font-headline-md text-lg leading-tight mb-2 group-hover:text-secondary dark:group-hover:text-amber-500 transition-colors">
                                            {article.title}
                                        </h3>

                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                            {article.excerpt}
                                        </p>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Featured Highlights */}
                <section className="py-section-gap">
                    <div className="flex justify-between items-end mb-12 border-b border-outline-variant pb-4">
                        <h3 className="font-headline-lg text-headline-lg">Featured Highlights</h3>
                    </div>

                    <div className="grid grid-cols-12 gap-gutter">
                        {/* Large Highlight */}
                        {mainHighlight && (
                            <article className="col-span-12 lg:col-span-8 group cursor-pointer">
                                <Link href={`/articles/${mainHighlight.slug}`}>
                                    <div className="aspect-[16/9] overflow-hidden mb-6 border border-outline-variant bg-surface-container">
                                        <img
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                                            src={getThumbnailUrl(mainHighlight.thumbnail)}
                                            alt={mainHighlight.title}
                                        />
                                    </div>
                                    <div className="flex gap-4 mb-3">
                                        <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-2 py-1 inline-block mb-3 uppercase">
                                            {mainHighlight.category?.name}
                                        </span>
                                        <span className="font-label-caps text-label-caps opacity-60 tracking-wider">
                                            {calculateMinRead(mainHighlight)}
                                        </span>
                                    </div>
                                    <h4 className="font-headline-lg text-headline-lg mb-4 group-hover:text-secondary dark:group-hover:text-amber-500 transition-colors uppercase">
                                        {mainHighlight.title}
                                    </h4>
                                    <p className="font-body-md text-body-md text-slate-700 dark:text-zinc-400 line-clamp-3">
                                        {mainHighlight.excerpt}
                                    </p>
                                </Link>
                            </article>
                        )}

                        {/* Side Highlights (Dinamis) */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-10">
                            {sideHighlights.map((item) => (
                                <article key={item.id} className="group cursor-pointer border-b border-outline-variant pb-8 last:border-0 last:pb-0">
                                    <Link href={`/articles/${item.slug}`}>
                                        <div className="flex gap-4 mb-2 items-center">
                                            <span className="font-label-caps text-label-caps text-secondary dark:text-amber-500 uppercase font-bold">
                                                {item.category?.name}
                                            </span>
                                            <span className="font-label-caps text-label-caps opacity-60 tracking-wider">
                                                {calculateMinRead(item)}
                                            </span>
                                        </div>
                                        <h5 className="font-headline-md text-headline-md mb-2 group-hover:text-secondary dark:group-hover:text-amber-500 transition-colors leading-tight uppercase">
                                            {item.title}
                                        </h5>
                                        <p className="font-body-md text-body-md text-slate-700 dark:text-zinc-400 line-clamp-3">
                                            {item.excerpt}
                                        </p>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </MainLayout>
    );
}