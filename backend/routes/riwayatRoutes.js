const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/auth");

/* 
----------------------------------------
🔹 1. Ambil riwayat piket milik user login
----------------------------------------
*/
router.get("/my", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT * FROM riwayat_piket WHERE user_id = ? ORDER BY tanggal_piket DESC`,
      [userId]
    );

    rows.forEach(r => {
      if (r.tanggal_piket instanceof Date) {
        r.tanggal_piket = r.tanggal_piket.toISOString().split("T")[0];
      }
    });

    const formatted = rows.map(r => ({
      ...r,
      laporan_inventaris: safeParseJSON(r.laporan_inventaris),
    }));

    res.json({
      success: true,
      message: "Riwayat piket pengguna berhasil diambil.",
      data: formatted,
    });
  } catch (err) {
    console.error("❌ Error get my riwayat:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data riwayat." });
  }
});

/* 
----------------------------------------
🔹 2. Tambahkan riwayat piket (Masuk)
----------------------------------------
*/
router.post("/masuk", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tanggal = new Date().toISOString().split("T")[0];
    const waktuMasuk = new Date();

    await db.query(
      `INSERT INTO riwayat_piket (user_id, tanggal_piket, waktu_masuk, status)
       VALUES (?, ?, ?, 'Hadir')
       ON DUPLICATE KEY UPDATE waktu_masuk = VALUES(waktu_masuk), status = 'Hadir'`,
      [userId, tanggal, waktuMasuk]
    );

    res.json({ success: true, message: "Piket masuk berhasil dicatat." });
  } catch (err) {
    console.error("❌ Error tambah piket masuk:", err);
    res.status(500).json({ success: false, message: "Gagal mencatat piket masuk." });
  }
});

/* 
----------------------------------------
🔹 3. Update riwayat piket (Keluar)
----------------------------------------
*/
router.put("/keluar", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const waktuKeluar = new Date();

    await db.query(
      `UPDATE riwayat_piket
       SET waktu_keluar = ?, 
           durasi_piket = TIMESTAMPDIFF(MINUTE, waktu_masuk, ?),
           status = 'Hadir'
       WHERE user_id = ? AND tanggal_piket = CURDATE()`,
      [waktuKeluar, waktuKeluar, userId]
    );

    res.json({ success: true, message: "Piket keluar berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Error update piket keluar:", err);
    res.status(500).json({ success: false, message: "Gagal mencatat piket keluar." });
  }
});

/* 
----------------------------------------
🔹 4. User Ajukan Izin
----------------------------------------
*/
router.post("/izin", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tanggal, alasan } = req.body;

    if (!tanggal || !alasan) {
      return res.status(400).json({ success: false, message: "Tanggal dan alasan wajib diisi." });
    }

    const [existing] = await db.query(
      `SELECT * FROM riwayat_piket WHERE user_id = ? AND tanggal_piket = ?`,
      [userId, tanggal]
    );

    if (existing.length > 0 && existing[0].status === "Izin") {
      return res.status(400).json({ success: false, message: "Izin untuk tanggal ini sudah diajukan." });
    }

    await db.query(
      `INSERT INTO riwayat_piket (user_id, tanggal_piket, status, laporan_inventaris)
       VALUES (?, ?, 'Izin', ?)
       ON DUPLICATE KEY UPDATE status = 'Izin', laporan_inventaris = VALUES(laporan_inventaris)`,
      [userId, tanggal, JSON.stringify({ alasan })]
    );

    res.json({ success: true, message: "Izin berhasil diajukan." });
  } catch (err) {
    console.error("❌ Error izin:", err);
    res.status(500).json({ success: false, message: "Gagal mengajukan izin." });
  }
});

/* 
----------------------------------------
🔹 5. Auto tandai Tidak Hadir (oleh sistem)
----------------------------------------
*/
router.post("/auto-mark-absent", async (req, res) => {
  try {
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const hariIni = hari[new Date().getDay()];
    const tanggalHariIni = new Date().toISOString().split("T")[0];

    const [jadwalHariIni] = await db.query(`
      SELECT jp.user_id FROM jadwal_piket jp WHERE jp.hari = ?`, [hariIni]);

    const [absen] = await db.query(`
      SELECT DISTINCT user_id FROM absensi WHERE DATE(waktu_masuk) = ?`, [tanggalHariIni]);
    const sudahAbsen = absen.map(r => r.user_id);

    const [izin] = await db.query(`
      SELECT DISTINCT user_id FROM riwayat_piket WHERE tanggal_piket = ? AND status = 'Izin'`, [tanggalHariIni]);
    const sudahIzin = izin.map(r => r.user_id);

    let count = 0;
    for (const j of jadwalHariIni) {
      if (!sudahAbsen.includes(j.user_id) && !sudahIzin.includes(j.user_id)) {
        await db.query(`
          INSERT INTO riwayat_piket (user_id, tanggal_piket, status)
          VALUES (?, ?, 'Tidak Hadir')
          ON DUPLICATE KEY UPDATE status = 'Tidak Hadir'`, [j.user_id, tanggalHariIni]);
        count++;
      }
    }

    res.json({ success: true, message: `${count} pengguna ditandai "Tidak Hadir".` });
  } catch (err) {
    console.error("❌ Error auto absent:", err);
    res.status(500).json({ success: false, message: "Gagal menandai tidak hadir." });
  }
});

/* Helper */
function safeParseJSON(str) {
  try { return str ? JSON.parse(str) : []; }
  catch { return []; }
}

module.exports = router;
