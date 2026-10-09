import { PilotApp } from '@/components/pilot-app';
import { demoMode, liveEnabled } from '@/lib/server/gemini';

export const dynamic = 'force-dynamic';
// This shared layout preserves profile, matches and document edits when the
// user navigates between stages, including browser Back and Forward.
export default function PilotLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PilotApp mode={demoMode() ? 'fixture' : 'live'} liveReady={liveEnabled()} />
      {children}
    </>
  );
}
