# Teknik mimari — öneri

Durum: aşağıdaki tam mimari hedeftir; dar çalışan kesit Next.js/TypeScript, doğrudan @google/genai ve Zod ile kuruldu. Agent framework zorunlu değildir; bounded server pipeline kullanılır.

Güncel uygulama (2026-10-09): profil, dört gerçek katalog kaydı, comparison ve seçili paket/CV-only açık; GitHub bekliyor. Prototype-v2 sınırı DATA_CONTRACTS'dadır. Adapter 25 sn/2 çağrı, tek retry veya repair uygular; fixture ayrı opt-in'dir. `(pilot)` ortak layout içindeki client state `/profil`, `/imkanlar`, `/senedler` geçişlerinde korunur. Sonraki adım için state yoksa router.replace önceki gerekli adıma döner. Yenilemede kişisel state temizlenir. Client deadline uyarısı dakikada güncellenir; sunucu match ve paket cevaplarında kaynak freshness/expiry kapısını yeniden kontrol eder.

## Katmanlar

```text
Tarayıcı: Profil → Kanıt onayı → Fırsatlar → Paket editörü
                       ↓
Sunucu API: input validation / session ownership / rate limiting
                       ↓
Orchestrator: extraction → evidence → comparison → generation
       ↓                 ↓                  ↓
Gemini adapter     GitHub adapter      Verified catalog JSON
       ↓                 ↓                  ↓
JSON + semantic validation → deterministic score → response DTO
                       ↓
Onaylı belge → TXT / browser print PDF
```

İlk sürümde katalog versioned JSON'dur; SQLite/cloud DB gerekli değildir. Profil ve belge varsayılan olarak kısa ömürlü session state'tedir. Stateless hosting için client'ın gönderdiği profil revizyonu server tarafından tekrar doğrulanır; server process memory kalıcı state garantisi sayılmaz. Auth ve kalıcı storage M2'de tasarlanır.

## API önerisi

| Route | Davranış |
| --- | --- |
| POST /api/profile/extract | Metin → profile draft; onaylanmış sayılmaz |
| POST /api/github/analyze | Onaylı public username + scope → sınırlı kanıt seti/coverage |
| POST /api/opportunities/match | Profil revizyonu + onaylı evidence IDs → aday tabloları ve kodla puan |
| POST /api/package/generate | Profil revizyonu + seçili katalog ID veya CV-only → paket |

Önerilen kaynak düzeni: `src/app`, `src/lib/ai`, `src/lib/github`, `src/lib/catalog`, `src/lib/scoring`, `src/lib/schemas`, `data/opportunities.json`, `tests/fixtures`. Bu klasörler henüz mevcut değil. UI aynı state modelini kullanır, adapter kaynakları birbirine karıştırmaz.

## Orkestrasyon

1. Profil normalize edilir ve kullanıcı onaylar.
2. İstenirse GitHub verisi alınır; kanıt çıkarma sonrası kullanıcı katkısını onaylar.
3. Kod, tür/lokasyon/deadline/status filtreleriyle kataloğu daraltır. Katı eligibility dışındaki bilinmeyenlere fırsat kapısını tümden kapatma; netleştirme göster.
4. Gemini yalnız verilen requirement ID'leri için tablo üretir. Validator tabloyu ve kaynakları kontrol eder.
5. Kod puanı, eligibility ve sıralamayı hesaplar; UI en fazla üç sonuç gösterir.
6. Yalnız kullanıcı seçtiği fırsat için paket üretilir. CV-only ayrı moddur.
7. Paket validasyonu ve düzenleme → export. Mektup üretimi otomatik başvuru değildir.

## Performans hedefleri — henüz ölçülmedi

- Profil için warm p95 ≤ 5 sn; eşleştirme ≤ 8 sn; paket ≤ 15 sn.
- GitHub cold analiz ≤ 25 sn hedef; uygulama toplam request timeout 30 sn. Hosting limiti ayrıca doğrulanır.
- Normal akışta 3 LLM çağrısı (profil, karşılaştırma, paket); GitHub seçilirse 1 ek. Kullanıcı düzenlemesi ve kontrollü retry ayrıca ölçülür.
- GitHub: metadata en fazla 20 repo, derin analiz en fazla 3; istek bütçesi en fazla 25, concurrency 2. Limitler kalite/latency ölçümüne göre değiştirilir.
- Profil metni başlangıç 8.000 karakter; her repo özeti en fazla 12.000 karakter; toplam model input hedefi 16.000 token. Limit aşımı görünür truncation/coverage bilgisi üretir.
- Paket çıktı sınırı 4.000 token; profil 1.500; comparison 3.000; evidence 2.500. Thinking kullanımı da maliyet ölçümüne dahil edilir; kesilen JSON gösterilmez.

Bunlar model kapasitesi değil uygulama bütçeleridir. Uzun repo içeriği modelin büyük context penceresi var diye sınırsız gönderilmez.

## Cache ve invalidasyon

Public GitHub metadata için 15 dakika cache hedefi; içerik owner/repo/path/commit SHA ile anahtarlanır. AI çıktı cache anahtarı: profile revision + confirmed claim IDs + catalog version + selected opportunity + prompt/schema/model version + language. Kişiye özel cache başka session'a sunulmaz. Profil/kanıt reddi ve değişen katalog çıktıyı geçersiz kılar. Belge editleri kullanıcı state'i olarak tutulur; regeneration bunları sessizce silmez.

## Hata ve gözlemleme

Provider adapter ortak error enum'una çevirir: INVALID_INPUT, PROVIDER_UNAVAILABLE, RATE_LIMITED, INVALID_AI_OUTPUT, PARTIAL_EVIDENCE, NO_RESULTS. Bir bozuk AI çıktısı UI'ya raw olarak geçmez. Trace ID, süre, model/prompt/schema version, token sayısı, retry/cache state loglanır; ham CV, repo metni, token ve e-posta loglanmaz.

Network 429/5xx için tüm request içinde en fazla 2 retry; jitter + Retry-After ve toplam süre sınırı. Şema onarımı için en fazla 1 yeni LLM çağrısı; sonsuz döngü yok. Model fallback yalnız erişimi test edilmiş adayla ve toplam bütçe içinde. GitHub başarısızsa profil/CV-only devam eder; yanlış veri eklenmez.

## U03 PDF adapter

`/api/export` Node runtime'da pdf-lib/fontkit ve yerel açık lisanslı Noto Sans ile mevcut kullanıcı edit'ini biçimler. Browser bundle'a PDF kütüphanesi eklenmez; server-only adapter, strict input/origin/size/rate sınırları ve no-store response vardır. Disk'e kullanıcı belgesi yazılmaz, AI çağrısı yapılmaz. OutputFileTracingIncludes yalnız export route için fontları paketler. Çok sayfalı wrap/page ölçümü PDF font metrikiyle yapılır; preview CSS A4 ailesinin responsive görünüşüdür, tarayıcı dar genişliğinde birebir PDF pagination iddiası taşımaz.
