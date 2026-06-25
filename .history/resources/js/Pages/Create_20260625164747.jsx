import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Create({ categories = [], article = null, drafts = [] }) {
    const isEditMode = !!article;

    const [linkModal, setLinkModal] = useState({
        show: false,
        url: '',
        range: null,
        top: 0,
        left: 0
    });

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
        is_draft: article ? article.status === 'draft' : true, 
    });

    const [isSaving, setIsSaving] = useState(false);
    const [currentArticleId, setCurrentArticleId] = useState(article?.id || null);
    
    const editorRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Memasukkan teks awal ke dalam editor saat pertama kali halaman dimuat
    useEffect(() => {
        if (editorRef.current) {
            const initialContent = article?.content || data?.content || '<p><br></p>';
            editorRef.current.innerHTML = initialContent;
        }
    }, []);

    // Membersihkan timer saat komponen tidak lagi digunakan (unmount)
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    // Auto-save logic
    useEffect(() => {
        if (
            !data.title.trim() &&
            (!data.content.trim() || data.content === "<p><br></p>")
        ) {
            return;
        }

        const timer = setTimeout(async () => {
            setIsSaving(true);
            const formData = new FormData();

            formData.append("id", currentArticleId ?? "");
            formData.append("title", data.title);
            formData.append("slug", data.slug);
            formData.append("excerpt", data.excerpt);
            formData.append("content", data.content);
            formData.append("category_id", data.category_id ?? "");
            formData.append("is_draft", true);

            // upload thumbnail hanya jika masih berupa File
            if (data.thumbnail instanceof File) {
                formData.append("thumbnail", data.thumbnail);
            } else {
                formData.append("thumbnail", data.thumbnail ?? "");
            }

            try {

                const response = await axios.post(
                    "/api/articles/auto-save",
                    formData
                );

                if (response.data.article_id) {
                    setCurrentArticleId(response.data.article_id);
                }

            } finally {

                setIsSaving(false);

            }

        }, 5000);

        return () => clearTimeout(timer);

    }, [
        data.title,
        data.slug,
        data.excerpt,
        data.content,
        data.category_id,
        data.thumbnail
    ]);

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

    // Menggunakan Debounce untuk mencegah kursor melompat saat menghapus/mengetik
    const handleEditorChange = () => {
        if (!editorRef.current) return;

        const allSpans = editorRef.current.querySelectorAll('span');

        allSpans.forEach(span => {
            if (
                !span.hasAttribute('class') &&
                !span.hasAttribute('style') &&
                span.tagName.toLowerCase() === 'span'
            ) {
                const textNode = document.createTextNode(span.textContent);
                span.parentNode.replaceChild(textNode, span);
            }
        });

        const allLis = editorRef.current.querySelectorAll('li');
        allLis.forEach(li => {
            if (li.hasAttribute('style')) {
                li.removeAttribute('style');
            }
        });

        let html = editorRef.current.innerHTML;
        
        // Standarisasi konten kosong
        if (html === '' || html === '<br>' || html === '<div><br></div>') {
            html = '<p><br></p>';
            editorRef.current.innerHTML = html;
        }

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
            const temp = document.createElement('div');
            temp.innerHTML = html;

            temp.querySelectorAll('*').forEach(el => {
                [...el.attributes].forEach(attr => {
                    const name = attr.name.toLowerCase();

                    if (
                        name.startsWith('data-') ||
                        name.startsWith('aria-') ||
                        name.startsWith('js')
                    ) {
                        el.removeAttribute(attr.name);
                    }
                });
            });

            temp.querySelectorAll("div").forEach(div => {
                const p = document.createElement("p");
                p.innerHTML = div.innerHTML;
                div.replaceWith(p);
            });

            temp.querySelectorAll('a').forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });

            html = temp.innerHTML;
            temp.querySelectorAll('*').forEach(el => {
                if (
                    el.tagName !== 'A' &&
                    el.tagName !== 'BLOCKQUOTE' &&
                    el.tagName !== 'H2'
                ) {
                    el.removeAttribute('style');
                }

                [...el.attributes].forEach(attr => {
                    const name = attr.name.toLowerCase();

                    if (
                        name.startsWith('data-') ||
                        name.startsWith('aria-') ||
                        name.startsWith('js')
                    ) {
                        el.removeAttribute(attr.name);
                    }
                });
            });
            if (!html.includes('<p') && !html.includes('<h2') && !html.includes('<blockquote')) {
                html = `<p>${editorRef.current.innerHTML}</p>`;
                editorRef.current.innerHTML = html;
            }
            setData('content', html); // Menyimpan HTML bersih ke database
        }, 500);
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const text = e.clipboardData.getData('text/plain');

        document.execCommand(
            'insertText',
            false,
            text
        );
    };

    const handleEditorKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const selection = window.getSelection();
        if (!selection.rangeCount) return;

        let node = selection.anchorNode;

        while (node && node !== editorRef.current) {
            if (node.nodeType === 1 && node.tagName === "H2") {

                e.preventDefault();

                const p = document.createElement("p");
                p.innerHTML = "<br>";

                node.parentNode.insertBefore(p, node.nextSibling);

                const range = document.createRange();
                range.setStart(p, 0);
                range.collapse(true);

                selection.removeAllRanges();
                selection.addRange(range);

                handleEditorChange();

                return;
            }

            node = node.parentNode;
        }
    };

    // Fungsi eksekutor tombol format text Rich Text (Hanya Menyisipkan Tag Tanpa Atribut Style)
    const formatText = (command, value = null) => {
        if (!editorRef.current) return;
        
        editorRef.current.focus();

        if (command === 'subheadline') {
            const selection = window.getSelection();

            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);

            if (range.collapsed) return;

            const h2 = document.createElement('h2');

            try {
                range.surroundContents(h2);
                const p = document.createElement("p");
                p.innerHTML = "<br>";

                h2.parentNode.insertBefore(p, h2.nextSibling);

                const range = document.createRange();
                range.setStart(p, 0);
                range.collapse(true);

                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } catch (err) {
                const content = range.extractContents();
                h2.appendChild(content);
                range.insertNode(h2);
            }
        } else if (command === 'quotes') {
            const selection = window.getSelection();

            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);

            let node = range.commonAncestorContainer;

            while (node && node !== editorRef.current) {
                if (
                    node.nodeType === 1 &&
                    node.tagName.toLowerCase() === 'blockquote'
                ) {
                    const parent = node.parentNode;

                    while (node.firstChild) {
                        parent.insertBefore(node.firstChild, node);
                    }

                    parent.removeChild(node);

                    setData('content', editorRef.current.innerHTML);
                    return;
                }

                node = node.parentNode;
            }

            if (range.collapsed) return;

            const blockquote = document.createElement('blockquote');

            try {
                range.surroundContents(blockquote);
            } catch (err) {
                const content = range.extractContents();
                blockquote.appendChild(content);
                range.insertNode(blockquote);
            }

            setData('content', editorRef.current.innerHTML);
        } else if (command === 'bullet' || command === 'number') {
            const nativeCommand = command === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList';
            document.execCommand(nativeCommand, false, value);

            const elementsToClean = editorRef.current.querySelectorAll(
                'li, li span, ul, ol, ul span, ol span'
            );

            elementsToClean.forEach(el => {
                if (el.hasAttribute('style')) {
                    el.removeAttribute('style');
                }
            });
            
        } else if (command === 'bold') {
            // Memicu tag <strong> atau <b> murni
            document.execCommand('bold', false, value);
            
            // Singkirkan span pembawa inline style pengganggu saat melakukan text-selection bold
            const spans = editorRef.current.querySelectorAll('span');
            spans.forEach(span => {
                if (span.hasAttribute('style')) {
                    span.removeAttribute('style');
                }
            });
        } else if (command === 'link') {
            const selection = window.getSelection();
            let range = null;
            if (selection && selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
            }
            let topPosition = 0;
            let leftPosition = 0;

            if (linkButtonRef.current) {
                const rect = linkButtonRef.current.getBoundingClientRect();
                topPosition = rect.bottom + window.scrollY + 8; 
                leftPosition = rect.left + window.scrollX;
                
                if (leftPosition + 280 > window.innerWidth) {
                    leftPosition = window.innerWidth - 300;
                }

                setLinkModal({
                show: true,
                url: 'https://',
                range: range,
                top: topPosition,
                left: leftPosition
            });
            }
            else {
                alert('Silakan pilih/blok teks yang ingin diberi link terlebih dahulu.');
            }
        } else {
            document.execCommand(command, false, value);
        }

        // Sinkronisasi data HTML bersih terakhir ke state formulir Inertia sebelum disubmit
        if (editorRef.current) {
            setData('content', editorRef.current.innerHTML);
        }
    };

    const linkButtonRef = useRef(null);
    const applyCustomLink = (e) => {
        e.preventDefault();
        
        if (!linkModal.url || linkModal.url === 'https://' || linkModal.url.trim() === '') {
            setLinkModal(prev => ({ ...prev, show: false }));
            return;
        }

        editorRef.current.focus();
        const selection = window.getSelection();

        if (linkModal.range) {
            selection.removeAllRanges();
            selection.addRange(linkModal.range);
            document.execCommand('createLink', false, linkModal.url);
        } else {
            const cleanUrl = linkModal.url.trim();
            const anchorTag = `
            <a href="${cleanUrl}"
            rel="noopener noreferrer"
            target="_blank">
            ${cleanUrl}
            </a>`;
            document.execCommand('insertHTML', false, anchorTag);
        }

        if (editorRef.current) {
            const links = editorRef.current.querySelectorAll('a');
            links.forEach(link => {
                link.removeAttribute('style');
            });
            // Sinkronisasi data HTML bersih terakhir ke Inertia
            setData('content', editorRef.current.innerHTML);
        }

        // Tutup modal popover
        setLinkModal(prev => ({ ...prev, show: false, range: null }));
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        router.post('/categories', { name: newCategoryName }, {
            onSuccess: () => {
                setNewCategoryName('');
                setCategoryError('');
                Toast.fire({ icon: 'success', title: 'Kategori berhasil ditambahkan!' });
            },
            onError: (err) => {
                setCategoryError(err.name || 'Gagal menambahkan kategori.');
            },
            preserveScroll: true,
        });
    };

    const initiateDeleteCategory = (cat) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Kategori "${cat.name}" akan dihapus secara permanen!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', 
            cancelButtonColor: '#27272a',  
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            background: '#1e1e1e',
            color: '#f3f4f6'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/categories/${cat.id}`, {
                    onSuccess: () => {
                        if (data.category_id == cat.id) {
                            setData('category_id', '');
                        }
                        Toast.fire({ icon: 'success', title: 'Kategori berhasil dihapus!' });
                    },
                    preserveScroll: true,
                });
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData("thumbnail", file);
        setImagePreview(URL.createObjectURL(file));
    }

    const handleSaveDraft = (e) => {
        if (e) e.preventDefault();
        const finalContent = editorRef.current ? editorRef.current.innerHTML : data.content;
        const payload = { ...data, content: finalContent, is_draft: true };
        const activeId = article?.id || currentArticleId;

        if (isEditMode || activeId) {
            router.post(`/articles/${activeId}`, payload, {
                forceFormData: true,
                onSuccess: () => {
                    Toast.fire({ icon: 'info', title: 'Perubahan draf berhasil disimpan!', iconColor: '#38bdf8' });
                }
            });
        } else {
            router.post('/articles', payload, { 
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    if (editorRef.current) editorRef.current.innerHTML = '<p><br></p>';
                    setImagePreview(null);
                    Toast.fire({ icon: 'info', title: 'Draf baru berhasil disimpan!', iconColor: '#38bdf8' });
                },
            });
        }
    };
    
    const handlePublish = (e) => {
        if (e) e.preventDefault();
        const finalContent = editorRef.current ? editorRef.current.innerHTML : data.content;
        const activeId = article?.id || currentArticleId;
        const publishPayload = { ...data, content: finalContent, is_draft: false };

        if (isEditMode || activeId) {
            router.post(route('articles.update', activeId), publishPayload, {
                forceFormData: true,
                onSuccess: () => {
                    Toast.fire({ icon: 'success', title: 'Artikel berhasil diterbitkan!' });
                },
                onError: (err) => {
                    console.error("Gagal Update:", err);
                    Toast.fire({ icon: 'error', title: 'Gagal memperbarui artikel.' });
                }
            });
        } else {
            router.post(route('articles.store'), publishPayload, { 
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    if (editorRef.current) editorRef.current.innerHTML = '<p><br></p>';
                    setImagePreview(null);
                    Toast.fire({ icon: 'success', title: 'Artikel baru berhasil dipublikasikan!' });
                },
                onError: (err) => {
                    console.error("Gagal Simpan Baru:", err);
                    Toast.fire({ icon: 'error', title: 'Gagal menerbitkan artikel.' });
                }
            });
        }
    };

    return (
        <MainLayout>
            <Head title="Create Article | The Modern Broadsheet" />

            <main className="max-w-content-max-width mx-auto px-4 md:px-margin-edge py-12 w-full overflow-x-hidden">
                <div className="mb-10 md:mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant pb-6 md:pb-8">
                    <div className="max-w-2xl">
                        <span className="font-label-caps text-[10px] md:text-label-caps text-secondary dark:text-amber-500 mb-1.5 block tracking-widest">Editorial Dashboard</span>
                        <h1 className="font-headline-lg text-2xl md:text-headline-lg text-primary dark:text-white tracking-tight">
                            {isEditMode ? 'Edit Article / Draft' : 'Compose New Article'}
                        </h1>

                        <div className="mt-2 flex items-center gap-2 h-5">
                            {isSaving ? (
                                <span className="text-xs text-amber-500 font-mono flex items-center gap-1.5 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Menyimpan draf otomatis...
                                </span>
                            ) : data.title || (data.content && data.content !== '<p><br></p>') ? (
                                <span className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Draf aman di server
                                </span>
                            ) : null}
                        </div>
                        
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
                            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-secondary dark:bg-on-secondary dark:hover:bg-amber-600 text-white dark:text-primary font-label-caps text-[11px] md:text-label-caps hover:shadow-lg transition-all disabled:opacity-50 uppercase tracking-widest cursor-pointer"
                        >
                            {processing ? 'Publishing...' : isEditMode ? 'Update & Publish' : 'Publish Article'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8 md:space-y-10 w-full">
                        <section className="space-y-6">
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
                                    rows="5"
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
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
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

                        {/* SECTION RICH TEXT EDITOR */}
                        <section className="w-full">
                            <label className="font-label-caps text-[11px] md:text-label-caps text-on-surface-variant mb-4 block uppercase tracking-widest">Article Body</label>
                            <div className="border border-outline-variant bg-surface-container-lowest dark:bg-zinc-900 w-full">
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 border-b border-outline-variant bg-surface-container-low dark:bg-zinc-800">
                                    <button type="button" onClick={() => formatText('bold')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-white" title="Bold">format_bold</button>
                                    <button type="button" onClick={() => formatText('italic')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-white" title="Italic">format_italic</button>
                                    <button type="button" onClick={() => formatText('underline')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-white" title="Underline">format_underlined</button>
                                    <button type="button" onClick={() => formatText('subheadline')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-white" title="Subheadline">label</button>
                                    <div className="w-[1px] h-4 bg-outline-variant mx-1"></div>
                                    <button type="button" onClick={() => formatText('bullet')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-white" title="Bullet List">format_list_bulleted</button>
                                    <button type="button" onClick={() => formatText('number')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-white" title="Numbered List">format_list_numbered</button>
                                    <button type="button" onClick={() => formatText('quotes')} className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-white" title="Quotes">format_quote</button>
                                    <div className="w-[1px] h-4 bg-outline-variant mx-1"></div>
                                    <button 
                                        type="button" 
                                        ref={linkButtonRef} // <-- PASANG REFERENSI DI SINI
                                        onClick={() => formatText('link')} 
                                        className="material-symbols-outlined text-[18px] md:text-[20px] text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-white cursor-pointer" 
                                        title="Insert Link"
                                    >
                                        link
                                    </button>
                                </div>
                                
                                <div 
                                    ref={editorRef}
                                    contentEditable
                                    suppressContentEditableWarning={true}
                                    onInput={handleEditorChange}
                                    onPaste={handlePaste}
                                    onKeyDown={handleEditorKeyDown}
                                    className="w-full p-4 pl-10 dark:bg-zinc-900 text-sm focus:outline-none border-none min-h-[320px] focus:ring-0 overflow-y-auto font-sans"
                                    style={{ outline: 'none' }}
                                ></div>

                                <style>{`
                                    [contenteditable] h2 {
                                        font-family: 'Newsreader', serif;
                                        font-weight: 600 !important;
                                        color: currentColor;
                                        line-height: 1.6;
                                        margin-top: 1.5rem !important;
                                        margin-bottom: 1.5rem !important;
                                        display: block !important;
                                    }
                                    [contenteditable] h2 { font-size: 22px !important; }    
                                    [contenteditable] p { 
                                        margin-top: 0px !important; 
                                        margin-bottom: 1rem !important; 
                                        font-size: 15px !important;
                                        line-height: 1.6;
                                    }
                                    [contenteditable] ul { 
                                        list-style-type: disc !important; 
                                        margin-left: 1.25rem !important; 
                                        padding-left: 0px !important; }
                                    [contenteditable] ol { list-style-type: decimal !important; margin-left: 1.25rem !important; padding-left: 0px !important; }
                                    [contenteditable] li { display: list-item !important; margin-bottom: 0px !important; margin-top: 0px !important; }
                                    [contenteditable] blockquote {
                                        border-left: 4px solid #bb0021;
                                        padding-left: 16px;
                                        margin: 16px 0;
                                        font-style: italic;
                                        opacity: 0.9;
                                    }
                                    [contenteditable] a {
                                        color: #bb0021;
                                        text-decoration: underline;
                                        font-weight: 500;
                                    }
                                `}</style>
                            </div>
                            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                        </section>
                    </div>

                    {/* Sidebar Metadata */}
                    <aside className="lg:col-span-4 space-y-6 w-full">
                        <div className="bg-surface-container-low dark:bg-zinc-900 p-6 border border-outline-variant space-y-6">
                            {(() => {
                                const sortedCategories = categories ? [...categories].sort((a, b) => a.name.localeCompare(b.name)) : [];

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
                                                value={data.category_id || ''}
                                                onChange={e => setData('category_id', e.target.value === '' ? '' : Number(e.target.value))}
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
                                                    <button type="button" onClick={handleAddCategory} className="bg-zinc-800 text-white px-4 py-2 text-xs font-bold uppercase hover:opacity-90">Add</button>
                                                </div>
                                                {categoryError && <p className="text-red-500 text-xs mb-3">{categoryError}</p>}

                                                <div className="max-h-40 overflow-y-auto space-y-1">
                                                    {sortedCategories.map(cat => (
                                                        <div key={cat.id} className="flex justify-between items-center text-xs p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200">
                                                            <span className="uppercase">{cat.name}</span>
                                                            <button type="button" onClick={() => initiateDeleteCategory(cat)} className="text-red-500 font-bold px-1 hover:text-red-700 transition-colors">✕</button>
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
                                        className={`w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors ${data.allow_comments ? 'bg-secondary dark:bg-amber-500 justify-end' : 'bg-zinc-700 justify-start'}`}
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

                        {/* LIVE PREVIEW CARD */}
                        <div className="border border-outline-variant bg-surface-container-low dark:bg-zinc-900 p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                                <label className="font-label-caps text-[11px] block uppercase tracking-widest text-zinc-400">Live Card Preview</label>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider">Live</span>
                            </div>
                            
                            <div className="group block border border-outline-variant/60 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="aspect-[16/9] w-full bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview Card Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="text-center text-zinc-400 p-4">
                                            <span className="material-symbols-outlined text-[32px] block mb-1">image</span>
                                            <span className="text-xs font-mono">No Image Uploaded</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 md:p-5 space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-label-caps tracking-wider text-amber-600 dark:text-amber-500 font-bold uppercase">
                                            {categories && categories.find(c => String(c.id) === String(data?.category_id))?.name || 'Uncategorized'}
                                        </span>
                                    </div>

                                    <h3 className="font-headline-sm text-base md:text-lg font-bold text-primary dark:text-white line-clamp-2 leading-tight tracking-tight min-h-[2.5rem]">
                                        {data?.title?.trim() ? data.title : <span className="text-zinc-400 italic font-normal">Untitled Headline</span>}
                                    </h3>

                                    <p className="font-body-sm text-xs md:text-sm text-on-surface-variant dark:text-zinc-400 line-clamp-3 leading-relaxed min-h-[3rem]">
                                        {data?.excerpt?.trim() ? data.excerpt : <span className="text-zinc-500 italic">No subheadline or excerpt written yet...</span>}
                                    </p>
                                    
                                    <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                                        <span>By You • Just now</span>
                                        {data?.feature_on_homepage && (
                                            <span className="flex items-center gap-1 text-amber-500 font-semibold uppercase tracking-wider">
                                                <span className="w-1 h-1 rounded-full bg-amber-500"></span> Featured
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SAVED DRAFTS SIDEBAR (PENGAMAN TOTAL) */}
                        <div className="bg-surface-container dark:bg-[#1e1e1e] p-5 border border-zinc-800">
                            <h3 className="text-xs font-mono tracking-wider uppercase text-secondary dark:text-amber-400 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-secondary dark:bg-amber-500 animate-pulse"></span>
                                Draf Tersimpan ({drafts?.length || 0})
                            </h3>

                            {!drafts || drafts.length === 0 ? (
                                <p className="text-xs text-zinc-500 italic py-2 text-center">Belum ada draf.</p>
                            ) : (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                    {drafts.map((draft) => {
                                        if (!draft) return null;
                                        return (
                                            <div key={draft.id} className="p-3 bg-on-secondary dark:bg-[#282828] dark:hover:bg-[#303030] border border-zinc-800 transition flex flex-col justify-between gap-2">
                                                <div>
                                                    <h4 className="text-primary text-xs font-medium dark:text-zinc-200 line-clamp-1">{draft?.title || '(Belum ada judul)'}</h4>
                                                    <span className="text-[10px] text-zinc-500">{draft?.category?.name || 'Tanpa Kategori'}</span>
                                                </div>
                                                <a href={`/articles/${draft?.id}/edit`} className="text-center px-3 py-1 bg-outline dark:bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-on-secondary border border-zinc-700 transition">
                                                    Buka Draf
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
            {/* --- INLINE LINK POPOVER MODERN --- */}
            {linkModal.show && (
                <div 
                    className="absolute z-[999] p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-lg flex items-center gap-2 max-w-sm w-[280px] sm:w-[320px]"
                    style={{ 
                        top: `${linkModal.top}px`, 
                        left: `${linkModal.left}px` 
                    }}
                >
                    <form onSubmit={applyCustomLink} className="flex items-center gap-2 w-full">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined text-[16px] text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2">
                                link
                            </span>
                            <input 
                                type="text"
                                value={linkModal.url}
                                onChange={(e) => setLinkModal({ ...linkModal, url: e.target.value })}
                                placeholder="Paste or type URL..."
                                autoFocus
                                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:border-secondary dark:focus:border-amber-500 text-slate-800 dark:text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-md text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
                        >
                            Apply
                        </button>
                        <button
                            type="button"
                            onClick={() => setLinkModal(prev => ({ ...prev, show: false }))}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-600 transition-colors flex-shrink-0 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[16px] block">close</span>
                        </button>
                    </form>
                </div>
            )}
        </MainLayout>
    );
}