const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'absensi.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use('/uploads', express.static(UPLOAD_DIR));

// Buat folder uploads jika belum ada
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Buat file data absensi jika belum ada
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.post('/api/absen', (req, res) => {
  const { nama, latitude, longitude, selfie } = req.body;

  if (!nama || !selfie) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  const waktu = new Date().toISOString();
  const filename = `${nama.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Ambil data base64 (tanpa prefix data:image/...)
  const base64Data = selfie.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  fs.writeFileSync(filepath, base64Data, 'base64');

  const dataBaru = {
    nama,
    latitude,
    longitude,
    foto: `/uploads/${filename}`,
    waktu
  };

  const dataLama = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  dataLama.push(dataBaru);
  fs.writeFileSync(DATA_FILE, JSON.stringify(dataLama, null, 2));

  console.log('Absensi tersimpan:', dataBaru.nama);
  res.json({ message: 'Absensi berhasil disimpan!' });
});

app.get('/api/absensi', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});