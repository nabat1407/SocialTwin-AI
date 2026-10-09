# Katkı rehberi

Yayıncı ve mevcut geliştirici katkıları [CONTRIBUTORS.md](CONTRIBUTORS.md) içinde belirtilir. Kod GPL-3.0-or-later altında sunulur; üçüncü taraf bileşenlerin bildirimleri korunur.

1. Depoyu fork edip küçük, tek amaçlı bir dal açın.
2. [README](README.md) üzerinden yerel kurulumu tamamlayın. Geliştirme agentleri [AGENTS.md](AGENTS.md) giriş kurallarını izlemelidir.
3. İlgili değişikliği uygulayın; gerçek ilan, deneyim veya başarı uydurmayın. Kullanıcı onayı, kanıt atfı ve deterministik hazırlık hesabını koruyun.
4. `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm format:check` ve `pnpm build` çalıştırın. AI değişikliklerinde ilgili doğruluk senaryolarını ayrıca değerlendirin.
5. Pull request'te problemi, değişen davranışı ve gerçekten çalıştırılan kontrolleri açıklayın.

API anahtarı, `.env.local`, ham CV veya kişisel kullanıcı verisi commit etmeyin. Canlı Gemini testleri ayrı opt-in ve API kotası gerektirir; CI bunları çalıştırmaz.
