import './globals.css';
import Header from '@/components/layout/Header';
import Toaster from '@/components/ui/Toaster';
import { AppStateProvider } from '@/lib/store';

export const metadata = {
  title: 'ByteFX — Economic Calendar',
  description:
    'Track market-moving economic releases, central bank decisions and the data that drives global markets.',
};

/* Applied before paint so a dark-mode visitor never sees a light flash. */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('bytefx-theme');
    if (stored === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://flagcdn.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-app text-ink">
        <AppStateProvider>
          <Header />
          {/* clip (not hidden) keeps sticky positioning working inside */}
          <main className="[overflow-x:clip]">{children}</main>
          <Toaster />
        </AppStateProvider>
      </body>
    </html>
  );
}
