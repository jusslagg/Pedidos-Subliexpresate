import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subliexpresate | Pedidos",
  description: "Gestion simple de pedidos y presupuestos para Subliexpresate.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/icon-192.png"
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
