import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "FilingPulse — Real-Time Form D Alerts",
  description:
    "Monitor SEC Form D filings in real-time. Set custom alert rules for SIC codes, geographies, offering sizes, and specific companies or persons. Get notified within minutes.",
  keywords: "SEC, Form D, EDGAR, filing alerts, venture capital, private offerings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
