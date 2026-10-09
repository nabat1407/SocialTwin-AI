import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { OpportunityDashboard } from '../src/components/opportunity-dashboard';
import { catalogSchema } from '../src/lib/catalog-schema';
import { scoreRows } from '../src/lib/scoring';
import type { Profile } from '../src/lib/schemas';
import catalogData from '../data/opportunities.json';

afterEach(() => vi.useRealTimers());

it('renders the urgent cutoff warning and removes the card once its deadline expires', () => {
  const opportunity = catalogSchema.parse(catalogData)[0];
  if (opportunity.deadline.kind !== 'fixed_datetime') throw new Error('Expected a timed cutoff');
  const cutoff = Date.parse(opportunity.deadline.instant);
  const profile: Profile = {
    id: 'synthetic',
    revision: 1,
    locale: 'az',
    name: '',
    education: '',
    skills: [],
    target_role: null,
    claims: [],
    missing_information: [],
    confirmed_at: null,
  };
  const match = {
    opportunity,
    ...scoreRows(
      opportunity,
      opportunity.requirements.map((requirement) => ({
        requirement_id: requirement.id,
        status: 'unknown' as const,
        rationale: 'Məlumat yoxdur.',
        profile_field_refs: [],
      })),
    ),
  };
  const render = () =>
    renderToStaticMarkup(
      createElement(OpportunityDashboard, {
        profile,
        matches: [match],
        excludedMatches: [],
        saved: [],
        catalogCount: 1,
        status: 'ready',
        fixture: false,
        busy: false,
        onSavedChange: () => {},
        onEdit: () => {},
        onRetry: () => {},
        onGenerate: () => {},
      }),
    );
  vi.useFakeTimers();
  vi.setSystemTime(cutoff - 3 * 3600000);
  expect(render()).toContain('class="deadline-alert urgent" role="status"');
  expect(render()).toContain('Vaxt bitir! 3 saat qalır');
  vi.setSystemTime(cutoff);
  expect(render()).not.toContain('<article');
  expect(render()).not.toContain(opportunity.name);
});
