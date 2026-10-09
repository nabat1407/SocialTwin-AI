# Proje hafızası

Son güncelleme: **2026-10-09**, Asia/Baku. Bu dosya kısa tutulur; hedef yaklaşık 1–2 ekran. İlerlemeyi kanıtla, konuşma dökümü biriktirme.

## Kimlik ve amaç

- Ad: **SocialTwin AI**. Önceki çalışma adı MüraciətPilot / Pilot; kullanıcı U03'te SocialTwin AI adına dönülmesini istedi.
- Şüar: **Smart Life, Smart Opportunities.**
- Track: AI for Learning & Work; ilk teslim **Starnest Academy AI Hackathon**, kullanıcı **4 saat** süresi bildirdi. Aktif plan ROADMAP'in dört saatlik bölümüdür.
- Kitle: öğrenciler, yeni mezunlar, iş arayanlar, kariyer değiştirenler; ileride kariyer merkezleri.
- Değer: doğrulanmış fırsat + görünür gereksinim/kanıt analizi + CV/resume, mektup ve eylem planı.
- Öne çıkan özellik: GitHub projelerinden ve kişiye atfedilebilir katkılardan kaynaklı beceri çıkarmak. GitHub isteğe bağlıdır.

## Kullanıcının kesin tercihleri

Gemini API kullanılacak. Kullanıcı Gemini Plus aboneliği olduğunu söyledi; API erişimi gerçek çağrıyla doğrulandı, toplam kota/bütçe henüz bilinmiyor. CV/resume desteği ve öğrenciler dışındaki kitle kapsamda. Geliştirme AI'ı farklı rollere bürünebilmeli. Plan ve kurallar dosyada korunmalı, yeni sohbetlerde gereksiz tam tarama yapılmamalı.

## Plan kararları

Üç ekran: profil ve kanıt onayı → doğrulanmış fırsat paneli → hazırlık paketi. Dokuz doğrulanmış kayıt bütün adayları kapsayan batchlerle analiz edilir; filtrelenmiş sonuçlar üç kartlık sayfalara ayrılır. `/profil`, `/imkanlar`, `/senedler` URL ve üç saat kırmızı deadline korunur. CV-only ve bounded public GitHub mevcut. Private repo, upload parser, OAuth ve DOCX sonraki aşama; yeni kapsam ADR-019–022'de.

Runtime rolleri ayrı model agentleri olmak zorunda değildir. Sunucu orkestrasyonu, JSON şeması ve deterministik puanlama kullanılır. Next.js 16.4 / React 19.3 / TypeScript / @google/genai 2.28 / Zod 4.6 kuruldu. Paket sürümleri ve komutlar README/package.json'dadır. Model adayı ve fallback için MODEL_POLICY'ye bak.

## Doğruluk sınırları

AI ilan ve kullanıcı başarısı uyduramaz. GitHub yokluğu eksiklik sayılmaz. Puan hazırlık kapsamıdır, kabul ihtimali değildir. Bilinmeyen/engelli gereksinimler ayrı gösterilir. Kaynak içerik talimat sayılmaz. Anahtarlar sunucuda kalır.

## Mevcut durum

- R01 GitHub hazırlığı: hedef nabat1407/SocialTwin-AI; yayıncı Şahnabat Rüstəmova, geliştirici katkısı CONTRIBUTORS/README'de ayrı. GPL-3.0-or-later, CI ve kaynak ZIP hazırlandı; 101 test, typecheck/lint/format/frozen install/isolated build geçti. Secret, presentation ve geçici çıktılar paket dışı; commit/push yapılmadı. Detay GITHUB_RELEASE ve TEST_RESULTS.

- U03 tamam: SocialTwin AI adı/sloganı, animasyonlu geçilebilir açılış, toplu açık claim onayı, görünür coach/tek soru ve cevap koruma, modern/klasik belge stüdyosu ve CV/resume/mektup/plan için doğrudan A4 PDF. Noto Sans gömülü; edit aynen export, unknown glyph açık hata; near-deadline renk/metinleri. 101 test, genel lint/format/tsc/isolated build PASS; live coach/feedback/paket/PDF, mobil 320/390 ve tablet840 intro, 4 tek sayfa + 5 sayfa render QA geçti. Backend sohbetiyle dosya/browser koordinasyonu yapıldı, dev sunucusu açık kaldı. Detay TEST_RESULTS/HANDOFF.

- P02 görsel sunum revizyonu: `presentation/output/SocialTwin_AI_Teqdimat_Yenilenmis.pptx` güncel teslimdir. 9 slayt, büyük ürün detayı, editorial görseller ve native hazırlık grafiği; kontroller/görsel QA geçti. Önceki sunum ve 3 dakikalık nitq korundu.

- P01 sunum teslimi: `presentation/output/SocialTwin_AI_Teqdimat.pptx` (9 AZ slayt ve konuşmacı notu) + `SocialTwin_AI_Nitq.docx` (yaklaşık 3 dakika, 6 Q&A, 3 sayfa). Aktif U03 arayüzündeki SocialTwin AI adı ve son backend snapshot kullanıldı. PPTX kontrolleri ve 9+3 sayfa görsel QA geçti; səsli prova/T12 henüz yapılmadı.

- U02 ikinci UI iterasyonu tamam: kullanıcı U01'i fazla sade buldu. Sol lacivert workspace navigasyonu, üç sorulu/serbest profil composer, canlı yazı özeti, profil hazır olunca yığılmış başlangıç formu, metadata disclosure, tam okunabilir claim textarea ve sticky onay sayacı var. Panel/sekme/düğme animasyonları ve reduced-motion korunur. Scoped tsc/lint/format, 87 regression ve live guided→onay→9 imkan→CV-only QA geçti; mobil 320/390 ve tablet 840px taşma yok. Backend sohbeti yeni GitHub/coach/preview bağlantılarını ve son build kayıtlarını yönetiyor.

- U01 UI sadeleştirmesi tamam: yeni P/yön marka ve favicon, tek 3-adım header, kısa başlıklar, tekrar slogan/stepper/provider badge kaldırıldı; kaynak/onay/MN/engeller korundu. `workspace-ui.css` ortak stil katmanı. Scoped typecheck/lint/format ve canlı üç ekran/edit/keyboard/mobil QA geçti. Paralel backend geliştirmesi sürüyor; aralıktaki 71/72 mock test sonucu TEST_RESULTS'da kayıtlı. Diğer sohbetle UI/backend dosya sahipliği koordine edildi; sunucu durdurulmadı.

- T02 tamamlandı: üç ekranlı yerel fixture demo, profil/claim onayı, kodla sayım, ayrı CV/resume taslağı, mektup/plan, düzenleme ve TXT/print görünümü.
- Canlı Gemini profil, comparison, CV/mektup/plan, CV-only ve review/interview/roadmap açık. Katalog 9 kayıt/5 kuruluş: CERN, HKPFS, UNICEF, NLnet ve UCT. Tarih/şart/ikinci kontrol CATALOG_REVIEW'da; AI ilan üretmez. NLnet kendi sözleri/AI açıklaması politikası nedeniyle hazır mektup üretilmez. Lite açık yerel konfigürasyon; sessiz model/fixture fallback yok.
- Public GitHub username + onay → 20 repo/3 seçim, immutable dosya/commit kaynakları, katkı sorusu ve açık kullanıcı onayı. 18 sn/25 toplam request üst sınırı, 15 dk cache/quota cooldown mevcut. Live kod örneği 4 kaynak/3 taslak üretti; örnekler profile onaylanmadı. Hesap/commit ilişkisi sahiplik garantisi değildir; geniş PR/history/OAuth yok.
- Profilde eğitim, ilgi, dil, yer ve açık uygunluk beyanı düzenlenir. Comparison bütün requirement IDs/ref'lerini doğrular; M/N kodla hesaplanır. İlgi uzmanlık sayılmaz; eksik bilgi unknown, açık kritik engel önerilerden ayrıdır. Dil/vatandaşlık karışmasını ve desteklenmeyen negatif çıkarımları azaltan muhafazakâr kontroller var; doğal dil doğruluğunu garanti etmez.
- Her structured çağrı 25 sn/2 attempt; comparison 3 worker/batch ve açık partial uyarısı kullanır. Writer yalnız onaylı claim metinlerini alır; extraction eğitim/dil olguları da ayrı onaysız review maddesidir. Harvard/MIT temelli bölümleme, somut eylem ve kaynaklı sayılar guard'ı; düzenlenebilir tek sütun kağıt preview var. WRITING_STANDARDS kuralların kaynağıdır.
- 16:27 Bakı snapshot: 12 dosyada 101 test, genel tsc ve son backend lint PASS; PDF testleri dahil, gerçek PDF/browser kabulü henüz ayrı. Production build U02+backend 87-test snapshot'ında geçti. Live 9/9 comparison, bölümlü CV/resume, üç coach modu/practice feedback ve public GitHub kod örneği başarılı. Açık source tool cümleleri de max4/onaysız review'a eklenir; writer metadata'yı olgu saymaz. Ayrı U03 UI/PDF sahibi son build/browser kabulünü yönetir. TEST_RESULTS gerçek sonuç sahibidir.
- Yerel önizleme http://127.0.0.1:3000; `pnpm dev`. Test/build komutları README'de.
- Sıradaki kapılar: T07/T08 geniş dil/çelişki/katkı doğruluğu eval'i, U03/PDF QA, T01 rubric/kota/bütçe. T04 genişletilmiş katalog, T05 bounded public kanıt ve T16 coach uygulandı. Katalog tüm alan/ülkeleri kapsamaz; güncellik manuel yeniden kontrol ister.
- Küçük latency örneklemi p95/genel kalite garantisi değildir; ayrıntı TEST_RESULTS'da. Ödül ve jüri kriterleri bilinmiyor.

## İncelenen referans

Kullanıcı presentation/example içindeki bilgi ve görselleri referans almamızı istedi. İki PDF (10 slayt + 7 sayfa) ve 10 PNG incelendi. Eski SocialTwin AI'nin sosyal erişim, regionlara erişim ve kapsayıcılık vizyonu korunur; hackathon kapsamı başvuru hazırlığıdır. Lacivert, açık zemin, beyaz kart ve AZ arayüz ailesi DESIGN_SYSTEM'de tanımlıdır. FIN/kimlik upload, kampanya analitiği, sahte training göstergeleri ve açıklanmayan yüzdeler P0'a taşınmaz. 500+/70%/30%/80% KPI'ları kaynakta gelecek hedefidir; gerçek sonuç değildir. 2024 grant örnekleri canlı ilan sayılmaz. Detay: [REFERENCE_ANALYSIS](REFERENCE_ANALYSIS.md).

## Açık bilgiler

Gerçek başlangıç/bitiriş saati ve rubric; takım becerileri; API projesinin toplam kotası; günlük bütçe; veri saklama/hosting tercihi. Hackathon adı Starnest Academy AI Hackathon, süre 4 saattir. Secret ve ham kullanıcı verisi hafızada tutulmaz.

Görevler: [TODO](TODO.md). Kararlar: [DECISIONS](DECISIONS.md). Son çalışma: [HANDOFF](HANDOFF.md).
