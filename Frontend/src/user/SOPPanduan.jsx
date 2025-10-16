import React, { useEffect, useState } from "react";
import api from "../api/axios";

const SopPanduan = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get("/informasi");
        setData(res.data);
      } catch (err) {
        console.error("Gagal mengambil data SOP & Panduan", err);
      }
    };
    getData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">SOP & Panduan</h2>
      {data.map((item) => (
        <div key={item.id} className="border p-3 mb-3 rounded">
          <h3 className="font-semibold text-lg">{item.judul}</h3>
          <p className="text-sm text-gray-500">{item.kategori}</p>
          <p className="mt-2">{item.isi}</p>
        </div>
      ))}
    </div>
  );
};

export default SopPanduan;
