// src/admin/components/PeriodSelector.jsx
// Komponen simple untuk memilih periode laporan

import React from 'react';
import { CalendarRange, CalendarDays } from 'lucide-react';

const PeriodSelector = ({
    periodType,
    setPeriodType,
    selectedDate,
    setSelectedDate,
    dateRange,
    setDateRange,
    selectedMonth,
    setSelectedMonth
}) => {

    // Helper untuk get week range
    const getWeekRange = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);

        return {
            startDate: monday.toISOString().split('T')[0],
            endDate: friday.toISOString().split('T')[0]
        };
    };

    // Handler untuk perubahan periode
    const handlePeriodChange = (newPeriod) => {
        setPeriodType(newPeriod);

        // Set default values
        if (newPeriod === 'mingguan') {
            const weekRange = getWeekRange();
            setDateRange(weekRange);
        } else if (newPeriod === 'bulanan') {
            const today = new Date();
            setSelectedMonth({
                year: today.getFullYear(),
                month: today.getMonth() + 1
            });
        }
    };

    return (
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-black shadow-sm">
            {/* Dropdown Periode */}
            <select
                value={periodType}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-3 py-2 text-sm font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
                <option value="mingguan">📅 Mingguan</option>
                <option value="bulanan">📅 Bulanan</option>
            </select>

            {/* Inputs berdasarkan periode */}
            {periodType === 'mingguan' ? (
                <div className="flex items-center gap-2">
                    <CalendarRange size={16} className="text-gray-600" />
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <span className="text-sm text-gray-500">-</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-gray-600" />
                    <select
                        value={selectedMonth.month}
                        onChange={(e) => setSelectedMonth({ ...selectedMonth, month: parseInt(e.target.value) })}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>
                                {new Date(2000, month - 1).toLocaleDateString('id-ID', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={selectedMonth.year}
                        onChange={(e) => setSelectedMonth({ ...selectedMonth, year: parseInt(e.target.value) })}
                        min="2020"
                        max="2100"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none w-20"
                    />
                </div>
            )}
        </div>
    );
};

export default PeriodSelector;
