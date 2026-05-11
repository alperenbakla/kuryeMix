# 🚚 KuryeMix

Kurye ve teslimat süreçlerini yönetmek için geliştirilmiş **full-stack web uygulaması**.  
Node.js + Express backend, vanilla JS frontend, Microsoft SQL Server veritabanı.

---

## ✨ Özellikler

| Modül | Açıklama |
|---|---|
| 👤 Kullanıcı Sistemi | Kayıt, giriş, oturum yönetimi (bcrypt şifreleme) |
| 🔐 Admin Paneli | Ayrı admin girişi ve yönetim ekranı |
| 🚴 Kurye Yönetimi | Kurye ekleme, listeleme, silme |
| 📦 Paket / Sipariş | Paket seçimi, sepet ve ödeme akışı |
| 🌐 REST API | Express.js tabanlı JSON API |

---

## 🗂️ Proje Yapısı

```
kuryemix/
├── server.js          # Express sunucusu & API endpoint'leri
├── app.js             # Frontend JavaScript (modal, form, sepet)
├── index.html         # Ana sayfa
├── style.css          # Stil dosyası
├── package.json       # Bağımlılıklar
├── .env.example       # Ortam değişkeni şablonu (bunu kopyalayın)
├── .gitignore
└── README.md
```

---

## ⚙️ Kurulum

### 1. Repoyu klonlayın

```bash
git clone https://github.com/KULLANICI_ADIN/kuryemix.git
cd kuryemix
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. Ortam değişkenlerini ayarlayın

```bash
cp .env.example .env
```

Ardından `.env` dosyasını açıp kendi veritabanı bilgilerinizi girin:

```env
DB_USER=admin
DB_PASSWORD=GERCEK_SIFRENIZ
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=KuryeMixDB
PORT=3000
```

### 4. Veritabanını oluşturun

SQL Server'da `KuryeMixDB` adında bir veritabanı oluşturup aşağıdaki tabloları ekleyin:

```sql
CREATE TABLE Kullanicilar (
    Id          INT PRIMARY KEY IDENTITY,
    Isim        NVARCHAR(100),
    Email       NVARCHAR(150) UNIQUE,
    Sifre       NVARCHAR(255),
    KayitTarihi DATETIME
);

CREATE TABLE AdminKullanicilar (
    Id           INT PRIMARY KEY IDENTITY,
    KullaniciAdi NVARCHAR(100),
    Sifre        NVARCHAR(255)
);

CREATE TABLE Kuryeler (
    Id    INT PRIMARY KEY IDENTITY,
    Ad    NVARCHAR(100),
    Bolge NVARCHAR(100),
    Durum NVARCHAR(50)
);
```

### 5. Sunucuyu başlatın

```bash
npm start
```

Uygulama `http://localhost:3000` adresinde çalışır.

---

## 🔌 API Endpoint'leri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/kayit` | Kullanıcı kaydı |
| POST | `/api/giris` | Kullanıcı girişi |
| POST | `/api/admin-giris` | Admin girişi |
| GET | `/api/kuryeler` | Kuryeleri listele |
| POST | `/api/kuryeler` | Kurye ekle |
| DELETE | `/api/kuryeler/:id` | Kurye sil |

---

## 🛠️ Teknolojiler

- **Backend:** Node.js, Express.js
- **Veritabanı:** Microsoft SQL Server (`mssql`)
- **Güvenlik:** bcrypt (şifre hash'leme)
- **Frontend:** HTML, CSS, Vanilla JavaScript

---

## ⚠️ Güvenlik Notları

- `.env` dosyası `.gitignore`'a eklenmiştir — veritabanı şifresi GitHub'a **gitmez**
- Şifreler veritabanında bcrypt ile hash'lenerek saklanır
- Production ortamında `encrypt: true` yapılması önerilir

---

## 📄 Lisans

ISC
