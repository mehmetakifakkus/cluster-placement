# Stüdyo: yeni arayüz ve altyapı (tasarım)

Tarih: 2026-11-04 · Durum: onaylandı, uygulanıyor
Görsel taslaklar ve şemalar: https://claude.ai/artifact/8p8W3drpKQARejxaCUAN5v
(A · Stüdyo, C · Anlatım, mimari, veri akışı, test ve yayın panoları)

## Amaç

Uygulama iki kitleye hizmet eder:

- **Gerçek kullanım (Stüdyo):** Bir kullanıcı kendi dosyalarını getirir, adlarına göre
  kümelenmiş ve boşluksuz yerleşmiş bir pano görür, sonucu dışa aktarır.
- **Portföy (Anlatım):** Kişisel sitede algoritmayı dört adımda anlatan bir sayfa.
  Ziyaretçiyi Stüdyo'ya yönlendirir.

## Kararlar

| Konu | Karar |
| --- | --- |
| Yön | Taslak A (Stüdyo) + taslak C (Anlatım) |
| Dosya girişi | Sürükle-bırak (dosya ya da klasör) ana yol, metin yapıştırma alternatif |
| Anlatım sayfasının yeri | `mehmetakifakkus.github.io` sitesinde statik bir Jekyll sayfası |
| Altyapı | Vite + React 18, çizim SVG ile; paper.js, antd, reactstrap, bootstrap, jquery, mathjs kalkar |
| Dil | Arayüz Türkçe |

## Mimari

Üç katman; her biri tek başına test edilir.

- `src/core/` algoritma; React ve tarayıcıdan bağımsız.
  - `cluster.js`: token tabanlı ad kümeleme (eski `FileCluster`, aynen).
  - `parse.js`: `ad, genişlik, yükseklik` satırlarını ayrıştırma.
  - `ratio.js`: çözünürlüğü en fazla 10:10'luk bir orana indirme.
  - `geometry.js`: dikdörtgen kesişimi, sınır kutusu, alan (paper.js yerine).
  - `ga.js`: blokları yerleştiren genetik algoritma (eski `Block`, `Chromosome`,
    `GABuilder` mantığı tek modülde).
  - `layout.js`: tek giriş noktası `runLayout(files, { weight })`. Küme ağacını,
    her dosyanın mutlak konumunu, metrikleri ve en iyi 3 alternatif yerleşimi döndürür.
- `src/io/` tarayıcıyla temas: `readFiles.js` (ad, görsel çözünürlüğü, küçük resim adresi,
  klasör okuma), `export.js` (SVG, PNG, JSON).
- `src/ui/` React bileşenleri: `Header`, `FilePanel`, `LayoutView`, `Inspector`;
  durum tek bir `App` bileşeninde.

### GA (eskisiyle aynı fikir, iki düzeltme)

- Bloklar alana göre büyükten küçüğe sıralanır; ilki (0,0)'a konur. Her sonraki blok,
  kendinden önceki blokların sağ-üst ya da sol-alt köşelerinden çakışmayan rastgele birine
  yapışır. **Düzeltme:** Hiçbir köşe boş değilse blok, yerleşmiş blokların sağına konur;
  böylece bloklar hiçbir zaman çakışmaz (eski kod bu durumda rastgele başlangıç konumunda
  bırakıyordu).
- Havuz 10 yerleşimden oluşur; her nesilde kötü yarı atılır, en iyi yerleşim mutasyona
  uğratılarak havuz doldurulur (tümünü ya da küçük %70'ini yeniden yerleştirme). 5 nesil.
- Uygunluk: `(1 - w) · doluluk + w · oran puanı` (oran puanı en-boy ≈ 1.8'e yakınlıkla
  artar); `w` Hedef kaydırıcısıdır. **Varsayılan 50** (eskisi 80): 20 tohumluk ölçümde
  doluluk tasarım örneğinde %44'ten %85'e, karışık örnekte %50'den %72'ye çıktı.
- **Düzeltme:** Alt kümeler, üst kümede tek blok olarak kullanılmadan önce kendi
  nesillerini tamamlar. Eski kodda yalnızca kök küme evrimleşiyordu.

## Veri akışı ve etkileşimler

1. **Açılış:** "Tasarım projesi" örneği yüklü ve yerleşmiş olarak açılır.
2. **Dosya ekleme:** Bırakılan ya da seçilen dosyalar listeye eklenir; "Temizle" sıfırlar.
   Metin yapıştırma alanı aynı listeye ekler. Örnek seçimi listeyi değiştirir.
3. **Eksik boyut:** Tarayıcının boyutunu okuyamadığı dosyalar işaretlenir, 1:1 kabul edilir;
   satıra boyut yazılabilir.
4. **Yerleşim:** Dosya listesi ya da Hedef değişince 300 ms sonra kendiliğinden yeniden
   hesaplanır. RUN düğmesi yoktur; "Yeniden üret" aynı ayarlarla yeni bir deneme yapar.
5. **İnceleme ve çıktı:** Dosya ya da küme seçilince tuvalde vurgulanır, diğerleri soluklaşır
   (kümeye yakınlaşma bu sürümde yok);
   en iyi 3 yerleşim arasında geçilir; SVG, PNG ya da JSON indirilir.

Dosyalar tarayıcıdan çıkmaz. Boş liste için boş durum mesajı gösterilir; tek dosya
için GA çalışmaz, dosya tek başına gösterilir.

## Anlatım sayfası (ayrı PR, kişisel site)

`/projects/cluster-placement/` adresinde, sitenin `default` düzeniyle; taslak C'deki dört
adım. Görseller Stüdyo'nun SVG dışa aktarımıyla üretilir. Projeler kartı bu sayfaya,
sayfadaki "Stüdyoyu aç" uygulamaya gider; Stüdyo başlığındaki "Nasıl çalışır?" bu sayfaya
döner.

## Test ve yayın

- Vitest: core ve io birim testleri (eski 21 testin karşılıkları dahil; yeni: geometri,
  `runLayout` için her dosya bir kez yerleşir, bloklar çakışmaz, kümeler hizalı).
- Testing Library: örnek yükleme, metin yapıştırma, eksik boyut girme, küme vurgulama.
- Playwright duman testi: üretim derlemesi `/cluster-placement/` alt yolunda açılır;
  bloklar çizilmeli, sayfada hata olmamalı.
- GitHub Actions (Node 22): `npm ci` → testler → `vite build` → duman testi → Pages.
  Duman testi geçmezse yayın yapılmaz.
