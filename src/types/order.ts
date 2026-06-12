export type OrderStatus = "draft" | "saved";

export interface Client {
  id: string;
  nombre: string;
  dni?: string;
  lugar?: string;
  telefono?: string;
  correo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FrequentProduct {
  id: string;
  descripcion: string;
  precioUnitario: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  descripcion: string;
  cantidad: number | "";
  precioUnitario: number | "";
}

export interface Order {
  id: string;
  fecha: string;
  clienteNombre: string;
  dni: string;
  lugar: string;
  telefono: string;
  correo: string;
  fechaEntrega: string;
  deliveredAt?: string;
  observaciones: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
