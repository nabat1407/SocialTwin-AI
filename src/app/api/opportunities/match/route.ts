import { z } from 'zod';
import { profileSchema } from '@/lib/schemas';
import { fixtureOpportunities } from '@/lib/fixtures';
import { matchFixtures } from '@/lib/scoring';
import { demoMode } from '@/lib/server/gemini';
import { failure, readBody, RequestError, success } from '@/lib/server/http';
import catalog from '../../../../../data/opportunities.json';
import { catalogSchema } from '@/lib/catalog-schema';
import { matchCatalog } from '@/lib/server/matching';

export async function POST(request: Request) {
  try {
    const { profile } = await readBody(request, z.object({ profile: profileSchema }).strict());
    if (!profile.confirmed_at || !profile.claims.some((c) => c.user_approved))
      throw new RequestError(
        'PROFILE_NOT_CONFIRMED',
        'Əvvəlcə profilinizi və ən azı bir təcrübə maddəsini təsdiqləyin.',
      );
    catalogSchema.parse(catalog);
    const result = demoMode()
      ? {
          matches: matchFixtures(profile, fixtureOpportunities),
          excluded_matches: [],
          catalog_count: fixtureOpportunities.length,
        }
      : await matchCatalog(profile);
    return success({
      mode: demoMode() ? 'fixture' : 'live',
      ...result,
      catalog_status: demoMode()
        ? 'synthetic_examples'
        : result.catalog_count
          ? 'verified_catalog'
          : 'empty_verified_catalog',
    });
  } catch (error) {
    return failure(error);
  }
}
