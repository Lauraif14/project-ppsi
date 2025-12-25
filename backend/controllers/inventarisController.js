// controllers/inventarisController.js (Bentuk Class/OOP)

// Mengimpor secara statis karena ini adalah helper/Model
const InventarisModel = require('../models/inventarisModel');
const { parseUploadedFile, cleanupFile } = require('../utils/uploadUtils');


const validStatuses = ['Tersedia', 'Habis', 'Dipinjam', 'Rusak', 'Hilang'];

class InventarisController {

    async getAllInventaris(req, res) {
        try {
            const rows = await InventarisModel.getAllInventaris();
            res.json({ success: true, data: rows, total: rows.length });
        } catch (error) {
            console.error('Error fetching inventaris:', error);
            res.status(500).json({ success: false, message: 'Error fetching inventaris data', error: error.message });
        }
    };

    async createInventaris(req, res) {
        try {
            const { nama_barang, kode_barang, jumlah, status } = req.body;

            if (!nama_barang || !jumlah) {
                return res.status(400).json({ success: false, message: 'Nama barang dan jumlah harus diisi' });
            }

            const parsedJumlah = parseInt(jumlah);
            if (isNaN(parsedJumlah) || parsedJumlah <= 0) {
                return res.status(400).json({ success: false, message: 'Jumlah harus berupa angka dan lebih dari 0' });
            }

            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: 'Status tidak valid. Harus salah satu dari: ' + validStatuses.join(', ') });
            }

            const data = {
                nama_barang: nama_barang.trim(),
                kode_barang: kode_barang && kode_barang.trim() ? kode_barang.trim() : null,
                jumlah: parsedJumlah,
                status: status || 'Tersedia'
            };

            const insertId = await InventarisModel.createInventaris(data);
            const newInventaris = await InventarisModel.findInventarisById(insertId);

            res.json({ success: true, message: 'Inventaris berhasil ditambahkan', data: newInventaris });
        } catch (error) {
            console.error('Error creating inventaris:', error);
            res.status(500).json({ success: false, message: 'Error creating inventaris', error: error.message });
        }
    };

    async deleteInventaris(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'ID inventaris tidak valid' });
            }

            const existingItem = await InventarisModel.findInventarisById(id);
            if (!existingItem) {
                return res.status(404).json({ success: false, message: 'Item inventaris tidak ditemukan' });
            }

            const affectedRows = await InventarisModel.deleteInventaris(id);

            if (affectedRows === 0) {
                return res.status(500).json({ success: false, message: 'Gagal menghapus inventaris' });
            }

            res.json({ success: true, message: 'Inventaris berhasil dihapus', data: existingItem });
        } catch (error) {
            console.error('Error deleting inventaris:', error);
            res.status(500).json({ success: false, message: 'Error deleting inventaris', error: error.message });
        }
    };

    async updateInventaris(req, res) {
        try {

            const { id } = req.params;
            const { nama_barang, kode_barang, jumlah, status } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'ID inventaris tidak valid' });
            }

            const existingItem = await InventarisModel.findInventarisById(id);
            if (!existingItem) {
                return res.status(404).json({ success: false, message: 'Item inventaris tidak ditemukan' });
            }

            if (!nama_barang || !jumlah) {
                return res.status(400).json({ success: false, message: 'Nama barang dan jumlah harus diisi' });
            }

            const parsedJumlah = parseInt(jumlah);
            if (isNaN(parsedJumlah) || parsedJumlah <= 0) {
                return res.status(400).json({ success: false, message: 'Jumlah harus berupa angka dan lebih dari 0' });
            }

            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: 'Status tidak valid. Harus salah satu dari: ' + validStatuses.join(', ') });
            }

            const data = {
                nama_barang: nama_barang.trim(),
                kode_barang: kode_barang && kode_barang.trim() ? kode_barang.trim() : null,
                jumlah: parsedJumlah,
                status: status || 'Tersedia'
            };

            await InventarisModel.updateInventaris(id, data);
            const updatedItem = await InventarisModel.findInventarisById(id);

            res.json({ success: true, message: 'Inventaris berhasil diupdate', data: updatedItem });
        } catch (error) {
            console.error('Error updating inventaris:', error);
            res.status(500).json({ success: false, message: 'Error updating inventaris', error: error.message });
        }
    };

    async bulkCreateInventaris(req, res) {
        let filePath = null;

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'File tidak ditemukan'
                });
            }

            filePath = req.file.path;

            // 1. Parse File
            let jsonData;
            try {
                jsonData = parseUploadedFile(filePath, req.file.originalname);
            } catch (e) {
                cleanupFile(filePath);
                return res.status(400).json({ success: false, message: e.message });
            }

            if (jsonData.length === 0) {
                cleanupFile(filePath);
                return res.status(400).json({ success: false, message: 'File kosong atau format tidak sesuai.' });
            }

            // 2. Process Data
            const results = [];
            const errors = [];

            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                const rowNumber = i + 2;

                try {
                    const namaBarang = row.nama_barang ? row.nama_barang.toString().trim() : '';
                    const kodeBarang = row.kode_barang && row.kode_barang.toString().trim() ? row.kode_barang.toString().trim() : null;
                    const jumlah = row.jumlah ? parseInt(row.jumlah) : 0;
                    const status = row.status && row.status.toString().trim() ? row.status.toString().trim() : 'Tersedia';

                    if (!namaBarang || !jumlah || isNaN(jumlah) || jumlah <= 0) {
                        errors.push(`Baris ${rowNumber}: nama_barang dan jumlah (harus > 0) harus diisi`);
                        continue;
                    }

                    if (status && !validStatuses.includes(status)) {
                        errors.push(`Baris ${rowNumber}: Status tidak valid. Harus: ${validStatuses.join(', ')}`);
                        continue;
                    }

                    const existingItem = await InventarisModel.findInventarisByName(namaBarang);

                    if (existingItem) {
                        // Update existing item quantity
                        await InventarisModel.updateInventarisQuantity(namaBarang, jumlah, kodeBarang, status);
                        results.push({ id: existingItem.id, nama_barang: namaBarang, action: 'updated', quantity_added: jumlah });
                    } else {
                        // Insert new item
                        const insertId = await InventarisModel.createInventaris({ nama_barang: namaBarang, kode_barang: kodeBarang, jumlah, status });
                        results.push({ id: insertId, nama_barang: namaBarang, action: 'created' });
                    }

                } catch (error) {
                    console.error('Row processing error:', error);
                    errors.push(`Baris ${rowNumber}: Error tidak terduga: ${error.message}`);
                }
            }

            // 3. Final Response
            res.status(201).json({
                success: true,
                message: `Berhasil import ${results.length} data inventaris`,
                data: {
                    imported: results,
                    errors: errors,
                    total_processed: jsonData.length,
                    total_success: results.length,
                    total_errors: errors.length
                }
            });

        } catch (error) {
            console.error('Bulk upload error:', error);
            res.status(500).json({ success: false, message: 'Error processing bulk upload', error: error.message });
        } finally {
            cleanupFile(filePath);
        }
    };
}

// EKSPOR INSTANCE CLASS
module.exports = new InventarisController();