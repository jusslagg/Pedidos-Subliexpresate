"use client";

import { Plus, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CalendarButton } from "@/components/CalendarButton";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { formatARS, itemAmount, subtotal, total } from "@/lib/calculations";
import { createEmptyItem, createEmptyOrder, createId, touchOrder } from "@/lib/orderFactory";
import { saveClient, saveOrder, saveProduct } from "@/lib/repository";
import type { Client, FrequentProduct, Order, OrderItem } from "@/types/order";

type Props = {
  order?: Order;
  clients: Client[];
  products: FrequentProduct[];
  onSaved: (order: Order) => void;
  onCancel: () => void;
};

export function OrderForm({ order, clients, products, onSaved, onCancel }: Props) {
  const [current, setCurrent] = useState<Order>(() => order ?? createEmptyOrder());
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const totals = useMemo(
    () => ({
      subtotal: subtotal(current.items),
      total: total(current.items)
    }),
    [current.items]
  );
  const hasProductValues = current.items.some(
    (item) => item.descripcion.trim() || item.cantidad !== "" || item.precioUnitario !== ""
  );

  function updateField<K extends keyof Order>(field: K, value: Order[K]) {
    setCurrent((prev) => touchOrder({ ...prev, [field]: value }));
    setMessage("");
  }

  function updateItem(id: string, patch: Partial<OrderItem>) {
    setCurrent((prev) =>
      touchOrder({
        ...prev,
        items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item))
      })
    );
  }

  function applyClient(nombre: string) {
    updateField("clienteNombre", nombre);
    const found = clients.find((client) => client.nombre.toLowerCase() === nombre.toLowerCase());
    if (!found) return;
    setCurrent((prev) =>
      touchOrder({
        ...prev,
        clienteNombre: found.nombre,
        lugar: found.lugar ?? "",
        telefono: found.telefono ?? "",
        correo: found.correo ?? ""
      })
    );
  }

  function applyProduct(itemId: string, descripcion: string) {
    updateItem(itemId, { descripcion });
    const found = products.find(
      (product) => product.descripcion.toLowerCase() === descripcion.toLowerCase()
    );
    if (found) updateItem(itemId, { descripcion: found.descripcion, precioUnitario: found.precioUnitario });
  }

  async function persist(status: Order["status"]) {
    const cleanItems = current.items.filter((item) => item.descripcion.trim());
    const validation = [
      !current.clienteNombre.trim() ? "Ingresa el nombre del cliente." : "",
      cleanItems.length === 0 ? "Agrega al menos un producto con descripcion." : ""
    ].filter(Boolean);

    if (validation.length) {
      setErrors(validation);
      return;
    }

    const nextOrder = touchOrder({
      ...current,
      status,
      items: cleanItems.map((item) => ({
        ...item,
        cantidad: Number(item.cantidad) || 0,
        precioUnitario: Number(item.precioUnitario) || 0
      }))
    });

    await saveOrder(nextOrder);

    const now = new Date().toISOString();
    await saveClient({
      id: createId("cliente"),
      nombre: nextOrder.clienteNombre,
      lugar: nextOrder.lugar,
      telefono: nextOrder.telefono,
      correo: nextOrder.correo,
      createdAt: now,
      updatedAt: now
    });

    await Promise.all(
      nextOrder.items.map((item) =>
        saveProduct({
          id: createId("producto"),
          descripcion: item.descripcion,
          precioUnitario: Number(item.precioUnitario) || 0,
          createdAt: now,
          updatedAt: now
        })
      )
    );

    setCurrent(nextOrder);
    setErrors([]);
    setMessage(status === "draft" ? "Borrador guardado." : "Pedido guardado.");
    onSaved(nextOrder);
  }

  return (
    <section className="pb-24">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-brand-blue">Pedido</p>
            <h1 className="text-xl font-black text-brand-ink">
              {order ? "Editar pedido" : "Nuevo pedido"}
            </h1>
          </div>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white"
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Fecha">
            <input
              className="input"
              type="date"
              value={current.fecha}
              onChange={(event) => updateField("fecha", event.target.value)}
            />
          </Field>
          <Field label="Fecha de entrega">
            <input
              className="input"
              type="date"
              value={current.fechaEntrega}
              onChange={(event) => updateField("fechaEntrega", event.target.value)}
            />
          </Field>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-soft">
          <h2 className="mb-4 text-base font-black text-brand-ink">Datos del cliente</h2>
          <div className="grid gap-3">
            <Field label="Nombre del cliente">
              <input
                className="input"
                list="clientes"
                placeholder="Ej: Maria Gonzalez"
                value={current.clienteNombre}
                onChange={(event) => applyClient(event.target.value)}
              />
              <datalist id="clientes">
                {clients.map((client) => (
                  <option key={client.id} value={client.nombre} />
                ))}
              </datalist>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Telefono">
                <input
                  className="input"
                  inputMode="tel"
                  placeholder="Ej: 11 2345 6789"
                  value={current.telefono}
                  onChange={(event) => updateField("telefono", event.target.value)}
                />
              </Field>
              <Field label="Correo">
                <input
                  className="input"
                  type="email"
                  placeholder="Ej: cliente@email.com"
                  value={current.correo}
                  onChange={(event) => updateField("correo", event.target.value)}
                />
              </Field>
            </div>
            <Field label="Lugar / localidad">
              <input
                className="input"
                placeholder="Ej: Quilmes"
                value={current.lugar}
                onChange={(event) => updateField("lugar", event.target.value)}
              />
            </Field>
            <Field label="Observaciones">
              <textarea
                className="input min-h-24 resize-y py-3"
                placeholder="Ej: Retira por local, colores, medidas o detalles del trabajo"
                value={current.observaciones}
                onChange={(event) => updateField("observaciones", event.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-brand-ink">Productos</h2>
            <button
              className="flex h-11 items-center gap-2 rounded-lg bg-brand-blue px-3 text-sm font-bold text-white"
              type="button"
              onClick={() =>
                setCurrent((prev) => touchOrder({ ...prev, items: [...prev.items, createEmptyItem()] }))
              }
            >
              <Plus size={18} />
              Agregar
            </button>
          </div>

          <datalist id="productos">
            {products.map((product) => (
              <option key={product.id} value={product.descripcion} />
            ))}
          </datalist>

          <div className="space-y-3">
            {current.items.map((item, index) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-700">Producto {index + 1}</span>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600"
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Eliminar este producto del pedido?")) return;
                      setCurrent((prev) =>
                        touchOrder({
                          ...prev,
                          items:
                            prev.items.length === 1
                              ? [createEmptyItem()]
                              : prev.items.filter((row) => row.id !== item.id)
                        })
                      );
                    }}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="grid gap-3">
                  <Field label="Descripcion">
                    <input
                      className="input"
                      list="productos"
                      placeholder="Ej: Remera sublimada talle M"
                      value={item.descripcion}
                      onChange={(event) => applyProduct(item.id, event.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Cantidad">
                      <input
                        className="input"
                        inputMode="decimal"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Ej: 2"
                        value={item.cantidad}
                        onChange={(event) =>
                          updateItem(item.id, {
                            cantidad: event.target.value === "" ? "" : Number(event.target.value)
                          })
                        }
                      />
                    </Field>
                    <Field label="Precio unitario">
                      <input
                        className="input"
                        inputMode="decimal"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ej: 4500"
                        value={item.precioUnitario}
                        onChange={(event) =>
                          updateItem(item.id, {
                            precioUnitario: event.target.value === "" ? "" : Number(event.target.value)
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-right text-sm font-black text-brand-ink">
                    Monto:{" "}
                    {item.cantidad !== "" && item.precioUnitario !== "" ? formatARS(itemAmount(item)) : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4">
            <div className="flex justify-between text-sm font-semibold text-slate-600">
              <span>Subtotal</span>
              <span>{hasProductValues ? formatARS(totals.subtotal) : ""}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-brand-ink">
              <span>Total</span>
              <span>{hasProductValues ? formatARS(totals.total) : ""}</span>
            </div>
          </div>
        </div>

        {errors.length ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-4">
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-brand-ink"
            type="button"
            onClick={() => persist("draft")}
          >
            <Save size={18} />
            Borrador
          </button>
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-ink px-4 text-sm font-bold text-white"
            type="button"
            onClick={() => persist("saved")}
          >
            <Save size={18} />
            Guardar
          </button>
          <PdfDownloadButton order={current} />
          <CalendarButton order={current} />
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase text-slate-500">{label}</span>
      {children}
    </label>
  );
}
