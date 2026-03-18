import { Providers } from "./providers";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTopLoader color="#7c3aed" showSpinner={false} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
