'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/tracking';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { setError('Contraseña incorrecta'); return; }
      localStorage.setItem('aura_admin', '1');
      router.push(redirect);
    } catch {
      setError('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full shadow-sm">
        <img src="/logo.svg?v=2" alt="AURA" className="h-12 mx-auto mb-6" />
        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">Acceso administrador</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Introduce la contraseña para acceder al panel privado.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" autoFocus className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300" />
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button type="submit" className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all text-sm">
            Acceder
          </button>
        </form>
      </div>
    </div>
  );
}