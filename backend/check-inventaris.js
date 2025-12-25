// Script untuk cek dan insert sample data inventaris
const db = require('./db');

async function checkAndInsertInventaris() {
    try {
        console.log('🔍 Mengecek data inventaris...\n');

        // 1. Cek apakah tabel inventaris ada
        const [tables] = await db.query(`
            SHOW TABLES LIKE 'inventaris'
        `);

        if (tables.length === 0) {
            console.log('❌ Tabel inventaris tidak ditemukan!');
            console.log('Silakan jalankan migration terlebih dahulu.');
            process.exit(1);
        }

        console.log('✅ Tabel inventaris ditemukan');

        // 2. Cek struktur tabel
        const [columns] = await db.query(`DESCRIBE inventaris`);
        console.log('\n📋 Struktur tabel inventaris:');
        console.table(columns);

        // 3. Cek data yang ada
        const [existing] = await db.query(`
            SELECT id, nama_barang, kode_barang, jumlah, status 
            FROM inventaris 
            ORDER BY id DESC
        `);

        console.log(`\n📦 Data inventaris yang ada: ${existing.length} item`);

        if (existing.length > 0) {
            console.table(existing);
            console.log('\n✅ Data inventaris sudah ada!');
        } else {
            console.log('\n⚠️  Tidak ada data inventaris. Menambahkan sample data...\n');

            // Insert sample data
            const sampleData = [
                ['INV-001', 'Laptop Dell Latitude', 5, 'Tersedia'],
                ['INV-002', 'Mouse Logitech', 10, 'Tersedia'],
                ['INV-003', 'Keyboard Mechanical', 8, 'Tersedia'],
                ['INV-004', 'Monitor LG 24"', 3, 'Tersedia'],
                ['INV-005', 'Printer HP LaserJet', 2, 'Tersedia'],
                ['INV-006', 'Proyektor Epson', 1, 'Rusak'],
                ['INV-007', 'Kabel HDMI', 15, 'Tersedia'],
                ['INV-008', 'Headset Gaming', 4, 'Tersedia'],
                ['INV-009', 'Webcam Logitech', 2, 'Hilang'],
                ['INV-010', 'Speaker Bluetooth', 6, 'Tersedia']
            ];

            for (const [kode, nama, jumlah, status] of sampleData) {
                await db.query(`
                    INSERT INTO inventaris (kode_barang, nama_barang, jumlah, status)
                    VALUES (?, ?, ?, ?)
                `, [kode, nama, jumlah, status]);
                console.log(`✅ Inserted: ${nama}`);
            }

            console.log(`\n✅ Berhasil menambahkan ${sampleData.length} sample data inventaris!`);

            // Tampilkan data yang baru diinsert
            const [newData] = await db.query(`
                SELECT id, nama_barang, kode_barang, jumlah, status 
                FROM inventaris 
                ORDER BY id DESC
            `);
            console.log('\n📦 Data inventaris sekarang:');
            console.table(newData);
        }

        // 4. Test endpoint (simulasi)
        console.log('\n🧪 Simulasi response endpoint /api/users/inventaris:');
        const [testData] = await db.query(`
            SELECT id, nama_barang, kode_barang, jumlah, status, created_at 
            FROM inventaris 
            ORDER BY id DESC
        `);
        console.log(JSON.stringify({
            success: true,
            data: testData,
            total: testData.length
        }, null, 2));

        console.log('\n✅ Selesai! Silakan refresh halaman laporan admin.\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAndInsertInventaris();
