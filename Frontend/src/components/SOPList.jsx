import React, { useEffect, useState } from "react";
import api from "../api/axios";

const SOPList = () => {
  const [sopList, setSopList] = useState([]);

  useEffect(() => {
    api.get("/informasi")
      .then((res) => setSopList(res.data.data || []))
      .catch(() => setSopList([]));
  }, []);

  if (sopList.length === 0) {
    return <p className="text-gray-500 italic">Belum ada SOP atau panduan yang ditambahkan.</p>;
  }

  return (
  <div className="p-6 border-2 border-black rounded-xl bg-white shadow-lg mt-6">
    <h3 className="text-xl font-bold mb-4 text-gray-800">📘 SOP & Panduan</h3>

    {sopList.length === 0 ? (
      <p>Belum ada SOP atau Panduan yang ditambahkan.</p>
    ) : (
      <ul className="space-y-4">
        {sopList.map((item) => (
          <li key={item.id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
            <h4 className="font-semibold text-gray-800 text-lg mb-1">
              {item.judul}
            </h4>
            <p className="text-sm text-gray-500 mb-3">{item.kategori}</p>

            {item.file_path ? (
              <a
                href={`${process.env.REACT_APP_API_URL.replace('/api', '')}/${item.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 text-sm font-semibold text-white bg-pink-500 border-2 border-black rounded-lg hover:bg-pink-600 transition"
              >
                📂 Lihat / Unduh PDF
              </a>
            ) : (
              <p className="text-gray-700">{item.isi}</p>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

};

export default SOPList;
