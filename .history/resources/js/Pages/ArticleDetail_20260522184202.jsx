import React, {useState, useEffect} from 'react';
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

    // Fungsi untuk memastikan konten memiliki class 'drop-cap' pada paragraf pertama
    const renderContent = (content) => {
        if (!content) return "";
        // Kita bungkus konten dari DB dengan class 'drop-cap-area'
        // CSS di bawah akan menargetkan p pertama di dalam area ini
        return { __html: content };
    };

    const { data, setData, post, reset, processing, errors } = useForm({
        body: '',
    });

    const submitComment = (e) => {
        e.preventDefault();
        
        post(`/articles/${article.id}/comments`, {
            onSuccess: () => reset('body'),
            // Jika ada error validasi, ia akan muncul di console ini
            onError: (err) => console.log("Detail Error:", err), 
            preserveScroll: true,
        });
    };

    return (
        <MainLayout activePage={article.category?.slug}>
            <Head title={`${article.title} | The Modern Broadsheet`} />

            {/* CSS Internal untuk Dropcap dan spacing database content */}
            <style dangerouslySetInnerHTML={{ __html: `
                /* Dropcap hanya untuk paragraf pertama di dalam konten artikel */
                .article-body p:first-of-type::first-letter {
                    float: left;
                    font-size: 5.5rem;
                    line-height: 0.8;
                    padding-right: 0.1em;
                    padding-top: 0.1em;
                    font-family: 'Newsreader', serif;
                    font-weight: 700;
                    color: #000000;
                }

                /* Memastikan spacing antar paragraf dari database konsisten */
                .article-body p {
                    margin-bottom: 2rem; /* Sama dengan space-y-8 */
                }

                /* Styling otomatis untuk subheading (h2) dari database */
                .article-body h2 {
                    font-family: 'Newsreader', serif;
                    font-size: 28px;
                    font-weight: 600;
                    color: #000000; /* Warna primary */
                    margin-top: 3rem;
                    margin-bottom: 1.5rem;
                }

                /* Styling otomatis untuk blockquote dari database */
                .article-body blockquote {
                    border-left-width: 4px;
                    border-color: #bb0021; /* Warna secondary */
                    padding-left: 2rem;
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                    margin-top: 3rem;
                    margin-bottom: 3rem;
                    font-style: italic;
                    font-family: 'Newsreader', serif;
                    font-size: 28px;
                    color: #45474a; /* Warna on-surface-variant */
                }
            `}} />

            {/* Reading Progress Bar */}
            <div 
                className="fixed top-0 left-0 h-[2px] bg-secondary z-[100] transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            <main className="max-w-content-max-width mx-auto px-margin-edge">
                {/* Article Header */}
                <header className="max-w-4xl mx-auto text-center mb-16 bg-surface dark:bg-[#121212] dark:text-white border-outline-variant dark:border-zinc-800">
                    <div className="inline-block bg-secondary px-3 py-1 mt-6 mb-6">
                        <span className="font-label-caps text-label-caps uppercase text-on-secondary tracking-widest">
                            {article.category?.name || 'General'}
                        </span>
                    </div>
                    <h1 className="font-display-xl text-headline-lg lg:text-display-xl mb-8 leading-tight uppercase">
                        {article.title}
                    </h1>
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 font-body-md text-on-surface-variant">
                            <span className="font-bold text-primary dark:text-on-secondary uppercase">By Elena Vance</span>
                            <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                            <span className='dark:text-on-primary-container'>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                            <span className='dark:text-on-primary-container'>12 Min Read</span>
                        </div>
                    </div>
                </header>

                {/* Hero Image */}
                <div className="w-full h-[600px] mb-16 relative overflow-hidden group border border-outline-variant/30">
                    <img 
                        src={article.thumbnail?.startsWith('http') ? article.thumbnail : `/storage/${article.thumbnail}`} 
                        alt={article.title}
                        className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 group-hover:scale-105"
                    />
                </div>

                <div className="grid grid-cols-12 gap-gutter relative">
                    {/* Left Sidebar Actions */}
                    <aside className="hidden lg:block col-span-1 sticky top-32 h-fit mb-10">
                        <div className="flex flex-col gap-8 text-on-surface-variant">
                            <button className="hover:text-secondary transition-colors"><span className="material-symbols-outlined">share</span></button>
                            <button className="hover:text-secondary transition-colors"><span className="material-symbols-outlined">bookmark</span></button>
                            <button className="hover:text-secondary transition-colors"><span className="material-symbols-outlined">chat_bubble</span></button>
                            <div className="w-full h-[1px] bg-outline-variant"></div>
                            <button className="hover:text-secondary transition-colors"><span className="material-symbols-outlined">more_horiz</span></button>
                        </div>
                    </aside>

                    {/* Main Content Body */}
                    <article className="col-span-12 lg:col-span-7 lg:col-start-3">
                        <div 
                            className="article-body font-body-lg text-body-lg text-on-surface leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                        
                        {/* Discussion Section */}
                        <section className="mt-section-gap mb-5 pt-12 border-t border-outline-variant">
                            <h3 className="font-headline-md text-headline-md mb-8 italic">
                                Discussions ({article.comments?.length || 0})
                            </h3>

                            <div className="space-y-8">
                                {/* List Komentar (Mapping data seperti sebelumnya) */}
                                {article.comments && article.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 p-6 bg-surface-container-low border border-outline-variant/20">
                                        <div className="w-10 h-10 bg-primary-fixed-dim rounded-full flex-shrink-0"></div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold font-label-caps uppercase">{comment.user?.name}</span>
                                                <span className="text-on-surface-variant text-[11px]">{new Date(comment.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-body-md text-on-surface-variant italic">"{comment.content}"</p>
                                        </div>
                                    </div>
                                ))}

                                {/* --- BAGIAN INPUT YANG BISA DIKETIK --- */}
                                {auth.user ? (
                                    <form onSubmit={submitComment}>
                                        <textarea 
                                            name="body" 
                                            value={data.body}
                                            onChange={e => setData('body', e.target.value)}
                                            placeholder="Tulis komentar..."
                                            required
                                            className="w-full ..."
                                        ></textarea>

                                        <button type="submit" disabled={processing}>
                                            {processing ? 'Mengirim...' : 'Kirim Komentar'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="p-6 bg-surface-container-low border border-outline-variant text-center">
                                        <p className="font-['Newsreader'] italic mb-4">Please sign in to join the conversation.</p>
                                        <Link href="/login" className="font-bold text-xs uppercase underline decoration-secondary underline-offset-4">Sign In Now</Link>
                                    </div>
                                )}
                            </div>
                        </section>
                    </article>

                    {/* Right Sidebar Related */}
                    <aside className="col-span-12 lg:col-span-3 space-y-12">
                        <div>
                            <h4 className="font-label-caps text-label-caps border-b border-primary pb-2 mb-6 uppercase tracking-widest">More from Category</h4>
                            <div className="flex flex-col gap-8">
                                {relatedArticles.map(item => (
                                    <Link key={item.id} href={`/articles/${item.slug}`} className="group cursor-pointer">
                                        <div className="aspect-video mb-3 overflow-hidden border border-outline-variant">
                                            <img 
                                                src={item.thumbnail?.startsWith('http') ? item.thumbnail : `/storage/${item.thumbnail}`} 
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                                alt={item.title} 
                                            />
                                        </div>
                                        <p className="font-label-caps text-[10px] text-secondary mb-1 uppercase">{item.category?.name}</p>
                                        <h5 className="font-headline-md text-body-lg leading-snug group-hover:text-secondary transition-colors uppercase">
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