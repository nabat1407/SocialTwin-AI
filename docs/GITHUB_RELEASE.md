# R01 — GitHub kaynak yayını

Hedef: [nabat1407/SocialTwin-AI](https://github.com/nabat1407/SocialTwin-AI).

SocialTwin AI, **Şahnabat Rüstəmova tərəfindən yayınlanır**. Takım geliştiricisi [Cavanshirpro](https://github.com/Cavanshirpro), projenin geliştirilmesine katkıda bulunmuştur. Rol kaydı [CONTRIBUTORS](../CONTRIBUTORS.md) içindedir.

## Hazırlanan içerik

- GPL-3.0-or-later tam metni: [LICENSE](../LICENSE). Paket metadata'sı ve README aynı lisansı belirtir. Lisans metnine geliştiricinin kişisel bilgileri eklenmez.
- README kurulum, açık demo/live ayrımı, gerçek ürün sınırları ve katkı atfını içerir.
- CI, Node 24 / pnpm 11.25.0 ile frozen install, typecheck, lint, test, format ve build çalıştırır. Gerçek API anahtarı kullanmaz.
- Noto Sans OFL bildirimi korunur; [üçüncü taraf bildirimleri](../THIRD_PARTY_NOTICES.md) eklenmiştir.
- `.env.local`, dependencies, build/cache/log/geçici dosyalar ve `release/` Git dışında tutulur. `presentation/` kaynakları yerelde korunur, yayın paketine dahil edilmez.

## Yayın işlemi

Bu çalışma kaynakları hazırlar; uzak depoya push yapmaz ve herhangi biri adına commit oluşturmaz. Yerel Git dalı `main`, `origin` hedef depoya bağlıdır. `release/SocialTwin-AI-source.zip`, `.git` veya commit kimliği içermeyen kaynak teslimidir.

Yayıncı kendi GitHub oturumuyla ZIP içeriğini depoya yükleyebilir. Git kullanacaksa commit öncesinde kendi `user.name` ve `user.email` ayarlarını kontrol eder; bu belgede kimlik/e-posta uydurulmaz. `git status --short` ve `git diff --cached` incelendikten sonra kaynak commit'i ve `git push -u origin main` yayıncı tarafından yapılabilir. Mevcut klasörde `.env.local` korunur ve commit edilmez.

Kaynak kod yayını canlı servis dağıtımı değildir. Katalog güncelliği, geniş AI doğruluk değerlendirmesi, auth ve dağıtık bütçe kontrolleri TODO'da açık kalır. CI'nin GitHub üzerinde geçtiği ancak ilk push sonrası doğrulanabilir.
