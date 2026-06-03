import React, { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Create({ categories = [], article=null }) {
    const isEditMode = !!article;

    // Ambil data form state dari Inertia useForm pipeline
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: article?.title || '',
        subheadline: article?.slug || '',
        content: article?.content || '',
        category_id: article?.category_id || categories[0]?.id || '',
        thumbnail: null,
        allow_comments: article ? !!article.allow_comments : true,
        feature_on_homepage: article ? !!article.feature_on_homepage : false,
    });

    const [imagePreview, setImagePreview] = useState(
        article?.thumbnail 
            ? article.thumbnail.startsWith('http') 
                ? article.thumbnail
                : `/storage/${article.thumbnail}` 
            : null
    );

    // State untuk mengelola visibilitas Quick Category Manager
    const [showManageCategory, setShowManageCategory] = useState(false);

    // State tambahan untuk mengelola Kategori Baru via Modal
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryError, setCategoryError] = useState('');

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

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

    // --- FUNGSI TAMBAH KATEGORI ---
    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        router.post('/categories', { name: newCategoryName }, {
            onSuccess: () => {
                setNewCategoryName('');
                setCategoryError('');
            },
            onError: (err) => {
                setCategoryError(err.name || 'Gagal menambahkan kategori.');
            },
            preserveScroll: true,
        });
    };

    // --- FUNGSI KONFIRMASI HAPUS ---
    const initiateDeleteCategory = (cat) => {
        setCategoryToDelete(cat);
        setIsDeleteConfirmOpen(true);
    };

    // --- FUNGSI EKSEKUSI HAPUS KATEGORI ---
    const handleExecuteDelete = () => {
        if (!categoryToDelete) return;

        router.delete(`/categories/${categoryToDelete.id}`, {
            onSuccess: () => {
                if (data.category_id == categoryToDelete.id) {
                    setData('category_id', '');
                }
                setIsDeleteConfirmOpen(false);
                setCategoryToDelete(null);
            },
            preserveScroll: true,
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

    // Handler untuk Simpan sebagai Draf (Mengarah ke tabel drafts)
    const handleSaveDraft = () => {
        post('/drafts', { 
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
                alert('Draf berhasil disimpan!');
            },
        });
    };

    // Handler untuk Publish Artikel (Mengarah ke tabel articles)
    const handlePublish = (e) => {
        if (e) e.preventDefault();

        if (isEditMode) {
            router.post(`/articles/${article.id}`, {
                ...data,
                _method: 'PUT',
            }, {
                forceFormData: true,
                onSuccess: () => {
                    alert('Artikel berhasil diperbarui!');
                },
            });
        } else {
            post('/articles', { 
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setImagePreview(null);
                    alert('Artikel berhasil diterbitkan!');
                },
            });
        }
    };

    return (
        <MainLayout>
            <Head title="Create Article | The Modern Broadsheet" />

            <main className="max-w-content-max-width mx-auto px-4 md:px-margin-edge py-12 w-full overflow-x-hidden">
                {/* Editor Header */}
                <div className="mb-10 md:mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant pb-6 md:pb-8">
                    <div className="max-w-2xl">
                        <span className="font-label-caps text-[10px] md:text-label-caps text-secondary mb-1.5 block tracking-widest">Editorial Dashboard</span>
                        <h1 className="font-headline-lg text-2xl md:text-headline-lg text-primary dark:text-white tracking-tight">Compose New Article</h1>
                        {Object.keys(errors).length > 0 && (
                        <div className="p-4 my-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
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
                            className="w-full sm:w-auto px-6 py-3 border border-primary dark:border-white font-label-caps text-[11px] md:text-label-caps hover:bg-surface-container dark:hover:bg-zinc-800 transition-all dark:text-white uppercase tracking-widest disabled:opacity-50"
                        >
                            Save Draf
                        </button>
                        <button 
                            type="button"
                            onClick={handlePublish}
                            disabled={processing}
                            className="w-full sm:w-auto px-6 py-3 bg-primary dark:bg-secondary text-on-primary font-label-caps text-[11px] md:text-label-caps hover:shadow-lg transition-all disabled:opacity-50 uppercase tracking-widest"
                        >
                            {processing ? 'Publishing...' : 'Publish Article'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter w-full">
                    {/* Main Content Area (8 Columns) */}
                    <div className="lg:col-span-8 space-y-8 md:space-y-10 w-full">
                        {/* Title & Subheadline */}
                        <section className="space-y-6">
                            <div>
                                <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Article Title</label>
                                <input 
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full font-headline-lg text-xl md:text-headline-lg bg-transparent border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 transition-colors dark:text-white outline-none placeholder:text-sm md:placeholder:text-base" 
                                    placeholder="Enter a compelling headline..."
                                />
                                {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Subheadline</label>
                                <textarea 
                                    rows="2"
                                    value={data.subheadline}
                                    onChange={e => setData('subheadline', e.target.value)}
                                    className="w-full font-body-lg text-base md:text-body-lg bg-transparent border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 resize-none transition-colors dark:text-white outline-none placeholder:text-sm" 
                                    placeholder="The bridge between your title and the story's depth..."
                                />
                                {errors.subheadline && <p className="text-error text-xs mt-1">{errors.subheadline}</p>}
                            </div>
                        </section>

                        {/* Featured Image Upload Area */}
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
                                        <p className="text-[9px] md:text-[10px] text-outline mt-1 italic">Recommended: 2000 x 850px</p>
                                    </div>
                                )}
                            </label>
                            {errors.thumbnail && <p className="text-error text-xs mt-1">{errors.thumbnail}</p>}
                        </section>

                        {/* Article Body */}
                        <section className="w-full">
                            <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant mb-4 block uppercase tracking-widest">Article Body</label>
                            <div className="border border-outline-variant bg-surface-container-lowest dark:bg-zinc-900 w-full">
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 border-b border-outline-variant bg-surface-container-low dark:bg-zinc-800">
                                    <button type="button" onClick={() => formatText('paragraf')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Paragraph">format_paragraph</button>
                                    <button type="button" onClick={() => formatText('bold')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Bold">format_bold</button>
                                    <button type="button" onClick={() => formatText('italic')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Italic">format_italic</button>
                                    <button type="button" onClick={() => formatText('underline')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Underline">format_underlined</button>
                                    <div className="w-[1px] h-4 bg-outline-variant mx-0.5"></div>
                                    <button type="button" onClick={() => formatText('bullet')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Bullet List">format_list_bulleted</button>
                                    <button type="button" onClick={() => formatText('number')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white" title="Numbered List">format_list_numbered</button>
                                    <div className="w-[1px] h-4 bg-outline-variant mx-0.5"></div>
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
                            {errors.content && <p className="text-error text-xs mt-1">{errors.content}</p>}
                        </section>
                    </div>

                    {/* Sidebar Metadata (4 Columns) */}
                    <aside className="lg:col-span-4 space-y-6 md:space-y-8 w-full">
                        <div className="bg-surface-container-low dark:bg-zinc-900 p-6 md:p-8 border border-outline-variant space-y-6 md:space-y-8">
                            {/* Category Selection */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium">Category</label>
                                    {/* Tombol memicu modal kustom atau inline manager */}
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowManageCategory(!showManageCategory);
                                        }}
                                        className="text-xs text-primary dark:text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">settings</span> Manage Categories
                                    </button>
                                </div>

                                <select 
                                    className="w-full border p-2 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 uppercase text-xs focus:outline-none focus:border-secondary dark:focus:border-amber-500"
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                            </div>

                            {/* INTERFACE QUICK MANAGE KATEGORI (TAMBAH & HAPUS) */}
                            {showManageCategory && (
                                <div className="p-4 border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 rounded-md">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Quick Category Manager</h4>
                                        <button 
                                            type="button"
                                            onClick={() => setIsCategoryModalOpen(true)}
                                            className="text-[11px] text-blue-600 hover:underline"
                                        >
                                            Open Full View
                                        </button>
                                    </div>
                                    
                                    {/* Form Input Tambah Kategori */}
                                    <div className="flex gap-2 mb-4">
                                        <input 
                                            type="text" 
                                            placeholder="New Category Name..."
                                            className="flex-1 text-xs border p-2 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleAddCategory}
                                            className="bg-secondary dark:bg-amber-500 text-white px-4 py-2 text-xs font-bold uppercase hover:opacity-90"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {categoryError && <p className="text-red-500 text-xs mb-3">{categoryError}</p>}

                                    {/* Daftar Kategori dengan Tombol Hapus */}
                                    <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                                        {categories.map(cat => (
                                            <div key={cat.id} className="flex justify-between items-center text-xs p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                                <span className="uppercase">{cat.name}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => initiateDeleteCategory(cat)}
                                                    className="text-red-500 dark:text-red-400 hover:text-red-700 font-bold px-1"
                                                    title="Delete Category"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )} 

                            {/* Visibility Settings Using Toggles linked to State */}
                            <div className="pt-5 border-t border-outline-variant space-y-4">
                                <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant block uppercase tracking-widest">Visibility Settings</label>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-body-md dark:text-zinc-300">Allow Comments</span>
                                    <div 
                                        onClick={() => setData('allow_comments', !data.allow_comments)}
                                        className={`w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors ${data.allow_comments ? 'bg-secondary justify-end' : 'bg-outline-variant justify-start'}`}
                                    >
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-body-md dark:text-zinc-300">Feature on Homepage</span>
                                    <div 
                                        onClick={() => setData('feature_on_homepage', !data.feature_on_homepage)}
                                        className={`w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors ${data.feature_on_homepage ? 'bg-secondary justify-end' : 'bg-outline-variant justify-start'}`}
                                    >
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Live Preview Card Card */}
                        <div className="border border-outline-variant p-4 md:p-6 space-y-4 w-full">
                            <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant block uppercase tracking-widest">Card Live Preview</label>
                            <div className="group bg-white dark:bg-zinc-900 p-4 shadow-sm border border-outline-variant/30 w-full">
                                <div className="aspect-video bg-surface-container-low dark:bg-zinc-800 mb-4 overflow-hidden relative w-full">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview card" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-outline text-xs">No Media Selected</div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white font-label-caps text-[9px] tracking-widest">LATEST</div>
                                </div>
                                <h4 className="font-headline-md text-base md:text-[18px] leading-tight mb-2 dark:text-white uppercase line-clamp-2 tracking-tight">
                                    {data.title || 'Headline Will Appear Here After Entry'}
                                </h4>
                                <p className="font-body-md text-xs md:text-[13px] text-on-surface-variant line-clamp-2 leading-relaxed">
                                    {data.subheadline ? (
                                        data.subheadline
                                    ) : data.content ? (
                                        data.content.replace(/<\/?[^>]+(>|$)/g, "")
                                    ) : (
                                        'Your subheadline or opening paragraph will be summarized in the grid view cards...'
                                    )}
                                </p>
                            </div>
                        </div>
                    </aside>
                </form>

                {/* POP-UP INSERT LINK CUSTOM */}
                {isLinkModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                            onClick={() => setIsLinkModalOpen(false)}
                        ></div>

                        <div className="relative bg-white dark:bg-zinc-900 border border-outline-variant dark:border-zinc-800 p-6 md:p-8 w-full max-w-md shadow-2xl transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-['Newsreader'] italic text-xl md:text-2xl font-semibold text-primary dark:text-zinc-100">
                                    Insert Hyperlink
                                </h3>
                                <button 
                                    type="button"
                                    onClick={() => setIsLinkModalOpen(false)}
                                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer text-lg font-medium"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleInsertLink} className="space-y-5">
                                <div>
                                    <label className="block font-label-caps text-[10px] tracking-widest text-zinc-500 dark:text-zinc-400 uppercase font-bold mb-2">
                                        Destination URL
                                    </label>
                                    <input 
                                        type="url" 
                                        required
                                        className="w-full text-sm border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-secondary dark:focus:border-amber-500 font-mono"
                                        placeholder="https://example.com"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        autoFocus
                                    />
                                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">
                                        Pastikan tautan dimulai dengan http:// atau https://
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsLinkModalOpen(false)}
                                        className="px-4 py-2.5 text-xs font-label-caps uppercase tracking-wider font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-5 py-2.5 font-label-caps text-xs uppercase tracking-wider font-bold hover:bg-secondary dark:hover:bg-amber-500 dark:hover:text-zinc-900 transition-colors cursor-pointer shadow-md"
                                    >
                                        Insert Link
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL FULL VIEW MANAJEMEN KATEGORI */}
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}></div>

                        <div className="relative bg-white dark:bg-zinc-900 border border-outline-variant dark:border-zinc-800 p-6 md:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-['Newsreader'] italic text-xl md:text-2xl font-semibold text-primary dark:text-zinc-100">
                                    Category Manager
                                </h3>
                                <button 
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-medium cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleAddCategory} className="mb-4">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Add new category..."
                                        className="flex-1 text-xs border p-2 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                    />
                                    <button type="submit" className="bg-primary text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 text-xs font-bold uppercase">
                                        Add
                                    </button>
                                </div>
                                {categoryError && <p className="text-red-500 text-xs mt-1">{categoryError}</p>}
                            </form>

                            <div className="max-h-60 overflow-y-auto space-y-1.5">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex justify-between items-center text-xs p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                        <span className="uppercase font-medium">{cat.name}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => initiateDeleteCategory(cat)}
                                            className="text-red-500 hover:text-red-700 font-bold px-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI HAPUS KATEGORI */}
                {isDeleteConfirmOpen && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-xs" onClick={() => setIsDeleteConfirmOpen(false)}></div>
                        <div className="relative bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/40 p-6 w-full max-w-sm shadow-2xl">
                            <div className="text-center space-y-3">
                                <h3 className="italic text-xl font-semibold text-red-600 dark:text-red-400">Delete Category?</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Are you sure you want to permanently delete <strong className="uppercase">"{categoryToDelete?.name}"</strong>?
                                </p>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 px-4 py-2 text-xs border border-zinc-300 text-zinc-600 dark:text-zinc-400">Cancel</button>
                                <button type="button" onClick={handleExecuteDelete} className="flex-1 bg-red-600 text-white px-4 py-2 text-xs font-bold">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </MainLayout>
    );
}