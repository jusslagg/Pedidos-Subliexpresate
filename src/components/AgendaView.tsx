"use client";

import { CalendarDays, Edit3, PackageCheck } from "lucide-react";
import { useMemo } from "react";
import { CalendarButton } from "@/components/CalendarButton";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { formatInputDate } from "@/lib/dates";
import type { Order } from "@/types/order";

type Props = {
  orders: Order[];
  onEdit: (order: Order) => void;
};

type Group = {
  date: string;
  label: string;
  tone: string;
  orders: Order[];
};

export function AgendaView({ orders, onEdit }: Props) {
  const groups = useMemo(() => buildGroups(orders), [orders]);
  const pendingCount = groups.reduce((sum, group) => sum + group.orders.length, 0);
  const unitCount = groups.reduce(
    (sum, group) => sum + group.orders.reduce((inner, order) => inner + orderUnits(order), 0),
    0
  );

  return (
    <section className="mx-auto max-w-3xl px-4 py-5">
      <div className="mb-4">
        <p className="text-xs font-black uppercase text-brand-blue">Trabajo por entrega</p>
        <h1 className="text-2xl font-black text-brand-ink">Agenda</h1>
        <p className="mt-1 text-sm text-slate-600">
          Pedidos ordenados por fecha de entrega y cantidad de productos.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <SummaryCard label="Pedidos" value={String(pendingCount)} />
        <SummaryCard label="Unidades" value={String(unitCount)} />
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.date} className="space-y-3">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-soft backdrop-blur">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-brand-blue" />
                <div>
                  <h2 className="text-sm font-black text-brand-ink">{group.label}</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    {group.orders.length} pedido(s)
                  </p>
                </div>
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${group.tone}`}>
                {group.date ? formatInputDate(group.date) : "Sin fecha"}
              </span>
            </div>

            {group.orders.map((order) => (
              <article key={order.id} className="rounded-lg bg-white p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-brand-ink">
                      {order.clienteNombre || "Sin cliente"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {order.lugar || "Sin lugar"} {order.telefono ? `- ${order.telefono}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-lg bg-brand-ink px-3 py-2 text-center text-white">
                    <p className="text-lg font-black leading-none">{orderUnits(order)}</p>
                    <p className="mt-1 text-[0.65rem] font-bold uppercase">unid.</p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                    <PackageCheck size={15} />
                    Productos
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 text-sm text-slate-700"
                      >
                        <span className="min-w-0 flex-1">{item.descripcion || "Sin descripcion"}</span>
                        <span className="font-black text-brand-ink">x{item.cantidad || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.observaciones ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                    {order.observaciones}
                  </p>
                ) : null}

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <button
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white"
                    type="button"
                    onClick={() => onEdit(order)}
                  >
                    <Edit3 size={18} />
                    Editar
                  </button>
                  <PdfDownloadButton order={order} />
                  <CalendarButton order={order} />
                </div>
              </article>
            ))}
          </section>
        ))}

        {!groups.length ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-500">
            No hay pedidos con fecha de entrega para mostrar.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-soft">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-brand-ink">{value}</p>
    </div>
  );
}

function buildGroups(orders: Order[]): Group[] {
  const agendaOrders = [...orders]
    .filter((order) => order.fechaEntrega)
    .sort((a, b) => {
      const dateDiff = a.fechaEntrega.localeCompare(b.fechaEntrega);
      return dateDiff || b.updatedAt.localeCompare(a.updatedAt);
    });

  const map = new Map<string, Order[]>();
  agendaOrders.forEach((order) => {
    const current = map.get(order.fechaEntrega) ?? [];
    current.push(order);
    map.set(order.fechaEntrega, current);
  });

  return Array.from(map.entries()).map(([date, items]) => ({
    date,
    label: dateLabel(date),
    tone: dateTone(date),
    orders: items.sort((a, b) => orderUnits(b) - orderUnits(a))
  }));
}

function orderUnits(order: Order): number {
  return order.items.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);
}

function dateLabel(date: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) return "Atrasados";
  if (date === today) return "Para hoy";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date === tomorrow.toISOString().slice(0, 10)) return "Para manana";

  return "Proximas entregas";
}

function dateTone(date: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) return "bg-red-50 text-red-700";
  if (date === today) return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}
