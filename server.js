const express = require('express');
const sql     = require('mssql');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const dbAyar = {
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server:   process.env.DB_SERVER || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'KuryeMixDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Bağlantı havuzunu bir kere oluştur
let pool;
async function baglan() {
  if (!pool) {
    pool = await sql.connect(dbAyar);
    console.log('✅ Veritabanına bağlandı');
  }
  return pool;
}

// ══════════════════════════════════════════
//  KULLANICI KAYIT
//  POST /api/kayit
//  Body: { isim, email, sifre }
// ══════════════════════════════════════════
app.post('/api/kayit', async (req, res) => {
  const { isim, email, sifre } = req.body;

  if (!isim || !email || !sifre)
    return res.status(400).json({ hata: 'Tüm alanlar zorunludur.' });

  if (sifre.length < 6)
    return res.status(400).json({ hata: 'Şifre en az 6 karakter olmalıdır.' });

  try {
    const p = await baglan();

    const kontrol = await p.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT Id FROM Kullanicilar WHERE Email = @email');

    if (kontrol.recordset.length > 0)
      return res.status(409).json({ hata: 'Bu e-posta zaten kayıtlı.' });

    const hash = await bcrypt.hash(sifre, 10);

    await p.request()
      .input('isim',  sql.NVarChar, isim)
      .input('email', sql.NVarChar, email)
      .input('sifre', sql.NVarChar, hash)
      .query(`
        INSERT INTO Kullanicilar (Isim, Email, Sifre, KayitTarihi)
        VALUES (@isim, @email, @sifre, GETDATE())
      `);

    console.log('✅ Yeni kullanıcı kaydedildi:', email);
    res.json({ basari: true, mesaj: 'Hesabınız oluşturuldu!' });

  } catch (err) {
    console.error('KAYIT hatası:', err.message);
    res.status(500).json({ hata: 'Sunucu hatası: ' + err.message });
  }
});

// ══════════════════════════════════════════
//  KULLANICI GİRİŞ
//  POST /api/giris
//  Body: { email, sifre }
// ══════════════════════════════════════════
app.post('/api/giris', async (req, res) => {
  const { email, sifre } = req.body;

  if (!email || !sifre)
    return res.status(400).json({ hata: 'E-posta ve şifre zorunludur.' });

  try {
    const p = await baglan();

    const sonuc = await p.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Kullanicilar WHERE Email = @email');

    if (sonuc.recordset.length === 0)
      return res.status(401).json({ hata: 'E-posta veya şifre hatalı.' });

    const kullanici = sonuc.recordset[0];

    const eslesme = await bcrypt.compare(sifre, kullanici.Sifre);
    if (!eslesme)
      return res.status(401).json({ hata: 'E-posta veya şifre hatalı.' });

    console.log('✅ Giriş yapıldı:', email);
    res.json({
      basari: true,
      kullanici: {
        id:    kullanici.Id,
        isim:  kullanici.Isim,
        email: kullanici.Email
      }
    });

  } catch (err) {
    console.error('GİRİŞ hatası:', err.message);
    res.status(500).json({ hata: 'Sunucu hatası: ' + err.message });
  }
});

// ══════════════════════════════════════════
//  KURYELERİ GETİR
// ══════════════════════════════════════════
app.get('/api/kuryeler', async (req, res) => {
  try {
    const p = await baglan();
    const sonuc = await p.request().query('SELECT * FROM Kuryeler');
    res.json(sonuc.recordset);
  } catch (err) {
    console.error('GET hatası:', err.message);
    res.status(500).json({ hata: err.message });
  }
});

// ══════════════════════════════════════════
//  KURYE EKLE
// ══════════════════════════════════════════
app.post('/api/kuryeler', async (req, res) => {
  const { ad, bolge, durum } = req.body;
  try {
    const p = await baglan();
    await p.request()
      .input('ad',    sql.NVarChar, ad)
      .input('bolge', sql.NVarChar, bolge)
      .input('durum', sql.NVarChar, durum)
      .query('INSERT INTO Kuryeler (Ad, Bolge, Durum) VALUES (@ad, @bolge, @durum)');
    res.json({ basari: true });
  } catch (err) {
    console.error('POST hatası:', err.message);
    res.status(500).json({ hata: err.message });
  }
});

// ══════════════════════════════════════════
//  KURYE SİL
// ══════════════════════════════════════════
app.delete('/api/kuryeler/:id', async (req, res) => {
  try {
    const p = await baglan();
    await p.request()
      .input('id', sql.Int, parseInt(req.params.id))
      .query('DELETE FROM Kuryeler WHERE Id = @id');
    res.json({ basari: true });
  } catch (err) {
    console.error('DELETE hatası:', err.message);
    res.status(500).json({ hata: err.message });
  }
});

// ══════════════════════════════════════════
//  ADMİN GİRİŞ
//  POST /api/admin-giris
//  Body: { kullanici, sifre }
// ══════════════════════════════════════════
app.post('/api/admin-giris', async (req, res) => {
  const { kullanici, sifre } = req.body;

  if (!kullanici || !sifre)
    return res.status(400).json({ hata: 'Kullanıcı adı ve şifre zorunludur.' });

  try {
    const p = await baglan();

    const sonuc = await p.request()
      .input('kullanici', sql.NVarChar, kullanici)
      .query('SELECT * FROM AdminKullanicilar WHERE KullaniciAdi = @kullanici');

    if (sonuc.recordset.length === 0)
      return res.status(401).json({ hata: 'Kullanıcı adı veya şifre hatalı.' });

    const admin = sonuc.recordset[0];
    const eslesme = await bcrypt.compare(sifre, admin.Sifre);

    if (!eslesme)
      return res.status(401).json({ hata: 'Kullanıcı adı veya şifre hatalı.' });

    console.log('✅ Admin girişi yapıldı:', kullanici);
    res.json({ basari: true });

  } catch (err) {
    console.error('ADMIN GİRİŞ hatası:', err.message);
    res.status(500).json({ hata: 'Sunucu hatası: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`));
