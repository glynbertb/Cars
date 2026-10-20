import { Newsreader, Inter } from "next/font/google";
import "./globals.css";

const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--serif" });
const sans = Inter({ subsets: ["latin"], variable: "--sans" });

export const metadata = { title: "Spotlight – Cars & Motorcycles", description: "Selected machines, framed in light." };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
