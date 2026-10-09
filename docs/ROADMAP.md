# Roadmap ve dört saatlik hackathon teslimi

## Aktif teslim: Starnest Academy AI Hackathon — 4 saat

Kullanıcı 2026-10-09 sohbetinde hackathon adını ve **4 saat** süresini belirtti. Aşağıdaki plan aktif önceliktir; önceki iki günlük tahmin arşiv bağlamıdır. Gerçek başlangıç/bitiriş saati ve jüri rubric'i henüz bilinmiyor.

Güncel kapsam değişikliği: kullanıcı SocialTwin açıklama PDF'si ve panel örneğine göre grant/ilgi/eğitim temelli fırsat dashboard'u ile izahlı uygunluk yüzdelerini istedi; ardından ayrı aşama URL'leri ve son 3 saat için kırmızı uyarı ekledi. Bu açık istek dashboard/grant için önceki kesme kararının önündedir (ADR-017/018). Dört resmî fırsat ve profil temelli canlı comparison uygulanıyor; vatandaş hizmetleri, otomatik başvuru ve bildirim gönderimi bu değişiklikle açılmadı.

| Göreceli blok | Öncelik ve çıktı                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| 0–60 dk       | T02: üç ekran, tipler, açık fixture modu, onay ve belge export'u; API erişimi kontrolü paralel         |
| 60–120 dk     | T03/T07 canlı Gemini smoke test ve tek senaryo; T05 için tek public repo/kanıt akışı                   |
| 120–170 dk    | T04/T06 için 3–5 resmî aktif fırsat veya dürüst boş katalog; kanıt/requirement bağı ve tek hedef paket |
| 170–210 dk    | T08/T10: ana akış/hata testleri, mobil ve print, invalidasyon                                          |
| 210–240 dk    | T12: özellik dondurma, demo provası, yedek fixture/kayıt, teslim README                                |

Kesilecekler: 10–12 kayıt zorunluluğu, geniş GitHub taraması, private repo, auth, CV import, DOCX ve ek şablon. Kullanıcının yeni talebiyle dashboard ve grant artık kapsamda. Korunacaklar: kaynak doğruluğu, katkı onayı, M/N, unknown/eligibility ve çalışan AI/paket akışı. API/katalog erişimi sağlanmazsa demo etiketi korunur.

## 2026-10-09 — U03 kullanıcı kapsamı

SocialTwin AI adı/sloganı, animasyonlu ilk açılış, toplu claim seçimi, açık coach akışı ve A4 PDF stüdyosu güncel teslim kapsamıdır (ADR-023–025). Doğrudan PDF export önceki T14'ten şimdiye çekildi; import/DOCX/auth/otomatik gönderim aynı sonraki aşama sınırında. Üç ana URL, onaylı olgular, public GitHub ve kaynak doğruluğu korunur.

## Önceki iki günlük plan — aktif takvim değil

Takvim hackathon başlangıcına göre görecelidir; 2026-10-09 hackathon tarihi varsayılmaz. Süreler üç kişilik ekip için planlama tahminidir. Kritik yol: sözleşmeler → profil/kanıt → eşleştirme → paket → uçtan uca doğrulama.

## Gün 1 — çalışan çekirdek

| Saat bloğu | Çıktı                                                  | Görev         |
| ---------- | ------------------------------------------------------ | ------------- |
| 0–2        | Rubric/API erişim kontrolü, şemalar, üç ekran iskeleti | T01–T02       |
| 2–5        | Profil çıkarma/onay, katalog kayıtları ve doğrulama    | T03–T04       |
| 5–8        | Public GitHub toplama, kanıt kartları ve katkı atfı    | T05           |
| 8–11       | Gereksinim analizi, kodla puan ve fırsat ekranı        | T06           |
| 11–14      | CV/resume, mektup, plan; TXT çıktı                     | T07           |
| Gün sonu   | Bir senaryo gerçek Gemini ile uçtan uca                | T08 başlangıç |

Katalog işi UI/AI ile eşzamanlı ilerleyebilir. İnsanlar için önerilen sorumluluklar: bir kişi AI+backend+kanıt, bir kişi frontend+export, bir kişi katalog+QA+sunum. Gerçek ekip becerilerine göre değiştir; bunlar AI agent rol ataması değildir.

## Gün 2 — kalite ve jüri demosu

| Saat bloğu | Çıktı                                            | Görev |
| ---------- | ------------------------------------------------ | ----- |
| 0–3        | Üç ana senaryo ve adversarial testler            | T08   |
| 3–6        | Deadline/status, boş durum, rate-limit/fallback  | T09   |
| 6–8        | PDF baskı, AZ metin, mobil/klavye düzeltmeleri   | T10   |
| 8–10       | Ölçüm, kanıt linkleri, export ve secret kontrolü | T11   |
| 10–12      | Demo prova, yedek kayıt ve teslim README         | T12   |
| Son blok   | Özellik dondurma, yalnız kritik hata düzeltme    | T12   |

## Kapsam azaltma eşikleri

- Gün 1 ortasında API erişimi yoksa açıkça fixture moduyla UI ilerlesin; API bağlantısı blokaj olarak kaydedilsin. Fixture canlı AI diye sunulmaz.
- Gün 1 sonunda çekirdek bitmediyse ikinci şablon, geniş PR taraması, parser ve animasyon kesilir.
- GitHub incelemesi yavaşsa 3 repo derin inceleme korunur, genişlik azaltılır. README-only analizi “katkı doğrulandı” sayılmaz.
- Gün 2 son çeyreğinde yeni özellik eklenmez; veri doğruluğu, ana akış ve export önce gelir.
- Gerçek ilan bulma gecikirse katalog daraltılır; 10–12 sayısına ulaşmak için sahte ilan eklenmez. Hackathon öncesi güncel veri yeniden kontrol edilir.

## Sonraki aşamalar

2026-10-09 kullanıcının kapsam genişletmesi (ADR-019–022): M0 içinde katalog 9 kayda çıkarıldı; bütün güncel adaylar bounded batch ile analiz edilir ve üçlü sayfalarla erişilir. Public GitHub katkı/onay başlangıcı, profesyonel CV bölümleri/preview ve isteğe bağlı review/interview/roadmap koçu uygulanır. Bunlar geniş PR taraması/OAuth/parser/kalıcılık değildir. Anonim GitHub kota ve geniş doğal dil/PDF kalite kapıları ayrı doğrulanır; özelliklerin varlığı bütün P0 çıkışını tamamlamaz.

| Aşama                | Kapsam                                                                 | Geçiş koşulu                                     |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| M0 — hackathon       | P0 üç ekran ve kanıtlı paket                                           | QUALITY çıkış kapısı                             |
| M1 — 1–2 hafta hedef | Kullanıcı denemeleri, CV import, DOCX, katkı doğrulamasını güçlendirme | Veri/kanıt hatalarının analizi, gözlenen ihtiyaç |
| M2 — 3–6 hafta hedef | Hesaplar, private repo izinleri, kayıtlı profiller, kaynak yenileme    | Auth/retention tasarımı ve güvenlik testi        |
| M3 — sonraki ürün    | Kariyer merkezleri, izinli paylaşım/hatırlatma, farklı iş seviyeleri   | Kullanıcı izni, talep ve operasyon kapasitesi    |

Bu süreler taahhüt değildir. Her aşama gerçek kullanım ve ekibin kapasitesine göre yeniden planlanır. Ana ilke: önce kanıt doğruluğu, sonra kapsama genişliği.

Kaynak sunumun geniş GovTech/ülke ölçeği vizyonu, bu aşamaların ardından değerlendirilecek bir stratejik yöndür. Grant/girişimcilik/vatandaş hizmetlerini eklemek ayrı kapsam kararı gerektirir. Kaynakta geçen Mayıs 2026 fikir tarihi geçmiş beyanıdır; bu deponun çalışma başlangıcı veya tamamlanmış araştırma kaydı değildir. 500+ kullanıcı gibi hedefler iki günlük teslim koşulu yapılmaz.

