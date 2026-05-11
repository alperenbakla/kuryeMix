// ── Yardımcı: ID'ye göre element bul ──
function id(x) { return document.getElementById(x); }

// ── NAVBAR: kaydırınca gölge ──
window.addEventListener('scroll', function() {
  id('navbar').classList.toggle('kaydirilan', window.scrollY > 40);
});

// ── TOAST BİLDİRİMİ ──
function toast(mesaj, tip) {
  let t = id('toast');
  t.textContent = mesaj;
  t.className = 'goster ' + (tip || 'basari');
  setTimeout(function() { t.className = ''; }, 3000);
}

// ── MODAL: aç / kapat ──
function modalAc(id_) {
  id(id_).classList.add('aktif');
  id('overlay').classList.add('aktif');
  document.body.style.overflow = 'hidden';
}

function modalKapat(id_) {
  id(id_).classList.remove('aktif');
  id('overlay').classList.remove('aktif');
  document.body.style.overflow = '';
}

function tumModallariKapat() {
  document.querySelectorAll('.modal.aktif').forEach(function(m) {
    m.classList.remove('aktif');
  });
  id('overlay').classList.remove('aktif');
  document.body.style.overflow = '';
}

function modalGecis(kapat, ac) {
  modalKapat(kapat);
  setTimeout(function() { modalAc(ac); }, 150);
}

// ESC tuşuyla kapat
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') tumModallariKapat();
});

// ── ŞİFRE GÖSTER / GİZLE ──
function sifreyiGoster(inputId, btn) {
  let inp = id(inputId);
  let gizli = inp.type === 'password';
  inp.type = gizli ? 'text' : 'password';
  btn.textContent = gizli ? '🙈' : '👁';
}

// ── GİRİŞ FORMU ──
function girisYap() {
  var email = id('girisEmail').value.trim();
  var sifre = id('giriseSifre').value;

  if (!email || !sifre) return toast('⚠️ Tüm alanları doldurun!', 'hata');
  if (!email.includes('@')) return toast('⚠️ Geçerli e-posta girin!', 'hata');

  // Buton disable et (çift tıklamayı önle)
  var btn = document.querySelector('#girisModal .modal-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Giriş yapılıyor...';

  fetch('http://localhost:3000/api/giris', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, sifre: sifre })
  })
  .then(function(r) { return r.json(); })
  .then(function(veri) {
    if (veri.basari) {
      // Oturumu sakla
      localStorage.setItem('kmKullanici', JSON.stringify(veri.kullanici));
      kullaniciyiGoster(veri.kullanici);
      toast('✅ Hoş geldiniz, ' + veri.kullanici.isim + '!');
      modalKapat('girisModal');
      id('girisEmail').value = '';
      id('giriseSifre').value = '';
    } else {
      toast('❌ ' + (veri.hata || 'Giriş başarısız.'), 'hata');
    }
  })
  .catch(function() {
    toast('❌ Sunucuya bağlanılamadı!', 'hata');
  })
  .finally(function() {
    btn.disabled = false;
    btn.textContent = 'Giriş Yap';
  });
}

// ── KAYIT FORMU ──
function kayitOl() {
  var isim   = id('kayitIsim').value.trim();
  var email  = id('kayitEmail').value.trim();
  var sifre  = id('kayitSifre').value;
  var sifre2 = id('kayitSifre2').value;

  if (!isim || !email || !sifre || !sifre2) return toast('⚠️ Tüm alanları doldurun!', 'hata');
  if (!email.includes('@')) return toast('⚠️ Geçerli e-posta girin!', 'hata');
  if (sifre.length < 6) return toast('⚠️ Şifre en az 6 karakter olmalı!', 'hata');
  if (sifre !== sifre2)  return toast('⚠️ Şifreler eşleşmiyor!', 'hata');

  var btn = document.querySelector('#kayitModal .modal-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Kaydediliyor...';

  fetch('http://localhost:3000/api/kayit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isim: isim, email: email, sifre: sifre })
  })
  .then(function(r) { return r.json(); })
  .then(function(veri) {
    if (veri.basari) {
      toast('✅ Hesabınız oluşturuldu! Giriş yapabilirsiniz.');
      modalKapat('kayitModal');
      // Formu temizle
      id('kayitIsim').value = '';
      id('kayitEmail').value = '';
      id('kayitSifre').value = '';
      id('kayitSifre2').value = '';
      // Giriş modalına yönlendir
      setTimeout(function() { modalAc('girisModal'); }, 400);
    } else {
      toast('❌ ' + (veri.hata || 'Kayıt başarısız.'), 'hata');
    }
  })
  .catch(function() {
    toast('❌ Sunucuya bağlanılamadı!', 'hata');
  })
  .finally(function() {
    btn.disabled = false;
    btn.textContent = 'Kayıt Ol';
  });
}

// ── KULLANICI GÖSTER / ÇIKIŞ ──
function kullaniciyiGoster(kullanici) {
  // kullanici: { id, isim, email } objesi veya string email
  var email = typeof kullanici === 'string' ? kullanici : kullanici.email;
  var isim  = typeof kullanici === 'string' ? email     : kullanici.isim;

  id('navEmail').textContent  = isim;
  id('navAvatar').textContent = isim[0].toUpperCase();
  id('navAuthArea').classList.add('gizli');
  id('navUserArea').classList.remove('gizli');
}

function cikisYap() {
  localStorage.removeItem('kmKullanici');
  id('navAuthArea').classList.remove('gizli');
  id('navUserArea').classList.add('gizli');
  toast('👋 Çıkış yapıldı.');
}

// ── SAYFA YÜKLENİNCE OTURUM KONTROLÜ ──
(function() {
  var kayitli = localStorage.getItem('kmKullanici');
  if (kayitli) {
    try {
      var kullanici = JSON.parse(kayitli);
      kullaniciyiGoster(kullanici);
    } catch(e) {
      localStorage.removeItem('kmKullanici');
    }
  }
})();

// ── ADMİN GİRİŞİ ──
// ── ADMİN GİRİŞİ ──
async function adminGiris() {
  const kullanici = id('adminKullanici').value.trim();
  const sifre     = id('adminSifre').value;

  if (!kullanici || !sifre)
    return toast('⚠️ Tüm alanları doldurun!', 'hata');

  try {
    const yanit = await fetch('/api/admin-giris', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kullanici, sifre })
    });

    const veri = await yanit.json();

    if (veri.basari) {
      modalKapat('adminGirisModal');
      setTimeout(function() { modalAc('adminPanelModal'); }, 200);
      kuryeleriYukle();
      toast('🔐 Admin paneline hoş geldiniz!');
    } else {
      toast('❌ ' + (veri.hata || 'Giriş başarısız!'), 'hata');
    }

  } catch (err) {
    toast('❌ Sunucuya bağlanılamadı!', 'hata');
  }
}

// ── ADMİN: TAB GEÇİŞİ ──
function tabGoster(tabAdi, btn) {
  document.querySelectorAll('.tab-icerik').forEach(function(t) { t.classList.add('gizli'); });
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('aktif'); });
  id('tab-' + tabAdi).classList.remove('gizli');
  btn.classList.add('aktif');
}

// ── ADMİN: DEMO TEKLİF EKLE ──
function demoTeklifEkle() {
  let isimler    = ['Ahmet Y.', 'Zeynep K.', 'Burak D.', 'Selin A.'];
  let rotalar    = ['Kadıköy → Beşiktaş', 'Üsküdar → Bakırköy', 'Şişli → Maltepe'];
  let agirliklar = ['1 kg', '2 kg', '3 kg', '5 kg'];
  let durumlar   = [
    '<span class="badge bekliyor">Bekliyor</span>',
    '<span class="badge yolda">Yolda</span>',
    '<span class="badge teslim">Teslim Edildi</span>'
  ];

  function rastgele(dizi) { return dizi[Math.floor(Math.random() * dizi.length)]; }

  id('teklifTablosu').insertAdjacentHTML('beforeend',
    '<tr><td>' + rastgele(isimler) + '</td><td>' + rastgele(rotalar) +
    '</td><td>' + rastgele(agirliklar) + '</td><td>' + rastgele(durumlar) + '</td></tr>'
  );

  let sayac = id('toplamTeklif');
  sayac.textContent = parseInt(sayac.textContent) + 1;
  toast('✅ Demo teklif eklendi!');
}

// ── PAKETİ TAKİP ET ──
function takipEt() {
  let no  = id('takipNo').value.trim();
  let div = id('takipSonuc');

  if (!no) return toast('⚠️ Takip numarası girin!', 'hata');

  let sonuclar = {
    'KM-12345': '📦 <strong>' + no + '</strong><br>📍 <strong class="durum-yolda">🚴 Dağıtımda</strong><br>🕐 Tahmini: Bugün 17:00–19:00<br>📮 Kurye: Mehmet Ş.',
    'KM-99999': '📦 <strong>' + no + '</strong><br>✅ <strong class="durum-teslim">Teslim Edildi</strong><br>🕐 Dün 14:30<br>📮 Teslim Alan: Kapı komşusu'
  };

  div.innerHTML = sonuclar[no] ||
    '📦 <strong>' + no + '</strong><br>📍 <strong class="durum-bekliyor">⏳ Kargoya Verildi</strong><br>🕐 Yarın 10:00–16:00<br>📮 Şube: İstanbul Kadıköy';
  div.style.display = 'block';
}

// ── İLETİŞİM FORMU ──
function mesajGonder() {
  var alanlar = ['iletisimIsim', 'iletisimEmail', 'iletisimKonu', 'iletisimMesaj'];
  if (alanlar.some(function(a) { return !id(a).value; })) {
    return toast('⚠️ Tüm alanları doldurun!', 'hata');
  }

  var isim   = id('iletisimIsim').value;
  var email  = id('iletisimEmail').value;
  var konu   = id('iletisimKonu').value;
  var mesaj  = id('iletisimMesaj').value;
  var tarih  = new Date().toLocaleString('tr-TR');

  var satir = '========================================\n' +
              'Tarih    : ' + tarih + '\n' +
              'Ad Soyad : ' + isim + '\n' +
              'E-posta  : ' + email + '\n' +
              'Konu     : ' + konu + '\n' +
              'Mesaj    : ' + mesaj + '\n' +
              '========================================\n\n';

  // Önceki mesajları localStorage'dan al, yeni mesajı ekle
  var eskiler = localStorage.getItem('kuryemix_mesajlar') || '';
  var tumMesajlar = eskiler + satir;
  localStorage.setItem('kuryemix_mesajlar', tumMesajlar);

  // Dosyaya indir
  var blob = new Blob([tumMesajlar], { type: 'text/plain;charset=utf-8' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = 'mesajlar.txt';
  a.click();
  URL.revokeObjectURL(url);

  toast('✅ Mesajınız kaydedildi ve dosya indirildi!');
  alanlar.forEach(function(a) { id(a).value = ''; });
}

// ── SAYAÇ ANİMASYONU ──
function sayaciBaslat(el) {
  let hedef = parseInt(el.getAttribute('data-hedef'));
  let adim  = hedef / 60;
  let simdiki = 0;

  let interval = setInterval(function() {
    simdiki += adim;
    if (simdiki >= hedef) { simdiki = hedef; clearInterval(interval); }
    el.textContent = Math.floor(simdiki).toLocaleString('tr-TR');
  }, 1500 / 60);
}

// ── SCROLL ANİMASYONU ──
let gozlemci = new IntersectionObserver(function(girişler) {
  girişler.forEach(function(g) {
    if (!g.isIntersecting) return;

    if (g.target.classList.contains('animasyon-kart')) {
      g.target.classList.add('gorunen');
    }

    if (g.target.classList.contains('sayac') && !g.target.classList.contains('sayildi')) {
      g.target.classList.add('sayildi');
      sayaciBaslat(g.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.animasyon-kart, .sayac').forEach(function(el) {
  gozlemci.observe(el);
});


// ── PAKET DETAY ──
var paketler = {
  standart: {
    ikon: '📦',
    ad: 'Standart Paket',
    aciklama: 'Günlük ihtiyaçlar için ekonomik çözüm',
    fiyat: '₺49',
    ozellikler: [
      { ikon: '📅', baslik: 'Ertesi Gün Teslimat', detay: 'Siparişiniz ertesi iş günü teslim edilir, hafta içi geçerlidir.' },
      { ikon: '📱', baslik: 'SMS Bildirim', detay: 'Kargo hareketlerinde anlık SMS ile bilgilendirilirsiniz.' },
      { ikon: '🔍', baslik: 'Online Takip', detay: 'Web sitemizden takip numaranızla durumu görebilirsiniz.' },
      { ikon: '⚖️', baslik: 'Max 10 kg', detay: 'Standart paketle en fazla 10 kg kargo gönderebilirsiniz.' },
    ],
    yok: [
      { ikon: '🛡️', baslik: 'Sigorta Yok', detay: 'Bu pakette kargo sigortası bulunmamaktadır.' },
      { ikon: '🎯', baslik: 'Öncelikli Destek Yok', detay: 'Standart destek hattı kullanılır, bekleme süresi olabilir.' },
    ],
    sureler: [
      {
        etiket: '1 Gönderi', fiyat: '₺49', indirim: null,
        aciklama: 'Günlük ihtiyaçlar için ekonomik çözüm',
        ekstraOzellikler: [],
        ekstraYok: [
          { ikon: '🛡️', baslik: 'Sigorta Yok', detay: 'Bu pakette kargo sigortası bulunmamaktadır.' },
          { ikon: '🎯', baslik: 'Öncelikli Destek Yok', detay: 'Standart destek hattı kullanılır, bekleme süresi olabilir.' },
        ]
      },
      {
        etiket: '5 Gönderi', fiyat: '₺220', indirim: '%10 İndirim',
        aciklama: '5 gönderide %10 indirim + ücretsiz SMS bildirimi paketi',
        ekstraOzellikler: [
          { ikon: '🎁', baslik: 'Ücretsiz Paketleme Malzemesi', detay: '5 gönderi için paketleme malzemesi hediye edilir.' },
          { ikon: '📞', baslik: 'Öncelikli Telefon Desteği', detay: '5\'li pakette mesai saatlerinde öncelikli destek hattı.' },
        ],
        ekstraYok: [
          { ikon: '🛡️', baslik: 'Sigorta Yok', detay: 'Bu pakette kargo sigortası bulunmamaktadır.' },
        ]
      },
      {
        etiket: '10 Gönderi', fiyat: '₺399', indirim: '%18 İndirim',
        aciklama: '10 gönderide %18 indirim, sigorta ve tam destek dahil!',
        ekstraOzellikler: [
          { ikon: '🛡️', baslik: 'Temel Sigorta Dahil', detay: '10\'lu pakette 250 TL\'ye kadar kargo sigortası ücretsiz.' },
          { ikon: '🎁', baslik: 'Ücretsiz Paketleme Malzemesi', detay: '10 gönderi için eksiksiz paketleme seti hediye.' },
          { ikon: '📞', baslik: '7/24 Telefon Desteği', detay: '10\'lu pakette 7 gün 24 saat destek hattı aktif.' },
          { ikon: '🚀', baslik: 'Öncelikli Kuyruğa Alma', detay: 'Gönderileriniz kargo sırasında öncelikli işleme alınır.' },
        ],
        ekstraYok: []
      },
    ]
  },
  ekspres: {
    ikon: '⚡',
    ad: 'Ekspres Paket',
    aciklama: 'Aynı gün teslimat garantisi ile hızlı çözüm',
    fiyat: '₺89',
    ozellikler: [
      { ikon: '🚀', baslik: 'Aynı Gün Teslimat', detay: 'Saat 14:00\'e kadar verilen siparişler aynı gün teslim edilir.' },
      { ikon: '📱', baslik: 'SMS & E-posta Bildirim', detay: 'Her hareket için hem SMS hem e-posta ile bilgilendirilirsiniz.' },
      { ikon: '🗺️', baslik: 'Online Takip', detay: 'Web sitemizden anlık takip yapabilirsiniz.' },
      { ikon: '🛡️', baslik: 'Temel Sigorta', detay: '500 TL\'ye kadar kargo sigortası dahildir.' },
      { ikon: '⚖️', baslik: 'Max 20 kg', detay: 'Ekspres paketle en fazla 20 kg kargo gönderebilirsiniz.' },
    ],
    yok: [
      { ikon: '🎯', baslik: 'Öncelikli Destek Yok', detay: 'Standart destek hattı kullanılır.' },
    ],
    sureler: [
      {
        etiket: '1 Gönderi', fiyat: '₺89', indirim: null,
        aciklama: 'Aynı gün teslimat garantisi ile hızlı çözüm',
        ekstraOzellikler: [],
        ekstraYok: [
          { ikon: '🎯', baslik: 'Öncelikli Destek Yok', detay: 'Standart destek hattı kullanılır.' },
        ]
      },
      {
        etiket: '5 Gönderi', fiyat: '₺399', indirim: '%10 İndirim',
        aciklama: '5 gönderide %10 indirim + öncelikli destek kazanırsınız!',
        ekstraOzellikler: [
          { ikon: '🎯', baslik: 'Öncelikli Destek', detay: '5\'li pakette öncelikli müşteri destek hattına erişim.' },
          { ikon: '🎁', baslik: 'Ücretsiz Paketleme', detay: '5 gönderi için standart kutu ve bant seti hediye.' },
        ],
        ekstraYok: []
      },
      {
        etiket: '10 Gönderi', fiyat: '₺749', indirim: '%16 İndirim',
        aciklama: '10 gönderide %16 indirim, canlı takip ve tam sigorta!',
        ekstraOzellikler: [
          { ikon: '🎯', baslik: '7/24 Öncelikli Destek', detay: 'Özel destek hattı ile sıra beklemeden anında yardım.' },
          { ikon: '📡', baslik: 'Canlı Harita Takip', detay: '10\'lu pakette kuryenizi harita üzerinde anlık takip edin.' },
          { ikon: '🛡️', baslik: 'Gelişmiş Sigorta', detay: '10\'lu pakette sigorta limiti 1.500 TL\'ye yükseltilir.' },
          { ikon: '🎁', baslik: 'Ücretsiz Paketleme Seti', detay: '10 gönderi için premium paketleme malzemeleri dahil.' },
        ],
        ekstraYok: []
      },
    ]
  },
  premium: {
    ikon: '👑',
    ad: 'Premium Paket',
    aciklama: '2 saat içinde teslimat, tam koruma ve öncelikli destek',
    fiyat: '₺149',
    ozellikler: [
      { ikon: '⏱️', baslik: '2 Saat İçinde Teslimat', detay: 'Siparişiniz verildiği andan itibaren 2 saat içinde kapınızda.' },
      { ikon: '🔔', baslik: 'Tüm Bildirimler', detay: 'SMS, e-posta ve uygulama bildirimleri ile her adımda haberdar olun.' },
      { ikon: '📡', baslik: 'Canlı Harita Takip', detay: 'Kuryenizin konumunu harita üzerinde anlık takip edin.' },
      { ikon: '🛡️', baslik: 'Tam Kapsamlı Sigorta', detay: 'Sınırsız tutarda tam kapsamlı kargo sigortası dahildir.' },
      { ikon: '🎯', baslik: '7/24 Öncelikli Destek', detay: 'Özel destek hattı ile sıra beklemeden anında yardım alın.' },
      { ikon: '⚖️', baslik: 'Sınırsız Ağırlık', detay: 'Premium pakette ağırlık sınırı bulunmamaktadır.' },
    ],
    yok: [],
    sureler: [
      {
        etiket: '1 Gönderi', fiyat: '₺149', indirim: null,
        aciklama: '2 saat içinde teslimat, tam koruma ve öncelikli destek',
        ekstraOzellikler: [],
        ekstraYok: []
      },
      {
        etiket: '5 Gönderi', fiyat: '₺649', indirim: '%13 İndirim',
        aciklama: '5 gönderide %13 indirim + kişisel kurye atama!',
        ekstraOzellikler: [
          { ikon: '🏍️', baslik: 'Kişisel Kurye Ataması', detay: '5\'li pakette size özel kurye atanır, aynı kurye hep sizi teslim eder.' },
          { ikon: '📊', baslik: 'Aylık Gönderi Raporu', detay: 'Tüm gönderilerinizin detaylı özet raporu e-posta ile gönderilir.' },
        ],
        ekstraYok: []
      },
      {
        etiket: '10 Gönderi', fiyat: '₺1.199', indirim: '%19 İndirim',
        aciklama: '10 gönderide %19 indirim, VIP hizmet ve işletme desteği!',
        ekstraOzellikler: [
          { ikon: '🏍️', baslik: 'Kişisel Kurye Ataması', detay: 'Size özel kurye, tüm teslimatlarınızı gerçekleştirir.' },
          { ikon: '📊', baslik: 'Aylık Gönderi Raporu', detay: 'Detaylı istatistik raporu her ay otomatik gönderilir.' },
          { ikon: '🏢', baslik: 'İşletme Faturası', detay: 'Kurumsal fatura düzenlenebilir, muhasebe entegrasyonu sağlanır.' },
          { ikon: '🔑', baslik: 'VIP Müşteri Statüsü', detay: 'Özel VIP hattı, öncelikli kurye ve ekstra kilometre garantisi.' },
        ],
        ekstraYok: []
      },
    ]
  }
};
function paketDetayAc(paketAdi) {
  var p = paketler[paketAdi];
  var aktifSure = p.sureler[0]; // Başlangıçta 1. seçenek

  function icerikOlustur(sure) {
    // Temel + ekstra özellikleri birleştir
    var tumOzellikler = p.ozellikler.concat(sure.ekstraOzellikler || []);
    var tumYok = sure.ekstraYok || p.yok;

    var ozellikHTML = tumOzellikler.map(function(o) {
      return '<div class="paket-ozellik-satir">' +
        '<div class="ozellik-ikon">' + o.ikon + '</div>' +
        '<div class="ozellik-bilgi"><strong>' + o.baslik + '</strong><span>' + o.detay + '</span></div>' +
        '</div>';
    }).join('');

    var yokHTML = tumYok.length ? tumYok.map(function(o) {
      return '<div class="paket-ozellik-satir">' +
        '<div class="ozellik-ikon">❌</div>' +
        '<div class="ozellik-bilgi"><strong>' + o.baslik + '</strong><span>' + o.detay + '</span></div>' +
        '</div>';
    }).join('') : '<div style="color:#555;font-size:13px;padding:10px 0;">Bu pakette tüm özellikler mevcut!</div>';

    return { ozellikHTML: ozellikHTML, yokHTML: yokHTML };
  }

  var surelerHTML = p.sureler.map(function(s, i) {
    return '<div class="sure-kart ' + (i === 0 ? 'aktif-sure' : '') + '" onclick="sureSec(this, \'' + paketAdi + '\', ' + i + ')">' +
      '<strong>' + s.fiyat + '</strong>' +
      '<span>' + s.etiket + '</span>' +
      (s.indirim ? '<div class="indirim">' + s.indirim + '</div>' : '') +
      '</div>';
  }).join('');

  var ilk = icerikOlustur(aktifSure);

  id('paketDetayIcerik').innerHTML =
    '<div class="paket-detay-baslik">' +
      '<div class="paket-detay-ikon">' + p.ikon + '</div>' +
      '<div><h2>' + p.ad + '</h2><p id="paketAciklama">' + aktifSure.aciklama + '</p></div>' +
      '<div class="paket-detay-fiyat">' + p.fiyat + '<span>/ gönderi</span></div>' +
    '</div>' +
    '<div id="paketDetayGrid" class="paket-detay-grid">' +
      '<div class="paket-detay-grup"><h4>✅ Dahil Olanlar</h4><div id="ozellikListesi">' + ilk.ozellikHTML + '</div></div>' +
      '<div class="paket-detay-grup"><h4>❌ Dahil Olmayanlar</h4><div id="yokListesi">' + ilk.yokHTML + '</div></div>' +
    '</div>' +
    '<div class="paket-detay-grup" style="margin-bottom:20px"><h4>🛒 Adet Seç</h4>' +
      '<div class="paket-detay-sure">' + surelerHTML + '</div>' +
    '</div>' +
    '<button class="paket-satin-al-btn" onclick="paketSatinAl(\'' + paketAdi + '\')">🛒 Sepete Ekle</button>' +
    '<p class="paket-garanti">🔒 Güvenli ödeme &nbsp;|&nbsp; 7 gün iade garantisi &nbsp;|&nbsp; SSL şifreli</p>';

  // Aktif paketi sakla (sureSec için)
  id('paketDetayIcerik').setAttribute('data-paket', paketAdi);

  modalAc('paketDetayModal');
}

function sureSec(el, paketAdi, sureIndex) {
  el.closest('.paket-detay-sure').querySelectorAll('.sure-kart').forEach(function(k) {
    k.classList.remove('aktif-sure');
  });
  el.classList.add('aktif-sure');

  // paketAdi parametresi gelmezse data-paket'ten al
  if (!paketAdi) {
    paketAdi = id('paketDetayIcerik').getAttribute('data-paket');
  }

  var p = paketler[paketAdi];
  var sure = p.sureler[sureIndex];

  // Açıklamayı güncelle
  id('paketAciklama').textContent = sure.aciklama;

  // Özellikleri güncelle (geçiş animasyonu ile)
  var tumOzellikler = p.ozellikler.concat(sure.ekstraOzellikler || []);
  var tumYok = sure.ekstraYok || p.yok;

  var ozellikHTML = tumOzellikler.map(function(o) {
    return '<div class="paket-ozellik-satir">' +
      '<div class="ozellik-ikon">' + o.ikon + '</div>' +
      '<div class="ozellik-bilgi"><strong>' + o.baslik + '</strong><span>' + o.detay + '</span></div>' +
      '</div>';
  }).join('');

  var yokHTML = tumYok.length ? tumYok.map(function(o) {
    return '<div class="paket-ozellik-satir">' +
      '<div class="ozellik-ikon">❌</div>' +
      '<div class="ozellik-bilgi"><strong>' + o.baslik + '</strong><span>' + o.detay + '</span></div>' +
      '</div>';
  }).join('') : '<div style="color:#555;font-size:13px;padding:10px 0;">Bu pakette tüm özellikler mevcut!</div>';

  // Yumuşak geçiş animasyonu
  var grid = id('paketDetayGrid');
  grid.style.opacity = '0';
  grid.style.transition = 'opacity 0.25s ease';

  setTimeout(function() {
    id('ozellikListesi').innerHTML = ozellikHTML;
    id('yokListesi').innerHTML = yokHTML;
    grid.style.opacity = '1';
  }, 200);
}
// ── SEPET ──
var sepet = [];

function paketSatinAl(paketAdi) {
  var p = paketler[paketAdi];
  var aktifSure = document.querySelector('.sure-kart.aktif-sure');
  var fiyat = aktifSure ? aktifSure.querySelector('strong').textContent : p.fiyat;
  var adet  = aktifSure ? aktifSure.querySelector('span').textContent  : '1 Gönderi';

  sepet.push({ id: Date.now(), ad: p.ad, ikon: p.ikon, adet: adet, fiyat: fiyat });
  sepetGuncelle();
  modalKapat('paketDetayModal');
  toast('🛒 Sepete eklendi!', 'basari');
}

function sepetGuncelle() {
  var sayi = id('sepetSayi');
  sayi.textContent = sepet.length;
  sayi.style.display = sepet.length > 0 ? 'flex' : 'none';
}

function sepetAc() {
  var div = id('sepetIcerik');

  if (sepet.length === 0) {
    div.innerHTML = '<p style="text-align:center;color:#aaa;padding:30px 0">Sepetiniz boş.</p>';
    modalAc('sepetModal');
    return;
  }

  var toplam = 0;
  var html = '';

  sepet.forEach(function(u) {
    var fiyatSayi = parseFloat(u.fiyat.replace('₺','').replace('.',''));
    toplam += fiyatSayi;
    html += '<div class="sepet-urun">' +
      '<div><b style="color:var(--s)">' + u.ikon + ' ' + u.ad + '</b><p style="color:#aaa;font-size:13px">' + u.adet + '</p></div>' +
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<b>' + u.fiyat + '</b>' +
        '<button onclick="sepetSil(' + u.id + ')" style="background:none;border:1px solid #555;color:#888;padding:4px 10px;border-radius:4px;cursor:pointer">Kaldır</button>' +
      '</div></div>';
  });

  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:15px;border-top:2px solid var(--s)">' +
    '<span style="font-size:20px;font-weight:bold;color:var(--s)">₺' + toplam.toLocaleString('tr-TR') + '</span>' +
    '<button onclick="odemeFormAc()" style="padding:11px 24px;background:var(--s);color:#000;border:none;border-radius:6px;font-weight:bold;cursor:pointer">💳 Ödemeye Geç</button>' +
  '</div>';

  html += '<div id="odemeForm" style="display:none;margin-top:20px;border-top:1px solid #333;padding-top:20px">' +
    '<h3 style="color:var(--s);margin-bottom:15px">Ödeme Bilgileri</h3>' +
    '<div class="form-grup"><label>Kart İsim</label><input id="kartIsim" placeholder="AD SOYAD" /></div>' +
    '<div class="form-grup"><label>Kart No</label><input id="kartNo" placeholder="0000 0000 0000 0000" maxlength="19" oninput="kartFormatla(this)" /></div>' +
    '<div style="display:flex;gap:12px">' +
      '<div class="form-grup" style="flex:1"><label>Son Kullanma</label><input id="kartSkt" placeholder="AA/YY" maxlength="5" oninput="sktFormatla(this)" /></div>' +
      '<div class="form-grup" style="flex:1"><label>CVV</label><input id="kartCvv" type="password" placeholder="***" maxlength="3" /></div>' +
    '</div>' +
    '<div class="form-grup"><label>Teslimat Adresi</label><textarea id="teslimatAdres" placeholder="Açık adres..."></textarea></div>' +
    '<button onclick="odemeYap()" style="width:100%;padding:13px;background:#22aa66;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;margin-top:8px">✅ Siparişi Tamamla</button>' +
  '</div>';

  div.innerHTML = html;
  modalAc('sepetModal');
}

function sepetSil(uid) {
  sepet = sepet.filter(function(u) { return u.id !== uid; });
  sepetGuncelle();
  sepetAc();
}

function odemeFormAc() {
  var f = id('odemeForm');
  f.style.display = f.style.display === 'block' ? 'none' : 'block';
}

function kartFormatla(inp) {
  var v = inp.value.replace(/\D/g,'').substring(0,16);
  inp.value = v.replace(/(.{4})/g,'$1 ').trim();
}

function sktFormatla(inp) {
  var v = inp.value.replace(/\D/g,'').substring(0,4);
  if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2);
  inp.value = v;
}

function odemeYap() {
  var isim  = id('kartIsim').value.trim();
  var kartNo = id('kartNo').value.replace(/\s/g,'');
  var skt   = id('kartSkt').value.trim();
  var cvv   = id('kartCvv').value.trim();
  var adres = id('teslimatAdres').value.trim();

  if (!isim || kartNo.length < 16 || skt.length < 5 || cvv.length < 3 || !adres)
    return toast('⚠️ Tüm alanları eksiksiz doldurun!', 'hata');

  sepet = [];
  sepetGuncelle();
  modalKapat('sepetModal');
  toast('✅ Siparişiniz alındı, teşekkürler!', 'basari');
}


// ── VERİTABANI KURYELERİ YÜKLEME ──
function kuryeleriYukle() {
  fetch('http://localhost:3000/api/kuryeler')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var tbody = id('kuryeTablosu');
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#555">Kayıt yok</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(function(k) {
        var renk = k.Durum === 'Aktif' ? 'yolda' : k.Durum === 'Müsait' ? 'bekliyor' : 'teslim';
        return '<tr>' +
          '<td>' + k.Ad + '</td>' +
          '<td>' + k.Bolge + '</td>' +
          '<td><span class="badge ' + renk + '">' + k.Durum + '</span></td>' +
          '<td><button onclick="kuryeSil(' + k.Id + ')" style="background:#c0392b;border:none;color:#fff;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px">Sil</button></td>' +
          '</tr>';
      }).join('');
    })
    .catch(function() {
      id('kuryeTablosu').innerHTML = '<tr><td colspan="4" style="text-align:center;color:#f44">Sunucuya bağlanılamadı!</td></tr>';
    });
}

// ── VERİTABANI: KURYE EKLE ──
function kuryeEkle() {
  var ad    = id('yeniKuryeAd').value.trim();
  var bolge = id('yeniKuryeBolge').value.trim();
  var durum = id('yeniKuryeDurum').value;

  if (!ad || !bolge) return toast('⚠️ Ad ve bölge girin!', 'hata');

  fetch('http://localhost:3000/api/kuryeler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ad: ad, bolge: bolge, durum: durum })
  })
  .then(function() {
    id('yeniKuryeAd').value = '';
    id('yeniKuryeBolge').value = '';
    kuryeleriYukle();
    toast('✅ Kurye eklendi!');
  })
  .catch(function() { toast('❌ Eklenemedi!', 'hata'); });
}

// ── VERİTABANI: KURYE SİL ──
function kuryeSil(kuryeId) {
  fetch('http://localhost:3000/api/kuryeler/' + kuryeId, { method: 'DELETE' })
  .then(function() {
    kuryeleriYukle();
    toast('🗑️ Kurye silindi!');
  })
  .catch(function() { toast('❌ Silinemedi!', 'hata'); });
}

