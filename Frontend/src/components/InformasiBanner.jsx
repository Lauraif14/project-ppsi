// src/components/InformasiBanner.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function InformasiBanner({ maxItems = 3 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 🔹 pakai instance api, bukan axios langsung
        const resp = await api.get('/informasi', { headers, timeout: 8000 });

        let data = [];
        if (Array.isArray(resp.data)) data = resp.data;
        else if (resp.data && Array.isArray(resp.data.data)) data = resp.data.data;
        else if (resp.data && Array.isArray(resp.data.items)) data = resp.data.items;
        else if (resp.data && typeof resp.data === 'object') {
          data = resp.data.data || resp.data.items || [];
          if (!Array.isArray(data)) data = [];
        }

        // urutkan: SOP, Panduan, Informasi Lain, lalu created_at terbaru
        const sorted = [...data].sort((a, b) => {
          const ka = (a.kategori || '').toLowerCase();
          const kb = (b.kategori || '').toLowerCase();

          const order = { sop: 1, panduan: 2, 'informasi lain': 3 };
          const oa = order[ka] || 99;
          const ob = order[kb] || 99;

          if (oa !== ob) return oa - ob;

          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          return 0;
        });

        if (mounted) setItems(sorted.slice(0, maxItems));
      } catch (err) {
        console.error('InformasiBanner: gagal ambil data informasi', err);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [maxItems]);

  if (loading) return null;
  if (!items || items.length === 0) return null;

  const buildFileUrl = (filePath) => {
    if (!filePath) return null;
    const base = (process.env.REACT_APP_API_URL || '/api')
      .replace(/\/api\/?$/i, '')
      .replace(/\/$/, '');
    return `${base}/${filePath.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  return (
    <div className="mb-5">
      {/* Header kecil & simple */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold tracking-[0.25em] text-gray-700 uppercase">
          Informasi
        </h3>
        <a
          href="/informasi"
          className="text-[11px] text-pink-600 hover:text-pink-700 underline"
        >
          Lihat semua
        </a>
      </div>

      {/* Card lebih kecil dan ringkas */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 shadow-sm">
        <ul className="space-y-1.5 text-sm">
          {items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {/* Badge kategori kecil */}
                  <span className="inline-flex items-center rounded-full bg-white/80 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                    {it.kategori || 'Info'}
                  </span>
                  <span className="font-medium text-gray-900 truncate">
                    {it.judul}
                  </span>
                </div>
                <p className="text-[12px] text-gray-700 mt-0.5 line-clamp-2">
                  {it.isi
                    ? it.isi.length > 120
                      ? `${it.isi.slice(0, 120)}...`
                      : it.isi
                    : <em>Tidak ada deskripsi</em>}
                </p>
              </div>

              {it.file_path && (
                <div className="flex items-center flex-shrink-0">
                  <a
                    href={buildFileUrl(it.file_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-pink-600 hover:text-pink-700 underline whitespace-nowrap"
                  >
                    Buka
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
