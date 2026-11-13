import { todayInputValue } from "@/lib/dates";
import type { Order, OrderItem } from "@/types/order";

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createEmptyItem(): OrderItem {
  return {
    id: createId("item"),
    descripcion: "",
    cantidad: "",
    precioUnitario: "",
  };
}

export function nextQuoteNumber(orders: Order[]): string {
  const last = orders.reduce((max, order) => {
    const match = order.numero?.match(/^N[ÖO]R-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `NÖR-${String(last + 1).padStart(3, "0")}`;
}

export function quoteConditions(days: number, advance: number): string {
  return `El presupuesto tiene validez de ${days} días. Se requiere seña del ${advance}% para confirmar el pedido. Los precios corresponden a la cantidad y características detalladas.`;
}

export function createEmptyOrder(numero = "NÖR-001"): Order {
  const now = new Date().toISOString();

  return {
    id: createId("pedido"),
    numero,
    validezDias: 10,
    estadoPresupuesto: "Pendiente",
    descuento: 0,
    descuentoTipo: "percent",
    anticipoPorcentaje: 50,
    condiciones: quoteConditions(10, 50),
    empresa: {
      nombre: "NÖR — Diseño en Evolución",
      alias: "NOR.DISENO",
      titular: "NÖR Diseño en Evolución",
      formaPago: "Transferencia / Efectivo",
    },
    fecha: todayInputValue(),
    clienteNombre: "",
    dni: "",
    lugar: "",
    telefono: "",
    correo: "",
    fechaEntrega: "",
    observaciones: "",
    items: [createEmptyItem()],
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

export function touchOrder(order: Order): Order {
  return {
    ...order,
    updatedAt: new Date().toISOString(),
  };
}
