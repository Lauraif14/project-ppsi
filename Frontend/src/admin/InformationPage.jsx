import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

const InformationPage = () => {
    const [informasi, setInformasi] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        const response = await api.get('/informasi', { headers: { 'Authorization': `Bearer ${token}` } });
        setInformasi(response.data);
    };

    useEffect(() => {
        fetchData();
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
        if (window.confirm('Apakah Anda yakin ingin menghapus informasi ini?')) {
            const token = localStorage.getItem("token");
            await api.delete(`/informasi/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchData();
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

                    <div className="bg-white border-2 border-black rounded-xl shadow-lg">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-black">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold uppercase">Judul</th>
                                    <th className="p-4 text-left text-sm font-semibold uppercase">Kategori</th>
                                    <th className="p-4 text-left text-sm font-semibold uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {informasi.map(item => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-4 font-medium">{item.judul}</td>
                                        <td className="p-4 text-gray-600">{item.kategori}</td>
                                        <td className="p-4 flex gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
            {isModalOpen && <InfoModal item={selectedItem} onClose={handleCloseModal} onSave={fetchData} />}
        </div>
    );
};

// Modal untuk Tambah/Edit
const InfoModal = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState({ judul: '', isi: '', kategori: 'SOP' });

    useEffect(() => {
        if (item) {
            setFormData({ judul: item.judul, isi: item.isi, kategori: item.kategori });
        } else {
            setFormData({ judul: '', isi: '', kategori: 'SOP' });
        }
    }, [item]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const headers = { 'Authorization': `Bearer ${token}` };
        
        if (item) { // Edit
            await api.put(`/informasi/${item.id}`, formData, { headers });
        } else { // Tambah
            await api.post('/informasi', formData, { headers });
        }
        onSave();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl border-2 border-black w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">{item ? 'Edit' : 'Tambah'} Informasi</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="judul" value={formData.judul} onChange={handleChange} placeholder="Judul" className="w-full p-3 border-2 border-black rounded-lg" required />
                    <textarea name="isi" value={formData.isi} onChange={handleChange} placeholder="Isi konten..." rows="10" className="w-full p-3 border-2 border-black rounded-lg" required />
                    <select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full p-3 border-2 border-black rounded-lg bg-white">
                        <option value="SOP">SOP</option>
                        <option value="Panduan">Panduan</option>
                        <option value="Jobdesk">Jobdesk</option>
                    </select>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg border-2 border-black">Batal</button>
                        <button type="submit" className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg border-2 border-black">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InformationPage