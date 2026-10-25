export const metadata = { title: "Next.js + PostgreSQL on SKYHOST" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "64px auto", padding: "0 16px" }}>{children}</body>
    </html>
  );
}
