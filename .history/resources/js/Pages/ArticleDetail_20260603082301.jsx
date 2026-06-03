import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function ArticleDetail({ article, auth, relatedArticles = [] }) {
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

    // Fungsi kalkulasi estimasi waktu baca otomatis jika tidak ada di DB
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

    const { data, setData, post, reset, processing, errors } = useForm({
        body: '',
    });

    const submitComment = (e) => {
        e.preventDefault();
        post(`/articles/${article.id}/comments`, {
            onSuccess: () => reset('body'),
            onError: (err) => console.log("Detail Error:", err), 
            preserveScroll: true,
        });
    };

    return (
        <MainLayout activePage={article.category?.slug}>
            <Head title={`${article.title} | The Modern Broadsheet`} />

            {/* CSS Internal */}
            <style dangerouslySetInnerHTML={{ __html: `
                .article-body p:first-of-type::first-letter {
                    float: left;
                    font-size: 5.5rem;
                    line-height: 0.8;
                    padding-right: 0.1em;
                    padding-top: 0.1em;
                    font-family: 'Newsreader', serif;
                    font-weight: 700;
                    color: currentColor; /* Mengikuti warna teks induk (hitam saat terang, putih saat gelap) */
                }

                .article-body p {
                    margin-bottom: 2rem;
                }

                .article-body h2 {
                    font-family: 'Newsreader', serif;
                    font-size: 28px;
                    font-weight: 600;
                    color: currentColor;
                    margin-top: 3rem;
                    margin-bottom: 1.5rem;
                }

                .article-body blockquote {
                    border-left-width: 4px;
                    border-color: #bb0021; 
                    padding-left: 2rem;
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                    margin-top: 3rem;
                    margin-bottom: 3rem;
                    font-style: italic;
                    font-family: 'Newsreader', serif;
                    font-size: 28px;
                }

                /* --- ATURAN BARU UNTUK KONTEN RICH TEXT ARTIKEL --- */
                .article-body b, .article-body strong {
                    font-weight: 700;
                    color: currentColor;
                }
                .article-body i, .article-body em {
                    font-style: italic;
                }
                .article-body u {
                    text-decoration: underline;
                }
                .article-body ul {
                    list-style-type: disc !important;
                    padding-left: 1.75rem;
                    margin-bottom: 2rem;
                }
                .article-body ol {
                    list-style-type: decimal !important;
                    padding-left: 1.75rem;
                    margin-bottom: 2rem;
                }
                .article-body li {
                    margin-bottom: 0.5rem;
                    list-style-position: outside;
                }
                .article-body a {
                    color: #bb0021;
                    text-decoration: underline;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }
                .dark .article-body a {
                    color: #fbbf24;
                }
                .article-body a:hover {
                    opacity: 0.8;
                }
            `}} />

            {/* Reading Progress Bar */}
            <div 
                className="fixed top-0 left-0 h-[2px] bg-secondary dark:bg-amber-500 z-[100] transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            <main className="max-w-content-max-width mx-auto px-margin-edge pb-24 dark:text-zinc-100 bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800">
                {/* Article Header */}
                <header className="max-w-4xl mx-auto text-center mb-16 bg-surface dark:bg-transparent">
                    <div className="inline-block bg-secondary dark:bg-amber-600 px-3 py-1 mt-6 mb-6">
                        <span className="font-label-caps text-label-caps uppercase text-on-secondary dark:text-zinc-900 tracking-widest font-bold">
                            {article.category?.name || 'General'}
                        </span>
                    </div>
                    <h1 className="font-display-xl text-headline-lg lg:text-display-xl mb-8 leading-tight uppercase text-primary dark:text-zinc-100 font-bold">
                        {article.title}
                    </h1>
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-wrap justify-center items-center gap-3 font-body-md text-slate-600 dark:text-zinc-400">
                            <span className="font-bold text-secondary dark:text-amber-500 uppercase">
                                By {article.user?.name || article.author_name || 'Editorial Staff'}
                            </span>
                            <span className="w-1 h-1 bg-outline-variant dark:bg-zinc-700 rounded-full"></span>
                            <span>
                                {article.created_at 
                                    ? new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                    : 'Recent'}
                            </span>
                            <span className="w-1 h-1 bg-outline-variant dark:bg-zinc-700 rounded-full"></span>
                            <span className="uppercase tracking-wider">
                                {calculateMinRead(article)}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Hero Image */}
                <div className="w-full h-[600px] mb-16 relative overflow-hidden group border border-outline-variant/30 dark:border-zinc-800">
                    <img 
                        src={article.thumbnail?.startsWith('http') ? article.thumbnail : `/storage/${article.thumbnail}`} 
                        alt={article.title}
                        className="w-full h-full object-cover grayscale-[0.2] dark:grayscale-[0.4] transition-transform duration-700 group-hover:scale-105"
                    />
                </div>

                <div className="grid grid-cols-12 gap-gutter relative">
                    {/* Left Sidebar Actions */}
                    <aside className="hidden lg:block col-span-1 sticky top-32 h-fit mb-10">
                        <div className="flex flex-col gap-8 text-slate-500 dark:text-zinc-400">
                            <button className="hover:text-secondary dark:hover:text-amber-400 transition-colors cursor-pointer"><span className="material-symbols-outlined">share</span></button>
                            <button className="hover:text-secondary dark:hover:text-amber-400 transition-colors cursor-pointer"><span className="material-symbols-outlined">bookmark</span></button>
                            <button className="hover:text-secondary dark:hover:text-amber-400 transition-colors cursor-pointer"><span className="material-symbols-outlined">chat_bubble</span></button>
                            <div className="w-full h-[1px] bg-outline-variant dark:bg-zinc-800"></div>
                            <button className="hover:text-secondary dark:hover:text-amber-400 transition-colors cursor-pointer"><span className="material-symbols-outlined">more_horiz</span></button>
                        </div>
                    </aside>

                    {/* Main Content Body */}
                    <article className="col-span-12 lg:col-span-7 lg:col-start-3">
                        <div 
                            className="article-body font-body-lg text-body-lg text-slate-800 dark:text-zinc-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                        
                        {/* Discussion Section */}
                        <section className="mt-section-gap mb-5 pt-12 border-t border-outline-variant dark:border-zinc-800">
                            <h3 className="font-headline-md text-headline-md mb-8 italic dark:text-zinc-200">
                                Discussions ({article.comments?.length || 0})
                            </h3>

                            <div className="space-y-6">
                                {/* List Komentar */}
                                {article.comments && article.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 p-6 bg-slate-50 dark:bg-zinc-900/50 border border-outline-variant/20 dark:border-zinc-800">
                                        <div className="w-10 h-10 bg-slate-300 dark:bg-zinc-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-zinc-300 uppercase">
                                            {comment.user?.name?.substring(0, 2) || 'AN'}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold font-label-caps uppercase text-sm dark:text-zinc-200">{comment.user?.name}</span>
                                                <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                                                    {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-body-md text-slate-600 dark:text-zinc-400 italic">"{comment.content || comment.body}"</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Bagian Input Komentar */}
                                {auth.user ? (
                                    <form onSubmit={submitComment} className="space-y-4 pt-4">
                                        <textarea 
                                            name="body" 
                                            value={data.body}
                                            onChange={e => setData('body', e.target.value)}
                                            placeholder="Join the discussion..."
                                            required
                                            rows={4}
                                            className="w-full border border-outline-variant dark:border-zinc-700 bg-transparent p-4 text-sm focus:outline-none focus:border-secondary dark:focus:border-amber-500 text-slate-800 dark:text-zinc-100"
                                        ></textarea>

                                        <button 
                                            type="submit" 
                                            disabled={processing}
                                            className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-3 font-label-caps text-xs uppercase tracking-wider font-bold hover:bg-secondary dark:hover:bg-amber-500 dark:hover:text-zinc-900 transition-colors disabled:opacity-50 cursor-pointer"
                                        >
                                            {processing ? 'Submitting...' : 'Post Comment'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="p-6 bg-slate-50 dark:bg-zinc-900/30 border border-outline-variant dark:border-zinc-800 text-center">
                                        <p className="font-['Newsreader'] italic mb-4 text-slate-600 dark:text-zinc-400">Please sign in to join the conversation.</p>
                                        <Link href="/login" className="font-bold text-xs uppercase underline decoration-secondary dark:decoration-amber-500 underline-offset-4 dark:text-zinc-200">Sign In Now</Link>
                                    </div>
                                )}
                            </div>
                        </section>
                    </article>

                    {/* Right Sidebar Related */}
                    <aside className="col-span-12 lg:col-span-3 space-y-12">
                        <div>
                            <h4 className="font-label-caps text-label-caps border-b border-primary dark:border-zinc-700 pb-2 mb-6 uppercase tracking-widest dark:text-zinc-300">
                                More from Category
                            </h4>
                            <div className="flex flex-col gap-8">
                                {relatedArticles.map(item => (
                                    <Link key={item.id} href={`/articles/${item.slug}`} className="group cursor-pointer block">
                                        <div className="aspect-video mb-3 overflow-hidden border border-outline-variant dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800">
                                            <img 
                                                src={item.thumbnail?.startsWith('http') ? item.thumbnail : `/storage/${item.thumbnail}`} 
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                                alt={item.title} 
                                            />
                                        </div>
                                        <p className="font-label-caps text-[10px] text-secondary dark:text-amber-500 mb-1 uppercase font-bold">{item.category?.name}</p>
                                        <h5 className="font-headline-md text-body-lg leading-snug text-slate-800 dark:text-zinc-200 group-hover:text-secondary dark:group-hover:text-amber-400 transition-colors uppercase font-semibold">
                                            {item.title}
                                        </h5>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </MainLayout>
    );
}