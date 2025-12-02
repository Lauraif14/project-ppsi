// src/components/SopPanduan.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";

const SopPanduan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await api.get("/informasi", { headers });

        // Normalisasi response { data: rows } / array langsung
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setData(list);
      } catch (err) {
        console.error("Gagal mengambil data SOP & Panduan", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Memuat informasi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Informasi</h1>
        <p className="text-sm text-gray-600 mb-6">
          Daftar semua informasi yang diterbitkan admin (SOP, Panduan, dan Informasi Lain).
        </p>

        {data.length === 0 ? (
          <div className="p-6 bg-white border-2 border-black rounded-xl shadow">
            <p className="text-gray-500">Belum ada informasi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div
                key={item.id}
                className="bg-white border-2 border-black rounded-xl shadow-sm p-4"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {item.kategori || "Informasi Lain"}
                    </div>
                    <h2 className="font-semibold text-lg text-gray-900">
                      {item.judul}
                    </h2>
                    {item.created_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(item.created_at).toLocaleString("id-ID")}
                      </div>
                    )}
                    <p className="text-sm text-gray-700 mt-2">
                      {item.isi
                        ? item.isi
                        : <em className="text-gray-500">Tidak ada deskripsi</em>}
                    </p>
                  </div>

                  {item.file_path && (
                    <div className="flex items-center">
                      <a
                        href={`${(process.env.REACT_APP_API_URL || "/api")
                          .replace(/\/api$/, "")}/${item.file_path.replace(/\\/g, "/")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-pink-600 underline"
                      >
                        Buka file
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SopPanduan;
