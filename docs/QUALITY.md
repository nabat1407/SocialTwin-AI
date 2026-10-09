# Kalite ve kabul kapıları

Durum: test planı; uygulama olmadığı için aşağıdaki kontroller çalıştırılmadı. Amaç implementasyonu kopyalayan testler değil, kullanıcıya yanlış sonuç veren sınırları yakalamaktır.

Güncel sonuç (2026-10-09): 52 domain/contracts/API/Gemini-mock/documents testi, typecheck/lint/format ve production build geçti. Önceki üç fixture HTTP/browser/export kontrolüne ek olarak gerçek Gemini ile AZ/TR/EN üç CV-only paketi ve bir injection örneği geçti; browser canlı iki onaylı claim→CV/plan/kaynaklar doğrulandı. Public GitHub, gerçek katalog/comparison, fırsat mektubu ve PDF sayfalama bekliyor. Küçük eval sonuçları TEST_RESULTS'dadır; tam çıkış kapısı değildir. İlk durum cümlesi planın başlangıç kaydıdır.

| Senaryo | Beklenen davranış |
| --- | --- |
| CS öğrencisi, AI stajı, public GitHub | Katkı kanıtı/atıf, gereksinim, onaylı CV maddesi bağlantısı |
| Ekonomi öğrencisi, uluslararası burs, GitHub yok | Eğitim/dil bilinmeyeni sorar; GitHub yokluğu ceza değildir |
| Kariyer değiştiren, junior iş | Aktarılabilir deneyimi korur; yeni alanda yıl/uzmanlık üretmez |
| Tasarım öğrencisi, portfolyo stajı | Portfolyo linki kullanıcı beyanı; otomatik inceleme yoksa incelemiş saymaz |
| CV-only, katalog boş | Fırsat yaratmadan CV/resume ve genel hazırlık üretir |
| Fork/takım reposu/bot commit | Upstream ve ekip katkısını kişiye mal etmez |
| README injection | Sistem rol/tool yetkisini değiştirmez |
| Profil çelişkisi/eksik diploma | Unknown ve clarification; kesin uygunluk yok |
| Kritik eligibility unmet | Yüksek readiness olsa da ineligible Top 3'e girmez |
| N=0, unknown, duplicate/alternatif şart | Sıfır payda güvenli; formül doğru; sayım şişmez |
| Deadline geçti / date-only / rolling | Expired dışlanır; cutoff belirsizliği görünür; tarih uydurulmaz |
| Provider 429/timeout/bozuk JSON | Bounded retry; açık hata/fallback; yanlış başarılı state yok |
| GitHub partial/403/404 | Coverage açık, manuel profil devam eder |
| Claim reddi / profil revizyonu | Cache invalidasyon; reddedilmiş madde pakete taşınmaz |
| Export ve edit | AZ harfleri doğru, metin seçilebilir, edit korunur, placeholder uyarısı |
| Referans eski ekranlar | FIN/kimlik upload, sahte training yüzdesi ve 2024 fırsat kopyası yok |

## Kontrol seviyeleri

- Unit: scoring, eligibility, deadline, deduplication, allowed IDs ve cache key invalidasyonu.
- Adapter/schema integration: fixture+mock üzerinden input limitleri, permission, hata ve partial state.
- Canlı örneklem: gerçek Gemini ile ana senaryolar, gerçek public GitHub erişimi; mock bu doğrulamanın yerine geçmez.
- UI: profil/kanıt onayı, Top 3, paket edit/export, boş/hata state, mobile ve klavye.
- Görsel export QA: uzun isim/bullets, AZ/TR harfleri, sayfa taşması, CV ve mektup ayrı print görünümü.

Çıkış kapısı: üç ana senaryo uçtan uca çalışır; katalog ve claim ID validasyonu geçer; uydurma fırsat yok; reddedilen katkı export'a girmez; kritik eligibility gizlenmez; secret/ham PII loglanmaz; demo mode görünür; art arda üç prova başarılıdır.

Doğal dil iddialarında insan kontrolü gerekir. Test örneklerinde desteklenmeyen iddia hedefi sıfırdır; bu sonuç genel güvenilirlik garantisi sayılmaz. Ölçülen sample size ve failure sayısı raporlanır.

## Sonuç kaydı

Güncel küçük örneklem (2026-10-09): 72 regression test, dört gerçek katalog kaydı, dört canlı comparison ve bir seçili paket; URL Back/Forward/edit ve mobil kontrolü geçti. Ayrıntı ve açık kapılar [TEST_RESULTS](TEST_RESULTS.md). Bu sayı tam P0/geçiş doğruluğu veya doğal dil garantisi değildir.

Test tarihi, commit/app version, model/prompt/schema/catalog version, senaryo, sample size, beklenen/gerçek sonuç, latency/token/maliyet, hata ve sonraki aksiyon. Gerçek kullanıcı metni veya token kaydetme. p95 yalnız yeterli örneklemle raporlanır; üç demo süresinin maksimumu p95 diye adlandırılmaz.

Sunum KPI'ları gerçek sonuç değildir. Erken kullanılabilirlik denemesi hedefi 5 kişide en az 4 yardımsız tamamlama; bütün kişi sayıları ve sonuçlar gerçekten ölçüldüğünde doldurulur.
