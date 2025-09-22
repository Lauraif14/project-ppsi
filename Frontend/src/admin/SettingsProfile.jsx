import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios"; // Pastikan path ini benar

// NAMA KOMPONEN DIUBAH
const SettingProfile = () => {
  const [form, setForm] = useState({
    username:"",
    name: "",
    email: "",
    role: "",
    divisi: "",
    jabatan: "",
    password: "",
    confirmPassword: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // 'success' or 'error'

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile", getAuthHeaders());
        setForm((prevForm) => ({
          ...prevForm,
          username: response.data.username,
          name: response.data.nama_lengkap || "Nama Belum Diatur",
          email: response.data.email,
          role: response.data.role, 
          divisi: response.data.divisi,
          jabatan: response.data.jabatan,
        }));
      } catch (error) {
        console.error("Gagal mengambil profil:", error);
        setMessageType("error");
        setMessage("Gagal mengambil data profil.");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => setProfilePic(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.password && form.password !== form.confirmPassword) {
      setMessageType("error");
      setMessage("Password konfirmasi tidak cocok.");
      return;
    }

    try {
      const response = await api.put("/profile", form, getAuthHeaders());
      setMessageType("success");
      setMessage(response.data.message);
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Gagal memperbarui profil.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Profile Card */}
            <div className="bg-white border-2 border-black shadow-lg rounded-2xl p-6 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-2 border-black overflow-hidden shadow-md">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-pink-200 text-pink-700 font-bold text-3xl">
                    {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{form.name}</h2>
                <p className="text-gray-600">{form.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-pink-100 text-pink-700 border-2 border-pink-400 rounded-full text-sm font-medium capitalize">
                  {form.role}
                </span>
              </div>
            </div>

            {/* Edit Form */}
            <div className="bg-white border-2 border-black shadow-lg rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
              {message && (
                <p className={`mb-4 text-center text-sm font-bold ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Profile Picture Controls */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-2 border-black overflow-hidden shadow-md">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pink-200 text-pink-700 font-bold text-4xl">
                        {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    <label className="block">
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <span className="cursor-pointer px-4 py-2 bg-pink-500 text-white rounded-lg border-2 border-black hover:bg-pink-600 transition">
                        Upload
                      </span>
                    </label>
                    {profilePic && (
                      <button onClick={handleRemoveImage} className="px-4 py-2 bg-red-500 text-white rounded-lg border-2 border-black hover:bg-red-600 transition w-full">
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Profile Form */}
                <div className="md:col-span-2">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
                      />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
                        />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
                      />
                    </div>
                    <div className="border-t border-gray-300 my-6"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
                        placeholder="Leave blank if you don't want to change"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg border-2 border-black hover:bg-pink-600 transition"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// EXPORT DIUBAH DAN DIPERBAIKI
export default SettingProfile;