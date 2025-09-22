// src/pages/JadwalPiketPage.jsx
import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const pengurusList = [
  "Ahmad", "Siti", "Budi", "Rina", "Andi", "Dewi", "Fajar", "Lina", "Rizki", "Nina"
];

const JadwalPiketPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedule, setSchedule] = useState({});
  const [newName, setNewName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const tableRef = useRef();

  const getWeekDays = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Senin–Jumat
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const generateSchedule = () => {
    if (!startDate || !endDate) return;
    const weekDays = getWeekDays(startDate, endDate);
    const newSchedule = {};
    weekDays.forEach(date => {
      const shuffled = [...pengurusList].sort(() => 0.5 - Math.random());
      newSchedule[date.toDateString()] = shuffled.slice(0, 5); // 5 pengurus per hari
    });
    setSchedule(newSchedule);
    setSelectedDate(weekDays[0]?.toDateString() || "");
  };

  const handleAddName = () => {
    if (!newName.trim() || !selectedDate) return;
    setSchedule(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate] ? [...prev[selectedDate], newName.trim()] : [newName.trim()]
    }));
    setNewName("");
  };

  const handleRemoveName = (dateStr, name) => {
    setSchedule(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].filter(n => n !== name)
    }));
  };

  const handleExport = () => {
    if (tableRef.current) {
      // sembunyikan semua tombol tambah sebelum capture
      const buttons = tableRef.current.querySelectorAll(".exclude-export");
      buttons.forEach(btn => btn.style.display = "none");

      html2canvas(tableRef.current, { scale: 2 }).then(canvas => {
        const link = document.createElement("a");
        link.download = "jadwal_piket.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }).finally(() => {
        buttons.forEach(btn => btn.style.display = "inline-block");
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 overflow-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Jadwal Piket Mingguan</h1>

          {/* Pilih tanggal */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <div>
              <label className="block text-gray-700 mb-1">Tanggal Awal</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border-2 border-black px-3 py-2 rounded focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border-2 border-black px-3 py-2 rounded focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <button
              onClick={generateSchedule}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 shadow-md border-2 border-black"
            >
              Generate Jadwal
            </button>
          </div>

          {/* Pilih hari untuk tambah nama */}
          {Object.keys(schedule).length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6 items-center">
              <select
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="border-2 border-black px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {Object.keys(schedule).map(dateStr => (
                  <option key={dateStr} value={dateStr}>
                    {new Date(dateStr).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nama Pengurus"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="border-2 border-black px-3 py-2 flex-1 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={handleAddName}
                className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors border-2 border-black exclude-export"
              >
                Tambah Nama
              </button>
            </div>
          )}

          {/* Tabel Jadwal */}
          <div
            ref={tableRef}
            className="overflow-auto border-2 border-black rounded shadow bg-white"
          >
            <table className="min-w-full border-collapse border border-black">
              <thead className="bg-pink-100 sticky top-0">
                <tr>
                  {Object.keys(schedule).map(dateStr => (
                    <th
                      key={dateStr}
                      className="border border-black px-4 py-2 text-left font-medium text-gray-900"
                    >
                      {new Date(dateStr).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.keys(schedule).map(dateStr => (
                    <td key={dateStr} className="border border-black px-4 py-2 align-top">
                      <ul className="list-disc list-inside space-y-1">
                        {schedule[dateStr].map((name, idx) => (
                          <li key={idx} className="flex justify-between items-center">
                            <span>{name}</span>
                            <button
                              onClick={() => handleRemoveName(dateStr, name)}
                              className="text-red-600 hover:text-red-800 ml-2 text-sm exclude-export"
                            >
                              Hapus
                            </button>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="mt-6 bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 transition-colors shadow-md border-2 border-black"
          >
            Export ke Gambar
          </button>
        </main>
      </div>
    </div>
  );
};

export default JadwalPiketPage;
