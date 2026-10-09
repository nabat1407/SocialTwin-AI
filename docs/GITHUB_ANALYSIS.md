# GitHub portfolyo ve katkı analizi

## Çalışan prototype-v3 sınırı — 2026-10-09

POST /api/github/repositories ve /api/github/analyze mevcut. Kullanıcı beyanı/onayıyla 20 public repo listelenir, en fazla 3 seçilir. Repo başına iki README/manifest ve iki kaynak dosyası örneklenir; 40 KB dosya/3000 karakter snippet sınırı. En güncel tek hesaba bağlı commit kontrol edilir, en fazla iki uygun kaynak diff'i alınır. Son commit yalnız dokümantasyonsa sınırlı atıf uyarısı gösterilir; diğer katkılar yok sayılmaz. Tam PR/geçmiş taraması yoktur.

GitHub REST header 2026-03-10; sabit api.github.com, redirect kapalı, 1 MB streamed response sınırı. 8 sn listing/18 sn analysis ağ bütçesi ve en fazla 25 toplam outbound read; 15 dk bounded process cache, immutable SHA kaynakları, quota header/cooldown. Coverage ve katkı soru/onayı UI'da; reddedilen/onaylanmayan iddia writer'a gitmez. Repository kodu çalıştırılmaz. Aşağıdaki genel tasarımın profile endpoint, PR ve daha geniş assessment modeli sonraki aşamadır.

Canlı teknik örnek: public kod reposunda 4 dosya/4 kaynak/3 taslak; kişisel profile eklenmedi. Bu, gerçek adayın kimliğini veya sahipliğini doğrulama testi değildir.

Amaç: kişinin görünen projelerini anlamak ve gerçekten atfedilebilen becerileri CV'ye kaynak göstererek taşıyabilmek. “GitHub'ını iyice inceleme” ilk sürümde açık kapsam/coverage ile sınırlı derin analiz anlamındadır; tüm geçmişin tarandığı iddia edilmez.

## Toplama akışı

1. Kullanıcı public analiz için onay verir ve kendine ait olduğunu beyan ettiği username'i girer.
2. Profil ve en fazla 20 public repo metadata'sı alınır. Pagination sınırında taranmayan repo sayısı/kapsamı belirtilir.
3. Hedef role uygun, kullanıcı seçimi öncelikli en fazla 3 repo derin incelemeye alınır. Popülerlik belirleyici değildir; fork ve arşiv bilgisi saklanır.
4. README, manifestler (package.json/pyproject vb.), sınırlı dizin ağacı, en fazla 3 ilgili kaynak/test dosyası örneklenir. Generated/vendor/binary dosyalar dışlanır. Repo kodu çalıştırılmaz ve bütün repo clone edilmez.
5. Bütçe kaldığında kullanıcıya atfedilmiş public commit ve PR verisi alınır. README teknolojiyi anlatır; commit/diff kişisel katkıyı destekleyebilir. API'de sonuç olmaması katkı yokluğu değildir.
6. Gemini özetlenmiş olgular ve canonical kaynak referanslarından kanıtlı beceri taslakları çıkarır.
7. Kullanıcı gözlenen bulguyu, kendi katkısını ve CV maddesini onaylar/düzeltir. Onaylanmayan atıf CV'ye girmez.

GitHub veri alımı [repos](https://docs.github.com/en/rest/repos/repos), [contents](https://docs.github.com/en/rest/repos/contents), [commits](https://docs.github.com/en/rest/commits/commits) API'lerinden yapılabilir. Limitleri runtime header ve [resmî rate-limit rehberi](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) üzerinden kontrol et; sabit kapasite varsayma.

## Kanıtın neyi desteklediği

| Gözlem                                      | Güvenli çıkarım                          | Çıkarılamayacak sonuç                        |
| ------------------------------------------- | ---------------------------------------- | -------------------------------------------- |
| README “PyTorch” diyor                      | Projede PyTorch kullanıldığı belirtilmiş | Kullanıcı PyTorch uzmanı                     |
| Dil dağılımında Python var                  | Repo Python kaynakları içeriyor          | Dil yüzdesi kadar yetkinlik                  |
| Manifest + ilgili kaynak örneği             | Teknoloji kullanımının somut izi var     | Kullanıcı bütün kodu yazmış                  |
| Kullanıcıya bağlı commit/diff + ilgili kod  | Belirli teknik katkıya dair kanıt var    | Tek commit'ten tüm alan hâkimiyeti           |
| Aynı tür iş farklı projelerde atfedilebilir | Tekrarlanan uygulama deneyimi gözlenmiş  | Profesyonel deneyim yılı / sertifikalı uzman |
| Test/CI yapılandırması                      | Projede test/CI uygulaması görülmüş      | Bütün testler geçiyor / sistemi kişi kurmuş  |
| Fork repo                                   | Kaynak projeden türemiş çalışma          | Upstream kodu kullanıcının özgün eseri       |

Assessment `exposure`, `demonstrated`, `repeated`, `unknown` görünür bulgunun gücünü anlatır. “Uzman”, “senior”, “yıllarca deneyim” otomatik etiketlenmez. Kullanıcı kendi seviyesini yazarsa `self_reported` olarak saklanır; GitHub doğrulaması gibi sunulmaz.

## Katkı atfı

- Commit author'ın GitHub hesabına bağlı olması bir sinyaldir; commit metadata'sı tek başına kimlik/özgünlük garantisi değildir.
- Takım reposunda repo sahibinin bütün çalışmayı yaptığı kabul edilmez. Commit/diff, merged PR ve kullanıcının katkı açıklaması birlikte ele alınır.
- Bot/dependency update, generated kod ve büyük vendor import beceri kanıtı olarak kullanılmaz.
- Commit sayısından yıl, üretkenlik veya kalite puanı hesaplanmaz. PR sayısından liderlik çıkarılmaz.
- Kişiye bağlanamayan katkı “projede görülüyor, senin katkın teyit edilmeli” olarak kalır.
- Public events endpoint'i tüm kariyer geçmişini temsil etmez. API pagination ve tarih kapsamı UI'da belirtilir.

## Kanıt kartı örneği — temsili

“API geliştirme: projede bir endpoint ve buna ait test görülüyor. Kaynak: [server tarafından verilen dosya/commit referansı]. Katkı atfı: sınırlı. Bu kısmı sen mi geliştirdin?” Kullanıcı onayından sonra: “X projesinde API endpoint'i ve ilgili test üzerinde çalıştım.” Sonuç metriği, ölçek ve sahiplik kanıtlanmadıkça eklenmez.

Kart alanları: claim draft, observed fact, source link/commit SHA/path, attribution, assessment, caveat, approve/reject/edit. Profile confirmed skills ve CV bullets bu kart kimliklerine bağlıdır.

## Performans ve hata

Metadata cache, SHA tabanlı dosya cache'i ve küçültülmüş metin kullan. Rate-limit/403/404 için uyarı göster ve self-reported profil akışını sürdür. İncelenmiş repo sayısı, atfedilen katkı sayısı, kesilen dosya/taranmayan alanlar ve retrieval tarihi coverage içinde döner. Sonuçların kısmi olduğunu saklama.

M1'de kullanıcı seçtiği ek repolar ve PR diff derinliği; M2'de OAuth/private repo, açık izin ve silme tasarımı. İlk sürüm “tam GitHub kariyer analizi” diye pazarlanmaz.
