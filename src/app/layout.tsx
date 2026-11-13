import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "N?R ? Dise?o en Evoluci?n | Pedidos",
  description: "Gestion simple de pedidos y presupuestos para N?R ? Dise?o en Evoluci?n.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/nor-icon.svg",
    shortcut: "/nor-icon.svg",
    apple: "/nor-logo.jpg"
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
