# Gemini model ve bütçe politikası

Kontrol tarihi: 2026-10-09. Model listesi ve gerçek API çağrıları yapıldı. Yerel aktif profil/comparison/yazım modeli `gemini-3.5-flash-lite`; üç AZ/TR/EN CV-only, injection, dört comparison ve seçili gerçek paket örneği geçti. `gemini-3.8-flash` listede bulundu fakat üretim denemeleri 503/25 sn timeout verdi. Liste erişimi üretim başarısı garantisi değildir. Aşağıdaki ilk routing önerisi tüm aşamalarda uygulanmadı; [TEST_RESULTS](TEST_RESULTS.md) ölçülen sonuçları içerir.

## Abonelik ayrımı

Kullanıcı Gemini Plus aboneliği olduğunu belirtti. Bu adı Pro/Ultra olarak yeniden yorumlama. Google'ın geliştirici açıklaması Pro/Ultra'nın AI Studio arayüzündeki faydalarını anlatır; dış uygulamadaki API anahtarı kullanımının ayrı yönetildiğini belirtir. Bu nedenle Plus'tan API kotası, ücretsiz kullanım veya Pro erişimi varsayılmaz. Gerçek proje erişimini AI Studio'da kontrol et. [Resmî Google AI plans](https://ai.google.dev/gemini-api/docs/google-ai-plans), [API billing](https://ai.google.dev/gemini-api/docs/billing).

## İlk seçim ve routing önerisi

| İş | Önerilen aday | Gerekçe |
| --- | --- | --- |
| Profil JSON çıkarma | gemini-3.5-flash-lite | Basit extraction için düşük maliyet/latency adayı |
| GitHub kanıt yorumlama | gemini-3.8-flash | Daha dikkatli çıkarım/atıf gerektiren iş |
| Gereksinim karşılaştırma | gemini-3.8-flash | Belirsizlik ve kanıt ilişkileri |
| CV/resume + mektup + plan | gemini-3.8-flash | Ana ürün çıktısının yazım ve tutarlılığı |

Bu model ID'leri resmî model listesinde stable olarak bulunuyor. Yeni proje için eski 2.5 serisini varsayılan yapma; resmî liste erişim kısıtlarını açıklıyor. [Model listesi](https://ai.google.dev/gemini-api/docs/models). Flash'ın structured output ve function calling desteği bulunuyor; thinking ayarını seçilen model/SDK ile doğrula. [Flash model kartı](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash).

Tek modelle daha hızlı kurulum gerekiyorsa bütün aşamalar önce Flash ile yapılır; Lite routing ancak kalite eşdeğerliği görüldüğünde açılır. Flash erişilemiyorsa Lite tüm aşamalar için kontrollü fallback adayıdır; eval geçmeden etkinleştirilmez. Pro preview P0'ın bağımlılığı değildir; daha pahalı/güçlü model doğruluk kapılarının yerini tutmaz.

## Konfigürasyon önerisi

Sunucu environment: GEMINI_API_KEY, GEMINI_MODEL_PROFILE, GEMINI_MODEL_ANALYSIS, GEMINI_MODEL_WRITING, GEMINI_MODEL_FALLBACK, GITHUB_TOKEN optional, DEMO_MODE, MAX_REQUEST_COST_USD. Anahtar hiçbir NEXT_PUBLIC değişkeninde tutulmaz. Model ID'leri tek config dosyasından yönetilir, UI hardcode etmez.

## Seçim kapısı

T01'de erişim ve küçük structured JSON smoke test; T08'de en az üç ana senaryo ve adversarial örnekler. Ölç: şema başarısı, doğru id/atıf, desteklenmeyen iddia sayısı, dil kalitesi, toplam süre, input/output/thinking token ve gerçek maliyet. En ucuz model yalnız kabul ölçütleri sağlanıyorsa seçilir. Preview/latest alias değişikliğinde eval tekrar çalışır.

## Maliyet

Yerel çalışan profile/comparison/writing konfigürasyonu `gemini-3.5-flash-lite`. Comparison küçük canlı dört senaryoda doğrulandı; otomatik model fallback yok. Yeni senaryo/model geçişi geniş eval gerektirir; güncel sonuçlar TEST_RESULTS'dadır.

2026-10-09 pricing snapshot: Flash input $0.75/1M, output $3.75/1M (2026 sonuna kadar belirtilen oran); Lite input $0.30/1M, output $2.50/1M. Güncel oranlar uygulama sırasında yeniden kontrol edilir. [Resmî fiyatlandırma](https://ai.google.dev/gemini-api/docs/pricing).

Örnek hesap, gerçekleşmiş ölçüm değildir: toplam 16.000 input ve 4.000 output token'lık tüm-Flash paket yaklaşık `16000/1e6×0.75 + 4000/1e6×3.75 = $0.027`. Retry, ek thinking/output, ücretli grounding ve hosting bu varsayımda yoktur. Normal request maliyet hedefi ≤ $0.05; günlük bütçe kullanıcı belirlemeden ücretli kullanım açılmaz. Cloud bütçe uyarısı hard spending limit varsayılmaz; uygulama request/token/concurrency sınırı uygular.

Gerçek kişisel CV verisi göndermeden önce veri kullanım koşulları kontrol edilir. Ücretsiz/ücretli katmanların veri kullanım farkı pricing'de belirtilir; demo için sentetik veya açık izinli veriler kullan. Hiçbir katman “sınırsız API” diye sunulmaz.
