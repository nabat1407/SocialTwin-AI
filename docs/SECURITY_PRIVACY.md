# Güvenlik ve mahremiyet tasarımı

Bu belge teknik ürün kurallarıdır; yasal uyum sertifikası değildir. Referans PDF'nin mevzuata uyma niyeti, uygulamanın denetlenmiş uyumu sayılmaz. Gerçek veriyle yayın öncesi uygulanacak yükümlülükler ayrıca doğrulanır.

## Veri minimizasyonu

P0: kullanıcı metni, ilgili eğitim/deneyim/beceri, isteğe bağlı public GitHub username ve üretilmiş belge. FIN kodu, kimlik fotoğrafı, tam adres, doğum tarihi ve zorunlu profil fotoğrafı alınmaz. CV iletişim bilgisi isteğe bağlıdır; eşleştirme için gerekmiyorsa modele gönderilmez.

Public GitHub verisinin de kullanıcı profiliyle ilişkilendirildiğini ve Gemini'ye sınırlı özetinin gönderileceğini UI açıklar. Analiz ve CV'ye iddia ekleme ayrı onaylardır. Teknik olmayan aday GitHub vermeden ilerler. Repo kodu çalıştırılmaz; private içerik P0 kapsamına girmez.

## Yaşam döngüsü

Session state varsayılan kısa ömürlü ve sunucuda kalıcı olmayan yapıdadır; tarayıcı kapanması/reload davranışı UI'da açıklanır. Kalıcı localStorage varsayılan yapılmaz. Session temizleme işlevi profil ve taslağı temizler; provider tarafındaki geçmişi sildiği iddia edilmez. Public metadata cache 15 dakika hedef; kişiye bağlı evidence/AI çıktısı session ile ayrılır ve süresi uygulamada tanımlanır.

M2 kalıcılık eklenmeden önce erişim, saklama süresi, export/silme, backup ve provider retention açıklaması netleşir. Demo fixture'ları sentetik veya izinli olur. Ham CV, kullanıcı notu ve GitHub metni geliştirici hafızasına/test loguna konmaz.

## Teknik sınırlar

- Gemini/GitHub anahtarları sunucuda, git dışında, minimum yetkiyle. UI/API cevabı/hata/log anahtar içermez.
- İzinli host/endpoint, boyut/süre/page/request limitleri; arbitrary URL fetch ve SSRF engeli.
- Kaynak metni sistem talimatı olamaz. Tool erişimini model değil server authorizer belirler.
- HTML/Markdown çıktısı sanitize edilir; CV preview/export script çalıştırmaz.
- Session ownership ve profil revizyonu kontrolü; cache farklı kullanıcıya veri vermez.
- Request rate/concurrency ve token bütçesi; abuse için sınırsız generation endpoint bırakılmaz.
- Auth/cookie eklenirse CSRF ve access control ayrıca ele alınır; MVP'de auth varmış gibi iddia edilmez.

Bir GitHub hesap adının girilmesi sahiplik doğrulaması değildir. Kullanıcının beyanı ve katkı onayı açıkça ayrılır. Recruiter tarzı insanları sıralama veya hassas özelliklerden uygunluk çıkarma yapılmaz.
