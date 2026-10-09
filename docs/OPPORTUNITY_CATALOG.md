# Fırsat kataloğu ve doğrulama

Uzun hedef 10–12 kayıt; dört saatlik ilk katalog 2026-10-09'da dört resmî kayıtla tamamlandı: internship, scholarship, job ve kullanıcı isteğiyle grant. Kaynak/şart/deadline/ikinci pass [CATALOG_REVIEW](CATALOG_REVIEW.md) içinde. Dağılım aktif fırsatlara bağlıdır; her kullanıcıya her kategoriden uygun ilan garantisi yok. Referansın 2024 grant adları/tutarları canlı veri sayılmaz.

Her kayıt DATA_CONTRACTS şemasına uyar. Resmî kuruluş/üniversite/işveren sayfası veya işverenin doğrudan kullandığı ATS tercih edilir. Sosyal medya/post agregatörü keşif için kullanılabilir; tek doğrulama kaynağı sayılmaz. Linkin ulaşılabilir olması, başvurunun açık olduğunu tek başına kanıtlamaz.

## Manuel kontrol

1. Programın adı, kuruluşu, türü, yer/çalışma biçimi ve resmî kaynak bulunur.
2. Eligibility, skill, document ve preference gereksinimleri ayrılır. Kaynaktaki alternatif koşullar tek mantıksal requirement olarak korunur.
3. Requirement başına kaynak bölüm/başlık ve kısa alıntı kaydedilir. AI önemli şartları sessizce çıkaramaz.
4. Deadline metni aynen saklanır; varsa saat ve timezone alınır. Bilinmeyen saat/süre/tutar uydurulmaz.
5. verified_at gerçek kontrol zamanı olur; ikinci kişi kaynak/şart/aktiflik kontrolünü yapar. Tek kişi varsa ikinci bağımsız pass kaydı tutulur.
6. Açık olmayan veya çelişkili kayıt pending olur; red sebebi varsa rejected. UI statüsü AI metnine göre verilmez.

Hackathon freshness başlangıç politikası: en fazla 7 günlük kontrol, demo gününde yeniden doğrulama; önümüzdeki 72 saatte kapanan/rolling fırsatlar için 24 saat içinde kontrol. Bu süreler iç operasyon önerisidir. Stale kayıt kaynak tekrar görülmeden Top 3'e girmez.

Expired ve verification ayrı kavramlardır. Önceden verified olmuş kayıt tarih geçince expired olabilir. Date-only deadline gününde saat/timezone belirsizse uncertain gösterilir; kesin açık denmez. Scholarship'te ülke, sınıf, diploma, dil ve başvuru türü gibi katı şartları atlama. Job'da çalışma izni, deneyim ve remote kapsamını tahmin etme.

Katalog versioned JSON + kontrol kaydı şeklinde tutulur. Fixture kataloğu ayrı konum ve `fixture` etiketi taşır. Demo tarihi için süresi geçen gerçek kayıt fixture diye yeniden açılmaz. Fırsat azsa üç sonucu doldurma; CV-only yoluna geçiş sun.
