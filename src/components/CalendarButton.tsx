"use client";

import { CalendarPlus } from "lucide-react";
import { downloadDeliveryCalendar } from "@/lib/calendar";
import type { Order } from "@/types/order";

export function CalendarButton({ order }: { order: Order }) {
  return (
    <button
      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-teal px-4 text-sm font-bold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
      type="button"
      disabled={!order.fechaEntrega}
      onClick={() => downloadDeliveryCalendar(order)}
      title={!order.fechaEntrega ? "Cargá una fecha de entrega" : "Agregar entrega al calendario"}
    >
      <CalendarPlus size={18} />
      Calendario
    </button>
  );
}
