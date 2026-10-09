# Pilot tasarım yönü

Dayanak: presentation/example ve kullanıcının SocialTwin AI-1.png referansı. Lacivert/açık zemin kart ailesi çalışan panelde uygulandı. Token'lar referans ailesine yakın yön değerleridir; kesin kaynak renk/font ölçümü değildir.

## Görsel temel

### 2026-10-09 — U02 modern workspace (güncel yön)

Kullanıcı U01'in hâlâ fazla sade ve kullanımının zor olduğunu bildirdi; daha dolgun, modern ve animasyonlu arayüz istedi. Güncel header desktop'ta 240px lacivert sol rail; tablet ≤1000px'de 84px ikon rail; mobil ≤760px'de sticky yatay navigasyondur. Üç URL aynı kalır. Kısa açıklamalar, seçili aşama ve kilitli aşamanın title/aria etiketi vardır; sahte sayılar/başarı veya yeni ürün scope'u eklenmez.

Profilde `Suallarla doldur / Sərbəst yaz`: Nə bilirsən / Nə etmisən / Nə axtarırsan. Sağdaki `Profil qaralaman` yalnız gerçek yazılanları ve doldurulmuş konu sayısını gösterir; AI analizi/puan değildir. Başlangıç formu extraction sonrası yığılır; eğitim/beceri/hedef xülasəsi, disclosure ile metadata, tam okunabilir claim textarea ve sticky onay sayısı öne çıkar. GitHub/iletişim optional disclosure'dır. Claims ve sources korunur.

`workspace-ui.css` güncel tasarım katmanıdır: primary #2453B9, sidebar #111F3A, background #F4F6FB, text #17243A, muted #64718A, border #E0E6F0. 14px form, 28–32px başlık, 14–18px radius; güçlü içerik hiyerarşisi ve yumuşak kart gölgesi. Motion: 0.3–0.6s opacity/translate girişleri, küçük hover/press tepkisi, disclosure açılımı ve gerçek busy durumunda belirsiz süre animasyonu; yüzde/ETA uydurulmaz. `prefers-reduced-motion` tüm motion/scroll animasyonlarını kapatır. PDF stilleri motion/workspace chrome'u taşımaz.

U01 aşağıda önceki iterasyon kaydıdır; U02 görsel/akış kuralları önceliklidir. API/provider/schema/GitHub/AI coach/DocumentPreview entegrasyonu aynı kalır.

### 2026-10-09 — sade çalışma arayüzü

U01 kullanıcı isteğiyle pazarlama ağırlıklı giriş sadeleştirildi. Header tek üç adımlı navigasyondur; tekrar breadcrumb/stepper yok. Marka işareti `pilot-mark.tsx` ve `app/icon.svg` içinde P/ileri yön çizgisidir. Başlıklar `Profilini yarat`, `Sənə uyğun imkanlar`, `Sənədlərini hazırla`; açıklama bir kısa cümledir. Live provider adı header'da gösterilmez, fixture demo ve bağlantısız durum etiketi korunur.

Uygulama token/typography/spacing katmanı `src/app/workspace-ui.css`; globals/dashboard'dan sonra yüklenir. Lacivert #173E8F, açık gri #F7F8FA, beyaz kart; Segoe UI/system sans, 32px desktop ve 28px mobile başlık. Minimal gölge, 12px kart köşesi, en az 40–44px kontrol hedefi. Profil yanında tekrarlanan slogan yerine `Nə yazım?` rehberi vardır. İmkanlarda tekrar kategori reklam kartı çıkarıldı; filtre/arama, kaynak, M/N ve kritik engel bilgisi korundu.

GitHub/AI coach/document preview backend sohbetinin ayrı bileşenleridir. Feature CSS bu ortak katmandan önce yüklenmeli; gelecekteki feature state ve içerik doğruluğu U01 görsel kabulünün parçası sayılmaz.

| Token | Öneri | Kullanım |
| --- | --- | --- |
| primary | #173E8F | CTA, seçili adım, marka |
| primary-soft | #EDF3FC | Kanıt/özet arka planı |
| background | #F7F8FA | Sayfa zemini |
| surface | #FFFFFF | Kart ve belge görünümü |
| text | #192536 | Gövde/başlık |
| text-muted | #5E6B7E | İkincil açıklama |
| border | #E1E6ED | İnce ayırıcılar |
| success / warning / danger | #167044 / #8C5A00 / #B42318 | Durum ikonu + metin |

Modern okunabilir sans-serif, AZ/TR karakter desteği. Desktop ana başlık 32px, mobil 28px, kart başlığı 18–20px, ana form metni 15–16px, ikincil açıklamalar 12–14px. Küçük monospaced navigation kullanılmaz. 8px spacing tabanı, kart radius 12px, hafif shadow ve border. Merkezli maksimum 1240px dış alan ve 32px desktop / 20px mobil iç boşluk.

Contrast test edilmeden palet erişilebilir kabul edilmez. Focus ring, klavye kullanım, label ve inline hata zorunludur. Durum yalnız renk veya emojiyle anlatılmaz. Mobilde tek sütun; requirement tablosu satır kartına dönüşebilir ama durum/kanıt ilişkisini korur.

## Ekran uygulamaları

**Profil:** üstte MüraciətPilot ve `1 Profil / 2 İmkanlar / 3 Sənədlər` navigasyonu. Ana alan serbest metin, yanında kısa `Nə yazım?` rehberi; altında düzenlenebilir profil. GitHub isteğe bağlı ayrı bölüm. Birincil CTA önce `Profili hazırla`, sonra `Profilimi təsdiqlə`. Kanıt kartında `Mənbə`, `Töhfə təsdiqi`, `CV-yə əlavə et`. Gizli uzmanlık puanı yok.

**İmkanlar:** kompakt sonuç sayaçları; dört tür filtresi, arama, deadline sırası ve açık sessiyada saklama. Aynı ilk ilanı tekrarlayan overview ve reklam keşif kartı görünmez. Kartlarda kuruluş/tür, deadline, kontrol tarihi, resmî link ve fayda vardır. Kullanıcının isteğiyle büyük yüzde görünür, aynı yerde M/N, bilinmeyen ve açıklama vardır. “Uyğunluq niyə?” bütün requirement/kaynakları açar. Kritik engel yüzdeyle gizlenmez. Kesin deadline'a ≤3 saat kalınca ikon/metinli kırmızı “Vaxt bitir!”; ≤24 saat sarı; dakika hesabı her 60 saniye yenilenir. Rolling/saat bilinmeyen kayıtta saat uydurulmaz. Daha fazla sonuç/pagination backend çalışmasının kapsamındadır.

**Paket:** CV/resume, mektup ve plan arasında aynı ekranda sade tabs/sections. Kullanıcı düzenleyebilir; evidence drawer/kaynak açılımı iddiaya bağlıdır. CTA `Mətn kimi yüklə`, `PDF üçün çap et`. Taslak/onaylı durumu ve eksik bilgi uyarıları export öncesi anlaşılırdır.

## Referanstan alınmayacak görsel anlamlar

Kampanya/Instagram metrikleri, FIN formu, model eğitim yüzdesi, sahte bildirimler ve kişiyi firmaların görüntülediği iddiası kullanılmaz. Eski cihaz çerçeveleri çalışan web app içine çizilmez. Logo/profil fotoğrafı zorunlu değildir. Kişisel verinin e-postaya gönderildiği gibi gerçek olmayan başarı mesajı gösterilmez.

Yükleme sırasında `Profil təhlil edilir`, `3 repo yoxlanılır` gibi gerçek aşama bilgisi kullanılabilir; ölçülmemiş % ilerleme üretilmez. Kanıt kısmi olduğunda kapsam sayıları gösterilir.

## Sunum tasarımı

Beyaz içerik sayfaları, lacivert başlıklar, açık mavi vurgu korunur. Teknoloji illüstrasyonu kapak/kapanışta isteğe bağlı; içerik ağırlığı çalışan demo ve okunabilir kanıttadır. Referanstaki sıkışık mimari açıklaması ve küçük ekran fotoğrafı yeni sunumda daha büyük gösterilir. Eski 10 slayt sayısı yeni sunuma zorunlu değildir; bu görevde yeni deck oluşturulmadı.

### 2026-10-09 — U03 SocialTwin AI (en güncel yön)

Güncel marka **SocialTwin AI**, slogan **Smart Life, Smart Opportunities.**; önceki marka kaydı ADR-023 ile değişti. S çizgisi/iki yön bağlantılı vektör marka, matching favicon ve metadata var. İlk açılış lacivert grid arka plan, büyük slogan ve 01 tanıt/02 keşfet/03 hazırla kartlarının kısa animasyon dizisidir; autoplay medya veya bekleme zorunluluğu yok, tek CTA profili açar. Desktop'ta sunum tekrar açılır; mobil header 124px, üç nav ve reset ile yığcamdır. Profil/session, metin ve onay replay sırasında temizlenmez.

Review başlığında `Hamısını seç / Seçimi təmizlə` kullanıcı eylemi vardır. Sonraki metin değişikliği ilgili onayı kaldırır. Coach, disclosure yerine görünür bölüm: mod kartları, amaca bağlı CTA, tek soru ve aynı panelde cevap/geri bildirim; önceki/sonraki soruda cevap korunur. Değişen document'a eski review gösterilmez.

Belge stüdyosu: paper preview esas görünüş, editör açık kullanıcı eylemiyle açılır; modern/klasik şablon, resume/CV/mektup/plan tabs. PDF aynı edit'ten yerel sunucuda A4 olarak biçimlenir; Noto Sans regular/bold gömülü, bölüm başlığı, bullet indent, font-metric wrap, taşmada yeni sayfa, tekrar isim ve sayfa sayacı. Print/TXT korunur. Etki/başarı veya eksik bilgi görsel dolgunluk için eklenmez.

Deadline: ≤3h belirgin kırmızı border + metin/ikon; ≤24h turuncu; ≤7g sarı; daha uzak kesin tarih kalan gün/saat ile yeşil, rolling sabit deadline olmadığını söyler; bilinmeyen saat gri kaynak kontrolü. `prefers-reduced-motion` yeni intro/studio motion dahil tüm animasyon/transition'ı kapatır. Print'te navigasyon/editor/coach yok. U01/U02 kayıtları tarihseldir, bu bölüm önceliklidir.
