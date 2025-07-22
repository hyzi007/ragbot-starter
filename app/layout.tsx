import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata = {
  title: "eBot",
  description: "eBot - Powered by DataStax and Vercel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
