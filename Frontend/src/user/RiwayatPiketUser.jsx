import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Package, CalendarDays } from "lucide-react";

const RiwayatPiketUser = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Helper aman untuk parsing JSON
  const safeParseJSON = (jsonString) => {
    try {
      return jsonString ? JSON.parse(jsonString) : [];
    } catch {
      return [];
    }
  };

  // 🔹 Fetch data riwayat
  const fetchRiwayat = async () => {
    try {
      const res = await api.get("/riwayat/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        const formatted = res.data.data.map((r) => ({
          ...r,
          laporan_inventaris: safeParseJSON(r.laporan_inventaris),
        }));
        setRiwayat(formatted);
      } else {
        setRiwayat([]);
      }
    } catch (err) {
      console.error("❌ Gagal memuat riwayat piket:", err);
      setError("Terjadi kesalahan saat memuat data riwayat piket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  // 🔹 State Loading
  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        ⏳ Memuat data riwayat piket...
      </div>
    );

  // 🔹 State Error
  if (error)
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 border border-red-300 rounded-lg">
        {error}
      </div>
    );

  // 🔹 Jika data kosong
  if (!riwayat.length)
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-lg">
        Tidak ada riwayat piket ditemukan.
      </div>
    );

  // 🔹 Tampilan utama
  return (
    <div className="p-6 bg-white shadow-md rounded-xl border-2 border-black mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        📘 Riwayat Piket Saya
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-300 rounded-lg">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border text-left">Tanggal</th>
              <th className="px-4 py-2 border text-left">Masuk</th>
              <th className="px-4 py-2 border text-left">Keluar</th>
              <th className="px-4 py-2 border text-center">Durasi (menit)</th>
              <th className="px-4 py-2 border text-center">Status</th>
              <th className="px-4 py-2 border text-left">Laporan / Alasan</th>
            </tr>
          </thead>

          <tbody>
            {riwayat.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition-colors border-b"
              >
                {/* 🔹 Tanggal piket */}
                <td className="px-4 py-2 border">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-gray-500" />
                    {item.tanggal_piket
                      ? new Date(item.tanggal_piket).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </div>
                </td>

                {/* 🔹 Jam masuk */}
                <td className="px-4 py-2 border text-gray-800">
                  {item.waktu_masuk
                    ? new Date(item.waktu_masuk).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>

                {/* 🔹 Jam keluar */}
                <td className="px-4 py-2 border text-gray-800">
                  {item.waktu_keluar
                    ? new Date(item.waktu_keluar).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>

                {/* 🔹 Durasi */}
                <td className="px-4 py-2 border text-center text-gray-800">
                  {item.durasi_piket || "-"}
                </td>

                {/* 🔹 Status badge */}
                <td className="px-4 py-2 border text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "Hadir"
                        ? "bg-green-200 text-green-800"
                        : item.status === "Izin"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* 🔹 Laporan inventaris / alasan izin */}
                <td className="px-4 py-2 border">
                  {item.status === "Izin" ? (
                    <p className="italic text-gray-600">
                      {item.laporan_inventaris?.alasan || "Tidak ada alasan"}
                    </p>
                  ) : Array.isArray(item.laporan_inventaris) &&
                    item.laporan_inventaris.length > 0 ? (
                    <ul className="space-y-1">
                      {item.laporan_inventaris.map((inv, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 border-b pb-1"
                        >
                          <Package size={14} className="text-gray-500" />
                          <span className="font-medium text-gray-800">
                            {inv.nama}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              inv.status === "Tersedia"
                                ? "bg-green-100 text-green-700"
                                : inv.status === "Dipinjam"
                                ? "bg-yellow-100 text-yellow-700"
                                : inv.status === "Rusak"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">
                      Tidak ada laporan
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiwayatPiketUser;
