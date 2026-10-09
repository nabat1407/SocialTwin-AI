# SocialTwin AI

**Smart Life, Smart Opportunities.**

SocialTwin AI, **Şahnabat Rüstəmova tərəfindən yayınlanır** — [nabat1407](https://github.com/nabat1407).

**Geliştirici katkısı:** [Cavanshirpro](https://github.com/Cavanshirpro), takımın developer'ı olarak projenin geliştirilmesine katkıda bulunmuştur. [Yayıncı ve katkı kaydı](CONTRIBUTORS.md).

Resmî depo: [nabat1407/SocialTwin-AI](https://github.com/nabat1407/SocialTwin-AI). Lisans: **GPL-3.0-or-later**.

Track: AI for Learning & Work. Önceki çalışma adı: MüraciətPilot / Pilot.

SocialTwin AI; öğrenciler, yeni mezunlar, iş arayanlar ve kariyer değiştirenler için kanıta dayalı başvuru hazırlığı sunar. Serbest metni ve isteğe bağlı GitHub portfolyosunu inceler, doğrulanmış fırsatların gereksinimlerini açıklar; hedefe uygun CV/resume, motivasyon mektubu ve hazırlık planı oluşturur.

En güçlü demo anı: **GitHub katkısı → kaynaklı beceri → ilan gereksinimi → düzenlenebilir CV maddesi.** Teknik olmayan kullanıcılar aynı akışa proje, eğitim ve deneyimlerini yazarak katılır.

## Bu deponun mevcut durumu

2026-10-09: **Canlı Gemini profil → doğrulanmış fırsat karşılaştırma → CV/mektup/plan** çalışır. Katalog 9 kayıt/5 kuruluş; tüm güncel adaylar analiz edilir, sonuçlar 3 kartlık sayfalara ayrılır. İlgi/eğitim/beceri/dil, dört fırsat türü, açıklanabilir M/N, arama/sıralama/saklama mevcut. [Kaynak kontrolü](docs/CATALOG_REVIEW.md). Bounded public GitHub ve review/interview/roadmap AI coach eklendi. Ayrı fixture gerçek ilan değildir; tam P0/geniş eval henüz tamamlanmadı.

Mərhələlər `/profil`, `/imkanlar`, `/senedler` URL'lerinde açılır. Tarayıcı Geri/İleri ortak layout içindeki profil ve belge düzeltmelerini korur; yenilemede hafıza temizlenir. Eksik session ile doğrudan sonraki URL açılırsa gerekli önceki adıma yönlendirilir. Kesin kapanışa ≤3 saat kaldığında kırmızı “Vaxt bitir!” ve kalan saat/dakika; ≤24 saat turuncu, ≤7 gün sarı uyarı; daha uzak kesin tarihte kalan gün/saat görünür. Süresi biten kart gizlenir. Saat bilinmiyorsa veya rolling ise geri sayım uydurulmaz.

Aktif teslim: **Starnest Academy AI Hackathon, 4 saat**. [Dört saatlik plan](docs/ROADMAP.md) geçerlidir.

## Yerelde çalıştırma

Node.js 20.9+ ve pnpm gerekir. Test edilen ortam Node 24.19.0 / pnpm 11.25.0'dır.

```powershell
git clone https://github.com/nabat1407/SocialTwin-AI.git
cd SocialTwin-AI
pnpm install --frozen-lockfile
pnpm dev
```

Önizleme: http://127.0.0.1:3000. Varsayılan demo modu anahtar istemez. Bir örnek seç, profili aç, kullanmak istediğin maddeleri işaretle ve profilini onayla. Örnek kartı veya CV-only yolunu seç. Belgeyi kontrol edip ayrıca onayladığında TXT ve print PDF düğmeleri açılır. Veriler açık sayfa hafızasında kalır; yenilemede temizlenir.

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm build
node scripts/smoke.mjs
```

Son komut çalışan yerel sunucuya üç sentetik senaryoyla API smoke testi yapar; demo modu gerektirir. Domain/schema/API/Gemini-mock testleri gerçek sağlayıcı erişimi kanıtı değildir.

Doğrulama ayrıntıları ve sınırlar: [TEST_RESULTS](docs/TEST_RESULTS.md). Demo plan/yardımcı metinleri AZ/TR/EN olabilir; deneyim maddeleri otomatik çevrilmez. Hedef rol bilinmiyorsa manuel profilde boş kalabilir. `pnpm format` kaynakları biçimlendirir. TypeScript 7/ESLint parser uyumsuzluğu için TypeScript 6.0.3 kullanılır; ESLint 9.39.5 mevcut plugin peer aralıklarıyla uyumludur fakat registry destek süresinin dolduğunu bildirir. Toolchain yükseltmesi birlikte değerlendirilmelidir.

## Gemini konfigürasyonu

`.env.local` yoksa `.env.example` dosyasından oluştur; var olan dosyayı üzerine kopyalama. Anahtar yalnız server-side `GEMINI_API_KEY` alanındadır; sohbete veya git'e yazma. Canlı kullanım için `DEMO_MODE=false` ve `ENABLE_LIVE_AI=true`; sabit demo için `DEMO_MODE=true`. Bu ortamda live ayarı yapıldı. Profil, karşılaştırma ve yazım modeli `gemini-3.5-flash-lite`; Flash listelense de üretim denemesi başarısız oldu. Güncel/açık katalog yoksa boş sonuç ve CV-only yolu sunulur. Hata halinde sessiz fixture/model fallback yok. Yeni ortamda sunucuyu yeniden başlat.

```powershell
# Anahtar/model erişimi; token üretmeyen liste isteği
node --env-file=.env.local scripts/check-gemini.mjs
# Live modda 3 sentetik profil/CV-only + 1 injection örneği (7 model çağrısı)
node scripts/smoke-live.mjs
# Live katalog: 4 comparison + profil + seçili gerçek fırsat paketi
node scripts/smoke-matching.mjs
# Live expanded catalog + professional CV + 3 coach modes, sentetik profil
node scripts/smoke-career.mjs --skip-github
# Read-only public GitHub technical sample; hiçbir iddia profile eklenmez
node scripts/smoke-public-github.mjs
```

Adapter toplam 25 saniye ve en fazla iki provider çağrısıyla sınırlıdır; yalnız bir transient retry veya bir schema/reference repair yapabilir. Yanıt yerel Zod ve onaylı ID validator'ından geçmeden UI'ya verilmez. Writer'a onaysız claim veya profil skill metadata'sı gönderilmez. Loglar model/süre/token sayılarını içerir; anahtar, prompt ve CV metni içermez. Günlük bütçe ve gerçek fatura henüz ölçülmedi.

Public GitHub açık onayla en fazla 20 repo/3 seçili repo okur; SHA kaynakları, katkı soru/onayı, 15 dk cache ve quota/partial uyarısı vardır. Kod çalıştırılmaz; ownership/uzmanlık çıkarılmaz. OAuth/private/PR derin taraması yok. Anahtar istemez; anonymous quota dolduğunda self-reported akış sürer.

CV/resume eğitim, deneyim/proje, beceri/dil ve kaynak varsa akademik bölümlere ayrılır; yalnız onaylı olgular kullanılır. [Harvard/MIT temelli standartlar](docs/WRITING_STANDARDS.md), sayısal atıf guardı ve kaynak own-words politikası uygulanır. Düzenleme ve kağıt preview mevcuttur. Coach belge görüşü, 5 müsahibe sorusu, 4–5 adım plan ve cevap alıştırmasına feedback sunar; cevabı profile eklemez.

Gerçek kullanıcıya açık canlı servis kurulmadan önce auth/dağıtık kota, katalog yenileme, geniş canlı eval ve gerçek katkı doğruluğu kabulü gerekir. Process-local quota global harcama sınırı değildir. U03 doğrudan PDF ve görsel QA sonuçları [TEST_RESULTS](docs/TEST_RESULTS.md) içinde kayıtlıdır; geniş semantik eval ve native print sayfalama kapıları açıktır. Kaynak kod yayını bu servis kapılarının tamamlandığı anlamına gelmez.

## Başlangıç

## Lisans ve katkı

SocialTwin AI kaynak kodu **GNU GPL sürüm 3 veya sonraki sürüm** (`GPL-3.0-or-later`) altında sunulur; herhangi bir garanti verilmez. Tam metin [LICENSE](LICENSE) içindedir. [Üçüncü taraf bildirimleri](THIRD_PARTY_NOTICES.md), [katkı rehberi](CONTRIBUTING.md) ve [GitHub yayın hazırlığı](docs/GITHUB_RELEASE.md) ayrıca bulunur. `presentation/` materyalleri yerelde korunur ve kaynak yayın paketine dahil edilmez.

## Dokümanlara giriş

- Geliştirme AI'ı: [AGENTS.md](AGENTS.md) → [proje hafızası](docs/PROJECT_MEMORY.md) → [TODO](docs/TODO.md).
- Takım: [ürün kapsamı](docs/PRODUCT.md), [iki günlük plan ve roadmap](docs/ROADMAP.md), [demo stratejisi](docs/HACKATHON.md).
- Teknik çalışma: [mimari](docs/ARCHITECTURE.md), [AI sistemi](docs/AI_SYSTEM.md), [GitHub analizi](docs/GITHUB_ANALYSIS.md), [veri sözleşmeleri](docs/DATA_CONTRACTS.md).
- Tüm belgeler: [doküman indeksi](docs/INDEX.md).

Kullanıcının `presentation/example` referansları incelendi. [Kaynak analizi](docs/REFERENCE_ANALYSIS.md), eski SocialTwin vizyonunun güncel Pilot planına nasıl taşındığını; [tasarım yönü](docs/DESIGN_SYSTEM.md) lacivert/açık zemin UI ailesinin uygulanmasını açıklar. Kaynak PDF/PNG dosyaları korunmuştur.

Gemini API seçildi. Abonelikten API kotası varsayılmaz; model, hesap erişimi ve maliyet kararları [MODEL_POLICY.md](docs/MODEL_POLICY.md) içinde bulunur. Gerçek anahtar hiçbir dokümana eklenmez.

## İlk geliştirilecek iş

**T02/T03/T04/T05/T06/T16 bounded kapsamları uygulandı.** Sıradaki kapılar geniş comparison/yazım/katkı/PDF QA, T01 rubric/kota/bütçe ve tam P0; durum TODO'dadır.


## SocialTwin arayüzü ve belge çıktısı

İlk açılış tanıtımı tek düğmeyle geçilir. Profil review'da `Hamısını seç` kullanıcı isteğiyle bütün mevcut maddeleri onaylar; metni değiştirmek ilgili onayı yeniden kaldırır. Kariyer danışmanında görünür mod kartları, tek tek mülakat soruları ve aynı yerde cevap/geri bildirim vardır.

Belge stüdyosunda CV/resume/mektup/plan önizlemesi esas görünüş, metin editörü isteğe bağlıdır. Modern/klasik tasarım ve onaydan sonra doğrudan `PDF yüklə`; TXT/print korunur. `/api/export` sadece kullanıcının gözden geçirdiği güncel metni PDF olarak biçimler; Gemini çağrısı veya dosya saklama yoktur. Noto Sans fontları [SIL OFL lisansı](public/fonts/OFL.txt) ile yereldir; deployment font trace'leri next.config.ts içindedir. Kaynak: [Noto fonts](https://github.com/notofonts/noto-fonts), PDF API: [pdf-lib](https://pdf-lib.js.org/docs/api/classes/pdfdocument).
