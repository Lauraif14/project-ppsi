const express = require("express");
const db = require("../db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const router = express.Router();

router.use(verifyToken, verifyAdmin);

/* 🔹 LAPORAN PIKET */
router.get("/piket", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Tanggal diperlukan." });

    const [rows] = await db.query(
      `
      SELECT 
        rp.id,
        u.nama_lengkap AS nama,
        rp.tanggal_piket,
        rp.waktu_masuk,
        rp.waktu_keluar,
        rp.durasi_piket,
        rp.status
      FROM riwayat_piket rp
      JOIN users u ON rp.user_id = u.id
      WHERE DATE(rp.tanggal_piket) = ?
      ORDER BY rp.waktu_masuk ASC
      `,
      [date]
    );

    const data = rows.map((r) => ({
      id: r.id,
      nama: r.nama,
      jam_masuk: r.waktu_masuk
        ? new Date(r.waktu_masuk).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      jam_keluar: r.waktu_keluar
        ? new Date(r.waktu_keluar).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      durasi: r.durasi_piket || 0,
      status: r.status,
    }));

    res.json({ data });
  } catch (error) {
    console.error("❌ Error laporan piket:", error);
    res.status(500).json({ message: "Gagal mengambil laporan piket." });
  }
});

/* 🔹 LAPORAN INVENTARIS */
router.get("/inventaris", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Tanggal diperlukan." });

    const [rows] = await db.query(
      `
      SELECT 
        a.id,
        u.nama_lengkap AS checkedBy,
        a.inventaris_checklist,
        DATE(a.waktu_masuk) AS tanggal_absen
      FROM absensi a
      JOIN users u ON a.user_id = u.id
      WHERE DATE(a.waktu_masuk) = ? AND a.checklist_submitted = TRUE
      ORDER BY a.waktu_masuk ASC
      `,
      [date]
    );

    const inventarisData = [];

    for (const row of rows) {
      let items = [];
      try {
        const parsed = JSON.parse(row.inventaris_checklist);
        items = Array.isArray(parsed)
          ? parsed
          : Object.entries(parsed).map(([nama, status]) => ({
              nama,
              status,
              catatan: "",
            }));
      } catch {
        items = [];
      }

      items.forEach((item) =>
        inventarisData.push({
          id: row.id,
          item: item.nama || "Tidak diketahui",
          condition: item.status || "Baik",
          checkedBy: row.checkedBy,
          tanggal: row.tanggal_absen,
        })
      );
    }

    res.json({ data: inventarisData });
  } catch (error) {
    console.error("❌ Error laporan inventaris:", error);
    res.status(500).json({ message: "Gagal mengambil laporan inventaris." });
  }
});

module.exports = router;
