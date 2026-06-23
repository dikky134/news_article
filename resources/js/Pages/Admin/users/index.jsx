import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import Swal from 'sweetalert2';

export default function Index({ users }) {
    // Mengontrol status munculnya popup formulir (modal).
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Menjadi penanda apakah pengguna sedang menambah data baru atau mengedit data lama.
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Merekam ID pengguna yang profilnya sedang diubah.
    const [editingUserId, setEditingUserId] = useState(null);

    // Mengelola alur inputan form menggunakan bantuan Inertia.
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '2', // Menggunakan format teks '2' sebagai nilai mutlak awal
    });

    // Menyiapkan formulir bersih khusus untuk pembuatan pengguna baru.
    const openAddModal = () => {
        setIsEditMode(false);
        reset();
        setData('role_id', '2'); // Memaksa role kembali ke User Biasa
        clearErrors();
        setIsModalOpen(true);
    };

    // Menyuntikkan data lama pengguna ke dalam kotak inputan form.
    const openEditModal = (user) => {
        setIsEditMode(true);
        setEditingUserId(user.id);
        setData({
            name: user.name || '',
            email: user.email || '',
            password: '', 
            // PERBAIKAN MUTLAK: Jika database kosong, paksa menjadi "2"
            role_id: user.role_id ? String(user.role_id) : '2',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    // Mengeksekusi pengiriman beban data form (payload) ke rute Backend.
    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditMode) {
            put(route('admin.users.update', editingUserId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire({ title: 'Berhasil!', text: 'Data user diperbarui.', icon: 'success', timer: 2000, showConfirmButton: false });
                }
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire({ title: 'Berhasil!', text: 'User baru telah ditambahkan.', icon: 'success', timer: 2000, showConfirmButton: false });
                }
            });
        }
    };

    // Memicu notifikasi bahaya sebelum benar-benar membakar data pengguna dari sistem.
    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Hapus User?',
            text: `Anda yakin ingin menghapus akun "${name}" secara permanen?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus',
            background: document.documentElement.classList.contains('dark') ? '#1e1e1e' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.users.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({ title: 'Terhapus!', text: 'User berhasil dihapus.', icon: 'success', timer: 2000, showConfirmButton: false });
                    },
                    onError: (err) => {
                        Swal.fire('Gagal', Object.values(err)[0] || 'Terjadi kesalahan.', 'error');
                    }
                });
            }
        });
    };

    return (
        <MainLayout activePage="admin">
            <Head title="Kelola User - Super Admin" />

            <div className="w-full max-w-5xl mx-auto py-8 px-4 relative min-h-[60vh]">
                
                {/* Mencetak teks panduan awal dan meletakkan tombol tambah user. */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-outline-variant dark:border-zinc-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold font-display-xl tracking-tighter text-primary dark:text-white">
                            Kelola User
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Manajemen hak akses dan operasional akun pengguna.
                        </p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="bg-primary dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary dark:hover:bg-amber-500 transition-colors flex-shrink-0"
                    >
                        + Tambah User
                    </button>
                </div>

                {/* Merangkai arsitektur baris sel demi menampilkan populasi data pengguna. */}
                <div className="bg-white dark:bg-[#181818] border border-outline-variant dark:border-zinc-800 rounded-sm overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-zinc-900/50 border-b border-outline-variant dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Nama</th>
                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Email</th>
                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Role</th>
                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant dark:divide-zinc-800">
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-primary dark:text-zinc-200">{user.name}</td>
                                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                                            <td className="px-6 py-4">
                                                {/* Memberi corak indikasi visual terhadap tingkat hierarki masing-masing anggota. */}
                                                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                                                    user.role_id === 3 
                                                        ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' 
                                                        : user.role_id === 1
                                                        ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50'
                                                        : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                                                }`}>
                                                    {user.role ? user.role.name : 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => openEditModal(user)} className="text-xs font-bold text-secondary dark:text-amber-500 hover:underline px-3">
                                                    Edit
                                                </button>
                                                {user.role_id !== 3 && (
                                                    <button onClick={() => handleDelete(user.id, user.name)} className="text-xs font-bold text-red-600 hover:underline pl-3">
                                                        Hapus
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-zinc-500 italic">Belum ada data user.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Menjalankan roda urutan navigasi (pagination) bilamana data melampaui 10 entitas. */}
                    {users.links && users.links.length > 3 && (
                        <div className="p-4 border-t border-outline-variant dark:border-zinc-800 flex justify-end gap-2 flex-wrap">
                            {users.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 text-xs border rounded-sm transition-colors ${
                                        link.active 
                                            ? 'bg-primary text-white border-primary dark:bg-zinc-700 dark:border-zinc-700 dark:text-white' 
                                            : 'text-zinc-600 border-outline dark:text-zinc-400 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Melukiskan area dialog melayang (modal) guna menangkap ketikan pengguna. */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                        <div className="bg-white dark:bg-[#181818] w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative">
                            
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 dark:hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>

                            <h2 className="text-xl font-bold font-serif mb-6 text-slate-900 dark:text-white">
                                {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                        className="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-sm focus:outline-none focus:border-primary dark:focus:border-amber-500 dark:text-white" 
                                        required 
                                    />
                                    {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Alamat Email</label>
                                    <input 
                                        type="email" 
                                        value={data.email} 
                                        onChange={e => setData('email', e.target.value)} 
                                        className="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-sm focus:outline-none focus:border-primary dark:focus:border-amber-500 dark:text-white" 
                                        required 
                                    />
                                    {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                                        Kata Sandi {isEditMode && <span className="lowercase font-normal text-[10px] ml-1">(Kosongkan jika tidak ingin diubah)</span>}
                                    </label>
                                    <input 
                                        type="password" 
                                        value={data.password} 
                                        onChange={e => setData('password', e.target.value)} 
                                        className="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-sm focus:outline-none focus:border-primary dark:focus:border-amber-500 dark:text-white" 
                                        required={!isEditMode} 
                                    />
                                    {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Hak Akses (Role)</label>
                                    <select 
                                        value={data.role_id} 
                                        onChange={e => setData('role_id', e.target.value)} 
                                        className="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-sm focus:outline-none focus:border-primary dark:focus:border-amber-500 dark:text-white cursor-pointer"
                                    >
                                        <option value="2" className="bg-white dark:bg-zinc-800 text-black dark:text-white">User Biasa</option>
                                        <option value="1" className="bg-white dark:bg-zinc-800 text-black dark:text-white">Administrator</option>
                                        <option value="3" className="bg-white dark:bg-zinc-800 text-red-500 font-bold">Super Admin</option>
                                    </select>
                                    {errors.role_id && <div className="text-red-500 text-xs mt-1">{errors.role_id}</div>}
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="px-4 py-2 text-xs font-bold uppercase text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={processing} 
                                        className="bg-primary dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary dark:hover:bg-amber-500 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </MainLayout>
    );
}