# Cluster Placement: Genetik Algoritma ile Blok Yerleşimi

Bu proje, dosyaları isimlerine göre **kümeleyip** her kümeyi ve içindeki dosyaları bir tuval üzerinde
dikdörtgen bloklar olarak **sıkı ve düzenli** biçimde yerleştiren bir React uygulamasıdır.
Yerleşimi **hiyerarşik bir genetik algoritma (GA)** bulur.

Örnek kullanım: bir tasarımcının proje klasöründeki `design1.ai`, `renderdesign1.png`, `sketchv1.jpeg` gibi
dosyaları, birbiriyle ilgili olanlar yan yana duracak şekilde bir panoya (mood board / galeri görünümü)
yerleştirmek.

## Nasıl çalışır?

### 1. Girdi (`src/App.js`)

Soldaki metin kutusuna her satıra bir dosya yazılır:

```
isim, genişlik, yükseklik
```

```
design1.ai, 1200, 1600
renderdesign1.png, 800, 800
sketchv1.jpeg, 800, 400
```

Boyut verilmezse dosya 1×1 kabul edilir.

### 2. Boyutları sadeleştirme (`src/File.js`, `src/Utils/Ratios.js`)

Her dosyanın çözünürlüğü küçük bir en-boy oranına indirilir (ör. 1200×1600 → 3×4). Sadeleşmiş oran
10'u aşıyorsa en yakın "güzel" orana yuvarlanır. Böylece GA küçük bir ızgara üzerinde çalışır.

### 3. İsme göre kümeleme (`src/Utils/FileCluster.js`)

Dosya adları ortak önek ağacına (prefix tree) ayrılır:

- `design1.ai`, `design2.ai`, `design3.ai` → `design` kümesi
- `renderdesign1..4.png` → `renderdesign` kümesi
- `sketchv1..3.jpeg` → `sketchv` kümesi

Tek çocuklu dallar birleştirilir (`arrange`), sonuçta iç içe bir küme hiyerarşisi oluşur.

### 4. Hiyerarşik genetik algoritma (`src/main.js`, `src/ga/`)

- Her küme için ayrı bir `GABuilder` (10 kromozomluk havuz) oluşturulur. Alt kümeler, üst kümenin
  içinde **tek bir blok** gibi davranır; bu bloğun boyutu alt kümenin en iyi yerleşiminin sınır kutusudur.
- **Kromozom** (`Chromosome.js`): blokların konumlarından oluşan bir yerleşimdir. İlk blok (0,0)'a
  konur; diğerleri daha önce yerleşmiş blokların sağ-üst veya sol-alt köşelerine rastgele yapıştırılır.
  Çakışma olursa 30 kez yeniden denenir (`Block.changePosAbit2`).
- **Evrim** (`GABuilder.evolve`, 5 nesil): havuzun kötü yarısı atılır, en iyi kromozom mutasyona
  uğratılarak havuz yeniden doldurulur:
  - `mutate5`: blokların yarısını yeniden yerleştirir
  - `mutate6`: en küçük blokları yeniden yerleştirir

### 5. Uygunluk fonksiyonu (`Chromosome.fitnessFunction`)

İki ölçütün ağırlıklı ortalamasıdır:

| Ölçüt | Tanım | Amaç |
|-------|-------|------|
| **f1, doluluk** | blok alanları toplamı / sınır kutusu alanı | boşluğu azaltmak |
| **f2, en-boy oranı** | sınır kutusu oranının ~1.8'e yakınlığı | yatay, ekrana uygun bir düzen |

Arayüzdeki **Fill ↔ 2x1** slider'ı bu iki ölçütün ağırlığını ayarlar (varsayılan: 80, oran ağırlıklı).

### 6. Görselleştirme (`src/main.js → draw`, paper.js)

- Sonuç `<canvas>` üzerinde renkli dikdörtgenler olarak çizilir.
- Soldaki **Tree** bileşeni küme hiyerarşisini gösterir; bir kümeye tıklayınca o kümenin yerleşimi çizilir.
- **prev / next** düğmeleriyle havuzdaki diğer kromozomlar ve fitness değerleri incelenebilir.

## Proje yapısı

```
src/
├── App.js               # Arayüz: metin girişi, slider, küme ağacı, tuval
├── main.js              # Kümeleme + hiyerarşik GA kurulumu ve çizim
├── File.js              # Dosya modeli ve oran sadeleştirme
├── ga/
│   ├── GABuilder.js     # Gen havuzu, seçilim ve evrim
│   ├── Chromosome.js    # Yerleşim, mutasyonlar, uygunluk fonksiyonu
│   └── Block.js         # Tek bir blok ve çakışmasız konumlandırma
├── geometry/            # Point, Rectangle
└── Utils/
    ├── FileCluster.js   # İsim önekine göre kümeleme
    ├── Ratios.js        # En yakın en-boy oranı tabloları
    ├── Settings.js      # Paylaşılan ayarlar (slider değeri)
    └── Utilities.js     # Yardımcı fonksiyonlar
```

## Teknolojiler

React 17 (Create React App), [paper.js](http://paperjs.org/) (çizim), antd, reactstrap ve bootstrap (arayüz).

## Çalıştırma

```bash
npm install
```

```bash
npm start
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde açılır. Metin kutusunu düzenleyip
**RUN** düğmesine basarak yerleşimi oluşturabilirsiniz.

Üretim derlemesi için:

```bash
npm run build
```

## Durum

Proje deneysel / prototip aşamasındadır. Henüz test yoktur ve kodda deneme amaçlı, yorum satırına
alınmış kısımlar bulunmaktadır.
