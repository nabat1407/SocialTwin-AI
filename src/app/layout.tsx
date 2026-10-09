import type { Metadata } from 'next';
import './globals.css';
import './dashboard.css';
import './features.css';
import './workspace-ui.css';

export const metadata: Metadata = {
  title: 'SocialTwin AI — Smart Life, Smart Opportunities.',
  description:
    'Smart Life, Smart Opportunities. Təcrübəni tanı, uyğun imkanları tap və professional CV ilə hazırlaş.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  );
}
