const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Konfigurasi koneksi ke PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// Inisialisasi Tabel jika belum ada
pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        nama_pemesan VARCHAR(100),
        lapangan VARCHAR(50),
        waktu_booking TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`).catch(err => console.error("Gagal membuat tabel:", err));


// 1. Endpoint GET /health (Healthcheck)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Aplikasi berjalan dengan baik!' });
});

// 2. Endpoint POST (Tulis data ke database)
app.post('/api/reservations', async (req, res) => {
    try {
        const { nama_pemesan, lapangan } = req.body;
        const result = await pool.query(
            'INSERT INTO reservations (nama_pemesan, lapangan) VALUES ($1, $2) RETURNING *',
            [nama_pemesan, lapangan]
        );
        res.status(201).json({ message: 'Reservasi berhasil dibuat', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Endpoint GET (Baca data dari database)
app.get('/api/reservations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reservations ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});