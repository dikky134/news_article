<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Menampilkan daftar pengguna dari database dan merendernya ke tampilan React.
     */
    public function index()
    {
        $users = User::with('role')->latest()->paginate(10);

        // Path folder wajib disamakan dengan struktur aslimu: Admin/users/index
        return Inertia::render('Admin/users/index', [
            'users' => $users
        ]);
    }

    /**
     * Menyimpan data pendaftaran pengguna baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            // Aturan validasi memastikan data role hanya boleh bernilai 1, 2, atau 3
            'role_id' => 'required|in:1,2,3',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => (int) $request->role_id,
        ]);

        return redirect()->back()->with('success', 'User berhasil ditambahkan.');
    }

    /**
     * Memperbarui data pengguna lama di database tanpa wajib mengubah kata sandi.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role_id' => 'required|in:1,2,3',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->role_id = (int) $request->role_id;

        // Sandi hanya diperbarui jika kotak input form sandi diisi
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('success', 'Data user berhasil diperbarui.');
    }

    /**
     * Menghapus profil akun dari sistem secara permanen.
     */
    public function destroy(User $user)
    {
        // Memblokir upaya penghapusan profil diri sendiri untuk menghindari error sesi.
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'Anda tidak bisa menghapus akun Anda sendiri.');
        }

        $user->delete();
        
        return redirect()->back()->with('success', 'User berhasil dihapus dari sistem.');
    }
}