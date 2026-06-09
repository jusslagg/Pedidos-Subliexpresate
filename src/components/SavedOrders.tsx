"use client";

import { Edit3, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { formatARS, total } from "@/lib/calculations";
import { formatInputDate } from "@/lib/dates";
import { deleteOrder } from "@/lib/repository";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import type { Order } from "@/types/order";

type Props = {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDeleted: () => void;
};

export function SavedOrders({ orders, onEdit, onDeleted }: Props) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter((order) =>
        order.clienteNombre.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [orders, search]
  );

  return (
    <section className="mx-auto max-w-3xl px-4 py-5">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-brand-ink">Pedidos guardados</h1>
        <p className="mt-1 text-sm text-slate-600">Buscá, editá y volvé a generar el PDF.</p>
      </div>
      <div className="mb-4 flex h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
        <Search size={20} className="text-slate-400" />
        <input
          className="h-full min-w-0 flex-1 outline-none"
          placeholder="Buscar por cliente"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((order) => (
          <article key={order.id} className="rounded-lg bg-white p-4 shadow-soft">
            <button
              className="w-full text-left"
              type="button"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-brand-ink">{order.clienteNombre}</h2>
                  <p className="text-sm text-slate-600">
                    {formatInputDate(order.fecha)} · {order.items.length} producto(s)
                  </p>
                </div>
                <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black text-brand-ink">
                  {formatARS(total(order.items))}
                </span>
              </div>
            </button>

            {expanded === order.id ? (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    <strong>DNI:</strong> {order.dni || "-"}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {order.telefono || "-"}
                  </p>
                  <p>
                    <strong>Entrega:</strong> {formatInputDate(order.fechaEntrega) || "-"}
                  </p>
                </div>
                <div className="mt-4 grid gap-2">
                  <button
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white"
                    type="button"
                    onClick={() => onEdit(order)}
                  >
                    <Edit3 size={18} />
                    Editar
                  </button>
                  <PdfDownloadButton order={order} />
                  <button
                    className="flex h-12 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-bold text-red-600"
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("¿Borrar este pedido guardado?")) return;
                      await deleteOrder(order.id);
                      onDeleted();
                    }}
                  >
                    <Trash2 size={18} />
                    Borrar
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        ))}
        {!filtered.length ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-500">
            No hay pedidos para mostrar.
          </div>
        ) : null}
      </div>
    </section>
  );
}
