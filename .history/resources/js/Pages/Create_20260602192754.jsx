import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Create({ categories = [] }) {
    // 1. Ambil data form state dari Inertia useForm pipeline
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        subheadline: '',
        content: '',
        category_id: categories[0]?.id || '',
        thumbnail: null,
        allow_comments: true,
        feature_on_homepage: false,
        tags: ['EXCLUSIVE', 'ANALYSIS']
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [tagInput, setTagInput] = useState('');

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

    const handleAddTag = () => {
        if (tagInput.trim() && !data.tags.includes(tagInput.trim().toUpperCase())) {
            setData('tags', [...data.tags, tagInput.trim().toUpperCase()]);
            setTagInput('');
        }
    };

    // 2. Handler untuk Simpan sebagai Draf (Mengarah ke tabel drafts)
    const handleSaveDraft = () => {
        post('/admin/drafts', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
                alert('Draf berhasil disimpan!');
            },
        });
    };

    // 3. Handler untuk Publish Artikel (Mengarah ke tabel articles)
    const handlePublish = (e) => {
        if(e) e.preventDefault();
        post('/admin/articles', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
                alert('Artikel berhasil diterbitkan!');
            },
        });
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
                                    <button type="button" className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white">format_bold</button>
                                    <button type="button" className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white">format_italic</button>
                                    <button type="button" className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white">format_underlined</button>
                                    <div className="w-[1px] h-4 bg-outline-variant mx-0.5"></div>
                                    <button type="button" className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white">format_list_bulleted</button>
                                    <button type="button" className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white">format_list_numbered</button>
                                    <div className="w-[1px] h-4 bg-outline-variant mx-0.5"></div>
                                    <button type="button" className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant hover:text-primary dark:hover:text-white">link</button>
                                </div>
                                <textarea
                                    rows="12"
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    className="w-full p-4 md:p-8 bg-transparent border-none focus:ring-0 text-on-surface text-base md:text-body-lg resize-y dark:text-zinc-200 outline-none placeholder:text-sm leading-relaxed"
                                    placeholder="Begin typing your broadsheet story here..."
                                />
                            </div>
                            {errors.content && <p className="text-error text-xs mt-1">{errors.content}</p>}
                        </section>
                    </div>

                    {/* Sidebar Metadata (4 Columns) */}
                    <aside className="lg:col-span-4 space-y-6 md:space-y-8 w-full">
                        <div className="bg-surface-container-low dark:bg-zinc-900 p-6 md:p-8 border border-outline-variant space-y-6 md:space-y-8">
                            {/* Category Selection */}
                            <div className="space-y-4">
                                <div>
                                    <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Primary Category</label>
                                    <select 
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        className="w-full bg-surface-container-lowest dark:bg-zinc-800 border border-outline-variant px-3 md:px-4 py-2 text-base md:text-sm text-on-surface-variant focus:ring-primary focus:border-primary dark:text-zinc-200 outline-none"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Topical Tags Management */}
                            <div className="pt-5 border-t border-outline-variant">
                                <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant mb-3 block uppercase tracking-widest">Topical Tags</label>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {data.tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-surface-container-highest dark:bg-zinc-800 border border-outline-variant font-label-caps text-[9px] md:text-[10px] uppercase dark:text-zinc-300 tracking-wider">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        className="text-base md:text-xs px-2 py-1.5 md:py-1 bg-transparent border border-outline-variant focus:ring-primary focus:border-primary w-full dark:text-white outline-none uppercase placeholder:text-xs placeholder:normal-case"
                                        placeholder="NEW TAG..."
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleAddTag}
                                        className="px-4 py-1.5 md:py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider"
                                    >
                                        +Add
                                    </button>
                                </div>
                            </div>

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
                                    {data.subheadline || data.content || 'Your subheadline or opening paragraph will be summarized in the grid view cards...'}
                                </p>
                            </div>
                        </div>
                    </aside>
                </form>
            </main>
        </MainLayout>
    );
}