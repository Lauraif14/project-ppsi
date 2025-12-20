// src/admin/components/RekapSummary.jsx
// Komponen untuk menampilkan summary rekap laporan mingguan/bulanan

import React from 'react';
import { Users, CheckCircle, AlertCircle, XCircle, Calendar } from 'lucide-react';

const RekapSummary = ({ rekapData, periodType }) => {
    if (!rekapData || !rekapData.summary) return null;

    const { summary, period } = rekapData;

    // Format periode untuk display
    const getPeriodText = () => {
        if (periodType === 'mingguan') {
            const start = new Date(period.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            const end = new Date(period.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            return `${start} - ${end}`;
        } else if (periodType === 'bulanan') {
            const monthName = new Date(period.year, period.month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            return monthName;
        }
        return '';
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-black shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={24} />
                    Rekap Periode: {getPeriodText()}
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Total Pengurus */}
                <div className="bg-white p-4 rounded-lg border-2 border-black shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={20} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">Total Pengurus</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{summary.total_pengurus || 0}</p>
                </div>

                {/* Total Jadwal */}
                <div className="bg-white p-4 rounded-lg border-2 border-black shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={20} className="text-purple-600" />
                        <span className="text-sm font-medium text-gray-600">Total Jadwal</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{summary.total_jadwal || 0}</p>
                </div>

                {/* Selesai */}
                <div className="bg-white p-4 rounded-lg border-2 border-green-400 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={20} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-600">Selesai</span>
                    </div>
                    <p className="text-3xl font-bold text-green-700">{summary.total_selesai || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {summary.total_jadwal > 0
                            ? `${Math.round((summary.total_selesai / summary.total_jadwal) * 100)}%`
                            : '0%'
                        }
                    </p>
                </div>

                {/* Tidak Selesai */}
                <div className="bg-white p-4 rounded-lg border-2 border-yellow-400 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={20} className="text-yellow-600" />
                        <span className="text-sm font-medium text-gray-600">Tidak Selesai</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700">{summary.total_tidak_selesai || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {summary.total_jadwal > 0
                            ? `${Math.round((summary.total_tidak_selesai / summary.total_jadwal) * 100)}%`
                            : '0%'
                        }
                    </p>
                </div>

                {/* Tidak Piket */}
                <div className="bg-white p-4 rounded-lg border-2 border-red-400 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <XCircle size={20} className="text-red-600" />
                        <span className="text-sm font-medium text-gray-600">Tidak Piket</span>
                    </div>
                    <p className="text-3xl font-bold text-red-700">{summary.total_tidak_piket || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {summary.total_jadwal > 0
                            ? `${Math.round((summary.total_tidak_piket / summary.total_jadwal) * 100)}%`
                            : '0%'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RekapSummary;
