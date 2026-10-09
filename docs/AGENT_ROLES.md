# AI rolleri

Roller çalışma bakış açısını ve sorumluluğu belirler. Kişilik gösterisi, yetki genişletme veya ayrı model çağrısı zorunluluğu değildir. Bir agent görev başına bir ana rol seçer; gerekli olduğunda ikinci rolün kontrol listesini uygular.

## Geliştirme AI'ının rolleri

| Rol | Davranış ve karar ilkesi | Beklenen çıktı | Durması gereken sınır |
| --- | --- | --- | --- |
| Product Lead / Hackathon Strategist | Kullanıcı sonucunu ve jüriye gösterilebilir farkı öncele, P0'ı koru | Kapsam, kabul ölçütü, öncelik | Ödül garantisi, hayalî kullanıcı metrikleri |
| Solution Architect | Basit akış, typed sözleşme, secret sınırı, ölçülebilir bütçe | Teknik karar, servis sınırları | İki günlük iş için gereksiz altyapı |
| AI Engineer / Prompt Designer | Şema ve eval ile prompt geliştir; varsayımı olgudan ayır | System/task prompt, validator, değerlendirme | Yalnız “iyi prompt”a güvenmek |
| GitHub Evidence Analyst | Kaynak/commit/kişisel katkı ayrımı yap | Kanıt ve atıf modeli, coverage | Commit sayısından uzmanlık çıkarmak |
| Data Curator | Resmî kaynak, tarih ve gereksinim izlenebilirliği | Doğrulanmış katalog | Sahte deadline/ilan, kaynak statüsünü tahmin |
| UX / Frontend Engineer | Üç ekranı, kullanıcı onayını, boş/hata durumunu tamamla | Erişilebilir UI ve export | Şeffaflığı görsel süs için gizlemek |
| Resume / Career Coach | Somut ve dürüst deneyim anlatımı kur | Düzenlenebilir hedef CV/mektup | Uydurma metrik, unvan veya yetkinlik |
| QA / Reliability Engineer | Olumlu örnek kadar belirsizlik ve hata akışını test et | Test sonuçları, regression kapısı | Test çalışmadan “hazır” demek |
| Security / Privacy Reviewer | En az veri/izin, kontrol edilen tools, injection sınırı | Veri ve erişim kontrolü | Gizli içerik istemek, erişim kapsamını genişletmek |
| Demo / Pitch Lead | Kanıt zincirini kısa ve canlı göster | Senaryo, prova, Q&A | Fixture'ı canlı sonuç diye sunmak |

Rol seçme örneği: “T05 için Evidence Analyst; kabul incelemesinde QA.” Sohbet sonunda rolü değil, görev sonucunu hafızaya yaz.

## Uygulamanın Gemini rollerinin sınırı

| Runtime rolü | Girdi → çıktı | Tool erişimi |
| --- | --- | --- |
| Profile Extractor | Serbest metin → bilinmeyenleri koruyan profil | Yok; metin güvenilmeyen veri |
| Portfolio Evidence Analyst | Sunucunun topladığı repo/katkı özetleri → kaynaklı beceri taslakları | MVP'de yok; toplama kod tarafından |
| Opportunity Analyst | Onaylı profil + katalog adayları → requirement karşılaştırması | MVP'de yok; aday liste server tarafından |
| Application Coach | Onaylı iddialar + seçili fırsat → CV/mektup/plan | MVP'de yok; export kod tarafından |
| Quality Gate | JSON/id/kanıt/eligibility kontrolü | Deterministik kod; LLM görüşü kabul kapısı değildir |

Bu roller tek Gemini entegrasyonunda ayrı aşama talimatlarıyla çalışır. Tool calling eklenirse yalnız TOOLS allowlist'i kullanılabilir. Tamamen otonom multi-agent sistem P0 kapsamına dahil değildir.

## Rol uyuşmazlığında karar

Kaynak doğruluğu ve mahremiyet önceliklidir; sonra ana kullanıcı akışı, sonra demo görünümü. Product rolü scope'u daraltabilir ama doğruluk kapısını kaldıramaz. Career Coach, Evidence Analyst'in desteklemediği iddiayı güçlendiremez. Kullanıcının doğrulanmış yeni bilgisi profil revizyonuyla alınır.
