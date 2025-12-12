// models/inventarisModel.js

const db = require('../db');

const InventarisModel = {
    // Dipanggil oleh absenMasuk (untuk checklist)
    findAllItems: async () => {
        const [rows] = await db.query('SELECT id, kode_barang, nama_barang, status FROM inventaris');
        return rows;
    },
    
    // Dipanggil oleh getAllInventaris (Controller)
    getAllInventaris: async () => { 
        const [rows] = await db.execute(`
            SELECT id, nama_barang, kode_barang, jumlah, status, created_at 
            FROM inventaris 
            ORDER BY id DESC
        `);
        return rows;
    },

    // Dipanggil oleh createInventaris, deleteInventaris
    findInventarisById: async (id) => {
        const [rows] = await db.query('SELECT * FROM inventaris WHERE id = ?', [id]);
        return rows[0] || null;
    },
    
    // Dipanggil oleh createInventaris, bulkCreateInventaris
    createInventaris: async (data) => {
        const [result] = await db.query(
            'INSERT INTO inventaris (nama_barang, kode_barang, jumlah, status, created_at) VALUES (?, ?, ?, ?, NOW())',
            [data.nama_barang, data.kode_barang, data.jumlah, data.status]
        );
        return result.insertId;
    },

    // Dipanggil oleh bulkCreateInventaris
    findInventarisByName: async (namaBarang) => {
        const [rows] = await db.query('SELECT id, jumlah FROM inventaris WHERE nama_barang = ?', [namaBarang]);
        return rows[0] || null;
    },

    // Dipanggil oleh bulkCreateInventaris
    updateInventarisQuantity: async (namaBarang, jumlahTambahan, kodeBarang, status) => {
        await db.query(
            'UPDATE inventaris SET jumlah = jumlah + ?, kode_barang = COALESCE(?, kode_barang), status = COALESCE(?, status) WHERE nama_barang = ?',
            [jumlahTambahan, kodeBarang, status, namaBarang]
        );
    },

    // Dipanggil oleh deleteInventaris
    deleteInventaris: async (id) => {
        const [result] = await db.query('DELETE FROM inventaris WHERE id = ?', [id]);
        return result.affectedRows;
    },
    
    // Dipanggil oleh submitChecklist
    updateStatus: async (inventarisId, status) => {
        await db.query(
            'UPDATE inventaris SET status = ? WHERE id = ?',
            [status, inventarisId]
        );
    }
};

module.exports = InventarisModel;