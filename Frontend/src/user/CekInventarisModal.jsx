// src/user/CekInventarisModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Package, Save, AlertCircle } from 'lucide-react';

const CekInventarisModal = ({ isOpen, onClose, onSubmitSuccess }) => {
    const [checklist, setChecklist] = useState([]);
    const [note, setNote] = useState('');
    const [absensiId, setAbsensiId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchChecklist();
        }
    }, [isOpen]);

    const fetchChecklist = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/absensi/checklist');

            if (response.data.success) {
                setChecklist(response.data.data.checklist);
                setNote(response.data.data.note || '');
                setAbsensiId(response.data.data.absensiId);
            }
        } catch (err) {
            console.error('Error fetching checklist:', err);
            setError('Gagal memuat checklist inventaris');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (index, newStatus) => {
        const updated = [...checklist];
        updated[index].status = newStatus;
        setChecklist(updated);
    };



    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError('');

            await api.post('/absensi/submit-checklist', {
                absensiId,
                checklist,
                note
            });

            onSubmitSuccess();
        } catch (err) {
            console.error('Error submitting checklist:', err);
            setError('Gagal menyimpan checklist');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b-2 border-black bg-purple-500 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Package className="text-white" size={32} />
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                            Cek Inventaris
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-purple-600 rounded-lg transition-colors"
                    >
                        <X className="text-white" size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle size={48} className="text-red-500 mb-4" />
                            <p className="text-lg font-bold text-red-600">{error}</p>
                            <button
                                onClick={fetchChecklist}
                                className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* List Inventaris */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                                    Daftar Inventaris ({checklist.length} item)
                                </h3>

                                {checklist.map((item, index) => (
                                    <div
                                        key={item.inventaris_id}
                                        className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">
                                                    {item.nama}
                                                </h4>
                                                {item.kode_barang && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Kode: {item.kode_barang}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status Selector */}
                                            <div className="flex gap-2">
                                                {['Baik', 'Rusak', 'Hilang'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(index, status)}
                                                        className={`px-4 py-2 rounded-lg border-2 border-black font-bold text-sm transition-all ${item.status === status
                                                            ? status === 'Baik'
                                                                ? 'bg-green-500 text-white'
                                                                : status === 'Rusak'
                                                                    ? 'bg-yellow-500 text-black'
                                                                    : 'bg-red-500 text-white'
                                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>

                            {/* Note Tambahan */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-900 uppercase tracking-tight">
                                    Catatan Tambahan (Opsional)
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Tambahkan catatan umum tentang kondisi inventaris..."
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!loading && !error && (
                    <div className="p-6 border-t-2 border-black bg-gray-50 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white text-gray-700 rounded-xl border-2 border-black font-bold hover:bg-gray-100 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 py-3 bg-purple-500 text-white rounded-xl border-2 border-black font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Simpan Checklist
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CekInventarisModal;
