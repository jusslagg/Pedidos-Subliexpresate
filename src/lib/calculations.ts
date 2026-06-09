import type { OrderItem } from "@/types/order";

export function itemAmount(item: OrderItem): number {
  return sanitizeNumber(item.cantidad) * sanitizeNumber(item.precioUnitario);
}

export function subtotal(items: OrderItem[]): number {
  return items.reduce((total, item) => total + itemAmount(item), 0);
}

export function total(items: OrderItem[]): number {
  return subtotal(items);
}

export function sanitizeNumber(value: number | ""): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

export function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2
  }).format(value || 0);
}

export function fileSafeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}
