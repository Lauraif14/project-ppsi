// src/admin/components/RekapTable.jsx
// Komponen tabel untuk menampilkan rekap laporan mingguan/bulanan

import React from 'react';
import StatusPiketBadge from './StatusPiketBadge';

const RekapTable = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-8 rounded-xl border-2 border-black shadow-md text-center">
                <p className="text-gray-500">Tidak ada data rekap untuk periode ini</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-bold">No</th>
                            <th className="px-4 py-3 text-left text-sm font-bold">Nama Lengkap</th>
                            <th className="px-4 py-3 text-left text-sm font-bold">Divisi</th>
                            <th className="px-4 py-3 text-left text-sm font-bold">Jabatan</th>
                            <th className="px-4 py-3 text-center text-sm font-bold">Total Jadwal</th>
                            <th className="px-4 py-3 text-center text-sm font-bold">Selesai</th>
                            <th className="px-4 py-3 text-center text-sm font-bold">Tidak Selesai</th>
                            <th className="px-4 py-3 text-center text-sm font-bold">Tidak Piket</th>
                            <th className="px-4 py-3 text-center text-sm font-bold">Persentase</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((item, index) => {
                            const totalJadwal = parseInt(item.total_jadwal) || 0;
                            const totalSelesai = parseInt(item.total_selesai) || 0;
                            const persentase = totalJadwal > 0
                                ? Math.round((totalSelesai / totalJadwal) * 100)
                                : 0;

                            // Tentukan warna persentase
                            let persentaseColor = 'text-red-600';
                            if (persentase >= 80) persentaseColor = 'text-green-600';
                            else if (persentase >= 50) persentaseColor = 'text-yellow-600';

                            return (
                                <tr
                                    key={item.user_id || index}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {item.nama_lengkap}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{item.divisi || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{item.jabatan || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">
                                        {totalJadwal}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold">
                                            {item.total_selesai || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                                            {item.total_tidak_selesai || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold">
                                            {item.total_tidak_piket || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className={`font-bold text-lg ${persentaseColor}`}>
                                            {persentase}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t-2 border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                    Total {data.length} pengurus ditampilkan
                </p>
            </div>
        </div>
    );
};

export default RekapTable;
