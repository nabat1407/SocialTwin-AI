# Tool tasarımı ve sınırları

## Çalışan yeni HTTP araçları — prototype-v3

- `POST /api/github/repositories`: `{username, consent:true}`; sadece public endpoint, ilk 20 owner/public repo, 8 sn/1 istek, 15 dk bounded process cache. OAuth/private token yok.
- `POST /api/github/analyze`: `{username,consent:true,repositories:[1–3 full_name],locale}`; liste allowlist'i, 18 sn network budget, en fazla 24 ek istek; her repoda 2 context + 2 kaynak dosyası, 1 hesaba bağlanan commit/2 patch örneği. Dosya 40 KB, response 1 MB, snippet 3000/patch 2000 karakter. Repo kodu çalıştırılmaz. AI ayrıca 25 sn/2 attempt budget alır. Sonuç coverage/warnings/evidence/claims; kişi katkısı kullanıcı onayı bekler.
- GitHub `retry-after`/`x-ratelimit-reset` header'ıyla cooldown ve Bakı reset zamanı. Scope/cache process-local, dağıtık limit değil. Redirect takip edilmez; sabit API host + doğrulanmış repo/path/SHA.
- `POST /api/coach`: confirmed profile + approved claims, selected active opportunity veya null, `review|interview|roadmap`, isteğe bağlı document/question/answer. Beş interview question veya 4–5 roadmap task; ID validator, stale/cutoff recheck. Practice answer qualification kaynağı sayılmaz.
- Matching: tüm aktif adaylar, en fazla 3 record/24 requirement batch, 3 worker; failed IDs/partial uyarı. Provider çağrısı 25 sn/2 attempt; frontend match/GitHub 55 sn, coach 30 sn bekler.

- POST /api/export: {text≤20000,name≤120,locale:az/tr/en,kind:resume/cv/letter/plan,template:modern/classic,approved:true,demo:boolean}; strict Zod, same-origin/40KB/shared rate limit, no-store PDF attachment. AI/network/kalıcı dosya yok. Noto Sans embed; desteklenmeyen glyph 400 + print önerisi. Deploy trace fontları next.config.ts'de.

Başvuru/e-posta gönderme, private repo erişimi ve ücretli servis etkinleştirme bu araçlarda yoktur.

İyi sistem promptu kadar iyi tool sözleşmesi gerekir. Prompt izin denetimi değildir; her giriş, erişim ve çıkış uygulama kodunda kontrol edilir. Profil extraction, verified katalog, comparison/scoring, paket yazımı ve TXT/print domain akışı uygulandı. Aşağıdaki GitHub servisleri ve genel function-calling hedefleri henüz yok; model recursive tool kullanmaz.

## MVP yürütme modeli

Orchestrator hangi adapter'ın hangi sırada çağrılacağını kodla belirler. Gemini'ye bütün tool'ları serbestçe verip interneti dolaştırmak yerine küçük ve kontrollü veri paketleri gönderilir. Function calling gelecekte eklenirse aynı sözleşmeler kullanılabilir; model tool çağrısı talep eder, sunucu doğrular ve yürütür. [Gemini function calling rehberi](https://ai.google.dev/gemini-api/docs/function-calling).

## Allowlist sözleşmeleri

| Tool/servis                              | Girdi                                                  | Çıktı                                                          | Kontrol / erişim                                                                        |
| ---------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| get_public_github_profile                | username                                               | canonical user id/login/url                                    | Username formatı; yalnız api.github.com public read                                     |
| list_public_repositories                 | username, cursor nullable, max_repos ≤20               | repo IDs, owner, fork/archive, metadata, next_cursor, coverage | Page sınırı; toplam request bütçesi; private sonuç reddi                                |
| read_repository_evidence                 | owner, repo, commit_sha, allowed_paths[]               | text snippets, canonical source URLs, truncation               | Repo önce seçim allowlist'inde; ≤3 repo; dosya/response boyut sınırı; kod çalıştırılmaz |
| get_attributed_contributions             | username, allowed_repo_ids[], range, limit             | commits/PRs, attribution flags, partial coverage               | Public ve bounded; author/account bağı dikkatle kontrol                                 |
| list_verified_opportunities              | category[], locale/location preferences                | fresh/open verified katalog kayıtları                          | Kaynak yerel katalog; LLM verified statüsü atayamaz                                     |
| compare_requirements (domain service)    | approved profile revision, evidence IDs, candidate IDs | checked comparison rows                                        | Gemini JSON ardından semantik validator; sayısal puan modelden alınmaz                  |
| calculate_readiness (pure function)      | validated rows                                         | M/N, unknown count, readiness, eligibility                     | DATA_CONTRACTS formülü; sıfır payda güvenli                                             |
| build_application_draft (domain service) | approved claims, selected opportunity nullable, locale | checked package                                                | Hedef mode kontrolü, claim referansları, deadline validasyonu                           |
| export_approved_document                 | session document, format `txt/print/pdf`                   | sanitized download/print view                                  | Belge onayı; güncel edit biçimlenir, HTML/JS çalıştırılmaz                    |

Gemini ile çalışan domain servisleri modelin kendisine recursive tool olarak verilmez. Pure scoring araç çağrısı yerine normal kod olabilir. Profil extraction doğrudan aşama çağrısıdır.

## Girdi/çıktı kuralları

- Tool JSON schema: dar tipler, required alanlar, enum'lar, makul maxLength/maxItems ve mümkün olduğunda unknown field reddi. Kullanılan Gemini schema alt kümesi SDK'da doğrulanır.
- Tool result: data, source_refs, retrieved_at, coverage, warnings, error nullable. Boş veri ile başarısız ağ çağrısı farklıdır.
- En fazla 25 GitHub HTTP isteği/analiz; toplam süre ARCHITECTURE bütçesinde. Tool-calling sürümü eklenirse en fazla 6 tool turn; limit sonrası partial sonuç veya açık hata, sonsuz döngü yok.
- Redirect'ler yeni host/özel IP'ye geçirilemez. Kullanıcının yazdığı rastgele URL server fetch'e doğrudan gönderilmez. GitHub path ve kaynak kimliklerinden canonical endpoint oluşturulur.
- Evidence locator/URL sunucu tarafından üretilir. Model URL üretmez; yalnız ID referansı döndürür.
- HTTP timeout, 404, 403/429, malformed body, oversized file ve permission failure ortak error kodlarıyla döner. Fallback başarısız veriyi başarılıymış gibi göstermez.

## Yetki sınırları

P0 yalnız public read'dir. Public username kullanıcının hesabı olduğu iddiasını doğrulamaz; kullanıcı katkıları CV'ye eklemeden onaylar. Sunucu GitHub token'ı varsa yalnız public veri için kullanılmalıdır; geniş yetkili kişisel token tercih edilmez. Private repo, write, başvuru gönderme, e-posta, shell/code execution ve ödeme tools'u allowlist dışındadır.

Paket taslağı oluşturma kullanıcı isteği kapsamındadır. Export kullanıcının açık UI işlemiyle olur. Gelecekte dış yan etkisi olan tool ayrı izin ve audit kaydı ister; geçmiş profil analizi izni buna taşınmaz.

## Test gereksinimi

Her tool için bir başarılı örnek, invalid input, izin dışı kaynak ve timeout/partial örneği. Domain servislerinde yanlış ID, hayalî kaynak, reddedilmiş claim ve yanlış deadline çıktısının kodla engellenmesi gerekir. Mock tool davranışı gerçek GitHub erişimi doğrulaması yerine geçmez.

