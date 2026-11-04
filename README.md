# Cluster Placement: Genetik Algoritma ile Blok Yerleşimi

Dosyaları adlarına göre **kümeleyip** her kümeyi ve içindeki dosyaları bir panoya **sıkı ve düzenli**
biçimde yerleştiren bir web uygulaması. Yerleşimi **hiyerarşik bir genetik algoritma (GA)** bulur.

**Stüdyo:** https://mehmetakifakkus.github.io/cluster-placement/

Örnek kullanım: bir tasarımcının proje klasöründeki `design1.ai`, `renderdesign1.png`, `sketchv1.jpeg` gibi
dosyaları, birbiriyle ilgili olanlar yan yana duracak şekilde bir panoya (mood board, galeri görünümü)
yerleştirmek.

## Stüdyo'yu kullanmak

1. **Dosyaları getirin.** Dosya ya da klasörü sol alana bırakın, "Dosya seç" / "Klasör seç" ile seçin
   veya "Metin olarak yapıştır" ile her satıra `ad, genişlik, yükseklik` yazın. Görsellerin
   çözünürlüğü tarayıcı tarafından okunur. Dosyalar hiçbir yere gönderilmez.
2. **Eksik boyutları tamamlayın.** Tarayıcının boyutunu okuyamadığı dosyalar (.ai, .psd, .3dm…)
   işaretlenir ve kare kabul edilir; isterseniz satıra boyut yazın.
3. **Yerleşimi inceleyin.** Liste ya da Hedef kaydırıcısı değişince yerleşim kendiliğinden yenilenir.
   Bir dosyaya ya da kümeye tıklayınca vurgulanır; sağda en iyi üç yerleşim arasında geçebilirsiniz.
   "Yeniden üret" aynı ayarlarla yeni bir deneme yapar.
4. **Dışa aktarın.** PNG, SVG ya da JSON (adlar ve koordinatlar) olarak indirin.

## Nasıl çalışır?

1. **Oran:** Her dosyanın çözünürlüğü en fazla 10:10'luk küçük bir orana indirilir
   (1200×1600 → 3:4, 1920×1080 → 9:5). GA bu küçük ızgarada çalışır.
2. **Kümeleme:** Adlar token'lara ayrılır: her rakam dizisi tek token, diğer her karakter ayrı bir
   token. Ortak önekle başlayan dosyalar aynı kümeye girer (`design1`, `design2` → `design`). Sayılar
   bölünmez, bu yüzden `img2` ile `img10` kardeş kalır. Adlı kardeşlerin yanındaki numaralı dosyalar
   bir seri kümesinde toplanır (`model1..3` → `1–3`).
3. **Yerleşim (GA):** Her küme kendi bloklarını yerleştirir; alt kümeler, üst kümede sınır kutuları
   büyüklüğünde tek blok olur. Bloklar büyükten küçüğe sıralanır; her blok daha önce yerleşmiş bir
   bloğun sağ-üst ya da sol-alt köşesine, çakışmadan yapışır. 10 yerleşimlik havuz her nesilde
   kötü yarısını atar ve en iyi yerleşimin mutasyonlarıyla dolar (5 nesil).
4. **Uygunluk:** `(1 − w) · doluluk + w · oran puanı`. Doluluk, blok alanlarının sınır kutusuna oranı;
   oran puanı, en-boy oranının ≈ 1.8'e yakınlığı. `w`, Hedef kaydırıcısıdır (varsayılan 50).

## Proje yapısı

```
src/
├── core/              # Algoritma: React'ten ve tarayıcıdan bağımsız
│   ├── cluster.js     # Ada göre token tabanlı kümeleme
│   ├── parse.js       # "ad, genişlik, yükseklik" satırlarını ayrıştırma
│   ├── ratio.js       # Çözünürlüğü küçük orana indirme
│   ├── geometry.js    # Dikdörtgen kesişimi, sınır kutusu, alan
│   ├── ga.js          # Genetik algoritma
│   ├── random.js      # Tohumlu rastgele sayı üreteci
│   └── layout.js      # runLayout(): küme ağacı, konumlar, metrikler, alternatifler
├── io/
│   ├── readFiles.js   # Bırakılan dosya ve klasörleri okuma, görsel boyutu, küçük resim
│   └── export.js      # SVG, PNG, JSON dışa aktarma
├── ui/                # Stüdyo ekranı (React)
│   ├── App.jsx        # Tek durum nesnesi, otomatik yeniden hesaplama
│   ├── Header.jsx     # Örnekler, Yeniden üret, Dışa aktar
│   ├── FilePanel.jsx  # Bırakma alanı, metin yapıştırma, dosya listesi
│   ├── LayoutView.jsx # SVG tuval
│   └── Inspector.jsx  # Kümeler, Hedef, metrikler, alternatifler
├── examples.js        # Hazır örnek dosya listeleri
└── styles.css
scripts/smoke.mjs      # Üretim derlemesi için tarayıcı duman testi
```

Tasarım kararları: [`docs/superpowers/specs/2026-11-04-studio-redesign-design.md`](docs/superpowers/specs/2026-11-04-studio-redesign-design.md)

## Geliştirme

Node 22.12 veya üzeri gerekir.

```bash
npm install
```

```bash
npm run dev
```

Testler (Vitest; algoritma, dosya okuma, dışa aktarma ve arayüz):

```bash
npm test
```

Üretim derlemesi ve duman testi (derlemeyi `/cluster-placement/` alt yolunda Chromium'da açar):

```bash
npm run build && npm run smoke
```

`clusterBasedGA` dalına yapılan her push, `.github/workflows/deploy-pages.yml` ile test edilip
derlenir; duman testi geçerse GitHub Pages'e yayınlanır. PR'larda aynı adımlar yayın olmadan çalışır.
