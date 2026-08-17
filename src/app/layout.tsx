import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";

const sans    = Inter({ subsets: ["latin"], weight: ["300","400","500"], variable: "--font-sans" });
const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["300","400","600"], style: ["normal","italic"], variable: "--font-display" });
const heading = Bebas_Neue({ subsets: ["latin"], weight: ["400"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "FocusTM Admin",
  description: "FocusTM Collection — Admin Dashboard",
  robots: { index: false, follow: false },
};

const noFlashScript = `
try {
  var t = localStorage.getItem('ftm-theme');
  if (t === 'light') document.documentElement.classList.add('light');
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${heading.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: noFlashScript }} /></head>
      <body className="bg-ftm-black text-ftm-white font-sans antialiased font-light">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            style: { background: "rgb(var(--ftm-charcoal))", color: "rgb(var(--ftm-white))", border: "1px solid rgb(var(--ftm-line))", fontSize: "11px", letterSpacing: "0.08em" }
          }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
