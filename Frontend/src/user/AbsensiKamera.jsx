import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import api from '../api/axios';

const AbsensiKamera = ({ mode, absensiId, onClose, setPesanDashboard, onSuccess }) => {
    const webcamRef = useRef(null);
    const [capturedImg, setCapturedImg] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImg(imageSrc);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                () => { setError('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.'); }
            );
        } else {
            setError('Geolocation tidak didukung oleh browser ini.');
        }
    }, [webcamRef]);

    const handleSubmitAbsen = async () => {
        if (!capturedImg || !location) {
            setError('Silakan ambil foto dan pastikan lokasi terdeteksi.');
            return;
        }
        setLoading(true);
        setError('');

        const blob = await fetch(capturedImg).then(res => res.blob());
        const file = new File([blob], "foto_absen.jpg", { type: "image/jpeg" });

        const formData = new FormData();
        formData.append('foto_absen', file);
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);

        // Tentukan endpoint berdasarkan mode
        let endpoint = '/absensi/masuk';
        if (mode === 'keluar') {
            endpoint = '/absensi/keluar';
            formData.append('absensiId', absensiId);
        }

        try {
            const token = localStorage.getItem("token");
            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Panggil onSuccess callback agar dashboard refresh data
            if (onSuccess) onSuccess();

            setPesanDashboard(response.data.message);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-lg text-center w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 capitalize">Ambil Absen {mode}</h2>

                {capturedImg ? (
                    <img src={capturedImg} alt="Hasil capture" className="rounded-lg mb-4" />
                ) : (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="rounded-lg mb-4 w-full"
                    />
                )}

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="space-y-3">
                    {capturedImg ? (
                        <>
                            <button onClick={handleSubmitAbsen} disabled={loading} className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">
                                {loading ? 'Mengirim...' : `Kirim Absen ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
                            </button>
                            <button onClick={() => setCapturedImg(null)} className="w-full py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors">
                                Ambil Ulang
                            </button>
                        </>
                    ) : (
                        <button onClick={capture} className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                            Ambil Foto & Lokasi
                        </button>
                    )}
                    <button onClick={onClose} className="w-full py-2 text-gray-600 hover:text-gray-800">Batal</button>
                </div>
            </div>
        </div>
    );
};

export default AbsensiKamera;