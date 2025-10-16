const jwt = require("jsonwebtoken");

/* 
----------------------------------------
🔹 1. Middleware untuk verifikasi JWT (semua user)
----------------------------------------
*/
const verifyToken = (req, res, next) => {
  try {
    // Ambil token dari header Authorization: Bearer <token>
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token diperlukan untuk otentikasi." });
    }

    // Verifikasi token menggunakan secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data user hasil decode (biasanya { id, role, username })
    req.user = decoded;

    next(); // lanjut ke route berikutnya
  } catch (err) {
    console.error("❌ Error verifyToken:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Token tidak valid atau kedaluwarsa." });
  }
};

/* 
----------------------------------------
🔹 2. Middleware tambahan untuk role ADMIN
----------------------------------------
*/
const verifyAdmin = (req, res, next) => {
  // Pastikan token diverifikasi dulu
  verifyToken(req, res, () => {
    if (req.user?.role === "admin") {
      return next(); // izinkan lanjut
    }
    return res
      .status(403)
      .json({ success: false, message: "Akses ditolak. Hanya untuk admin." });
  });
};

module.exports = { verifyToken, verifyAdmin };
