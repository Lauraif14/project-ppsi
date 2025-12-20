// src/admin/JadwalPiketPage.jsx - Standarisasi Layout
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Calendar, Save, Download, X, Plus } from "lucide-react";
import html2canvas from "html2canvas";
import { BASE_URL } from "../api/axios";

const JadwalPiketPage = () => {
  const [schedule, setSchedule] = useState([]);
  const [pengurusList, setPengurusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assignmentsPerDay, setAssignmentsPerDay] = useState(5);
  const [judulJadwal, setJudulJadwal] = useState("DAFTAR PIKET PENGURUS");

  const tableRef = useRef();

  // Fetch daftar pengurus
  const fetchPengurus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/piket/pengurus`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setPengurusList(result.data);
        return result.data; // Return data for immediate use
      }
    } catch (err) {
      console.error('Error fetching pengurus:', err);
    } finally {
      setLoading(false);
    }
    return [];
  };

  // Helper to enrich schedule with divisi info
  const enrichSchedule = (scheduleData, pengurusData) => {
    // If no pengurus data available, return original schedule
    if (!pengurusData || pengurusData.length === 0) return scheduleData;

    return scheduleData.map(day => ({
      ...day,
      pengurus: day.pengurus.map(p => {
        // Find pengurus info in fresh list
        const info = pengurusData.find(u => u.id === (p.user_id || p.id));
        return {
          ...p,
          divisi: info ? info.divisi : (p.divisi || '-')
        };
      })
    }));
  };

  // Load existing schedule
  const loadExistingSchedule = async () => {
    try {
      const token = localStorage.getItem('token');

      console.log('🔄 Loading existing schedule...');

      // Get current week schedule
      const response = await fetch(`${BASE_URL}/api/jadwal`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      console.log('📊 API Response:', result);

      if (result.success && result.data && result.data.length > 0) {
        console.log('✅ Schedule found:', result.data.length, 'days');

        // Data already grouped by backend
        setSchedule(result.data);

        // Set date range based on loaded schedule
        if (result.data.length > 0) {
          setStartDate(result.data[0].tanggal);
          setEndDate(result.data[result.data.length - 1].tanggal);
          console.log('📅 Date range set:', result.data[0].tanggal, 'to', result.data[result.data.length - 1].tanggal);
        }
      } else {
        console.log('ℹ️ No existing schedule found');
      }
    } catch (err) {
      console.error('❌ Error loading schedule:', err);
    }
  };

  // Save schedule to localStorage whenever it changes
  useEffect(() => {
    if (schedule.length > 0) {
      localStorage.setItem('jadwal_preview', JSON.stringify({
        schedule,
        startDate,
        endDate,
        savedAt: new Date().toISOString()
      }));
      console.log('💾 Schedule saved to localStorage');
    }
  }, [schedule, startDate, endDate]);

  // Load schedule from localStorage or database on mount
  useEffect(() => {
    const initializePage = async () => {
      // Fetch pengurus list first and get the data
      const pengurusData = await fetchPengurus();

      // Try to load from localStorage first (for preview/unsaved schedule)
      const savedPreview = localStorage.getItem('jadwal_preview');
      let loadedFromStorage = false;

      if (savedPreview) {
        try {
          const { schedule: savedSchedule, startDate: savedStart, endDate: savedEnd, savedAt } = JSON.parse(savedPreview);

          // Check if schedule is still valid (not expired)
          const endDateObj = new Date(savedEnd);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (endDateObj >= today) {
            console.log('✅ Loaded schedule from localStorage (preview)');
            // Enrich with fresh divisi info
            const enrichedSchedule = enrichSchedule(savedSchedule, pengurusData);
            setSchedule(enrichedSchedule);
            setStartDate(savedStart);
            setEndDate(savedEnd);
            loadedFromStorage = true;
          } else {
            console.log('🗑️ Clearing expired schedule from localStorage');
            localStorage.removeItem('jadwal_preview');
          }
        } catch (err) {
          console.error('Error loading from localStorage:', err);
          localStorage.removeItem('jadwal_preview');
        }
      }

      // If no valid preview, try to load from database
      if (!loadedFromStorage) {
        await loadExistingSchedule(pengurusData);
      }
    };

    initializePage();
  }, []);

  // Set default dates if no schedule loaded
  useEffect(() => {
    if (schedule.length === 0 && !startDate && !endDate) {
      const today = new Date();
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
      const nextFriday = new Date(nextMonday);
      nextFriday.setDate(nextMonday.getDate() + 4);

      setStartDate(nextMonday.toISOString().split('T')[0]);
      setEndDate(nextFriday.toISOString().split('T')[0]);
    }
  }, [schedule, startDate, endDate]);

  // Generate schedule
  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      alert('❌ Pilih tanggal mulai dan tanggal akhir!');
      return;
    }

    try {
      setGenerating(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${BASE_URL}/api/jadwal/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          assignments_per_day: assignmentsPerDay
        })
      });

      const result = await response.json();

      if (result.success) {
        const grouped = {};
        result.data.schedule.forEach(item => {
          if (!grouped[item.tanggal]) {
            grouped[item.tanggal] = {
              tanggal: item.tanggal,
              hari: item.hari,
              pengurus: []
            };
          }
          grouped[item.tanggal].pengurus.push(item);
        });

        setSchedule(Object.values(grouped));
        alert(`✅ Jadwal berhasil digenerate!\n\n📊 Total: ${result.data.total_days} hari`);
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  // Remove pengurus
  const removePengurus = (dayIndex, pengurusId) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].pengurus = newSchedule[dayIndex].pengurus.filter(
      p => (p.user_id || p.id) !== pengurusId
    );
    setSchedule(newSchedule);
  };

  // Add pengurus
  const addPengurus = (dayIndex) => {
    const currentPengurusIds = schedule[dayIndex].pengurus.map(p => p.user_id || p.id);
    const availablePengurus = pengurusList.filter(p => !currentPengurusIds.includes(p.id));

    if (availablePengurus.length === 0) {
      alert('❌ Semua pengurus sudah dijadwalkan untuk hari ini!');
      return;
    }

    // Create a simple select dialog
    const names = availablePengurus.map((p, i) => `${i + 1}. ${p.nama_lengkap} (${p.divisi || '-'})`).join('\n');
    const selected = prompt(
      `Tambah pengurus untuk ${schedule[dayIndex].hari}:\n\n${names}\n\nMasukkan nomor (1-${availablePengurus.length}):`
    );

    if (selected) {
      const index = parseInt(selected) - 1;
      if (index >= 0 && index < availablePengurus.length) {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].pengurus.push({
          user_id: availablePengurus[index].id,
          nama_lengkap: availablePengurus[index].nama_lengkap,
          divisi: availablePengurus[index].divisi || '-'
        });
        setSchedule(newSchedule);
        alert(`✅ ${availablePengurus[index].nama_lengkap} berhasil ditambahkan!`);
      } else {
        alert('❌ Nomor tidak valid!');
      }
    }
  };

  // Save schedule
  const handleSave = async () => {
    if (schedule.length === 0) {
      alert('❌ Tidak ada jadwal untuk disimpan!');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const flatSchedule = [];
      schedule.forEach(day => {
        day.pengurus.forEach(p => {
          flatSchedule.push({
            user_id: p.user_id || p.id,
            tanggal: day.tanggal,
            hari: day.hari
          });
        });
      });

      console.log('💾 Saving schedule:', flatSchedule);

      const response = await fetch(`${BASE_URL}/api/jadwal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ schedule: flatSchedule })
      });

      const result = await response.json();

      console.log('💾 Save response:', result);

      if (result.success) {
        alert(`✅ Jadwal berhasil disimpan!\n\nJadwal akan otomatis muncul di dashboard user per hari`);
        // Reload schedule after save
        await loadExistingSchedule();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Export as image
  const handleExport = async () => {
    if (schedule.length === 0) {
      alert('❌ Tidak ada jadwal untuk di-export!');
      return;
    }

    try {
      setExporting(true);

      // Hide elements with class 'no-export' before screenshot
      const noExportElements = tableRef.current.querySelectorAll('.no-export');
      noExportElements.forEach(el => el.style.display = 'none');

      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      // Show elements back after screenshot
      noExportElements.forEach(el => el.style.display = '');

      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `jadwal-piket-${dateStr}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      alert('✅ Jadwal berhasil di-export!');
    } catch (error) {
      alert('❌ Error export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Delete schedule
  const handleDelete = async () => {
    if (schedule.length === 0) {
      alert('❌ Tidak ada jadwal untuk dihapus!');
      return;
    }

    if (!window.confirm('🗑️ Hapus semua jadwal yang tersimpan?\n\nJadwal akan dihapus dari database dan tidak bisa dikembalikan.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${BASE_URL}/api/jadwal`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ delete_all: true })
      });

      const result = await response.json();

      if (result.success) {
        setSchedule([]);
        localStorage.removeItem('jadwal_preview'); // Clear localStorage
        alert('✅ Jadwal berhasil dihapus!');
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // Format tanggal
  const formatTanggal = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Memuat jadwal piket...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Sidebar - Fixed */}
      <Sidebar />

      {/* Wrapper - Fixed Navbar + Scrolling Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        {/* Content - Scrolling */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Jadwal Piket</h1>
            <p className="text-gray-600">Generate & kelola jadwal piket mingguan</p>
          </div>

          {/* Generate Form */}
          <div className="bg-white border-2 border-black rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <Calendar size={24} className="text-pink-500" />
              Generate Jadwal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Orang per Hari
                </label>
                <select
                  value={assignmentsPerDay}
                  onChange={(e) => setAssignmentsPerDay(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Judul Jadwal
                </label>
                <input
                  type="text"
                  value={judulJadwal}
                  onChange={(e) => setJudulJadwal(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          {schedule.length > 0 && (
            <>
              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} className="inline mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>

                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={20} className="inline mr-2" />
                  {exporting ? 'Exporting...' : 'Export Gambar'}
                </button>

                <button
                  onClick={handleDelete}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black"
                >
                  <X size={20} className="inline mr-2" />
                  Hapus Jadwal
                </button>
              </div>

              {/* Jadwal Grid (Like Image) - Compact for Export */}
              <div ref={tableRef} className="bg-white p-6 border-2 border-black rounded-xl shadow-sm">
                {/* Title */}
                <h2 className="text-center text-lg font-bold mb-4 uppercase text-gray-900">
                  {judulJadwal}
                </h2>

                {/* Grid 2x3 - Smaller */}
                <div className="grid grid-cols-2 gap-3">
                  {schedule.map((day, dayIndex) => (
                    <div key={dayIndex} className="border-2 border-gray-800">
                      {/* Header Hari */}
                      <div className="bg-blue-200 border-b-2 border-gray-800 px-2 py-1 text-center">
                        <h3 className="font-bold text-gray-900 text-xs">
                          {day.hari}, {formatTanggal(day.tanggal)}
                        </h3>
                      </div>

                      {/* Table */}
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-blue-100 border-b-2 border-gray-800">
                            <th className="border-r-2 border-gray-800 px-2 py-1 text-left w-8">No</th>
                            <th className="border-r-2 border-gray-800 px-2 py-1 text-left">Nama</th>
                            <th className="px-2 py-1 text-left">Dinas/Biro</th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.pengurus.map((p, pIndex) => (
                            <tr key={pIndex} className="border-b border-gray-400 group hover:bg-red-50">
                              <td className="border-r-2 border-gray-800 px-2 py-1 text-center">{pIndex + 1}.</td>
                              <td className="border-r-2 border-gray-800 px-2 py-1">{p.nama_lengkap}</td>
                              <td className="px-2 py-1 relative">
                                {p.divisi || '-'}
                                <button
                                  onClick={() => removePengurus(dayIndex, p.user_id || p.id)}
                                  className="no-export absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-200 rounded"
                                  title="Hapus"
                                >
                                  <X size={12} className="text-red-600" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {/* Empty rows to fill 5 */}
                          {[...Array(Math.max(0, 5 - day.pengurus.length))].map((_, i) => (
                            <tr key={`empty-${i}`} className="border-b border-gray-400">
                              <td className="border-r-2 border-gray-800 px-2 py-1 text-center">
                                {day.pengurus.length + i + 1}.
                              </td>
                              <td className="border-r-2 border-gray-800 px-2 py-1"></td>
                              <td className="px-2 py-1"></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Add Button */}
                      <button
                        onClick={() => addPengurus(dayIndex)}
                        className="no-export w-full py-1 border-t-2 border-gray-800 text-xs text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-1"
                      >
                        <Plus size={12} />
                        Tambah
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default JadwalPiketPage;
