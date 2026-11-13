import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NÖR — Diseño en Evolución | Pedidos",
  description: "Gestión simple de pedidos y presupuestos para NÖR — Diseño en Evolución.",
  manifest: "/manifest.webmanifest?v=nor-2",
  icons: {
    icon: "/favicon.png?v=nor-2",
    shortcut: "/favicon.png?v=nor-2",
    apple: "/apple-touch-icon.png?v=nor-2"
  },
  appleWebApp: {
    capable: true,
    title: "Pedidos",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1778b8"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
