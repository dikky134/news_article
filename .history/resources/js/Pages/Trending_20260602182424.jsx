import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Trending({ trendingArticles = [], stats }) {
    console.log("Data Trending dari Controller:", trendingArticles);

    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY || document.documentElement.scrollTop;
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;

            if (currentScroll <= 2) {
                setScrollProgress(0);
                return;
            }

            if (totalScroll > 0) {
                const progress = (currentScroll / totalScroll) * 100;
                setScrollProgress(progress);
            }
        };
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    const mainFeature = trendingArticles[0]; 
    const leftPillar = trendingArticles.slice(1, 4); 
    const bentoRow = trendingArticles.slice(4, 7); 

    const dynamicStats = [
        { val: stats?.readers || "0", label: "TOTAL READS" },
        { val: stats?.avgTime || "0m", label: "AVG. READ TIME" },
        { val: stats?.countries || "0", label: "TOPICS COVERED" },
        { val: stats?.accuracy || "100%", label: "ACCURACY RATING" }
    ];

    return (
        <MainLayout activePage="trending">
            <Head title="Trending | The Modern Broadsheet" />

            <div 
                className="fixed top-0 left-0 h-[2px] bg-secondary dark:bg-amber-500 z-[100] transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            <main className="max-w-content-max-width mx-auto px-margin-edge py-section-gap bg-surface dark:bg-[#121212] dark:text-white border-outline-variant dark:border-zinc-800">
                
                {/* HEADER */}
                <header className="mb-8 md:mb-16 border-b border-outline-variant pb-6 md:pb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                        <div>
                            <span className="bg-surface-container-highest text-primary font-label-caps text-xs px-2 py-1 mb-4 md:mb-6 inline-block uppercase">
                                Weekly Report
                            </span>
                            {/* Hanya ubah ukuran text-3xl pada mobile, jenis font asli tetap aktif di desktop */}
                            <h2 className="font-display-xl text-3xl md:text-headline-lg lg:text-display-xl mb-2">
                                Trending Now
                            </h2>
                            <p className="text-on-surface-variant dark:text-on-primary-container font-body-lg text-base max-w-2xl">
                                The most significant narratives shaping global discourse, ranked by real-time engagement and editorial rigor.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-on-surface-variant dark:text-on-primary-container">
                            <span className="font-label-caps text-xs md:text-sm uppercase">
                                LAST UPDATED: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} EST
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col md:grid md:grid-cols-12 gap-gutter">
                    
                    {/* TOP TRENDING #01 */}
                    {mainFeature && (
                        <article className="order-1 md:order-none md:col-span-8 group mb-8 md:mb-0">
                            <Link href={`/articles/${mainFeature.slug}`} className="cursor-pointer block">
                                <div className="relative mb-4 md:mb-6 overflow-hidden">
                                    <img 
                                        alt={mainFeature.title} 
                                        className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                                        src={mainFeature.thumbnail?.startsWith('http') ? mainFeature.thumbnail : `/storage/${mainFeature.thumbnail}`} 
                                    />
                                    <div className="absolute inset-0 border border-black/10 pointer-events-none"></div>
                                    <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
                                        <span className="bg-secondary dark:bg-amber-500 text-on-secondary font-label-caps text-xs px-2.5 py-1 md:px-3 md:shadow-lg uppercase">
                                            TOP TRENDING #01
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 md:gap-4">
                                    <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
                                        <span className="text-on-surface-variant font-label-caps uppercase font-bold text-primary dark:text-amber-500">BY {mainFeature.user?.name || 'EDITORIAL'}</span>
                                        <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                                        <span className="text-on-surface-variant dark:text-on-primary-container font-label-caps uppercase">{mainFeature.category?.name}</span>
                                    </div>
                                    {/* Hanya ubah ukuran text-xl pada mobile */}
                                    <h2 className="font-headline-lg text-xl md:text-headline-lg group-hover:text-secondary dark:group-hover:text-amber-500 transition-colors leading-tight uppercase">
                                        {mainFeature.title}
                                    </h2>
                                    <p className="text-on-surface-variant dark:text-on-primary-container font-body-lg text-sm max-w-3xl line-clamp-2">
                                        {mainFeature.excerpt}
                                    </p>
                                    <div className="dark:text-on-primary-container flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-6 mt-2 md:mt-4">
                                        <span className="font-label-caps text-[11px] uppercase">
                                            {mainFeature.reading_time}
                                        </span>
                                        <span className="flex items-center gap-1.5 font-label-caps text-[11px]">
                                            <span className="material-symbols-outlined text-[16px] md:text-[18px]">visibility</span>
                                            {mainFeature.views_count || 0} VIEWS
                                        </span>
                                        <span className="flex items-center gap-1.5 font-label-caps text-[11px]">
                                            <span className="material-symbols-outlined text-[16px] md:text-[18px]">mode_comment</span> 
                                            {mainFeature.comments_count || 0} COMMENTS
                                        </span>
                                        <span className="flex items-center gap-1.5 font-label-caps text-[11px]"><span className="material-symbols-outlined text-[16px] md:text-[18px]">share</span> SHARE</span>
                                    </div>
                                </div>
                            </Link>
                        </article>
                    )}

                    {/* PILLAR LIST #02 - #04 */}
                    <section className="order-2 md:order-none md:col-span-4 border-r-0 md:border-r border-outline-variant pr-0 md:pr-gutter pb-6 md:pb-0 border-b md:border-b-0 mb-6 md:mb-0">
                        <div className="space-y-6 md:space-y-10">
                            {leftPillar.map((item, index) => (
                                <Link 
                                    key={item.id} 
                                    href={`/articles/${item.slug}`} 
                                    className="group cursor-pointer block"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Hanya ubah ukuran text-3xl pada mobile */}
                                        <span className="font-display-xl text-3xl text-primary dark:text-on-secondary opacity-20 dark:opacity-80 md:text-headline-lg leading-none">
                                            {String(index + 2).padStart(2, '0')}
                                        </span>
                                        <div>
                                            <span className="text-secondary dark:text-amber-500 font-label-caps text-xs mb-1 block uppercase">
                                                {item.category?.name}
                                            </span>
                                            {/* Hanya ubah ukuran text-base pada mobile */}
                                            <h3 className="font-headline-md text-base md:text-headline-md leading-tight group-hover:text-secondary dark:group-hover:text-amber-500 transition-colors uppercase">
                                                {item.title}
                                            </h3>
                                            <div className="mt-2 md:mt-4 flex flex-wrap items-center gap-3 text-on-surface-variant dark:text-on-primary-container">
                                                <span className="font-label-caps text-[11px] uppercase">
                                                    {item.reading_time}
                                                </span>
                                                <span className="flex items-center gap-1 font-label-caps text-[11px]">
                                                    <span className="material-symbols-outlined text-sm">mode_comment</span> 
                                                    {item.comments_count || 0}
                                                </span>
                                                <span className="flex items-center gap-1 font-label-caps text-[11px]">
                                                    <span className="material-symbols-outlined text-sm">visibility</span> 
                                                    {item.views_count?.toLocaleString() || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                {/* SECONDARY TRENDING ROW (Bento Grid Style) */}
                <div className="mt-8 md:mt-section-gap grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-gutter">
                    {bentoRow.map((item, index) => (
                        <Link 
                            key={item.id} 
                            href={`/articles/${item.slug}`} 
                            className="p-4 md:p-6 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant hover:shadow-sm transition-all duration-300 group cursor-pointer"
                        >
                            {/* Hanya ubah ukuran text-2xl pada mobile */}
                            <span className="font-display-xl text-2xl text-primary dark:text-on-secondary opacity-50 mb-1 md:mb-2 block">
                                {String(index + 5).padStart(2, '0')}
                            </span>
                            <span className="text-secondary dark:text-amber-500 font-label-caps text-xs mb-1.5 md:mb-2 block uppercase">{item.category?.name}</span>
                            {/* Hanya ubah ukuran text-base pada mobile */}
                            <h4 className="font-headline-md text-base md:text-headline-md mb-2 md:mb-4 leading-snug group-hover:text-secondary dark:group-hover:text-amber-500 transition-colors uppercase">
                                {item.title}
                            </h4>
                            <p className="text-on-surface-variant dark:text-on-secondary text-xs md:text-body-md mb-4 md:mb-6 line-clamp-3">
                                {item.excerpt}
                            </p>
                            <div className="flex justify-between items-center border-t border-outline-variant pt-3 md:pt-4">
                                <div className="flex gap-3">
                                    <span className="font-label-caps text-[11px] uppercase">
                                        {item.reading_time}
                                    </span>
                                    <span className="flex items-center gap-1 font-label-caps text-[11px]">
                                        <span className="material-symbols-outlined text-sm">mode_comment</span> 
                                        {item.comments_count || 0}
                                    </span>
                                </div>
                                <span className="flex items-center gap-1 font-label-caps text-[11px]">
                                    <span className="material-symbols-outlined text-sm">visibility</span> 
                                    {item.views_count?.toLocaleString() || 0}
                                </span>
                                <span className="material-symbols-outlined text-primary dark:text-on-secondary text-lg md:text-xl">arrow_forward</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* METRIC VISUALIZATION SECTION */}
                {/* Ukuran Kotak Statistik disesuaikan menjadi py-6 px-4 pada mobile */}
                <section className="mt-8 md:mt-section-gap bg-primary text-on-primary py-6 px-4 md:p-margin-edge">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
                        <div className="text-center md:text-left">
                            {/* Hanya ubah ukuran text-lg pada mobile */}
                            <h3 className="font-headline-md text-lg md:font-headline-lg mb-1 md:mb-2 uppercase italic">Inside the Numbers</h3>
                            <p className="opacity-70 font-body-md text-xs italic">Real-time data from our global readership network.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 md:gap-12 w-full md:w-auto">
                            {dynamicStats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    {/* Hanya ubah ukuran text-xl pada mobile */}
                                    <span className="font-display-xl text-xl block md:text-headline-lg">{stat.val}</span>
                                    <span className="font-label-caps opacity-60 text-[9px] md:text-[10px] tracking-widest block mt-0.5">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </MainLayout>
    );
}