import type { Order, OrderItem } from "@/types/order";

export function itemAmount(item: OrderItem): number {
  return sanitizeNumber(item.cantidad) * sanitizeNumber(item.precioUnitario);
}

export function subtotal(items: OrderItem[]): number {
  return items.reduce((total, item) => total + itemAmount(item), 0);
}

export function total(items: OrderItem[], order?: Order): number {
  const base = subtotal(items);
  const value = sanitizeNumber(order?.descuento ?? 0);
  return Math.max(
    0,
    base -
      (order?.descuentoTipo === "amount"
        ? value
        : (base * Math.min(100, value)) / 100),
  );
}

export function quoteTotals(order: Order) {
  const base = subtotal(order.items);
  const amount = total(order.items, order);
  const advance =
    (amount * Math.min(100, sanitizeNumber(order.anticipoPorcentaje ?? 0))) /
    100;
  return {
    subtotal: base,
    discount: base - amount,
    total: amount,
    advance,
    balance: amount - advance,
  };
}

export function sanitizeNumber(value: number | ""): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

export function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
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
