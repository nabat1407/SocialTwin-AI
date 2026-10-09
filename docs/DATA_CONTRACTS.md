# Veri sözleşmeleri ve deterministik analiz

## Çalışan prototype-v3 ekleri

Kod doğruluğu için `src/lib/schemas.ts`, `catalog-schema.ts`, `github-contracts.ts`, `coach-contracts.ts` esas alınır. Aşağıdaki v1 hedeflerinin tümü implementasyon değildir.

- Profile claims en çok 20; optional kaynaklar canonical GitHub blob/commit linki, immutable sample ID/path/observed fact ve `limited|linked_commit` attribution taşır. Profil/claim onayı ayrı; GitHub absence beceri yokluğu değildir. Extraction eğitim ve kaynak-bağlı dilleri, ayrıca kaynakta açık araç kullanım/bilgi cümlelerini (max4, exact statement) review kuyruğuna ekler; otomatik approve etmez. Learning/negative/substring source anchor'ı genel semantik doğrulama değildir.
- Contact email/phone/website optional metadata'dır. Writer'a candidate facts olarak taşınmaz; çıktıda kodla header olur.
- Resume/CV `section` enum'u summary/education/experience/projects/skills/languages/research/publications/awards/volunteering. Legacy draft için optional, live writer validator'ında mandatory. Her entry approved claim_ids taşır; sayısal candidate facts o exact kaynakta bulunmalı.
- Opportunity optional `writing_policy`: standard/own_words/disclose_ai. Katalog kaynağı ve cutoff yine sunucudan gelir. Paket policy metadata taşır.
- Matching `analyzed_count`, `failed_opportunity_ids`, `warnings` ekleyebilir. Failed batch öneri veya fabricated score değildir. M/N formülü değişmedi.
- GitHub result: evidence, claim drafts, coverage (repos/files/linked commits/request count/partial/retrieval), warnings. Public review session/profile hakkında imzalı sahiplik sertifikası değildir.
- Coach result: summary, questions (claim/requirement IDs), improvements (claim IDs), missing information, deliverable priorities (existing requirement ID veya null); profile_revision eşleşir. Practice answer confirmed profile'e yazılmaz.

Sürüm: `v1-draft`. Bu belge implementasyon için tek şema kaynağıdır. TypeScript tipleri ve runtime schema daha sonra buradan türetilecek; aşağıdaki metin henüz çalışır validator değildir. Tarihler ISO biçiminde, kimlikler stabil ve ilişkiler sunucuda doğrulanır.

## Çalışan prototipin kapsamı — prototype-v2

Çalışan profil education metni/skills/self-reported claims ve opsiyonel interests, languages, location, eligibility_notes, opportunity_types alanlarıdır. Türler internship/scholarship/job/grant. Tam education/experience/evidence nesneleri henüz yok. CV/resume ayrı entry dizileri ve claim_ids taşır; tam section yapısı sonraki adımdır. Package profile_revision, opportunity_id ve sunucudan kaynak URL/kurum/deadline metadata'sını taşır. Comparison profile_field_refs education/eligibility_notes/skills.i/languages.i/interests.i/onaylı claims.ID olabilir. Met VE unmet en az bir kaynak gerektirir; non-preference için interests referansı reddedilir. Duplicate/uydurma IDs, eksik requirement, readiness/evidence coverage ve blocker kodla kontrol edilir. Dört resmî kaynaklı kayıtla live matching ve seçili fırsat yazımı açıktır. Bu dar prototip, aşağıdaki tam ürün sözleşmesi tamamlandı anlamına gelmez.

## Temel nesneler

| Nesne              | Zorunlu alanlar ve semantik                                                                                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile            | id, revision, locale, target_role, opportunity_types[], education[], experiences[], skills[], preferences, confirmed_at nullable                                                                                             |
| Skill              | id, label, provenance `self_reported/observed/user_confirmed`, evidence_ids[], assessment `unknown/exposure/demonstrated/repeated`, user_approved boolean                                                                    |
| Experience         | id, type `employment/internship/project/education/other`, title, organization nullable, start/end nullable, claims[]                                                                                                         |
| Claim              | id, text, basis `self_reported/github_evidence`, evidence_ids[], user_approved; metric nullable ve yalnız kullanıcı onayıyla                                                                                                 |
| Evidence           | id, kind `profile_text/repo_file/commit/pull_request`, source_url nullable, repo nullable, commit_sha nullable, locator nullable, observed_fact, attribution `unverified/limited/corroborated`, retrieved_at, user_confirmed |
| GitHubAnalysis     | username, repositories_scanned[], evidence[], skill_drafts[], coverage, warnings[], retrieved_at                                                                                                                             |
| Opportunity        | id, name, organization, category, location, work_mode, source_url, verified_at, verification_status, deadline, requirements[], source_excerpt, catalog_version                                                               |
| Requirement        | id, label, kind `eligibility/skill/document/preference`, mandatory boolean, criterion, source_locator                                                                                                                        |
| ComparisonRow      | requirement_id, status `met/unmet/unknown`, rationale, evidence_ids[], profile_field_refs[], missing_information[]                                                                                                           |
| Match              | opportunity_id, profile_revision, rows[], eligibility_status, score, blocking_requirement_ids[], uncertainties[]                                                                                                             |
| ApplicationPackage | id, mode `opportunity/cv_only`, opportunity_id nullable, profile_revision, locale, resume, cv, letter nullable, action_plan[], cv_suggestions[], missing_information[], provenance                                           |

Profile `target_role` bilinmiyorsa null olabilir; fırsat eşleştirmesinde kullanıcıya sorulur, CV-only temel taslak çalışabilir. Preferences lokasyon, remote seçimi, uygunluk bilgileri ve günlük hazırlanma zamanı gibi ilgili alanları içerir; doğum tarihi, fotoğraf, aile durumu veya hassas özellikler varsayılan alınmaz.

Evidence `source_url` yalnız profile_text için null olabilir; bu durumda profile_field_ref/locator gereklidir. GitHub kaynakları sunucunun döndürdüğü canonical bağlantılardır. Kullanıcı onayı gözlenen olguyu “GitHub tarafından sertifikalı” hale getirmez.

## Deadline ve statüler

`verification_status = verified | pending | rejected`. Deadline ayrı nesnedir:

```json
{
  "kind": "fixed_date",
  "date": "2026-10-25",
  "time": null,
  "timezone": null,
  "source_text": "Application deadline: 25 October 2026"
}
```

`kind = fixed_date | fixed_datetime | rolling | unknown`. Örnek deadline temsili olup gerçek ilan değildir. `fixed_datetime` için time + IANA timezone zorunludur. Date-only deadline'ın saatini uydurma. Deadline günü timezone/saat bilinmiyorsa cutoff belirsiz uyarısı göster; garantiyle açık sayma. Tarih geçen kayıt expired olur. Rolling için tarih yaratma; action plan kullanıcı hedef tarihini kullanır. Unknown deadline öneriye alınmaz. Effective availability kodda `open | uncertain | expired` hesaplanır.

UI: expired → 🔴; pending/rejected/stale/uncertain → 🟡 açıklamalı; yalnız verified + fresh + open → 🟢. Rejected kayıt kullanıcı kataloğunda önerilmez. Freshness politikası OPPORTUNITY_CATALOG'dadır.

## Skor

Bir fırsatın kaynakta ayrı belirtilmiş ve normalize edilmiş tüm requirements satırları sayılır. Aynı gereksinim yeniden adlandırılarak iki kez sayılmaz; eşdeğer/alternatif koşullar tek mantıksal requirement olur. Açık belgeler ve preferred kriterler dahilse UI sayımı açıklamalıdır.

```text
N = toplam requirement satırı
M = met sayısı
U = unmet sayısı
K = unknown sayısı
N = M + U + K
readiness = N > 0 ? round(100 × M / N) : null
evidence_coverage = N > 0 ? round(100 × (M + U) / N) : null
```

UI: “3/5 gereksinim karşılanıyor; 1 bilinmiyor”. Unknown paydada kalır ama “yok” diye işaretlenmez. N=0 için yüzde yok; veri eksik ilan önerilmez. Bu skor kabul/işe alınma ihtimali değildir. CV-only skor üretmez.

Eligibility: mandatory eligibility unmet → `ineligible`; hiç böyle unmet yok ve mandatory eligibility unknown → `needs_clarification`; aksi → `eligible`. Mandatory skill/document eksikleri blocker olarak ayrıca gösterilir, uygunlukla aynı kavram değildir. Ineligible kartlar Top 3'e alınmaz; açıklaması isteğe bağlı ayrı görünür. Needs_clarification “uygunluğu teyit et” etiketiyle gösterilir, kesin uygun diye sunulmaz.

Çalışan sıralama kodda: eligible önce needs_clarification, readiness azalan, kullanıcı ilgi/hedef metni ile katalog tag literal eşlemesi, stabil id. Kullanıcı ayrıca deadline sırasını seçebilir; ineligible önerilere alınmaz. Lokasyon ağırlığı hedef mimaridir, uygulanmış sayılmaz. Met üretmek için en az bir destekleyici profil/kanıt referansı gerekir; çelişki varsa unknown ve onay isteği.

## Belge alt nesneleri

Resume/CV: summary + sections[{heading, entries[{text, claim_ids, evidence_ids}]}]. Dışa aktarılan içerik yalnız onaylı iddiaları içerir; düzenleme görünümünde provenance saklanır. Letter: paragraphs[] + claim_refs[]; fırsatsız modda null. CV önerileri üç öğe: mevcut sorun, önerilen değişiklik, ilgili requirement_id nullable, gerekli bilgi/kanıt.

ActionStep: id, title, reason, deliverable, estimated_minutes, due_date nullable, requirement_ids[], dependencies[], feasibility_note nullable. Sabit deadline'dan sonraki adım reddedilir. Rolling/unknown için tarih kullanıcı hedefi olmadan null. 4–5 adım tek günlük gerçek zaman bütçesine sığmıyorsa azaltılmış acil plan ve yetişmeyecek gereksinim uyarısı verilir; birkaç günde uzmanlık edinme vaat edilmez.

## API envelope ve ilişki kontrolü

```json
{
  "ok": true,
  "schema_version": "v1",
  "trace_id": "opaque-id",
  "data": {},
  "warnings": [],
  "provenance": {
    "mode": "live",
    "model_id": "configured-model",
    "prompt_version": "pilot-v1",
    "catalog_version": "catalog-version"
  }
}
```

`provenance.mode = live | fixture | cached`. Cached sonuç orijinal live/fixture kaynağını ayrıca saklar. Hata envelope: ok=false, error{code,message,retryable}, trace_id; kişisel/provider debug içeriği yok.

Sunucu kontrolleri: unknown ID yok; her requirement tam bir kez; evidence IDs mevcut ve session/profile revizyonuyla ilişkili; returned opportunity input allowlist içinde; gerekli onaylar var; deadline/statü AI tarafından değişmemiş; puan koddan; export iddiaları approved. İzin verilen enum dışı cevap, kesilmiş JSON ve boş zorunlu alan reddedilir.

## U03 belge export sözleşmesi

`export-contracts.ts` dar HTTP sözleşmesini tanımlar: güncel kullanıcı edit'i, locale, dört document kind, iki template, `approved:true` ve demo flag. `/api/export` AI facts üretmez veya yeniden validate etmiş gibi etiketlemez; kullanıcı belge doğruluk onayını verir. Paket/claim/source şemaları değişmedi. Plan formatı mevcut action_plan alanlarını kullanır. PDF/TXT/preview aynı metindir; demo PDF dosyada açık etiket taşır.
