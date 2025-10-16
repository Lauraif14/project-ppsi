import React from 'react';

const DetailInventarisModal = ({ data, onClose }) => {
    if (!data) return null;

    let checklist;
    try {
        checklist = JSON.parse(data.inventaris_checklist);
    } catch (e) {
        return <p>Gagal memuat data checklist.</p>;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl border-2 border-black w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Detail Laporan Inventaris</h3>
                <p className="mb-1"><span className="font-semibold">Dicek oleh:</span> {data.nama_lengkap}</p>
                <p className="mb-4"><span className="font-semibold">Waktu:</span> {new Date(data.waktu_masuk).toLocaleString('id-ID')}</p>
                <div className="space-y-2 max-h-64 overflow-y-auto border-t pt-4">
                    {checklist.map((item, index) => (
                        <div key={index} className="p-2 border rounded-lg">
                            <p><strong>Barang:</strong> {item.nama}</p>
                            <p><strong>Status:</strong> {item.status}</p>
                            {item.catatan && <p><strong>Catatan:</strong> {item.catatan}</p>}
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-6 w-full py-2 bg-gray-200 rounded-lg border-2 border-black">Tutup</button>
            </div>
        </div>
    );
};

export default DetailInventarisModal;