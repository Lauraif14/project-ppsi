import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Upload, Download, FileText, Edit2, Save, X, Eye } from 'lucide-react';

const InformationPage = () => {
    const [sopFile, setSopFile] = useState(null);
    const [jobdeskFile, setJobdeskFile] = useState(null);
    const [informasiTambahan, setInformasiTambahan] = useState({ judul: '', isi: '', is_active: false });
    const [activeInfo, setActiveInfo] = useState(null);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [uploading, setUploading] = useState({ sop: false, jobdesk: false, info: false });

    const fetchData = async () => {
        try {
            const res = await api.get('/informasi');
            const data = res.data.data || res.data;

            // Get SOP and Job Desk
            const sop = data.find(item => item.kategori === 'SOP');
            const jobdesk = data.find(item => item.kategori === 'Panduan');
            const infoLain = data.find(item => item.kategori === 'Informasi Lain' && item.is_active);

            setSopFile(sop || null);
            setJobdeskFile(jobdesk || null);
            setActiveInfo(infoLain || null);

            if (infoLain) {
                setInformasiTambahan({
                    id: infoLain.id,
                    judul: infoLain.judul,
                    isi: infoLain.isi,
                    is_active: infoLain.is_active
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleFileUpload = async (kategori, file) => {
        if (!file) return;

        const uploadKey = kategori === 'SOP' ? 'sop' : 'jobdesk';
        setUploading({ ...uploading, [uploadKey]: true });

        const formData = new FormData();
        formData.append('judul', kategori === 'SOP' ? 'SOP Piket' : 'Job Desk Piket');
        formData.append('kategori', kategori);
        formData.append('isi', '');
        formData.append('is_active', true);
        formData.append('file', file);

        try {
            const existing = kategori === 'SOP' ? sopFile : jobdeskFile;
            if (existing && existing.id) {
                await api.put(`/informasi/${existing.id}`, formData);
            } else {
                await api.post('/informasi', formData);
            }
            fetchData();
            alert(`${kategori} berhasil diupload!`);
        } catch (err) {
            alert(`Gagal upload ${kategori}`);
            console.error(err);
        } finally {
            setUploading({ ...uploading, [uploadKey]: false });
        }
    };

    const handleSaveInformasi = async () => {
        if (!informasiTambahan.judul || !informasiTambahan.isi) {
            alert('Judul dan isi informasi harus diisi!');
            return;
        }

        setUploading({ ...uploading, info: true });

        const formData = new FormData();
        formData.append('judul', informasiTambahan.judul);
        formData.append('isi', informasiTambahan.isi);
        formData.append('kategori', 'Informasi Lain');
        formData.append('is_active', true); // Selalu aktif

        try {
            if (informasiTambahan.id) {
                await api.put(`/informasi/${informasiTambahan.id}`, formData);
            } else {
                await api.post('/informasi', formData);
            }
            fetchData();
            setIsEditingInfo(false);
            alert('Informasi berhasil disimpan!');
        } catch (err) {
            alert('Gagal menyimpan informasi');
            console.error(err);
        } finally {
            setUploading({ ...uploading, info: false });
        }
    };

    return (
        <div className="flex bg-gray-50 h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Informasi</h1>
                            <p className="text-gray-600">Upload SOP, Job Desk, dan atur informasi tambahan</p>
                        </div>

                        {/* Preview Informasi Aktif */}
                        {activeInfo && !isEditingInfo && (
                            <div className="p-6 border-2 border-pink-500 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center border-2 border-black flex-shrink-0">
                                        <Eye size={24} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <span className="inline-block px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-lg border-2 border-black mb-2">
                                                    PREVIEW DASHBOARD
                                                </span>
                                                <h3 className="text-xl font-bold text-gray-900">{activeInfo.judul}</h3>
                                            </div>
                                            <button
                                                onClick={() => setIsEditingInfo(true)}
                                                className="px-4 py-2 bg-white border-2 border-black rounded-lg font-medium hover:bg-gray-50 hover:shadow-md transition-all flex items-center gap-2"
                                            >
                                                <Edit2 size={16} /> Edit
                                            </button>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap">{activeInfo.isi}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form Edit Informasi Tambahan */}
                        {(isEditingInfo || !activeInfo) && (
                            <div className="p-6 border-2 border-black rounded-xl bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Informasi Tambahan</h2>
                                    {activeInfo && (
                                        <button
                                            onClick={() => {
                                                setIsEditingInfo(false);
                                                setInformasiTambahan({
                                                    id: activeInfo.id,
                                                    judul: activeInfo.judul,
                                                    isi: activeInfo.isi,
                                                    is_active: activeInfo.is_active
                                                });
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-4">Informasi ini akan ditampilkan di dashboard user dan admin</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Informasi</label>
                                        <input
                                            type="text"
                                            value={informasiTambahan.judul}
                                            onChange={(e) => setInformasiTambahan({ ...informasiTambahan, judul: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                            placeholder="Contoh: Pengumuman Penting"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Isi Informasi</label>
                                        <textarea
                                            value={informasiTambahan.isi}
                                            onChange={(e) => setInformasiTambahan({ ...informasiTambahan, isi: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none h-32 resize-none"
                                            placeholder="Tulis informasi yang akan ditampilkan..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleSaveInformasi}
                                        disabled={uploading.info}
                                        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} />
                                        {uploading.info ? 'Menyimpan...' : 'Simpan Informasi'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SOP & Job Desk Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* SOP Card */}
                            <DocumentCard
                                title="SOP Piket"
                                color="blue"
                                file={sopFile}
                                uploading={uploading.sop}
                                onUpload={(file) => handleFileUpload('SOP', file)}
                            />

                            {/* Job Desk Card */}
                            <DocumentCard
                                title="Job Desk Piket"
                                color="green"
                                file={jobdeskFile}
                                uploading={uploading.jobdesk}
                                onUpload={(file) => handleFileUpload('Panduan', file)}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Component untuk Document Card
const DocumentCard = ({ title, color, file, uploading, onUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = React.useRef(null);

    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-400',
            icon: 'bg-blue-500',
            button: 'bg-blue-500 hover:bg-blue-600'
        },
        green: {
            bg: 'bg-green-50',
            border: 'border-green-400',
            icon: 'bg-green-500',
            button: 'bg-green-500 hover:bg-green-600'
        }
    };

    const colors = colorClasses[color];

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUploadClick = () => {
        if (selectedFile) {
            onUpload(selectedFile);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`p-6 border-2 ${colors.border} rounded-xl ${colors.bg} shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${colors.icon} rounded-lg flex items-center justify-center border-2 border-black`}>
                    <FileText size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="text-xs text-gray-600">PDF, DOC, DOCX (Max 10MB)</p>
                </div>
            </div>

            {/* Current File */}
            {file && file.file_path && (
                <div className="mb-4 p-3 bg-white border-2 border-black rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">File Saat Ini:</p>
                    <a
                        href={`${BASE_URL}/${file.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        <Download size={16} />
                        {file.file_path.split('/').pop()}
                    </a>
                </div>
            )}

            {/* Upload Area */}
            <div className="space-y-3">
                <label className="block">
                    <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 text-center hover:border-gray-600 transition-colors cursor-pointer bg-white">
                        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-700">
                            {selectedFile ? selectedFile.name : 'Pilih file baru'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Klik untuk memilih file</p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </label>

                <button
                    onClick={handleUploadClick}
                    disabled={!selectedFile || uploading}
                    className={`w-full px-6 py-3 rounded-lg bg-gradient-to-r ${colors.button.replace('bg-', 'from-').replace(' hover:bg-', ' to-')} text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                    <Upload size={20} />
                    {uploading ? 'Mengupload...' : 'Upload File'}
                </button>
            </div>
        </div>
    );
};

export default InformationPage;