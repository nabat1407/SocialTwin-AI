# Uygulama doğrulama kaydı

## 2026-10-09 — R01 GitHub kaynak hazırlığı

- Frozen install PASS; `pnpm test` 12 dosya/101 test PASS; `tsc --noEmit --incremental false`, lint ve format PASS.
- `PILOT_BUILD_DIR=.next-release`, açık demo modu ile production build PASS; mevcut dev sunucusu durdurulmadı. Üretilen `next-env.d.ts`, kurulu Next rehberine göre Git dışında; CI build adımı typecheck öncesinde dosyayı üretir.
- Git `main`/origin hedef depoya bağlandı; commit/push veya kişisel Git kimliği ayarı yapılmadı. GPL metni SPDX license-list-data kaynağından değişmeden alındı; metadata GPL-3.0-or-later. Noto Sans OFL bildirimi korundu.
- Kaynak paketinde secret kalıpları ve yerel anahtar değerlerinin bulunmadığı, Git dışı yolların dahil edilmediği kontrol edildi. Kaynak ZIP commit metadata'sı içermez. GitHub CI uzak çalışması ve canlı AI/browser testi bu turda çalıştırılmadı.

## 2026-10-09 — U03 SocialTwin UI ve gerçek PDF final kabulü

- Son `pnpm test`: **12 dosya, 101/101 PASS**; genel `pnpm lint`, `pnpm format:check`, `tsc --noEmit --incremental false` PASS. Production build `PILOT_BUILD_DIR=.next-u03` PASS; dev `.next`/port3000 durdurulmadı. Font trace iki Noto Sans dosyasını içeriyor. İlk generated .next-u03 lint kapsamı yanlışlıkla tarandı; eslint/gitignore'a build dizini eklendi, genel lint tekrar PASS.
- Browser canlı AZ: üç soru extraction→7 claim; Hamısını seç 7/7, temizle0/7; gerçek metin edit'i yalnız ilgili onayı kaldırır; tekrar açık seçim→9/9 matching→CERN seçili resume/CV/mektup/plan. İkinci mobil manuel profil→9/9 matching→CV-only PASS. Bu QA sentetik veridir, gerçek kullanıcı sonucu değildir; GitHub çağrısı yapılmadı.
- Coach: 5 canlı mülakat sorusu, önceki/sonraki geçişte cevap koruma, aynı soruda live geri bildirim; document review ve 4 roadmap deliverable PASS. Document değişince eski review gizlenir ve yeniden kontrol çağrısı görünür. Cevap profile eklenmez. Tüm doğal dil semantiğinin doğruluğu garanti edilmez; geniş eval açık.
- Browser PDF download CV, mektup ve plan PASS; CV edit sentinel pypdf extraction'da mevcut; sekmeler arası edit korunur, sekme/editle belge onayı sıfırlanır. End tuşu Plan tabını seçti. Modern/klasik HTML + PDF, AZ şriftleri, bölüm başlıkları, mevcut yıl sırası ve genel kariyer hedefi başlığının kaldırılması regression'da doğrulandı.
- Dört belge PDF API200/application-pdf; Poppler ile bütün tek sayfalar ve klasik uzun CV'nin **5 sayfası** render edilip görsel incelendi. İsim tekrarları, sayfa numarası, ilk/son QA sentinel, metin wrap ve AZ harfleri pypdf ile kontrol edildi. İlk Ubuntu fontunda ə eksikti, yerel SIL OFL Noto Sans ile düzeltildi. Unsupported glyph sessiz düşmez, 400+print yolu; approval/origin/size limit testleri PASS.
- 390px ve 320px profil/imkan/belge client=scroll375/305; 840px intro client=scroll840. Mobil header124px, paper ve CTA taşmıyor. Default desktop intro/studio screenshot `tmp/ui/socialtwin-welcome.jpg`, `tmp/ui/socialtwin-document-studio.jpg`. Motion computed/source kontrolü: intro sonlu diziler, global reduced-motion !important kapısı; OS tercihi emüle edilmedi. Native print-to-PDF diyaloğu ve geniş gerçek çok sayfalı kullanıcı örneklemi ayrı kabul kapısıdır.
- Deadline exact ≤3h/≤24h/≤7g/expired/rolling/date-only testleri PASS; live normal kart kalan gün/saat gösterdi. Katalog zamanı veya veri kırmızı ekran gösterimi için değiştirilmedi. Red/amber CSS kaynak kontrolü ve eşik birim testleriyle doğrulandı.

## 2026-10-09 — 16:27 Bakı ek doğrulama

- `pnpm test`: **12 dosyada 101/101 PASS**; U03 sahibinin PDF testleri de dahil. Genel `tsc --noEmit --incremental false` ve son backend dosyalarında ESLint PASS. İlk PDF test stub cast hatası sahibi tarafından gerekli font method tipiyle düzeltildi.
- Live practice-answer coach: 200, 4.14 sn, 2 somut improvement, exact claim refs; profile yeni iddia eklenmedi.
- Son AZ browser örneği, açık onaydan sonra CV eğitim/proje/beceri/dil bölümleri ve 2026→2025 sırasını gösterdi. Coach document review çağrısı başladı. Paylaşılan tabın diğer UI sohbetince de kullanıldığı anlaşılınca browser kontrolü ona bırakıldı; final screenshot/PDF/mobile/coach UI kabulü onun kaydıdır.
- Açık kullanılan bazı araçların yalnız metadata'da kalması gözlendi. `sourceBackedSkillStatements` kullanıcı kaynağındaki tam cümleyi en fazla dört **onaysız** review maddesi olarak ekler; exact tool sınırı, kullanım/bilgi beyanı, learning/negative ve NoSQL→SQL substring koruması. 3 regression PASS; live extraction200, 5 review maddesi, exact kaynak cümlesi mevcut, **0 onay**. Writer metadata'yı yine olgusal kaynak saymaz. Bu anchor genel doğal dil doğrulayıcısı değildir.
- U03 yeni sunum/PDF final isolated build sahibi tarafından tamamlanacak; önceki build snapshotı aşağıda korunur. Bu kayıt gerçek PDF browser QA'sını geçti saymaz.

## 2026-10-09 — geniş katalog, public GitHub, profesyonel yazım ve coach

Bu backend snapshot 16:14 Bakı'da tamamlandı; ayrı U03 UI/PDF çalışması sürüyor. Aşağıdaki eski kayıtlar tarihsel snapshotlardır.

- pnpm test: **11 dosyada 88/88 PASS**. Yeni GitHub dokümantasyon-only commit testi ilk koşuda process quota testinden sonra çalıştığı için FAIL oldu; quota uygulayan test son sıraya alındı, final 88 PASS. Production davranışı bypass edilmedi.
- U02 + backend önceki 87-test snapshot: typecheck/lint/format PASS; PILOT_BUILD_DIR=.next-build ile production build PASS. Dev .next korunur. Sonradan eklenen GitHub uyarısı ve aktif U03/PDF değişiklikleri o build'in kapsamında değildir.
- Katalog: 9 kayıt/5 kuruluş. Beş yeni kaydın resmî kaynakları iki pass kontrol edildi; tarih-only UCT saati uydurulmadı, NLnet own-words/disclose-AI politikası kodda. Exact ID/ref, tüm adaylar, partial batch ve all-failed regressions PASS.
- node scripts/smoke-career.mjs --skip-github: live matching **9/9**, 8 öneri/1 kritik engelli, 0 batch uyarısı; 5.26 sn. Bölümlü resume/CV 3.16 sn; her ikisi education/projects/skills/languages ve kısa summary içerdi. CV daha fazla onaylı eğitim/teknik bağlam verdi; ölçülmemiş metrik/uydurma credential gözlenmedi. Küçük tek sentetik örnek, genel kalite garantisi değildir.
- Coach live review 3.04 sn, interview 3.56 sn/**5 soru**, roadmap 2.69 sn/**4 çıktı görevi**. İlk roadmap örneği yalnız 2 görev verdi; minimum4 guard ve mode instruction sonrası tekrar PASS. Practice cevap/profile ayrımı ve exact refs mock testlerinde PASS; bu snapshot'ta yeni U03 coach UI feedback e2e yapılmadı.
- Extraction AZ browser: eğitim/dil olguları ayrı **onaysız** review maddesi; açık onay sonrası CV'de TƏHSİL/LAYİHƏLƏR/BACARIQLAR/DİL BİLİKLƏRİ görüldü. Sayfa2/3 yeni sonuçlar ve grant filtresi reseti PASS. Genel amaç başlığı/ters yıl sırası gözlemi UI sahibi tarafından düzeltildi; son U03/PDF görsel kabulü onda.
- GitHub live octocat/Hello-World: listing200 (8 repo), analyze200, 6 request/1 immutable kaynak/**0 taslak**. Minimal README'den beceri uydurulmadı.
- GitHub live public kod örneği: listing200 (20 repo), analyze200 5.00 sn, 8 request/4 dosya/4 immutable kaynak/**3 taslak**. Exact evidence IDs doğrulandı; hiçbiri adayın profiline onaylanmadı. Hesaba bağlı son commit uygun kaynak diff'i içermedi; bu gözlem için sınırlı atıf uyarısı ve regression eklendi. Author-linked pozitif/yanlış yazar, fork/vendor/large/private, cache/quota/partial mockları PASS.
- GitHub ilk live denemesi anonymous quota429 verdi; belirtilen reset sonrası tek odaklı yeniden deneme başarılı. Kota aşma, token/private erişim veya OAuth yapılmadı.
- Secret literal kontrolü: 83 kaynak/script/docs + production static dosyasında 0 eşleşme; secret değeri/log/prompt metni yazdırılmadı.

Yerel QA ham çıktıları yalnız tmp/career-qa altında sentetiktir; hafıza kişisel veri içermez. Harvard/MIT yazım dayanakları [WRITING_STANDARDS](WRITING_STANDARDS.md), source review [CATALOG_REVIEW](CATALOG_REVIEW.md). Geniş dil/çelişki/gerçek katkı doğruluğu, tamamlanmış gerçek PDF sayfalama ve yayın/auth/dağıtık bütçe kapıları açıktır.

## 2026-10-09 — U02 yönlendirmeli ve animasyonlu UI

- Final `tsc --noEmit --incremental false`, pilot-app/profile-composer scoped ESLint ve ilgili Prettier: PASS.
- `pnpm test`: **11 dosyada 87/87 PASS**. Önceki U01 aralık writing mock hatası artık mevcut değil; backend onarımı diğer sohbetindir.
- Live sentetik üç soru → profil extraction → manuel claim onayı → 9 sonuç matching → CV-only `/senedler`: PASS. Yeni composer mevcut endpoint/schema'ları kullanır; claims otomatik onaylanmaz.
- Guided→free→guided tüm üç alanı korudu; serbest metin değiştirip guided'a dönme kullanıcı metnini korudu; reset bütün draft alanlarını temizledi. Profil hazırlanırken form kilitlenir, sonra başlangıç formu yığılır ve review'a focus geçer.
- Profil/review/imkan/belge 390×844: client=scroll=375px. Dar profil 320×800: 305px; tablet 840×900: 825px. Yatay taşma yok; viewport sıfırlandı.
- Resume/CV ArrowRight/Home keyboard ve belge edit koruma: PASS. QA edit/sessiyası temizlendi. GitHub/coach API çağrısı yapılmadı.
- Giriş motion browser computed style: `workspace-enter`, 0.55s. Hover/press/disclosure/busy stilleri ve `prefers-reduced-motion` kapatma kuralı source kontrolü geçti; reduced-motion OS emülasyonu yapılmadı.
- Önizleme: `tmp/ui/pilot-workspace-v2.jpg`. Ayrı QA sekmesi kullanıldı; mevcut kullanıcı sekmesindeki inputlara müdahale edilmedi. Production build diğer sohbetin ortak son kontrolüne bırakıldı; bu UI turunda gerçek PDF QA yapılmadı.

## 2026-10-09 — U01 arayüz sadeleştirmesi

Diğer aktif geliştirme sohbetiyle dosya sahipliği koordine edildi. UI katmanı `workspace-ui.css`, header/logo/favicon, profil rehberi ve kısa AZ metinler; tekrar stepper/breadcrumb/marketinq/provider badge ve keşif/overview tekrarı kaldırıldı. Backend/state/filter/scoring bu işte değiştirilmedi.

- `pnpm exec tsc --noEmit --incremental false`: PASS.
- UI dosyalarında scoped ESLint ve Prettier: PASS. SVG Prettier'in varsayılan parser kapsamına girmedi; SVG convention kurulu Next.js dokümanıyla kontrol edildi.
- Live browser, sentetik veri: profil çıkarma → iki claim onayı → gerçek katalog matching → CV-only `/senedler`: PASS. Yeni backend özelliklerinin tamamlandığı iddiası değildir.
- Resume/CV sekme geçişinde ve ekranlar arasında redaktə korundu; ArrowRight/Home klavye sekmeleri: PASS. QA redaktəsi test sonunda kaldırıldı.
- Profil/imkan/belge 390×844: clientWidth=scrollWidth=375px, yatay taşma yok. Geçici viewport sıfırlandı. Önizleme `tmp/ui/pilot-ui-refresh.jpg`; agent'in sentetik QA sessiyası temizlendi, server durdurulmadı.
- Genel `pnpm test` aralık sonucu: 9 dosyada 71 PASS / 1 FAIL. `tests/gemini.test.ts:47` writing mock 200 yerine 502 döndü; paralel backend yazım/schema çalışması sahibine iletildi. Test geçmiş gibi işaretlenmedi. Son tam regression/build sonucu backend sohbeti tarafından güncellenecek.

Production build ve gerçek print PDF bu UI sohbetinde çalıştırılmadı. U01 görsel/etkileşim kabulü tamam; T10/P0 ve paralel GitHub/coach/preview geliştirmelerinin kabulü açık.

Tarih: **2026-10-09**, Asia/Baku. Uygulama: `0.1.0`; güncel API şeması `prototype-v2`, task prompt `pilot-v2-matching`, çekirdek `pilot-v1-draft`. Git deposu başlatılmadığı için commit ID yok. Önceki kayıtlar kendi aşamasının tarihsel sonuçlarıdır; güncel gerçek katalog/URL/deadline doğrulaması son bölümde. GitHub henüz yok.

## Otomatik kontroller

| Kontrol                          | Gerçek sonuç                                                             |
| -------------------------------- | ------------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile` | Başarılı; lockfile ile kurulum                                           |
| `pnpm typecheck`                 | Başarılı                                                                 |
| `pnpm lint`                      | Başarılı; TypeScript 7 parser uyumsuzluğu TypeScript 6.0.3 ile giderildi |
| `pnpm format:check`              | Başarılı; generated next-env dosyası biçim kontrolünden hariç            |
| `pnpm test`                      | 5 test dosyasında 41 test başarılı                                       |
| `node scripts/smoke.mjs`         | Üç fixture HTTP senaryosu ve arbitrary-input sınırı başarılı             |
| `pnpm build`                     | Başarılı; ana sayfa ve üç POST API route üretildi                        |

Test kapsamı: unknown ayrı sayımı, sıfır payda, kritik eligibility ve mandatory skill ayrımı, duplicate/uydurma requirement ID, reddedilen claim, CV/letter referansları, profil revizyonu, AZ karakterli demo export, boş katalog, kaynak/deadline şeması, yanlış tarih/timezone, freshness, body/origin şeması, profil onay kapısı, key olmadan güvenli hata, bozuk model JSON'u, trusted/untrusted prompt ayrımı. Mock testi prompt dosyasını da okur; gerçek sağlayıcının injection direnci veya iddia doğruluğu ölçülmedi.

## Tarayıcı kontrolü

Yerel Next.js dev sunucusu ve Codex in-app browser kullanıldı. İlk gerçek tarayıcı isteği 403 döndü: loopback URL farkı vardı. Aynı protokol/portta localhost ve 127.0.0.1 için izin eklendi; farklı origin, port, protokol ve null origin testlerde reddedildi. Düzeltmeden sonra profil isteği başarılı oldu.

| Senaryo                              | Gözlenen sonuç                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| CS öğrencisi → staj demo paketi      | 3/5 karşılanan, 2 unknown; yalnız iki onaylı madde belgeye girdi, onaylanmayan proje maddesi girmedi        |
| Ekonomi öğrencisi → burs demo paketi | 2/4 karşılanan, dil belgesi unknown; mektup ve belge sekmeleri açıldı, klavyede sağ ok CV'den mektuba geçti |
| Kariyer değişimi → CV-only           | Junior job örneği 2/4; “SQL öğreniyorum” mastery sayılmadı; CV-only mektup üretmedi                         |
| Belge düzenleme                      | Sekmelerde ve aynı pakete geri dönüşte metin korundu; metin değişikliği export onayını kaldırdı             |
| TXT                                  | İndirme tamamlandı; dosyada DEMO etiketi ve `Ə, ı, ş, ç, ğ, ö, ü` doğru görüldü                             |
| Mobil paket                          | 390 × 844 viewport'ta görsel kontrol; yatay taşma yok, tek sütun; viewport geri sıfırlandı                  |
| Tarayıcı logu                        | Kontrol edilen QA sekmesinde error/warn kaydı yok                                                           |

Ekran görüntüsü `tmp/ui/pilot-package.png` yerel QA çıktısıdır, sentetik metin içerir. Tam erişilebilirlik denetimi/contrast ölçümü yapılmadı. Üç senaryo ayrı işlev kontrolüdür; T12'nin art arda üç demo provası değildir.

## Henüz doğrulanmayanlar

Canlı model ID/erişim/kota ve latency/token/maliyet, gerçek katalog çift kontrolü, GitHub atfı/rate limit/partial state, çok sayfalı PDF kaydetme ve görsel/metin kontrolü, doğal dil iddia eval'i, dağıtık rate limiting ve yayın ortamı. Hazırlık performans hedefleri ölçülmüş sonuç değildir. Bu kayıt T08/T10/T11 tamamlandı anlamına gelmez.

## Canlı Gemini — sonraki doğrulama

Kullanıcı API bağlantısını istedi. Yerel secret sunucuda ayarlandı; model liste isteği başarılı. Profil/yazım için `gemini-3.5-flash-lite`, task prompt `pilot-v1-live-1`. `gemini-3.8-flash` listelendi fakat üretimde 503/25 sn timeout verdi; otomatik fallback eklenmedi. Lite seçimi açık yerel konfigürasyondur. Ücretli servis/billing etkinleştirilmedi.

İlk üretim denemesi bounded package JSON Schema nedeniyle HTTP 400 verdi. Sağlayıcı şeması şekil/tip olarak sadeleştirildi; yerel Zod bütün sınırları korur. İlk yazım örneklerinde boş claim referansları, onaylanmamış skill metadata'sından metin ve profil hedefinde çıkarım gözlendi. Writer verisi onaylı claim IDs/metinleriyle daraltıldı; task talimatı explicit hedef/ID/limitlerle düzeltildi. Reddedilmiş çıktı kullanıcıya başarılıymış gibi dönmedi.

Son `node scripts/smoke-live.mjs` koşusu:

| Sentetik senaryo                | Dil | Profil HTTP süresi | CV HTTP süresi    | Sonuç                                                       |
| ------------------------------- | --- | ------------------ | ----------------- | ----------------------------------------------------------- |
| CS öğrencisi / staj hedefi      | AZ  | 1471 ms            | 3389 ms           | PASS                                                        |
| İktisat öğrencisi / burs hedefi | TR  | 1931 ms            | 2477 ms           | PASS                                                        |
| Satıştan veri analistine geçiş  | EN  | 1172 ms            | 2165 ms           | PASS                                                        |
| XML system benzeri injection    | AZ  | 1 örnek            | Yazım çağrısı yok | Uydurma 15 yıl/PhD çıkarılmadı; SQL öğrenimi mastery olmadı |

Kontroller: otomatik claim onayı yok; bilinmeyen isim/eğitim korunur; öğrenilen SQL skills'e girmez; açık burs hedefi iş unvanına dönüştürülmez; canlı katalog boş kalır; rejected sentinel belgeye girmez; CV/resume entry referansları onaylı IDs'ye aittir; CV-only mektupsuz, dört adım ve üç öneri üretir. Kaydedilen üç sentetik belge metni manuel incelendi; bu son örneklemde desteklenmeyen başarı/yıl/metrik gözlenmedi. N=3 paket + 1 injection; p95/genel doğruluk iddiası değildir.

Son yedi başarılı çağrının server metadata toplamı: 9501 input, 2878 output, 12379 toplam token. Bu sayım önceki hata/diagnostic çağrıları ve ek browser kontrolünü kapsamaz. Gerçek fatura/kota/günlük harcama doğrulanmadı.

Güncel otomatik kontroller: 5 dosyada **52 test**, typecheck, lint, format:check ve production build başarılı. Sandbox Vitest alt süreçlerinde EPERM verdi; yerel test/build izinli yürütmeyle tamamlandı. Mock regression: safe auth/config/quota hataları, en fazla iki çağrı, ortak timeout signal, tek schema/reference repair, yerel bound validasyonu ve onaysız claim/skill metninin provider'a gönderilmemesi.

Secret kontrolü: kaynak/script/docs ve `.next/static` listesindeki 54 dosyada gerçek anahtarın literal eşleşmesi sıfır; ana sayfa HTML'inde de yok. Anahtar yalnız ignore edilen yerel server env dosyasına kaydedildi. Provider ham hata/yanıtı loglanmaz; bu kontrol bağımsız kapsamlı güvenlik denetimi değildir.

Browser: gerçek profil isteği → yalnız iki claim onayı → boş katalog → canlı CV-only paketi/plan → kaynak açılımı başarılı. Onaylanmamış eğitim maddesi belgeye girmedi; AI qaralama etiketi ve export için ek kullanıcı onayı korundu. QA sekmesinde error/warn logu yok. Görüntü: `tmp/ui/pilot-live-ai.png`. Live TXT indirmesi ve gerçek print PDF bu turda tekrarlanmadı.

Kalan kapılar: gerçek katalog/requirement comparison, fırsata bağlı canlı mektup, public GitHub kanıt atfı, geniş adversarial/çelişki eval'i, PDF QA, dağıtık kota/auth ve yayın ortamı. T03 profil kabulü tamamlandı; tam T07/T08/T11/P0 tamamlanmadı.

## Gerçek katalog, panel, URL ve deadline — güncel doğrulama

Model `gemini-3.5-flash-lite`; katalog `pilot-catalog-2026-10-09`, dört resmî kayıt. Kaynak ve ikinci pass [CATALOG_REVIEW](CATALOG_REVIEW.md). Katalog kaynaklarının gerçek tarih/saatlerini demo amacıyla değiştirmedik.

Son `node scripts/smoke-matching.mjs` canlı koşusu:

| Sentetik senaryo                           | HTTP comparison süresi | Gerçek sonuç                                                                                               |
| ------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| CS öğrencisi                               | 7105 ms                | CERN studentship 8/9 = 89%, eligible; diğer üç ilan açıklama isteyen durum                                 |
| Şirket / çocuk etkili open-source prototip | 2303 ms                | UNICEF 6/7 = 86%, eligible                                                                                 |
| Açık şirket yokluğu                        | 1963 ms                | UNICEF 0%, ineligible; önerilerde yok                                                                      |
| Kaynak ülke listesi dışı açık vatandaşlık  | 3062 ms                | CERN 7/9 = 78% olsa da ineligible; nationality engeli görünür, önerilerde yok                              |
| Seçili gerçek CERN paketi                  | 4726 ms                | CV/resume/mektup, dört adım/üç öneri; yalnız onaylı IDs, sunucudan doğru kaynak/kurum/deadline metadata'sı |

Öğrenci extraction ayrı çağrıyla geçti; dil alanı doldu ve vatandaşlıktan Fransızca türetilmedi. Test yalnız sentetik veri gönderdi; N=4 comparison + 1 extraction + 1 paket, genel kalite/p95/maliyet iddiası değildir. Önceki smoke-live'nin üç dil CV-only kaydı geçerlidir; bu turda tekrarlanmadı.

Gözlenen hata/düzeltmeler: ilgi tek başına şirket/çocuk etkisi qualification sayıldı → non-preference interests referansı reddedildi. Student status şirket/diploma yokluğu diye yorumlandı → desteklenmeyen negatif unknown guard'ı. Aynı eligibility field içindeki ilgisiz “PhD yok” cümlesinin şirket yokluğuna taşınması → negatif cümlede requirement konusu kontrolü ve regression. Fransız vatandaşlığı dil sayıldı → kaynak cümlesi dil kontrolü. Mektup hitabında bozuk karakter → kurum hitabı kodla biçimlenir. Bunlar tam semantik validator değildir; kullanıcı review ve geniş çelişki eval'i hâlâ gerekir.

Son otomatik kontroller: **9 dosyada 72 test PASS**, lint/format PASS, production build + TypeScript PASS. Build `/`, `/profil`, `/imkanlar`, `/senedler` ve üç POST API route üretti. Yeni render testinin union tipinde `.instant` erişimi ilk build'de reddedildi; kind narrowing düzeltildi ve son build geçti. Son deadline testi tam üç saat, üç saat +1ms, 15 dakika, kesin expiry ve rolling/unknown/date-only durumlarını kapsar. Component SSR testi kırmızı urgent class/metin/role=status ve cutoff'ta kartın kalkmasını doğrular. Gerçek katalogda şu anda üç saatte kapanan ilan olmadığı için canlı ilan tarihine sahte saat verilmedi.

Browser: canlı profil/onay → `/imkanlar` → gerçek CERN paketi `/senedler`; iki kez Back → imkanlar/profil; iki kez Forward → imkanlar/senedler. Profil/onaylar ve belgeye yazılan sentetik redaktə korunmuştu. Yeni mektup “Hörmətli CERN komandası,” ile açıldı ve gerçek deadline footer'ı gösterildi. Kategori/burs filtresi, arama/sıralama ve saklama önceki browser kontrolünde çalıştı. 390×844 mobil ölçümünde clientWidth=contentWidth=375, tek sütun ve 16px gövde; viewport sıfırlandı. Screenshot `tmp/ui/opportunity-dashboard.png` sentetik QA çıktısıdır.

Secret scan: 65 kaynak/script/docs ve `.next/static` dosyasında gerçek key literal eşleşmesi **0**; `/profil` HTML'inde yok. Bu dar leak kontrolü kapsamlı security audit değildir. Anahtar veya kullanıcı ham verisi bu kayda yazılmadı.

Kalan kapılar: public GitHub atfı, daha geniş AZ/TR/EN opportunity/plan/doğal dil eval'i, gerçek print PDF sayfalama ve live TXT yeniden kontrolü, auth/dağıtık kota/fatura/yayın ortamı. T04/T06 tamamlandı; tam T07/T08/T10/T11/P0 tamamlanmadı.
