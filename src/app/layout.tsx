import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subliexpresate | Pedidos",
  description: "Gestión simple de pedidos y presupuestos para Subliexpresate."
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
