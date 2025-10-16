// src/pages/JadwalPiketPage.jsx
import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const JadwalPiketPage = () => {
  // Hapus state yang berkaitan dengan tanggal
  const [schedule, setSchedule] = useState({});
  const [newName, setNewName] = useState("");
  const [selectedDays, setSelectedDays] = useState([]); // Ganti selectedDay dengan selectedDays array
  const [pengurusList, setPengurusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [assignmentsPerDay, setAssignmentsPerDay] = useState(3);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const tableRef = useRef();

  // Hapus helper function yang tidak diperlukan
  // getIndonesianDayName sudah tidak diperlukan karena kita tidak menggunakan tanggal

  // Load jadwal piket dari database (berdasarkan hari)
  const loadScheduleFromDB = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingSchedule(true);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/piket/jadwal', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        // Convert to frontend format berdasarkan hari
        const convertedSchedule = {};
        Object.entries(result.data).forEach(([hari, assignments]) => {
          convertedSchedule[hari] = assignments.map(a => a.nama_lengkap);
        });
        
        // Pastikan semua hari kerja ada (meskipun kosong)
        const weekdays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        weekdays.forEach(hari => {
          if (!convertedSchedule[hari]) {
            convertedSchedule[hari] = [];
          }
        });
        
        setSchedule(convertedSchedule);
        setHasExistingData(Object.values(convertedSchedule).some(arr => arr.length > 0));
        
        return Object.values(convertedSchedule).some(arr => arr.length > 0);
      }
      return false;
    } catch (err) {
      console.error('Error loading schedule from DB:', err);
      return false;
    } finally {
      if (showLoading) setLoadingSchedule(false);
    }
  };

  // Function untuk handle confirmation modal
  const showConfirmation = (message, onConfirm) => {
    setConfirmData({ message, onConfirm });
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmData?.onConfirm) {
      confirmData.onConfirm();
    }
    setShowConfirmModal(false);
    setConfirmData(null);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmData(null);
  };

  // Generate jadwal piket (berdasarkan hari)
  const generateSchedule = async () => {
    if (pengurusList.length === 0) {
      alert('❌ Tidak ada data pengurus. Pastikan ada pengurus yang terdaftar di sistem.');
      return;
    }
    
    const message = `🔄 Generate jadwal piket untuk hari Senin-Jumat?\n\n📊 Jumlah pengurus: ${pengurusList.length}\n👥 Orang per hari: ${assignmentsPerDay}\n\nLanjutkan?`;
    
    showConfirmation(message, async () => {
      try {
        setLoadingSchedule(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/piket/jadwal/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            assignments_per_day: assignmentsPerDay
          })
        });

        const result = await response.json();
        console.log('Generate response:', result);
        
        if (result.success) {
          // Set schedule dari hasil generate
          const newSchedule = { ...result.data.schedule };
          
          // Pastikan semua hari kerja ada
          const weekdays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
          weekdays.forEach(hari => {
            if (!newSchedule[hari]) {
              newSchedule[hari] = [];
            }
          });
          
          setSchedule(newSchedule);
          setHasExistingData(false); // Belum disimpan ke DB
          
          alert(`✅ Jadwal piket berhasil dibuat!\n\n📊 Detail:\n• Total hari: ${result.data.total_hari}\n• Total assignment: ${result.data.total_assignments}\n• Orang per hari: ${result.data.assignments_per_day}`);
        } else {
          alert('❌ Gagal generate jadwal: ' + result.message);
        }
      } catch (error) {
        console.error('Generate error:', error);
        alert('❌ Error: ' + error.message);
      } finally {
        setLoadingSchedule(false);
      }
    });
  };

  // Save jadwal piket ke database
  const saveScheduleToDB = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      console.log('Sending schedule to backend:', schedule);

      const response = await fetch('http://localhost:5000/api/piket/jadwal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ schedule: schedule })
      });

      const result = await response.json();
      console.log('Save response:', result);

      if (result.success) {
        setHasExistingData(true);
        alert(`✅ Jadwal piket berhasil disimpan!\n\n• Total hari: ${result.data.total_hari}\n• Total assignment: ${result.data.total_assignments}\n• Total tersimpan: ${result.data.total_inserted}`);
      } else {
        alert('❌ Gagal menyimpan jadwal: ' + result.message);
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
      alert('❌ Terjadi kesalahan saat menyimpan jadwal: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Tambahkan function untuk hapus jadwal
  const deleteSchedule = async () => {
    const message = `🗑️ Hapus semua jadwal piket?\n\nTindakan ini akan menghapus SELURUH jadwal piket yang tersimpan di database.\n\n⚠️ Tindakan ini tidak dapat dibatalkan!\n\nLanjutkan?`;
    
    showConfirmation(message, async () => {
      try {
        setSaving(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/piket/jadwal', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        console.log('Delete response:', result);

        if (result.success) {
          // Hanya reset state schedule menjadi kosong, bukan menghapus struktur
          // Ini akan membuat halaman kembali menampilkan empty state
          setSchedule({});
          setNewName("");
          setSelectedDays([]);
          setHasExistingData(false);
          // Jangan reset assignmentsPerDay agar pengaturan tetap
          
          alert(`✅ ${result.message}\n\n📊 Total dihapus: ${result.deleted_count} jadwal\n\n🔄 Halaman dikembalikan ke tampilan awal.`);
        } else {
          alert('❌ Gagal menghapus jadwal: ' + result.message);
        }
      } catch (err) {
        console.error('Error deleting schedule:', err);
        alert('❌ Terjadi kesalahan saat menghapus jadwal: ' + err.message);
      } finally {
        setSaving(false);
      }
    });
  };

  // Fetch data pengurus dari database
  const fetchPengurus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        return false;
      }

      const response = await fetch('http://localhost:5000/api/piket/pengurus', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setPengurusList(result.data.map(pengurus => pengurus.nama_lengkap));
        setError(null);
        return true;
      } else {
        setError(result.message || 'Error fetching pengurus');
        return false;
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching pengurus:', err);
      return false;
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Fetch pengurus list dan load existing schedule
      await fetchPengurus();
      await loadScheduleFromDB(false);
      
      setLoading(false);
    };

    initializeData();
  }, []);

  // Tambahkan function untuk mendapatkan pengurus yang belum dijadwalkan
  const getUnassignedPengurus = () => {
    // Dapatkan semua nama yang sudah dijadwalkan
    const assignedNames = new Set();
    Object.values(schedule).forEach(daySchedule => {
      daySchedule.forEach(name => assignedNames.add(name));
    });
    
    // Filter pengurus yang belum dijadwalkan
    return pengurusList.filter(nama => !assignedNames.has(nama));
  };

  // Tambahkan function untuk mendapatkan pengurus yang belum dijadwalkan pada hari tertentu
  const getAvailablePengurusForDay = (selectedDay) => {
    const currentDaySchedule = schedule[selectedDay] || [];
    return pengurusList.filter(nama => !currentDaySchedule.includes(nama));
  };

  // Update handleAddName untuk multiple days
  const handleAddName = () => {
    if (!newName.trim() || selectedDays.length === 0) {
      alert('❌ Pilih nama pengurus dan minimal 1 hari!');
      return;
    }
    
    // Check apakah nama sudah ada di hari yang dipilih
    const conflictDays = selectedDays.filter(day => 
      schedule[day] && schedule[day].includes(newName.trim())
    );
    
    if (conflictDays.length > 0) {
      alert(`❌ ${newName} sudah dijadwalkan pada: ${conflictDays.join(', ')}`);
      return;
    }
    
    // Add nama ke semua hari yang dipilih
    setSchedule(prev => {
      const newSchedule = { ...prev };
      selectedDays.forEach(day => {
        newSchedule[day] = newSchedule[day] ? [...newSchedule[day], newName.trim()] : [newName.trim()];
      });
      return newSchedule;
    });
    
    setNewName(""); // Reset dropdown
    setSelectedDays([]); // Reset checkbox selection
    setHasExistingData(false); // Mark as modified
    
    alert(`✅ ${newName} berhasil ditambahkan ke: ${selectedDays.join(', ')}`);
  };

  // Function untuk handle checkbox change
  const handleDayCheckboxChange = (day, checked) => {
    if (checked) {
      setSelectedDays(prev => [...prev, day]);
    } else {
      setSelectedDays(prev => prev.filter(d => d !== day));
    }
  };

  // Function untuk mendapatkan pengurus yang tersedia untuk hari-hari yang dipilih
  const getAvailablePengurusForSelectedDays = () => {
    if (selectedDays.length === 0) return pengurusList;
    
    // Filter pengurus yang tidak ada di SEMUA hari yang dipilih
    return pengurusList.filter(nama => {
      return selectedDays.every(day => {
        const daySchedule = schedule[day] || [];
        return !daySchedule.includes(nama);
      });
    });
  };

  // Tambahkan fungsi handleRemoveName
  const handleRemoveName = (hari, nama) => {
    if (!window.confirm(`Hapus ${nama} dari jadwal hari ${hari}?`)) {
      return;
    }

    setSchedule(prev => ({
      ...prev,
      [hari]: prev[hari] ? prev[hari].filter(name => name !== nama) : []
    }));
    
    setHasExistingData(false); // Mark as modified
    
    // Optional: Show success message
    // alert(`✅ ${nama} berhasil dihapus dari jadwal ${hari}`);
  };

  // PERBAIKI handleExport - hapus referensi ke startDate dan endDate
  const handleExport = () => {
    if (tableRef.current) {
      const buttons = tableRef.current.querySelectorAll(".exclude-export");
      buttons.forEach(btn => btn.style.display = "none");

      html2canvas(tableRef.current, { scale: 2 }).then(canvas => {
        const link = document.createElement("a");
        // Ganti dengan nama file yang sesuai untuk jadwal mingguan
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        link.download = `jadwal_piket_mingguan_${dateString}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }).finally(() => {
        buttons.forEach(btn => btn.style.display = "inline-block");
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-6 overflow-auto flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data pengurus...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-6 overflow-auto flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                <p className="font-bold">❌ Error</p>
                <p className="mb-3">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 overflow-auto">
          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-black">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Konfirmasi</h3>
                <div className="mb-6 text-gray-600 whitespace-pre-line">
                  {confirmData?.message}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
                  >
                    Lanjutkan
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Jadwal Piket Mingguan</h1>
            <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-800">
                📊 Pengurus: <span className="font-bold">{pengurusList.length}</span> | 
                📅 Status: <span className="font-bold">
                  {hasExistingData ? '✅ Tersimpan' : '⚠️ Belum Disimpan'}
                </span>
              </p>
            </div>
          </div>

          {/* Loading Schedule Status */}
          {loadingSchedule && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <p className="font-medium text-blue-800">
                    📂 {Object.keys(schedule).length === 0 ? 'Membuat jadwal konsisten...' : 'Memuat jadwal dari database...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pengaturan Jadwal */}
          <div className="bg-white border-2 border-black rounded-lg p-4 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Pengaturan Jadwal</h2>
            
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Jumlah orang per hari</label>
                <select
                  value={assignmentsPerDay}
                  onChange={(e) => setAssignmentsPerDay(parseInt(e.target.value))}
                  className="border-2 border-black px-3 py-2 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} orang</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={generateSchedule}
                  disabled={pengurusList.length === 0 || loadingSchedule}
                  className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 shadow-md border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Generate Jadwal
                </button>
                
                {/* Tombol Hapus - hanya tampil jika ada jadwal */}
                {(Object.keys(schedule).length > 0 || hasExistingData) && (
                  <button
                    onClick={deleteSchedule}
                    disabled={saving || loadingSchedule}
                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 shadow-md border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Hapus Semua Jadwal
                  </button>
                )}
              </div>
            </div>
            
            {/* Warning jika tidak ada pengurus */}
            {pengurusList.length === 0 && (
              <p className="text-red-600 text-sm mt-2">
                Tidak ada data pengurus! Pastikan ada pengurus yang terdaftar di sistem.
              </p>
            )}
            
            {/* Info jadwal yang ada */}
            {Object.keys(schedule).length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-700">
                  Jadwal saat ini: {Object.keys(schedule).length} hari dengan total {Object.values(schedule).reduce((sum, names) => sum + names.length, 0)} assignment
                </p>
              </div>
            )}
          </div>

          {/* Empty State */}
          {Object.keys(schedule).length === 0 && !loading && !loadingSchedule && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 text-center mb-6">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Jadwal Piket</h3>
              <p className="text-gray-600 mb-4">Generate jadwal piket mingguan untuk hari Senin-Jumat</p>
              <button
                onClick={generateSchedule}
                disabled={pengurusList.length === 0}
                className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 shadow-md border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
              >
                🔄 Generate Jadwal
              </button>
            </div>
          )}

          {/* Form Tambah/Edit - UPDATE seluruh bagian ini */}
          {Object.keys(schedule).length > 0 && (
            <div className="bg-white border-2 border-black rounded-lg p-4 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">➕ Tambah/Edit Pengurus</h2>
              
              {/* Info pengurus yang belum dijadwalkan */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-blue-800">
                    📊 Status Penjadwalan:
                  </p>
                  <div className="text-sm text-blue-700">
                    <span className="font-bold">{pengurusList.length - getUnassignedPengurus().length}</span> dari <span className="font-bold">{pengurusList.length}</span> pengurus sudah dijadwalkan
                  </div>
                </div>
                
                {getUnassignedPengurus().length > 0 ? (
                  <div>
                    <p className="text-xs text-blue-600 mb-1">
                      Pengurus belum dijadwalkan: <span className="font-semibold">{getUnassignedPengurus().length}</span>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {getUnassignedPengurus().slice(0, 5).map((nama, idx) => (
                        <span key={idx} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                          {nama}
                        </span>
                      ))}
                      {getUnassignedPengurus().length > 5 && (
                        <span className="inline-block bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded">
                          +{getUnassignedPengurus().length - 5} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-green-700">
                    ✅ Semua pengurus sudah mendapatkan jadwal piket
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Kolom 1: Pilih Hari */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Pilih Hari <span className="text-red-500">*</span>
                    <span className="text-sm text-gray-500 block">
                      ({selectedDays.length} hari dipilih)
                    </span>
                  </label>
                  
                  <div className="space-y-2 border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(hari => {
                      const dayCount = schedule[hari]?.length || 0;
                      const isSelected = selectedDays.includes(hari);
                      
                      return (
                        <label key={hari} className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                          isSelected ? 'bg-pink-100 border border-pink-300' : 'hover:bg-gray-100'
                        }`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleDayCheckboxChange(hari, e.target.checked)}
                            className="w-4 h-4 text-pink-600 border-2 border-gray-300 rounded focus:ring-pink-500"
                          />
                          <div className="flex-1">
                            <span className={`font-medium ${isSelected ? 'text-pink-800' : 'text-gray-700'}`}>
                              {hari}
                            </span>
                            <div className="text-xs text-gray-500">
                              {dayCount} orang saat ini
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-pink-600 text-sm">✓</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  
                  {/* Quick select buttons */}
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])}
                      className="text-xs bg-pink-200 hover:bg-pink-300 text-pink-800 px-2 py-1 rounded transition-colors"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDays([])}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors"
                    >
                      Batal Semua
                    </button>
                  </div>
                </div>
                
                {/* Kolom 2: Pilih Pengurus */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Nama Pengurus <span className="text-red-500">*</span>
                    <span className="text-sm text-gray-500 block">
                      ({getAvailablePengurusForSelectedDays().length} tersedia untuk hari yang dipilih)
                    </span>
                  </label>
                  
                  {selectedDays.length === 0 ? (
                    <div className="w-full border-2 border-gray-300 px-3 py-2 rounded bg-gray-100 text-gray-500">
                      Pilih hari terlebih dahulu
                    </div>
                  ) : getAvailablePengurusForSelectedDays().length > 0 ? (
                    <select
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full border-2 border-black px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">-- Pilih Pengurus --</option>
                      {getAvailablePengurusForSelectedDays()
                        .sort((a, b) => a.localeCompare(b))
                        .map((nama, index) => (
                          <option key={index} value={nama}>
                            {nama}
                            {getUnassignedPengurus().includes(nama) ? ' 🆕' : ''}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <div className="w-full border-2 border-gray-300 px-3 py-2 rounded bg-gray-100 text-gray-500">
                      Semua pengurus sudah dijadwalkan untuk hari yang dipilih
                    </div>
                  )}
                  
                  {/* Info tambahan untuk hari yang dipilih */}
                  {selectedDays.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <div className="font-medium mb-1">Jadwal untuk hari yang dipilih:</div>
                      {selectedDays.map(day => (
                        <div key={day} className="mb-1">
                          <span className="font-medium">{day}:</span> {
                            schedule[day] && schedule[day].length > 0 
                              ? schedule[day].join(', ')
                              : 'Belum ada'
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Kolom 3: Action & Preview */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Aksi</label>
                  
                  <button
                    onClick={handleAddName}
                    disabled={!newName.trim() || selectedDays.length === 0 || getAvailablePengurusForSelectedDays().length === 0}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed exclude-export"
                  >
                    ➕ Tambah ke {selectedDays.length} Hari
                  </button>
                  
                  {/* Preview */}
                  {newName && selectedDays.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-800">
                        <div className="font-medium mb-1">📋 Preview:</div>
                        <div className="text-xs">
                          <strong>{newName}</strong> akan ditambahkan ke:
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDays.map(day => (
                            <span key={day} className="inline-block bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
                              {day}
                            </span>
                          ))}
                        </div>
                        
                        {/* Warning jika pengurus sudah punya jadwal di hari lain */}
                        {(() => {
                          const existingSchedules = Object.entries(schedule)
                            .filter(([day, names]) => names.includes(newName) && !selectedDays.includes(day))
                            .map(([day]) => day);
                          
                          if (existingSchedules.length > 0) {
                            return (
                              <div className="mt-2 text-xs text-orange-700 bg-orange-100 p-2 rounded">
                                ⚠️ {newName} sudah dijadwalkan di: {existingSchedules.join(', ')}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* Quick add untuk pengurus yang belum punya jadwal */}
                  {newName && getUnassignedPengurus().includes(newName) && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-800 mb-2">
                        💡 <strong>{newName}</strong> belum memiliki jadwal piket sama sekali.
                      </p>
                      <button
                        onClick={() => {
                          const allWorkdays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
                          const availableDays = allWorkdays.filter(day => {
                            const daySchedule = schedule[day] || [];
                            return !daySchedule.includes(newName);
                          });
                          setSelectedDays(availableDays);
                        }}
                        className="text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded transition-colors"
                      >
                        📅 Pilih Semua Hari Tersedia
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tabel Jadwal */}
          {Object.keys(schedule).length > 0 && (
            <div className="bg-white border-2 border-black rounded-lg shadow-sm overflow-hidden">
              <div className="bg-pink-100 px-4 py-3 border-b-2 border-black">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">📅 Jadwal Piket Mingguan</h2>
                    <p className="text-sm text-gray-600">
                      Jadwal tetap setiap minggu (Senin-Jumat) • 
                      Total assignment: <span className="font-bold">{Object.values(schedule).reduce((sum, names) => sum + names.length, 0)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      hasExistingData 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {hasExistingData ? '✅ Tersimpan di DB' : '⚠️ Belum Disimpan'}
                    </div>
                    
                    {/* Info pengurus belum dijadwalkan */}
                    {getUnassignedPengurus().length > 0 && (
                      <div className="mt-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        {getUnassignedPengurus().length} pengurus belum dijadwalkan
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div ref={tableRef} className="overflow-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-pink-50 sticky top-0">
                    <tr>
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(hari => (
                        <th
                          key={hari}
                          className="border border-black px-4 py-3 text-center font-medium text-gray-900 min-w-[200px]"
                        >
                          <div className="font-bold text-pink-600">{hari}</div>
                          <div className="text-xs font-normal text-gray-600 mt-1">
                            {schedule[hari]?.length || 0} pengurus
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(hari => (
                        <td key={hari} className="border border-black px-4 py-4 align-top bg-white">
                          {schedule[hari] && schedule[hari].length > 0 ? (
                            <ul className="space-y-2">
                              {schedule[hari].map((name, idx) => (
                                <li key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded border">
                                  <span className="font-medium text-gray-800">
                                    {idx + 1}. {name}
                                    {/* Tampilkan badge jika pengurus baru mendapat 1 jadwal */}
                                    {Object.values(schedule).filter(daySchedule => daySchedule.includes(name)).length === 1 && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                                        1x
                                      </span>
                                    )}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveName(hari, name)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-100 px-2 py-1 rounded text-sm exclude-export transition-colors"
                                    title="Hapus dari jadwal"
                                  >
                                    ❌
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-center text-gray-400 py-4">
                              <p>Belum ada pengurus</p>
                              <p className="text-xs mt-1">
                                {getAvailablePengurusForDay(hari).length} tersedia
                              </p>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {Object.keys(schedule).length > 0 && (
            <div className="flex justify-between mt-6">
              {/* Tombol Hapus di kiri */}
              <button
                onClick={deleteSchedule}
                disabled={saving}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors shadow-md border-2 border-black flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    🗑️ Hapus Semua Jadwal
                  </>
                )}
              </button>
              
              {/* Tombol Simpan & Export di kanan */}
              <div className="flex gap-3">
                <button
                  onClick={saveScheduleToDB}
                  disabled={saving}
                  className={`px-6 py-3 rounded-lg transition-colors shadow-md border-2 border-black flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    hasExistingData 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      {hasExistingData ? '🔄 Update Database' : '💾 Simpan ke Database'}
                    </>
                  )}
                </button>
                <button
                  onClick={handleExport}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md border-2 border-black flex items-center gap-2"
                >
                  📸 Export ke Gambar
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JadwalPiketPage;
