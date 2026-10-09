# Profesyonel CV, resume ve mektup

Kontrol tarihi: 2026-10-09. Kullanıcının web araştırması ve belge kalitesini artırma talebiyle uygulandı. Kaynaklar üçüncü taraf rehberdir; aday hakkında olgu sağlamaz.

## Kaynak ve uygulama

- [Harvard MCS — güçlü resume](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/): kısa, role göre seçilmiş, kolay taranan bölümler; aktif ve somut anlatım, tutarlı biçim, mevcut tarihlerle ters kronoloji. Fotoğraf, yaş/cinsiyet ve genel sıfatlar eklenmez.
- [MIT CAPD — becerileri anlatma](https://capd.mit.edu/resources/resumes-writing-about-your-skills/): eylem + yapılan iş + yöntem/araç + gerçekten bilinen sonuç. Proje amacı gerçekleşmiş etki gibi yazılmaz; ölçülmeyen sonuca sayı verilmez.
- [MIT CAPD — CV](https://capd.mit.edu/resources/cvs/): CV daha geniş akademik/mesleki kayıttır; eğitim, araştırma, yayın ve ödül bölümleri yalnız varsa eklenir. Tek evrensel şablon yoktur.
- [Harvard — CV/cover letter rehberi](https://careerservices.fas.harvard.edu/resources/gsas-cv-cover-letter-guide-2/): görünür başlıklar, boşluk ve açık katkı; mektup seçili kurum/programa somut deneyimle bağlanır.

`src/lib/writing-guidance.ts` çalışan görev talimatıdır. Her madde `section` ve onaylı `claim_ids` taşır. Resume seçici, CV desteklenen ayrıntılar bakımından daha geniştir; aynı olgular sınırlıysa uzunluk uğruna bilgi uydurulmaz. Eksik kurum, tarih, katkı ve sonuç kullanıcıya soru/öneri olur. Araç adları hızlı tarama için Skills bölümünde de listelenebilir; aynı cümle çoğaltılmaz.

## Kod ve inceleme kapıları

Writer yalnız onaylı iddiaları alır. Bilinmeyen ID, onaysız iddia veya referanslı metinde bulunmayan sayısal eğitim/deneyim/metrik reddedilir. Sayı kontrolü tüm doğal dil doğruluğunu kanıtlamaz; nitel başarı, bağlam ve unvan kullanıcı tarafından hâlâ gözden geçirilmelidir.

Extraction eğitim/dil metadata'sı ve kaynakta açık kullanılan/bilinen araç cümlelerini ayrı onaysız review maddesi olarak sunar. Kullanıcı onayından önce bunlar yazara geçmez. Araç source anchor'ı tam cümleyi korur, öğrenme hedefi/negatif beyanı otomatik beceriye dönüştürmez; genel doğal dil doğrulaması değildir.

İletişim alanları isteğe bağlı kullanıcı düzenlemesidir; belge başlığında kodla biçimlenir, beceri kanıtı değildir. U03 ile tek sütunlu, başlıklı modern/klasik paper preview ve doğrudan A4 PDF kullanılır. Edit, TXT, print ve PDF aynı güncel metinden türetilir. Gömülü Noto Sans AZ/TR/EN harflerini destekler; desteklenmeyen glyph sessizce silinmez, açıklanır ve print yolu sunulur. PDF kişisel metni saklamaz veya AI'a göndermez. Bir sayfalık dört belge ve beş sayfalık uzun belge Poppler render/pypdf ile doğrulandı; geniş gerçek kullanıcı belge örneklemi ayrı kapıdır.

## Fırsatın yazım politikası

`writing_policy`: `standard`, `own_words`, `disclose_ai`. Own-words kaydında otomatik paket yazımı engellenir, hazırlık koçu soru/checklist sunabilir. [NLnet](https://nlnet.nl/propose/) kendi sözleriyle İngilizce başvuru ve kullanılan AI yardımının/diyalogların açıklanmasını ister: bu iki fonda qrant başvurusu/mektubu oluşturulmaz; CV hazırlığı ve politika uyarısı sunulur. Uygulama otomatik başvuru göndermez veya disclosure log'u sunmuş gibi davranmaz.

