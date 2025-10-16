const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// Helper function to get Indonesian day name from date
function getIndonesianDayName(date) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
}

// GET all pengurus (untuk dropdown)
router.get('/pengurus', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, nama_lengkap, jabatan FROM users WHERE role = "user" ORDER BY nama_lengkap'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pengurus',
      error: error.message
    });
  }
});

// GET jadwal piket berdasarkan hari (bukan tanggal)
router.get('/jadwal', verifyToken, async (req, res) => {
  try {
    console.log('GET /jadwal called');
    
    // Check if table exists first
    const [tables] = await db.execute("SHOW TABLES LIKE 'jadwal_piket'");
    if (tables.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Table jadwal_piket does not exist. Please create the table first.',
        error: 'Table not found'
      });
    }
    
    const query = `
      SELECT 
        jp.id, 
        jp.hari, 
        jp.user_id, 
        u.nama_lengkap,
        u.jabatan,
        jp.created_at
      FROM jadwal_piket jp
      INNER JOIN users u ON jp.user_id = u.id
      ORDER BY 
        FIELD(jp.hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'),
        u.nama_lengkap ASC
    `;
    
    console.log('Executing query:', query);
    
    const [rows] = await db.execute(query);
    
    console.log('Query result:', rows);
    
    // Group by hari
    const groupedSchedule = {};
    rows.forEach(row => {
      const hari = row.hari;
      
      if (!groupedSchedule[hari]) {
        groupedSchedule[hari] = [];
      }
      groupedSchedule[hari].push({
        id: row.id,
        user_id: row.user_id,
        nama_lengkap: row.nama_lengkap,
        jabatan: row.jabatan,
        hari: row.hari
      });
    });
    
    res.json({
      success: true,
      data: groupedSchedule
    });
  } catch (error) {
    console.error('Error in GET /jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jadwal piket',
      error: error.message
    });
  }
});

// POST save jadwal piket (berdasarkan hari)
router.post('/jadwal', verifyToken, async (req, res) => {
  try {
    console.log('POST /jadwal called with body:', req.body);
    
    const { schedule } = req.body;
    
    if (!schedule || typeof schedule !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Schedule data is required'
      });
    }

    // Check if table exists first
    const [tables] = await db.execute("SHOW TABLES LIKE 'jadwal_piket'");
    if (tables.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Table jadwal_piket does not exist. Please create the table first.',
        error: 'Table not found'
      });
    }

    // Clear existing schedule first
    await db.execute('DELETE FROM jadwal_piket');
    console.log('Cleared existing schedule');

    // Insert new schedule berdasarkan hari
    let totalInserted = 0;
    let errors = [];
    
    for (const [hari, namaList] of Object.entries(schedule)) {
      console.log(`Processing hari: ${hari} with names:`, namaList);
      
      for (const nama of namaList) {
        try {
          // Find user_id by nama_lengkap
          const [userRows] = await db.execute(
            'SELECT id FROM users WHERE nama_lengkap = ? AND role = "user" LIMIT 1',
            [nama]
          );
          
          if (userRows.length > 0) {
            const user_id = userRows[0].id;
            
            console.log(`Inserting: user_id=${user_id}, hari=${hari}, nama=${nama}`);
            
            await db.execute(
              'INSERT INTO jadwal_piket (user_id, hari) VALUES (?, ?)',
              [user_id, hari]
            );
            
            totalInserted++;
            console.log(`Successfully inserted ${nama} for ${hari}`);
          } else {
            console.warn(`User not found: ${nama}`);
            errors.push(`User not found: ${nama}`);
          }
        } catch (insertError) {
          console.error(`Error inserting ${nama}:`, insertError);
          errors.push(`Error inserting ${nama}: ${insertError.message}`);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Jadwal piket berhasil disimpan',
      data: {
        total_hari: Object.keys(schedule).length,
        total_assignments: Object.values(schedule).reduce((sum, names) => sum + names.length, 0),
        total_inserted: totalInserted,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Error in POST /jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving jadwal piket',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE hapus semua jadwal piket
router.delete('/jadwal', verifyToken, async (req, res) => {
  try {
    console.log('DELETE /jadwal called');

    const [result] = await db.execute('DELETE FROM jadwal_piket');

    console.log('Delete result:', result);

    res.json({
      success: true,
      message: `Berhasil menghapus ${result.affectedRows} jadwal piket`,
      deleted_count: result.affectedRows
    });

  } catch (error) {
    console.error('Error in DELETE /jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting jadwal piket',
      error: error.message
    });
  }
});

// POST generate jadwal piket berdasarkan hari
router.post('/jadwal/generate', verifyToken, async (req, res) => {
  try {
    console.log('POST /jadwal/generate called with body:', req.body);
    
    const { assignments_per_day = 3 } = req.body;

    // Get all active pengurus
    const [pengurusRows] = await db.execute(
      'SELECT id, nama_lengkap FROM users WHERE role = "user" ORDER BY nama_lengkap'
    );

    if (pengurusRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pengurus found'
      });
    }

    // Generate schedule untuk hari Senin-Jumat
    const pengurus = pengurusRows.map(p => p.nama_lengkap);
    const shuffledPengurus = [...pengurus].sort(() => 0.5 - Math.random());
    
    const weekdays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const schedule = {};
    
    weekdays.forEach((hari, index) => {
      const startIdx = (index * assignments_per_day) % shuffledPengurus.length;
      const assigned = [];
      
      for (let i = 0; i < assignments_per_day; i++) {
        const pengurusIdx = (startIdx + i) % shuffledPengurus.length;
        assigned.push(shuffledPengurus[pengurusIdx]);
      }
      
      schedule[hari] = assigned;
    });

    console.log('Generated schedule:', schedule);

    res.json({
      success: true,
      message: 'Schedule generated successfully',
      data: {
        schedule: schedule,
        total_hari: Object.keys(schedule).length,
        total_assignments: Object.values(schedule).reduce((sum, names) => sum + names.length, 0),
        assignments_per_day: assignments_per_day,
        total_pengurus: pengurus.length
      }
    });

  } catch (error) {
    console.error('Error in POST /jadwal/generate:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating schedule',
      error: error.message
    });
  }
});

// GET absensi berdasarkan tanggal
router.get('/absensi', verifyToken, async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date query parameter is required'
    });
  }

  try {
    // Convert date string to date object
    const targetDate = new Date(date);
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Get day name in Indonesian
    const hari = getIndonesianDayName(targetDate);

    // Fetch absensi data for the specific date
    const [rows] = await db.execute(
      `
      SELECT 
        a.id,
        u.nama_lengkap,
        u.jabatan,
        a.status
      FROM absensi a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.tanggal = ?
      ORDER BY u.nama_lengkap
      `,
      [targetDate.toISOString().split('T')[0]] // Format date to YYYY-MM-DD
    );

    res.json({
      success: true,
      data: {
        tanggal: targetDate.toISOString().split('T')[0],
        hari: hari,
        absensi: rows
      }
    });
  } catch (error) {
    console.error('Error in GET /absensi:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching absensi data',
      error: error.message
    });
  }
});

// DELETE hapus absensi berdasarkan ID
router.delete('/absensi/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID parameter is required'
    });
  }

  try {
    // Delete absensi record by ID
    const [result] = await db.execute(
      'DELETE FROM absensi WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Absensi record not found'
      });
    }

    res.json({
      success: true,
      message: 'Absensi record deleted successfully',
      deleted_id: id
    });
  } catch (error) {
    console.error('Error in DELETE /absensi/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting absensi record',
      error: error.message
    });
  }
});

// TAMBAHKAN INI - EXPORT MODULE
module.exports = router;