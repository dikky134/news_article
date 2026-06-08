import React, { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import Swal from 'sweetalert2';

export default function Create({ categories = [], article = null, drafts = [] }) {
    const isEditMode = !!article;

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1e1e1e', 
        color: '#f3f4f6',      
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    // Ambil data form state dari Inertia useForm pipeline
    const { data, setData, post, processing, errors, reset } = useForm({
        title: article?.title || '',
        slug: article?.slug || '',
        excerpt: article?.excerpt || '',
        content: article?.content || '',
        category_id: article?.category_id || '',
        thumbnail: null,
        allow_comments: article ? !!article.allow_comments : true,
        feature_on_homepage: article ? !!article.feature_on_homepage : false,
        is_draft: article?.status === 'draft', 
    });

    const handleTitleChange = (e) => {
        const titleVal = e.target.value;
        setData(prev => {
            const updated = { ...prev, title: titleVal };
            if (!isEditMode) {
                updated.slug = titleVal
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-');
            }
            return updated;
        });
    };

    // Manual Edit untuk Slug
    const handleSlugChange = (e) => {
        const slugVal = e.target.value
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        setData('slug', slugVal);
    };

    const [imagePreview, setImagePreview] = useState(
        article?.thumbnail 
            ? article.thumbnail.startsWith('http') 
                ? article.thumbnail
                : `/storage/${article.thumbnail}` 
            : null
    );

    const [showManageCategory, setShowManageCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryError, setCategoryError] = useState('');

    const textareaRef = useRef(null);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('https://');
    const [savedSelection, setSavedSelection] = useState({ start: 0, end: 0 });

    const handleInsertLink = (e) => {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { start, end } = savedSelection;
        const fullText = data.content;
        const selectedText = fullText.substring(start, end);
   
        if (!linkUrl.trim() || linkUrl === 'https://') {
            setIsLinkModalOpen(false);
            return;
        }

        const formattedText = `<a href="${linkUrl}" target="_blank">${selectedText || 'Teks Link'}</a>`;
        const newContent = fullText.substring(0, start) + formattedText + fullText.substring(end);

        setData('content', newContent);
        setIsLinkModalOpen(false);
        setLinkUrl('https://');

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + formattedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const formatText = (command) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const fullText = data.content;
        const selectedText = fullText.substring(start, end);

        let formattedText = '';

        switch (command) {
            case 'bold':
                formattedText = `<b>${selectedText}</b>`;
                break;
            case 'italic':
                formattedText = `<i>${selectedText}</i>`;
                break;
            case 'underline':
                formattedText = `<u>${selectedText}</u>`;
                break;
            case 'bullet':
                formattedText = selectedText 
                    ? selectedText.split('\n').map(line => `<li>${line}</li>`).join('\n')
                    : '<li>\n  \n</li>';
                break;
            case 'number':
                formattedText = selectedText 
                    ? `<ol>\n${selectedText.split('\n').map(line => `  <li>${line}</li>`).join('\n')}\n</ol>`
                    : '<ol>\n  <li>\n  \n</li>\n</ol>';
                break;
            case 'link':
                setSavedSelection({
                    start: textarea.selectionStart,
                    end: textarea.selectionEnd
                });
                setIsLinkModalOpen(true);
                return;
            case 'paragraf':
                formattedText = `<p>${selectedText}</p>`;
                break;
            case 'quotes':
                formattedText = `<blockquote>${selectedText}</blockquote>`;
                break;
            default:
                return;
        }

        const newContent = fullText.substring(0, start) + formattedText + fullText.substring(end);
        setData('content', newContent);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + formattedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        router.post('/categories', { name: newCategoryName }, {
            onSuccess: () => {
                setNewCategoryName('');
                setCategoryError('');
                Toast.fire({
                    icon: 'success',
                    title: 'Kategori berhasil ditambahkan!'
                });
            },
            onError: (err) => {
                setCategoryError(err.name || 'Gagal menambahkan kategori.');
            },
            preserveScroll: true,
        });
    };

    // FUNGSI DELETE KATEGORI DENGAN SWEETALERT2
    const initiateDeleteCategory = (cat) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Kategori "${cat.name}" akan dihapus secara permanen!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', // Merah Tailwind
            cancelButtonColor: '#27272a',  // Zinc 800 Tailwind
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            background: '#1e1e1e',
            color: '#f3f4f6'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/categories/${cat.id}`, {
                    onSuccess: () => {
                        // Jika kategori yang sedang dipilih di form adalah yang dihapus, reset pilihannya
                        if (data.category_id == cat.id) {
                            setData('category_id', '');
                        }
                        Toast.fire({
                            icon: 'success',
                            title: 'Kategori berhasil dihapus!'
                        });
                    },
                    preserveScroll: true,
                });
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('thumbnail', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveDraft = (e) => {
        if (e) e.preventDefault();
        
        const payload = { ...data, is_draft: true };

        if (isEditMode) {
            router.post(`/articles/${article.id}`, {
                ...payload,
                _method: 'PUT'
            }, {
                forceFormData: true,
                onSuccess: () => {
                    Toast.fire({
                        icon: 'info',
                        title: 'Perubahan draf berhasil disimpan!',
                        iconColor: '#38bdf8'
                    });
                }
            });
        } else {
            router.post('/articles', payload, { 
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setImagePreview(null);
                    Toast.fire({
                        icon: 'info',
                        title: 'Draf baru berhasil disimpan!',
                        iconColor: '#38bdf8'
                    });
                },
            });
        }
    };

    const handlePublish = (e) => {
        if (e) e.preventDefault();

        const payload = { ...data, is_draft: false };

        if (isEditMode) {
            router.post(`/articles/${article.id}`, {
                ...payload,
                _method: 'PUT',
            }, {
                forceFormData: true,
                onSuccess: () => {
                    Toast.fire({
                        icon: 'success',
                        title: 'Artikel berhasil diterbitkan!',
                        iconColor: '#4ade80'
                    });
                },
            });
        } else {
            router.post('/articles', payload, { 
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setImagePreview(null);
                    Toast.fire({
                        icon: 'success',
                        title: 'Artikel baru berhasil dipublikasikan!',
                        iconColor: '#4ade80'
                    });
                },
            });
        }
    };

    return (
        <MainLayout>
            <Head title="Create Article | The Modern Broadsheet" />

            <main className="max-w-content-max-width mx-auto px-4 md:px-margin-edge py-12 w-full overflow-x-hidden">
                <div className="mb-10 md:mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant pb-6 md:pb-8">
                    <div className="max-w-2xl">
                        <span className="font-label-caps text-[10px] md:text-label-caps text-secondary mb-1.5 block tracking-widest">Editorial Dashboard</span>
                        <h1 className="font-headline-lg text-2xl md:text-headline-lg text-primary dark:text-white tracking-tight">
                            {isEditMode ? 'Edit Article / Draft' : 'Compose New Article'}
                        </h1>
                        {Object.keys(errors).length > 0 && (
                            <div className="p-4 my-4 bg-red-900/50 border-l-4 border-red-500 text-red-200 text-sm">
                                <p className="font-bold">Gagal menyimpan! Periksa kolom berikut:</p>
                                <ul className="list-disc pl-5 mt-1">
                                    {Object.keys(errors).map((key) => (
                                        <li key={key}>{key}: {errors[key]}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p className="font-body-md text-xs md:text-body-md text-on-surface-variant mt-1.5 italic">Crafting stories with precision and integrity.</p>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 md:mt-0 w-full md:w-auto">
                        <button 
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={processing}
                            className="w-full sm:w-auto px-6 py-3 border border-primary dark:border-white font-label-caps text-[11px] md:text-label-caps hover:bg-surface-container dark:hover:bg-zinc-800 transition-all dark:text-white uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                        >
                            Save Draf
                        </button>
                        <button 
                            type="button"
                            onClick={handlePublish}
                            disabled={processing}
                            className="w-full sm:w-auto px-6 py-3 bg-primary dark:bg-amber-600 text-white font-label-caps text-[11px] md:text-label-caps hover:shadow-lg transition-all disabled:opacity-50 uppercase tracking-widest cursor-pointer"
                        >
                            {processing ? 'Publishing...' : isEditMode ? 'Update & Publish' : 'Publish Article'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                    {/* Main Content Area (8 Columns) */}
                    <form onSubmit={handlePublish} className="lg:col-span-8 space-y-8 md:space-y-10 w-full">
                        <section className="space-y-6">
                            {/* Input Judul */}
                            <div>
                                <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Article Title</label>
                                <input 
                                    type="text"
                                    value={data.title}
                                    onChange={handleTitleChange}
                                    className="w-full font-headline-lg text-xl md:text-headline-lg bg-transparent border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 transition-colors dark:text-white outline-none placeholder:text-sm md:placeholder:text-base" 
                                    placeholder="Enter a compelling headline..."
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="font-label-caps text-[10px] md:text-[11px] text-zinc-500 mb-1 block uppercase tracking-widest">URL Slug</label>
                                <div className="flex items-center text-xs text-zinc-400 font-mono border-b border-outline/50 py-1">
                                    <span className="select-none text-zinc-500">/articles/</span>
                                    <input 
                                        type="text"
                                        value={data.slug}
                                        onChange={handleSlugChange}
                                        className="flex-1 bg-transparent border-none focus:ring-0 px-1 py-0 outline-none text-amber-500 dark:text-amber-400 placeholder:text-zinc-600"
                                        placeholder="url-slug-artikel-ini"
                                    />
                                </div>
                                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                            </div>

                            <div>
                                <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Subheadline (Excerpt)</label>
                                <textarea
                                    rows="3"
                                    value={data.excerpt}
                                    onChange={e => setData('excerpt', e.target.value)}
                                    className="w-full font-body-lg text-base md:text-body-lg bg-transparent border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 resize-none transition-colors dark:text-white outline-none placeholder:text-sm" 
                                    placeholder="Write a brief, engaging summary or subheadline for this article..."
                                />
                                {errors.excerpt && <p className="text-red-500 text-xs mt-1">{errors.excerpt}</p>}
                            </div>
                        </section>

                        <section>
                            <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant mb-4 block uppercase tracking-widest">Featured Editorial Image</label>
                            <label className="relative group aspect-[16/7] md:aspect-[21/9] w-full border border-dashed border-outline-variant hover:border-primary flex flex-col items-center justify-center bg-surface-container-lowest dark:bg-zinc-900 transition-all cursor-pointer overflow-hidden p-4">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                    className="hidden" 
                                />
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="z-10 text-center">
                                        <span className="material-symbols-outlined text-[36px] md:text-[48px] text-outline mb-1.5">add_a_photo</span>
                                        <p className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant uppercase tracking-wider">Click to upload image</p>
                                    </div>
                                )}
                            </label>
                            {errors.thumbnail && <p className="text-red-500 text-xs mt-1">{errors.thumbnail}</p>}
                        </section>

                        <section className="w-full">
                            <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant mb-4 block uppercase tracking-widest">Article Body</label>
                            <div className="border border-outline-variant bg-surface-container-lowest dark:bg-zinc-900 w-full">
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 border-b border-outline-variant bg-surface-container-low dark:bg-zinc-800">
                                    <button type="button" onClick={() => formatText('paragraf')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Paragraph">format_paragraph</button>
                                    <button type="button" onClick={() => formatText('bold')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Bold">format_bold</button>
                                    <button type="button" onClick={() => formatText('italic')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Italic">format_italic</button>
                                    <button type="button" onClick={() => formatText('underline')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Underline">format_underlined</button>
                                    <div class="w-[1px] h-4 bg-outline-variant mx-1"></div>
                                    <button type="button" onClick={() => formatText('bullet')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Bullet List">format_list_bulleted</button>
                                    <button type="button" onClick={() => formatText('number')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Numbered List">format_list_numbered</button>
                                    <button type="button" onClick={() => formatText('quotes')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Quotes">format_quote</button>
                                    <div class="w-[1px] h-4 bg-outline-variant mx-1"></div>
                                    <button type="button" onClick={() => formatText('link')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Insert Link">link</button>
                                </div>
                                <textarea 
                                    ref={textareaRef}
                                    rows="12"
                                    className="w-full p-4 dark:bg-zinc-900 text-sm focus:outline-none border-none font-mono"
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    placeholder="Tulis konten artikel Anda di sini..."
                                ></textarea>
                            </div>
                            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                        </section>
                    </form>

                    {/* Sidebar Metadata (4 Columns) */}
                    <aside className="lg:col-span-4 space-y-6 w-full">
                        <div className="bg-surface-container-low dark:bg-zinc-900 p-6 border border-outline-variant space-y-6">
                            {(() => {
                                const sortedCategories = categories 
                                    ? [...categories].sort((a, b) => a.name.localeCompare(b.name)) 
                                    : [];

                                return (
                                    <>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-medium">Category</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowManageCategory(!showManageCategory)}
                                                    className="text-xs text-primary dark:text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">settings</span> Manage
                                                </button>
                                            </div>

                                            <select 
                                                className="w-full border p-2 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 uppercase text-xs focus:outline-none focus:border-secondary"
                                                value={data.category_id}
                                                onChange={e => setData('category_id', e.target.value)}
                                            >
                                                <option value="">Select Category</option>
                                                {sortedCategories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                                        </div>

                                        {showManageCategory && (
                                            <div className="p-4 border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 rounded-md">
                                                <div className="flex gap-2 mb-4">
                                                    <input 
                                                        type="text" 
                                                        placeholder="New Category..."
                                                        className="flex-1 text-xs border p-2 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                                                        value={newCategoryName}
                                                        onChange={e => setNewCategoryName(e.target.value)}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={handleAddCategory}
                                                        className="bg-zinc-800 text-white px-4 py-2 text-xs font-bold uppercase hover:opacity-90"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                {categoryError && <p className="text-red-500 text-xs mb-3">{categoryError}</p>}

                                                <div className="max-h-40 overflow-y-auto space-y-1">
                                                    {sortedCategories.map(cat => (
                                                        <div key={cat.id} className="flex justify-between items-center text-xs p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200">
                                                            <span className="uppercase">{cat.name}</span>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => initiateDeleteCategory(cat)} 
                                                                className="text-red-500 font-bold px-1 hover:text-red-700 transition-colors"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()} 

                            <div className="pt-5 border-t border-outline-variant space-y-4">
                                <label className="font-label-caps text-[11px] block uppercase tracking-widest text-zinc-400">Visibility Settings</label>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm dark:text-zinc-300">Allow Comments</span>
                                    <div 
                                        onClick={() => setData('allow_comments', !data.allow_comments)}
                                        className={`w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors ${data.allow_comments ? 'bg-amber-500 justify-end' : 'bg-zinc-700 justify-start'}`}
                                    >
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm dark:text-zinc-300">Feature on Homepage</span>
                                    <div 
                                        onClick={() => setData('feature_on_homepage', !data.feature_on_homepage)}
                                        className={`w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors ${data.feature_on_homepage ? 'bg-amber-500 justify-end' : 'bg-zinc-700 justify-start'}`}
                                    >
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Daftar Draf Tersimpan */}
                        <div className="bg-[#1e1e1e] p-5 border border-zinc-800">
                            <h3 className="text-xs font-mono tracking-wider uppercase text-amber-400 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                Draf Tersimpan ({drafts.length})
                            </h3>

                            {drafts.length === 0 ? (
                                <p className="text-xs text-zinc-500 italic py-2 text-center">Belum ada draf.</p>
                            ) : (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                    {drafts.map((draft) => (
                                        <div key={draft.id} className="p-3 bg-[#282828] hover:bg-[#303030] border border-zinc-800 transition flex flex-col justify-between gap-2">
                                            <div>
                                                <h4 className="text-xs font-medium text-zinc-200 line-clamp-1">{draft.title || '(Belum ada judul)'}</h4>
                                                <span className="text-[10px] text-zinc-500">{draft.category?.name || 'Tanpa Kategori'}</span>
                                            </div>
                                            <a href={`/articles/${draft.id}/edit`} className="text-center px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-blue-400 border border-zinc-700 transition">
                                                Buka Draf
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </main>

            {/* Modal Link (Tetap dipertahankan untuk fitur formatText) */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleInsertLink} className="bg-zinc-900 border border-zinc-800 p-6 max-w-sm w-full text-white space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">Insert Link</h3>
                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">URL Address</label>
                            <input 
                                type="text" 
                                value={linkUrl} 
                                onChange={e => setLinkUrl(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 text-xs">
                            <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold">Insert</button>
                        </div>
                    </form>
                </div>
            )}
        </MainLayout>
    );
}