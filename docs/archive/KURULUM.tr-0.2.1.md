# Temiz Bağlantı — Chrome eklentisi

> Güncellenmiş Türkçe arşiv: 19 Kasım 2026 · Eklenti sürümü 0.2.1. Ana dokümantasyon artık [İngilizce README](../../README.md) dosyasıdır. Bu Türkçe sürüm arşiv anının durumunu açıklar; sonraki güncellemelerle eşzamanlı tutulması taahhüt edilmez. Bu dokümantasyon güncellemesi eklentinin Türkçe arayüzünü veya çalışma davranışını değiştirmez.

## Kurulum

1. ZIP indirdiyseniz kalıcı bir klasöre çıkartın.
2. Chrome adres çubuğunda `chrome://extensions` açın.
3. Sağ üstte **Geliştirici modu** seçeneğini açın.
4. **Paketlenmemiş öğe yükle / Load unpacked** düğmesine basın.
5. `manifest.json` dosyasının bulunduğu `temiz-baglanti` klasörünü seçin.
6. Daha önce açık olan web sayfalarını yenileyin.

Klasörü kurulumdan sonra silmeyin veya taşımayın. Bu yerel deneme sürümü Chrome Web Mağazası üzerinden dağıtılmaz.

## Kullanım

- **Ctrl + orta tık:** Tüm query parametrelerini kaldırıp arka planda yeni sekmede açar.
- **Normal orta tık / Ctrl + sol tık:** Normal tarayıcı davranışı sürer.
- Shift, Alt veya Windows tuşunu aynı anda basılı tutmayın.
- Adresin `#fragment` bölümü korunur.
- Yalnızca HTTP/HTTPS hedefleri işlenir; `mailto:`, `javascript:`, indirme blob adresleri vb. işlenmez.

Chrome'un yapboz biçimli Eklentiler menüsünde **Temiz Bağlantı** simgesine basarak sayfa durumunu görün. **Deneme sayfasını aç** düğmesi deneme sayfasını açar. Simgeyi sabitlemek isteğe bağlıdır.

## 0.2.1 güncellemesi ve Pinterest kontrolü

Yeni dosyaları kurulumda seçtiğiniz aynı klasöre çıkarıp eskilerin üzerine yazın. `chrome://extensions` üzerinde eklentinin yenile düğmesine basın; sürüm **0.2.1** olmalı. Sonra Pinterest ve diğer açık siteleri **Ctrl + R** ile yenileyin. Yeni bir klasöre çıkardıysanız Chrome'daki eski eklentiyi kaldırıp yeni klasörü paketlenmemiş öğe olarak yükleyin; iki kopyayı aynı anda kullanmayın.

Pinterest sekmesinde eklenti simgesine basın:

- **Bu sayfada hazır:** Sayfa betiği çalışıyor. Ctrl + orta tık yapınca kısa bir başarı bildirimi görünür. Simgeye tekrar basınca son tıklanan hedef ve temizlenen adres gösterilir.
- **Bu sayfada etkin değil:** Önce sayfayı yenileyin. Gerekirse Chrome → Uzantılar → Temiz Bağlantı → Ayrıntılar → Site erişimi bölümünden Pinterest'e izin verin.
- **Hazır, ancak henüz bağlantı yakalanmadı:** Tıkladığınız öğe gerçek `href` bağlantısı sunmuyor olabilir.
- **Temiz adres gönderildi, ancak yeni sekmede parametre var:** Hedef site yönlendirme veya JavaScript ile parametreleri yeniden ekliyor olabilir. Bu sürüm açıldıktan sonraki bütün yönlendirmelere müdahale etmez.

Durum ekranı üst çerçeveyi kontrol eder. Bir iframe içindeki bağlantı çalışsa da o çerçevenin son tıklaması üst çerçeve durumunda görünmeyebilir.

0.2.1, URL'yi orta tuşa **basıldığı anda** alıp açar; tuş bırakılana kadar sayfa bağlantıyı değiştirse de yakalanan hedef kullanılır. Sürükleme hareketinin bitmesi beklenmez. Mouse tuşu bırakıldığında Ctrl bırakılmış olsa bile aynı hareket ikinci sekme açmaz.

Pinterest `.com` ve alt alan adlarındaki pin sayfalarında **Ziyaret et / Visit site** düğmesi normal bir `href` bağlantısı yerine JavaScript düğmesi olarak oluşturulabilir. Özel destek, sayfanın sunduğu pin dış bağlantısını (`clickthrough-link`) bulur, temizler ve açar. Tek bir hedef belirlenemiyorsa normal davranışı bırakır. Gözlenen test işaretleri ve İngilizce/Türkçe düğme etiketleri tanınır. Diğer ülke alan adları ve tanınmayan düğme biçimleri bu adaptörün kapsamında değildir. Pinterest'in DOM yapısı değişirse uyarlama gerekebilir.

## Kontrol

Deneme sayfasındaki ilk bağlantıya Ctrl + orta tık yapın. Bir arka plan sekmesi açılmalı ve adresi `https://example.com/` olmalıdır. Normal orta tık yaptığınızda `?utm_source=whatsapp&ref=deneme` korunmalıdır. İkinci bağlantıda `#bolum` korunmalıdır.

Normal web sayfası kontrolü için Wikipedia gibi bir sitedeki gerçek bağlantıda Ctrl + orta tık deneyin. Hedef URL'de query yoksa yine aynı URL yeni sekmede açılır.

## Sınırlar

Bu sürüm takip parametrelerini ayırt etmez: **bütün query silinir**. `?v=...` ile video seçen, `?q=...` ile arama yapan, query içinde hedef URL veya erişim imzası taşıyan bağlantılar bozulabilir. Parametre temizleme, tüm izlemeleri engelleme garantisi vermez.

HTTP/HTTPS web sayfalarında çalışır. `chrome://` sayfaları, Chrome Web Mağazası, yer imleri çubuğu, Chrome'un PDF görüntüleyicisi ve masaüstü uygulamaları kapsam dışındadır. Yerel HTML dosyalarını doğrudan açmak yerine eklenti simgesinden deneme sayfasını açın. JavaScript ile hedef üreten özel düğmeler ve kapalı shadow DOM içindeki bağlantılar desteklenmeyebilir. Siteye erişim izni Chrome ayarlarında kısıtlanırsa ilgili sitelerde çalışmaz. Gizli pencerelerde kullanmak için Chrome eklenti ayrıntılarından ayrıca izin gerekir.

Kod değiştirirseniz `chrome://extensions` üzerinden eklentiyi yeniden yükleyin ve açık sayfaları yenileyin. Kaldırmak için aynı sayfada **Kaldır** düğmesini kullanın.

## Gizlilik ve dosyalar

Sunucu, analiz, telemetri, hesap veya üçüncü taraf çalışma zamanı bağımlılığı yoktur. İçerik betiği HTTP/HTTPS sayfalarında bağlantı tıklamalarını işler. URL yerelde temizlenir; eklenti kendi başına telemetri veya veri yükleme isteği yapmaz. Temiz adres açıldığında tarayıcı hedef siteye normal şekilde bağlanır.

Durum ekranı için son tıklanan bağlantının orijinal adresi, temiz adresi ve sonucu ilgili belge/çerçevenin belleğinde tutulur. Sonraki yakalanan tıklamada değiştirilir. Süreye bağlı otomatik silme yoktur; belgenin normal yenilenmesi veya yok edilmesiyle sıfırlanır. Tarayıcının belgeyi bellekte tutan özellikleri bu ömrü uzatabilir. Eklenti bu kaydı kalıcı depolamaya veya uzak sunucuya yazmaz. Chrome'un kendi geçmişi, önbelleği ve oturum kayıtları bu açıklamadan ayrıdır.

Orijinal adres kişisel query değerleri veya erişim belirteçleri içerebilir. Durum ekranının görüntüsünü paylaşmadan önce adresleri kontrol edin. Query'nin silinmesi, URL yolundaki, kullanıcı bilgisi bölümündeki veya `#fragment` içindeki hassas bilgileri kaldırmaz.

Eklenti cihaz kimliği, bilgisayar adı, işletim sistemi kullanıcı adı veya donanım bilgisi sorgulamaz. Hedef site normal tarayıcı isteğinde IP adresi, çerezler ve tarayıcı başlıkları gibi bilgileri alabilir. Bu araç anonimlik veya bütün izlemeleri engelleme garantisi vermez. Ayrıntılı açıklama: [PRIVACY.md](../../PRIVACY.md).

- `manifest.json`: Manifest V3 yapılandırması.
- `cleaner.js`: HTTP/HTTPS URL temizleme.
- `pinterest.js`: Pinterest pin sayfasındaki Visit site düğmesini dış bağlantıyla eşleştirme.
- `content.js`: Ctrl + orta tık yakalama.
- `background.js`: Yeni sekme açma.
- `popup.html`, `popup.css`, `popup.js`: Sayfa durumu, son tıklama ve deneme sayfası düğmesi.
- `deneme.html`, `deneme.css`: Deneme arayüzü.

Ek Chrome API izni istenmez; sayfalarda çalışabilmesi için HTTP/HTTPS content script eşleşmeleri tanımlıdır.

Bu eşleşmeler sayfa DOM'una erişim sağlar; Chrome bunu site verilerini okuma/değiştirme izni olarak gösterebilir. “Ek API izni yok” ifadesi sayfalara erişim olmadığı anlamına gelmez.

## Doğrulama

Node.js kuruluysa proje kök klasöründe şu kontroller çalıştırılabilir:

```shell
node tests/test-extension.cjs
node tests/test-popup.cjs
```

Bağımlılık kurulumuna gerek yoktur. URL temizleme, fragment koruma, erken tıklama yakalama, çift sekme önleme, Ctrl bırakılması, DOM değişmesi, normal tıklama istisnaları, Pinterest düğmesi, arka plan mesaj doğrulaması ve durum ekranı kontrolleri bulunur.

Pinterest adaptörü geliştirme sırasında gerçek bir pinin DOM'unda da kontrol edilerek beklenen temiz hedefin çıkarıldığı doğrulandı. Bu, kurulu eklenti üzerinde canlı tıklama ve gezinmenin baştan sona otomatik doğrulandığı anlamına gelmez. Kurulumdan sonra manuel Chrome kontrolü gereklidir. Public paketteki test verileri kişisel gezinme örnekleri yerine genel adresler kullanır.

## Public paylaşım ve lisans durumu

İncelenen 0.2.1 kaynak paketinde geliştirici kullanıcı adı, bilgisayara özgü yerel yol, cihaz kimliği, API anahtarı veya geliştirme oturumuna ait gerçek pin/ürün bağlantısı bulunmadı. Paket üçüncü taraf kütüphane veya indirilen görsel/font içermiyor. Bu kaynak incelemesi hukuki uygunluk veya bağımsız güvenlik sertifikası değildir.

Paylaşılacak içerik bu proje klasörü veya hazırlanmış kaynak ZIP'idir. Geliştirme çalışma dizinleri, tarayıcı profilleri, ekran görüntüleri, günlükler, sohbet dökümleri ve eski ZIP'ler bu paketin parçası değildir.

Henüz bir proje lisansı seçilmedi ve `LICENSE` dosyası eklenmedi. Kodu public göstermek, başkalarına olağan açık kaynak yeniden kullanım haklarını kendiliğinden vermez. Açık kaynak olarak sunmak isteyen hak sahibi lisansını seçmelidir. [GitHub lisans açıklaması](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) ve [MIT lisansı](https://opensource.org/license/mit) başvuru kaynaklarıdır. Yayıncı adına lisans seçilmedi.

Kaynağı public bir depoda göstermek ile Chrome Web Mağazası'nda dağıtmak ayrı işlemlerdir. Bu paket mağazaya gönderilmedi. Ürün adları yalnızca uyumluluğu belirtir; resmi bağlantı veya onay iddiası yoktur.
