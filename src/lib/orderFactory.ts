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
    precioUnitario: ""
  };
}

export function createEmptyOrder(): Order {
  const now = new Date().toISOString();

  return {
    id: createId("pedido"),
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
    updatedAt: now
  };
}

export function touchOrder(order: Order): Order {
  return {
    ...order,
    updatedAt: new Date().toISOString()
  };
}
