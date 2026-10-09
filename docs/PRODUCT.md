# Ürün planı

## Temel vaat

SocialTwin AI, “bana ilan göster” isteğini “bu fırsat için hangi kanıtlarım var, neyi tamamlamalıyım ve nasıl başvurmalıyım?” sonucuna taşır. Slogan: **Smart Life, Smart Opportunities.** İşe yerleştirme garantisi sunmaz. Kullanıcının becerilerini görünür kılar ve başvuru kalitesini artırmayı hedefler.

presentation/example kaynaklarındaki sosyal erişim ve kapsayıcılık vizyonu bu ürünün dayanağıdır. Regionlarda yaşayan ve dijital deneyimi az adaylar için sade AZ dil, mobil kullanım ve GitHub'sız yol önemlidir. Eski geniş GovTech hizmetleri ilk sürümün tamamlanmış kapsamı sayılmaz. Referans yorumları [REFERENCE_ANALYSIS](REFERENCE_ANALYSIS.md), görsel uygulama [DESIGN_SYSTEM](DESIGN_SYSTEM.md) içindedir.

## Kullanıcılar ve ihtiyaçlar

| Kullanıcı | Asıl ihtiyaç | Profil kanıtı |
| --- | --- | --- |
| Üniversite öğrencisi | İlk staj ve burs | Ders, proje, portfolyo, eğitim bilgisi |
| Yeni mezun | İlk iş, deneyimi anlatma | Bitirme projesi, staj, gönüllü deneyim |
| İş arayan | Hedef ilana göre CV | İş geçmişi, kullanıcı doğrulamalı sonuçlar |
| Kariyer değiştiren | Aktarılabilir beceriler | Önceki iş, yeni proje, eğitim |
| Teknik olmayan aday | GitHub'sız eşit erişim | Serbest metin, portfolyo linki, deneyim |
| Kariyer merkezi (sonraki aşama) | Danışmanlık verimliliği | Kullanıcı izniyle paylaşılan paket |

Hackathon üç farklı problemi aynı çekirdek akışla göstermeli: CS stajı, ekonomi bursu, kariyer değiştiren adayın junior işi. Tasarım portfolyosu dördüncü regresyon senaryosu olur. Uygulama fırsat türünden bağımsız temel CV/resume de hazırlayabilir.

## Üç ekran

Çalışan son kapsam (ADR-017/018): eğitim/ilgi/beceri/dil profili, iş/burs/grant/internship paneli ve seçili paket. Aşamalar `/profil`, `/imkanlar`, `/senedler` URL'lerindedir; Geri/İleri açık session state'ini korur. Kesin deadline'a son üç saatte kırmızı saat/dakika uyarısı, son günde sarı uyarı vardır.

### 1 — Profil ve kanıtlar

Serbest metin, hedef türü/alan, lokasyon, çalışma biçimi, çıktı dili. İsteğe bağlı GitHub kullanıcı adı; public verilerin Gemini ile analiz edileceği açıkça anlatılır ve onay alınır. Kullanıcı kendi hesabı olduğunu beyan eder; public kullanıcı adı sahiplik doğrulaması değildir.

AI metni düzenlenebilir alanlara çıkarır. Bilinmeyeni boş bırakır. Profil onayı olmadan eşleştirme başlamaz. GitHub analiz kartları kaynak linki, gözlenen bulgu, atıf seviyesi ve “CV'ye ekle” kontrolünü içerir. Kullanıcı kendi katkısını düzeltebilir/reddedebilir. Teknik olmayan kullanıcı doğrudan deneyimlerini onaylar.

### 2 — Fırsatlar ve şeffaf analiz

Katalogdan filtre başına en fazla üç aday. Tür filtresi/arama/sıralama/sessiyada saklama vardır. Her kartta kuruluş, tür, yer/çalışma biçimi, resmî kaynak, son kontrol, deadline ve durum. Yüzde M/N'dir; karşılanan ve bilinmeyen sayı yanında gösterilir. Her gereksinimde karşılandı/karşılanmadı/bilinmiyor, gerekçe ve kaynak görünür. Kritik engeller önerilerden ayrıdır. Üçten az uygun sonuç varsa mevcut sayı gösterilir; ilan üretilmez.

Fırsat yoksa kullanıcı CV-only yoluna geçebilir. “GitHub hesabın yok” hata değildir. Belge hazırlığı ile teknik beceri ayrı gereksinimlerdir; mektup taslağı yazılınca kullanıcının diploma/teknik yetkinliği değişmez.

### 3 — Başvuru paketi

Seçili fırsat için: 4–5 uygulanabilir adım, hedefe uyarlanmış mektup, CV/resume taslağı, üç somut CV iyileştirmesi. Kanıt bağlantıları ve eksik bilgi uyarıları düzenleme görünümünde korunur. Kullanıcı onaylı içerik TXT olarak indirilir ve sade baskı görünümüyle PDF yapılabilir. “Taslak hazır” ile “başvuruya hazır” ayrı etiketlerdir.

CV-only yolunda hedef rol kullanılır; olmayan ilan/kuruluş/deadline atfedilmez. CV bir veya iki sayfalık sade profesyonel belge; resume kısa, hedef role odaklı sürüm. Akademik CV ve karmaşık ülke formatları sonraki aşamadır. ATS uyumluluğu sade biçim ve okunabilirlik hedefidir; evrensel ATS puanı/garantisi üretilmez.

## Öncelikler

| P0 — demo için zorunlu | P1 — demo sağlamsa | Sonraki ürün |
| --- | --- | --- |
| Profil çıkarma + kullanıcı onayı | İkinci tasarım şablonu | Private GitHub/OAuth |
| Public GitHub kanıt analizi | Daha geniş PR incelemesi | PDF/DOCX CV içe aktarma |
| İlk dört resmî kayıt; geniş hedef 10–12 | Ek çeviri seçenekleri | DOCX export |
| Internship + scholarship + job + grant | Ek public repo sayfası | Kayıtlı profil/sürüm geçmişi |
| Gereksinim tablosu ve kodla puan | UI animasyonları | Danışman işbirliği |
| CV/resume + mektup + plan | Kontrollü kullanıcı ilanı içe alma | Kaynak yenileme pipeline'ı |
| TXT/print PDF + hata/boş durum | Sunucu PDF üretimi | İzinli deadline hatırlatma |

İlk sürümde kurs öneri pazarı, otomatik başvuru, form doldurma, e-posta gönderme, işveren aday sıralaması ve başvuru takip paneli yok. Kitlenin büyümesi bu işlerin iki güne eklenmesi anlamına gelmez.

## Ürün ölçümü

Hedefler: üç demo senaryosunun tamamlanması; her üretilmiş olgusal CV iddiasının kullanıcı onayı/kanıta izlenebilirliği; hiç uydurma fırsat olmaması; kullanıcıların düzenlemeyi anlayabilmesi. Başlangıç kullanılabilirlik hedefi 5 denemede en az 4 kişinin yardımsız pakete ulaşmasıdır. Gerçek sonuçlar QUALITY raporuna kaydedilir; hedefler başarı gibi sunulmaz.
