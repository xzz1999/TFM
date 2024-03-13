import '@/app/components/global.css';
import { inter } from '@/app/components/fonts';
export const metadata = {
  title: "AI assistants",
  description: "Generated by create next app",
};
export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
       <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}   