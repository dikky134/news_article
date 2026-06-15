import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import Swal from 'sweetalert2';

export default function ArticleDetail({ article, auth, relatedArticles = [] }) {
    const [scrollProgress, setScrollProgress] = useState(0);
    console.log("Data Auth dari Laravel:", auth);

    const { flash } = usePage().props || {}; 
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const localMessage = sessionStorage.getItem('edit_success_msg');
        const hasMessage = localMessage || flash?.success; 

        if (hasMessage) {
            setShowToast(true);
            sessionStorage.removeItem('edit_success_msg');

            const timer = setTimeout(() => {
                setShowToast(false);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [flash?.success]);
    
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

    const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return '';

    if (
        thumbnailPath.startsWith('http://') ||
        thumbnailPath.startsWith('https://')
    ) {
        return thumbnailPath;
    }

    return `https://ocxvxbjimyqcgndxvnsk.supabase.co/storage/v1/object/public/article-images/${thumbnailPath.replace('thumbnails/', '')}`;
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

    const handleDelete = () => {
        Swal.fire({
            title: 'Hapus Artikel?',
            text: `Artikel "${article.title}" akan dihapus permanen dan tidak dapat dikembalikan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Warna tombol konfirmasi (Merah)
            cancelButtonColor: '#3085d6', // Warna tombol batal (Biru)
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            background: document.documentElement.classList.contains('dark') ? '#1e1e1e' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        }).then((result) => {
            if (result.isConfirmed) {
                // Jalankan proses hapus Inertia jika user menekan "Ya, Hapus!"
                router.delete(route('articles.destroy', article.id), {
                    onSuccess: () => {
                        // Pop-up sukses setelah artikel berhasil terhapus
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Artikel Anda telah berhasil dihapus.',
                            icon: 'success',
                            confirmButtonColor: '#3085d6',
                            background: document.documentElement.classList.contains('dark') ? '#1e1e1e' : '#fff',
                            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                        });
                    },
                    onError: (err) => {
                        // Pop-up jika terjadi error sistem
                        Swal.fire({
                            title: 'Gagal!',
                            text: 'Terjadi kesalahan saat menghapus artikel.',
                            icon: 'error',
                            confirmButtonColor: '#3085d6',
                        });
                        console.error(err);
                    }
                });
            }
        });
    }

    return (
        <MainLayout activePage={article.category?.slug}>

            <Head title={`${article.title} | The Modern Broadsheet`} />

            {/* CSS Internal Modifikasi Responsif Mobile */}
            <style dangerouslySetInnerHTML={{ __html: `
                .article-body p:first-of-type::first-letter {
                    float: left;
                    font-size: 4rem; 
                    line-height: 0.85;
                    padding-right: 0.12em;
                    padding-top: 0.05em;
                    font-family: 'Newsreader', serif;
                    font-weight: 700;
                    color: currentColor;
                }
                @media (min-width: 768px) {
                    .article-body p:first-of-type::first-letter { font-size: 5.5rem; }
                }

                /* SINKRONISASI UKURAN FONT UTAMA */
                .article-body p, 
                .article-body ul, 
                .article-body ol, 
                .article-body li {
                    font-size: 16px !important;
                    margin-bottom: 1.5rem;
                }
                @media (min-width: 768px) {
                    .article-body p, 
                    .article-body ul, 
                    .article-body ol, 
                    .article-body li { 
                        font-size: 18px !important; 
                    }
                }

                .article-body h2,
                .article-body h3,
                .article-body h4 {
                    font-family: 'Newsreader', serif;
                    font-weight: 600;
                    color: currentColor;
                    line-height: 1.3;
                    margin-top: 2.5rem;
                    margin-bottom: 1.25rem;
                    display: block;
                }

                .article-body h2 { font-size: 24px; }
                .article-body h3 { font-size: 21px; }
                .article-body h4 { font-size: 18px; }

                @media (min-width: 768px) {
                    .article-body h2 { font-size: 28px; margin-top: 3rem; }
                    .article-body h3 { font-size: 26px; margin-top: 3rem; }
                    .article-body h4 { font-size: 22px; margin-top: 2.5rem; }
                }

                .article-body blockquote {
                    border-left-width: 4px;
                    border-color: #bb0021; 
                    padding-left: 1.25rem;
                    padding-top: 0.75rem;
                    padding-bottom: 0.75rem;
                    margin-top: 2rem;
                    margin-bottom: 2rem;
                    font-style: italic;
                    font-family: 'Newsreader', serif;
                    font-size: 20px; 
                }
                @media (min-width: 768px) {
                    .article-body blockquote { font-size: 28px; padding-left: 2rem; margin-top: 3rem; margin-bottom: 3rem; }
                }

                .article-body b, .article-body strong {
                    font-weight: 700 !important;
                    color: currentColor;
                }
                .article-body i, .article-body em { font-style: italic; }
                .article-body u { text-decoration: underline; }
                .article-body a {
                    color: #bb0021;
                    text-decoration: underline;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }
                .dark .article-body a { color: #fbbf24; }
                .article-body a:hover { opacity: 0.8; }
                .article-body ul, 
                .article-body ol {
                    list-style-type: none !important; /* Matikan bawaan browser */
                    padding-left: 0 !important;
                }

                .article-body ol {
                    counter-reset: article-list-counter;
                }

                .article-body li {
                    position: relative;
                    padding-left: 1.75rem !important; /* Beri ruang penomoran di kiri */
                    margin-bottom: 0.75rem !important;
                    line-height: 1.7 !important;
                    font-weight: normal !important; /* Standar teks list adalah normal */
                }

                .article-body ol li::before {
                    counter-increment: article-list-counter;
                    content: counter(article-list-counter) ".";
                    position: absolute;
                    left: 0;
                    top: 0;
                    font-weight: normal;
                }

                .article-body ul li::before {
                    content: "•";
                    position: absolute;
                    left: 0.25rem;
                    top: 0;
                    font-size: 1.25rem;
                    line-height: 1.2;
                    font-weight: normal;
                }

                .article-body li:has(> strong:first-child)::before,
                .article-body li:has(> b:first-child)::before {
                    font-weight: 700 !important;
                }

                .article-body li strong,
                .article-body li b {
                    font-weight: 700 !important;
                    display: inline;
                }
            `}} />
            
            {/* Reading Progress Bar */}
            <div 
                className="fixed top-0 left-0 h-[2px] bg-secondary dark:bg-amber-500 z-[100] transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            <main className="max-w-content-max-width mx-auto px-4 md:px-margin-edge pb-24 dark:text-zinc-100 bg-surface dark:bg-[#121212] text-primary dark:text-white border-outline-variant dark:border-zinc-800">
                
                {/* Article Header */}
                <header className="max-w-4xl mx-auto text-center mb-8 md:mb-16 bg-surface dark:bg-transparent pt-4">
                    <div className="inline-block bg-secondary dark:bg-amber-600 px-3 py-1 mt-2 mb-4 md:mt-6 md:mb-6">
                        <span className="font-label-caps text-[10px] md:text-label-caps uppercase text-on-secondary dark:text-zinc-900 tracking-widest font-bold">
                            {article.category?.name || 'General'}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-4xl lg:text-display-xl mb-6 md:mb-8 leading-tight uppercase text-primary dark:text-zinc-100 font-bold px-1">
                        {article.title}
                    </h1>
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs md:text-body-md text-slate-600 dark:text-zinc-400 px-2">
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
                <div className="w-full h-[260px] sm:h-[400px] md:h-[500px] lg:h-[600px] mb-8 md:mb-16 relative overflow-hidden group border border-outline-variant/30 dark:border-zinc-800 rounded-sm">
                    <img 
                        src={getThumbnailUrl(article.thumbnail)}
                        alt={article.title}
                        className="w-full h-full object-cover grayscale-[0.2] dark:grayscale-[0.4] transition-transform duration-700 group-hover:scale-105"
                    />
                </div>

                <div className="grid grid-cols-12 gap-y-10 lg:gap-gutter relative">
                    
                    {/* Desktop Sidebar Actions */}
                    <aside className="hidden lg:block col-span-1 sticky top-32 h-fit mb-10">
                        <div className="flex flex-col gap-8 text-slate-500 dark:text-zinc-400">
                            <button className="hover:text-secondary dark:hover:text-amber-400 transition-colors cursor-pointer"><span className="material-symbols-outlined">share</span></button>
                            <button className="hover:text-secondary dark:hover:text-amber-400 transition-colors cursor-pointer"><span className="material-symbols-outlined">bookmark</span></button>
                            
                            {/* Tombol chat hanya muncul jika komentar diaktifkan */}
                            {article.allow_comments ? (
                                <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="hover:text-secondary dark:hover:text-amber-400 transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined">chat_bubble</span>
                                </button>
                            ) : null}
                            
                            {auth?.user?.id === 1 && (
                                <>
                                    <div className="w-full h-[1px] bg-outline-variant dark:bg-zinc-800"></div>
                                    <Link 
                                        href={`/articles/${article.id}/edit`}
                                        className="text-primary dark:text-amber-500 hover:text-secondary dark:hover:text-amber-400 transition-colors cursor-pointer flex flex-col items-center gap-1"
                                        title="Edit Artikel"
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        type="button"
                                        className="text-primary dark:text-amber-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer flex flex-col items-center gap-1 bg-transparent border-none outline-none"
                                        title="Hapus Artikel"
                                    >
                                        <span className="material-symbols-outlined text-[22px]">
                                            delete
                                        </span>
                                    </button>
                                </>
                            )}

                            <div className="w-full h-[1px] bg-outline-variant dark:bg-zinc-800"></div>
                        </div>
                    </aside>

                    {/* Main Content Body */}
                    <article className="col-span-12 lg:col-span-7 lg:col-start-3 px-1 md:px-0">
                        <div 
                            className="article-body text-[16px] md:text-body-lg text-slate-800 dark:text-zinc-300 leading-relaxed break-words"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                        
                        {/* Discussion Section */}
                        <section className="mt-12 md:mt-section-gap mb-5 pt-8 md:pt-12 border-t border-outline-variant dark:border-zinc-800">
                            <h3 className="font-headline-md text-xl md:text-headline-md mb-6 md:mb-8 italic dark:text-zinc-200">
                                Discussions ({article.comments?.length || 0})
                            </h3>

                            <div className="space-y-4 md:space-y-6">
                                {/* List Komentar (Tetap dirender agar komentar lama bisa dibaca meskipun fitur dinonaktifkan sekarang) */}
                                {article.comments && article.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 md:gap-4 p-4 md:p-6 bg-slate-50 dark:bg-zinc-900/50 border border-outline-variant/20 dark:border-zinc-800">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-300 dark:bg-zinc-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-zinc-300 uppercase">
                                            {comment.user?.name?.substring(0, 2) || 'AN'}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-center mb-1 md:mb-2 gap-2">
                                                <span className="font-bold font-label-caps uppercase text-xs md:text-sm dark:text-zinc-200 truncate">{comment.user?.name}</span>
                                                <span className="text-slate-400 dark:text-zinc-500 text-[10px] md:text-[11px] flex-shrink-0">
                                                    {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-xs md:text-body-md text-slate-600 dark:text-zinc-400 italic break-words">"{comment.content || comment.body}"</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Pengecekan Fitur Visibilitas allow_comments */}
                                {article.allow_comments ? (
                                    auth.user ? (
                                        <form onSubmit={submitComment} className="space-y-4 pt-2">
                                            <textarea 
                                                name="body" 
                                                value={data.body}
                                                onChange={e => setData('body', e.target.value)}
                                                placeholder="Join the discussion..."
                                                required
                                                rows={4}
                                                className="w-full border border-outline-variant dark:border-zinc-700 bg-transparent p-3 md:p-4 text-sm focus:outline-none focus:border-secondary dark:focus:border-amber-500 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
                                            ></textarea>

                                            <button 
                                                type="submit" 
                                                disabled={processing}
                                                className="w-full sm:w-auto bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-3 font-label-caps text-xs uppercase tracking-wider font-bold hover:bg-secondary dark:hover:bg-amber-500 dark:hover:text-zinc-900 transition-colors disabled:opacity-50 cursor-pointer"
                                            >
                                                {processing ? 'Submitting...' : 'Post Comment'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="p-6 bg-slate-50 dark:bg-zinc-900/30 border border-outline-variant dark:border-zinc-800 text-center">
                                            <p className="font-['Newsreader'] italic mb-3 text-sm md:text-base text-slate-600 dark:text-zinc-400">Please sign in to join the conversation.</p>
                                            <Link href="/login" className="font-bold text-xs uppercase underline decoration-secondary dark:decoration-amber-500 underline-offset-4 dark:text-zinc-200">Sign In Now</Link>
                                        </div>
                                    )
                                ) : (
                                    /* Tampilan jika komentar dinonaktifkan */
                                    <div className="p-6 bg-amber-500/10 border border-amber-500/20 text-center rounded-sm">
                                        <p className="font-['Newsreader'] italic text-sm md:text-base text-amber-600 dark:text-amber-400">
                                            Comments have been disabled for this article.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </article>

                    {/* Right Sidebar Related */}
                    <aside className="col-span-12 lg:col-span-3 space-y-8 lg:space-y-12">
                        <div>
                            <h4 className="font-label-caps text-xs md:text-label-caps border-b border-primary dark:border-zinc-700 pb-2 mb-6 uppercase tracking-widest dark:text-zinc-300">
                                More from Category
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8">
                                {relatedArticles.map(item => (
                                    <Link key={item.id} href={`/articles/${item.slug}`} className="group cursor-pointer block">
                                        <div className="aspect-video mb-2 md:mb-3 overflow-hidden border border-outline-variant dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800">
                                            <img 
                                                src={getThumbnailUrl(item.thumbnail)}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                                alt={item.title} 
                                            />
                                        </div>
                                        <p className="font-label-caps text-[9px] md:text-[10px] text-secondary dark:text-amber-500 mb-1 uppercase font-bold">{item.category?.name}</p>
                                        <h5 className="font-headline-md text-sm md:text-body-lg leading-snug text-slate-800 dark:text-zinc-200 group-hover:text-secondary dark:group-hover:text-amber-400 transition-colors uppercase font-semibold">
                                            {item.title}
                                        </h5>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* ACTION FLOATING BOTTOM NAV BAR (KHUSUS MOBILE & TABLET) */}
            <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-8 shadow-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                <button className="hover:text-secondary dark:hover:text-amber-400 transition-colors flex items-center"><span className="material-symbols-outlined text-[22px]">share</span></button>
                <button className="hover:text-secondary dark:hover:text-amber-400 transition-colors flex items-center"><span className="material-symbols-outlined text-[22px]">bookmark</span></button>
                
                {/* Tombol chat mobile hanya muncul jika komentar diaktifkan */}
                {article.allow_comments ? (
                    <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="hover:text-secondary dark:hover:text-amber-400 transition-colors flex items-center">
                        <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
                    </button>
                ) : null}
                
                {auth?.user?.id === 1 && (
                    <Link 
                        href={`/articles/${article.id}/edit`}
                        className="text-amber-600 dark:text-amber-500 hover:text-secondary flex items-center"
                        title="Edit Artikel"
                    >
                        <span className="material-symbols-outlined text-[22px]">edit</span>
                    </Link>
                )}
            </div>
        </MainLayout>
    );
}