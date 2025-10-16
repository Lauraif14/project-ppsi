import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Edit, Trash2, PlusCircle, FileText } from "lucide-react";

const InformationPage = () => {
  const [informasi, setInformasi] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === Ambil data dari backend ===
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/informasi", {
        headers: { Authorization: `Bearer ${token}` },
      });


      // pastikan hasilnya array
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      setInformasi(data);
    } catch (err) {
      console.error("Gagal memuat data informasi:", err);
      setInformasi([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item = null) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus informasi ini?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/informasi/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
      } catch (error) {
        console.error("Gagal menghapus informasi:", error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Kelola SOP & Panduan</h1>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg border-2 border-black"
            >
              <PlusCircle size={20} /> Tambah Baru
            </button>
          </div>

          {/* === Tabel daftar informasi === */}
          <div className="bg-white border-2 border-black rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-black">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold uppercase">
                    Judul
                  </th>
                  <th className="p-4 text-left text-sm font-semibold uppercase">
                    Kategori
                  </th>
                  <th className="p-4 text-left text-sm font-semibold uppercase">
                    File PDF
                  </th>
                  <th className="p-4 text-left text-sm font-semibold uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {informasi.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4 font-medium">{item.judul}</td>
                    <td className="p-4 text-gray-600">{item.kategori}</td>
                    <td className="p-4">
                      {item.file_path ? (
                        <a
                          href={`http://localhost:5000/${item.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <FileText size={16} /> Lihat PDF
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          Tidak ada file
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {informasi.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-4 text-center text-gray-500 italic"
                    >
                      Belum ada data informasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <InfoModal
          item={selectedItem}
          onClose={handleCloseModal}
          onSave={fetchData}
        />
      )}
    </div>
  );
};

// =========================
// MODAL FORM TAMBAH / EDIT
// =========================
const InfoModal = ({ item, onClose, onSave }) => {
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [kategori, setKategori] = useState("SOP");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (item) {
      setJudul(item.judul);
      setIsi(item.isi);
      setKategori(item.kategori);
    } else {
      setJudul("");
      setIsi("");
      setKategori("SOP");
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("judul", judul);
    formData.append("isi", isi);
    formData.append("kategori", kategori);
    if (file) formData.append("file_pdf", file); // ✅ Upload PDF opsional

    try {
      if (item) {
        await api.put(`/informasi/${item.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/informasi", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      alert("Gagal menyimpan informasi. Lihat console untuk detail.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl border-2 border-black w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">
          {item ? "Edit" : "Tambah"} Informasi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Judul"
            className="w-full p-3 border-2 border-black rounded-lg"
            required
          />

          <textarea
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            placeholder="Isi konten..."
            rows="8"
            className="w-full p-3 border-2 border-black rounded-lg"
            required
          />

          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full p-3 border-2 border-black rounded-lg bg-white"
          >
            <option value="SOP">SOP</option>
            <option value="Panduan">Panduan</option>
            <option value="Informasi Lain">Informasi Lain</option>
          </select>

          <div>
            <label className="block font-semibold mb-1">
              Upload File PDF (opsional)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border-2 border-black rounded-lg bg-white"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 rounded-lg border-2 border-black"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg border-2 border-black"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InformationPage;
