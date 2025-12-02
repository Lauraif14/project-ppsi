import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Edit, Trash2, PlusCircle, FileText } from 'lucide-react';

const InformationPage = () => {
  const [informasi, setInformasi] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // <-- new

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log('[InformationPage] fetching /informasi with headers:', !!headers.Authorization);
      const response = await api.get('/informasi', { headers });
      console.log('[InformationPage] raw response:', response);

      // normalize: support array or { data: [...] } or { data: { data: [...] } }
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data?.data?.data)) {
        data = response.data.data.data;
      } else {
        data = [];
      }

      console.log('[InformationPage] normalized data length:', data.length);
      setInformasi(data);
    } catch (err) {
      console.error('[InformationPage] fetch error:', err);
      // set better error message for UI
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err.message || 'Unknown error';
      setError(`Gagal memuat data (HTTP ${status || '??'}): ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (item = null) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus informasi ini?')) return;
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.delete(`/informasi/${id}`, { headers });
      console.log('[InformationPage] delete response:', res);
      alert('Informasi berhasil dihapus.');
      fetchData();
    } catch (err) {
      console.error('Hapus gagal:', err);
      alert('Gagal menghapus informasi. Cek console untuk detail.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Master Data Informasi</h1>
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg border-2 border-black">
              <PlusCircle size={20} /> Tambah Baru
            </button>
          </div>

          {/* error / loading UI */}
          {loading && (
            <div className="p-6 bg-white border-2 border-black rounded-xl shadow-lg text-center">
              <div className="text-lg font-semibold mb-2">Memuat informasi...</div>
              <div className="text-sm text-gray-600">Jika membutuhkan waktu lama, periksa koneksi server atau token autentikasi.</div>
            </div>
          )}

          {error && (
            <div className="p-4 mb-4 bg-red-50 border-2 border-red-300 text-red-700 rounded">
              <strong>Error:</strong> {error}
              <div className="mt-2 text-xs text-gray-600">
                Periksa Console (F12 → Console) untuk detail. Jika menunjukkan 401/403, cek token di localStorage.
              </div>
            </div>
          )}

          {/* main table */}
          {!loading && !error && (
            <div className="bg-white border-2 border-black rounded-xl shadow-lg overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50 border-b-2 border-black">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold uppercase">Judul</th>
                    <th className="p-4 text-left text-sm font-semibold uppercase">Kategori</th>
                    <th className="p-4 text-left text-sm font-semibold uppercase">Tanggal</th>
                    <th className="p-4 text-left text-sm font-semibold uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {informasi.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-gray-600">Belum ada informasi.</td></tr>
                  ) : (
                    informasi.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="p-4 font-medium max-w-[420px]">
                          <div className="truncate" title={item.judul}>{item.judul}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.isi ? item.isi : <em>Tidak ada deskripsi</em>}</div>
                        </td>
                        <td className="p-4 text-gray-600">{item.kategori || 'Informasi Lain'}</td>
                        <td className="p-4 text-gray-600">{item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}</td>
                        <td className="p-4 flex gap-2">
                          {item.file_path && (
                            <a
                              href={(process.env.REACT_APP_API_URL || '/api').replace(/\/api$/,'') + '/' + item.file_path.replace(/\\/g,'/')}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-gray-700 hover:bg-gray-100 rounded-full inline-flex items-center gap-2"
                              title="Buka file"
                            >
                              <FileText size={16} />
                            </a>
                          )}
                          <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Hapus"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <InfoModal item={selectedItem} onClose={handleCloseModal} onSave={fetchData} />
      )}
    </div>
  );
};


// Modal untuk Tambah/Edit (support file upload)
const InfoModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({ judul: '', isi: '', kategori: 'SOP' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        judul: item.judul || '',
        isi: item.isi || '',
        kategori: item.kategori || 'SOP'
      });
      setFile(null);
    } else {
      setFormData({ judul: '', isi: '', kategori: 'SOP' });
      setFile(null);
    }
  }, [item]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || formData.judul.trim() === '') {
      alert('Judul wajib diisi');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'multipart/form-data' };

      const payload = new FormData();
      payload.append('judul', formData.judul);
      payload.append('isi', formData.isi || '');
      payload.append('kategori', formData.kategori || 'Informasi Lain');
      if (file) payload.append('file', file);

      if (item) {
        // edit
        const res = await api.put(`/informasi/${item.id}`, payload, { headers });
        console.log('[InfoModal] update response:', res);
        alert(res.data?.message || 'Informasi berhasil diupdate');
      } else {
        // create
        const res = await api.post('/informasi', payload, { headers });
        console.log('[InfoModal] create response:', res);
        alert(res.data?.message || 'Informasi berhasil dibuat');
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Simpan informasi gagal:', err);
      alert('Gagal menyimpan informasi. Cek console untuk detail.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl border-2 border-black w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{item ? 'Edit' : 'Tambah'} Informasi</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="judul"
            value={formData.judul}
            onChange={handleChange}
            placeholder="Judul"
            className="w-full p-3 border-2 border-black rounded-lg"
            required
          />

          <textarea
            name="isi"
            value={formData.isi}
            onChange={handleChange}
            placeholder="Isi konten..."
            rows="6"
            className="w-full p-3 border-2 border-black rounded-lg"
          />

          <select
            name="kategori"
            value={formData.kategori}
            onChange={handleChange}
            className="w-full p-3 border-2 border-black rounded-lg bg-white"
          >
            <option value="SOP">SOP</option>
            <option value="Panduan">Panduan</option>
            <option value="Informasi Lain">Informasi Lain</option>
          </select>

          <div>
            <label className="block text-sm font-medium mb-1">File (opsional)</label>
            <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
            {item && item.file_path && (
              <div className="text-xs text-gray-600 mt-2">
                File saat ini: <a
                  href={(process.env.REACT_APP_API_URL || '/api').replace(/\/api$/,'') + '/' + item.file_path.replace(/\\/g,'/')}
                  target="_blank" rel="noreferrer" className="underline"
                >
                  {item.file_path.split('/').pop()}
                </a>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="px-6 py-2 bg-gray-200 rounded-lg border-2 border-black">Batal</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg border-2 border-black">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InformationPage;
