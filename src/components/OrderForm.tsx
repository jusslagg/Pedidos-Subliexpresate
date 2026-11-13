"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { QuotePreview } from "@/components/QuotePreview";
import { CalendarButton } from "@/components/CalendarButton";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { formatARS, itemAmount, quoteTotals } from "@/lib/calculations";
import {
  createEmptyItem,
  createEmptyOrder,
  createId,
  quoteConditions,
  touchOrder,
} from "@/lib/orderFactory";
import { saveClient, saveOrder, saveProduct } from "@/lib/repository";
import type { Client, FrequentProduct, Order, OrderItem } from "@/types/order";

type Props = {
  nextNumber: string;
  order?: Order;
  clients: Client[];
  products: FrequentProduct[];
  onSaved: (order: Order) => void;
  onCancel: () => void;
};

export function OrderForm({
  order,
  nextNumber,
  clients,
  products,
  onSaved,
  onCancel,
}: Props) {
  const [current, setCurrent] = useState<Order>(
    () => order ?? createEmptyOrder(nextNumber),
  );
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const totals = quoteTotals(current);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const company = current.empresa ?? {
    nombre: "NÖR — Diseño en Evolución",
    alias: "",
    titular: "",
    formaPago: "Transferencia / Efectivo",
  };
  function updateField<K extends keyof Order>(field: K, value: Order[K]) {
    setCurrent((prev) => {
      const next = { ...prev, [field]: value };
      if (
        (field === "validezDias" || field === "anticipoPorcentaje") &&
        prev.condiciones ===
          quoteConditions(prev.validezDias ?? 10, prev.anticipoPorcentaje ?? 0)
      ) {
        next.condiciones = quoteConditions(
          next.validezDias ?? 10,
          next.anticipoPorcentaje ?? 0,
        );
      }
      return touchOrder(next);
    });
    setMessage("");
  }

  function updateItem(id: string, patch: Partial<OrderItem>) {
    setCurrent((prev) =>
      touchOrder({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      }),
    );
  }

  function applyClient(nombre: string) {
    updateField("clienteNombre", nombre);
    const found = clients.find(
      (client) => client.nombre.toLowerCase() === nombre.toLowerCase(),
    );
    if (!found) return;
    setCurrent((prev) =>
      touchOrder({
        ...prev,
        clienteNombre: found.nombre,
        lugar: found.lugar ?? "",
        telefono: found.telefono ?? "",
        correo: found.correo ?? "",
      }),
    );
  }

  function applyProduct(itemId: string, descripcion: string) {
    updateItem(itemId, { descripcion });
    const found = products.find(
      (product) =>
        product.descripcion.toLowerCase() === descripcion.toLowerCase(),
    );
    if (found)
      updateItem(itemId, {
        descripcion: found.descripcion,
        precioUnitario: found.precioUnitario,
      });
  }

  async function persist(status: Order["status"]) {
    const cleanItems = current.items.filter((item) => item.descripcion.trim());
    const validation = [
      !current.clienteNombre.trim() ? "Ingresa el nombre del cliente." : "",
      cleanItems.length === 0
        ? "Agrega al menos un producto con descripcion."
        : "",
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
        precioUnitario: Number(item.precioUnitario) || 0,
      })),
    });

    setSaving(true);
    try {
      await saveOrder(nextOrder);

      const now = new Date().toISOString();
      await saveClient({
        id: createId("cliente"),
        nombre: nextOrder.clienteNombre,
        lugar: nextOrder.lugar,
        telefono: nextOrder.telefono,
        correo: nextOrder.correo,
        createdAt: now,
        updatedAt: now,
      });

      await Promise.all(
        nextOrder.items.map((item) =>
          saveProduct({
            id: createId("producto"),
            descripcion: item.descripcion,
            precioUnitario: Number(item.precioUnitario) || 0,
            createdAt: now,
            updatedAt: now,
          }),
        ),
      );

      setCurrent(nextOrder);
      setErrors([]);
      setMessage(
        status === "draft" ? "Borrador guardado." : "Pedido guardado.",
      );
      await onSaved(nextOrder);
    } catch {
      setErrors(["No se pudo guardar. Intentá nuevamente."]);
    } finally {
      setSaving(false);
    }
  }

  function resetOrder(newIdentity: boolean) {
    if (
      !window.confirm(
        "¿Querés dejar el formulario en blanco? Los cambios sin guardar se perderán.",
      )
    )
      return;
    setCurrent((prev) => ({
      ...createEmptyOrder(nextNumber),
      ...(newIdentity
        ? {}
        : { id: prev.id, numero: prev.numero, createdAt: prev.createdAt }),
      empresa: company,
    }));
    setErrors([]);
    setMessage("");
  }
  return (
    <section className="quote-workspace">
      <div className="quote-editor">
        <header className="quote-editor-header">
          <div>
            <h1>{order ? "Editar presupuesto" : "Nuevo presupuesto"}</h1>
            <p>
              Completá los datos y mirá cómo queda el documento a la derecha.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="quote-small-button"
              aria-expanded={companyOpen}
              onClick={() => setCompanyOpen(!companyOpen)}
            >
              ⚙ Datos de la empresa
            </button>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cerrar"
              className="quote-close"
            >
              <X size={18} />
            </button>
          </div>
        </header>
        {companyOpen && (
          <div className="quote-item mb-5 grid gap-3">
            <h2>Datos de la empresa</h2>
            {(
              [
                ["nombre", "Nombre de la empresa"],
                ["alias", "Alias para transferencia"],
                ["titular", "A nombre de"],
                ["formaPago", "Forma de pago"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  className="input"
                  value={company[key]}
                  onChange={(e) =>
                    updateField("empresa", {
                      ...company,
                      [key]: e.target.value,
                    })
                  }
                />
              </Field>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void persist("saved");
          }}
        >
          <div className="quote-section">
            <div className="quote-section-title">
              <h2>Datos del presupuesto</h2>
              <span className="quote-status">
                {current.estadoPresupuesto ?? "Pendiente"}
              </span>
            </div>
            <div className="quote-data-grid">
              <Field label="Número">
                <input
                  className="input"
                  value={current.numero ?? ""}
                  placeholder="NÖR-002"
                  onChange={(e) => updateField("numero", e.target.value)}
                />
              </Field>
              <Field label="Fecha">
                <input
                  className="input"
                  type="date"
                  required
                  value={current.fecha}
                  onChange={(e) => updateField("fecha", e.target.value)}
                />
              </Field>
              <Field label="Entrega">
                <input
                  className="input"
                  type="date"
                  value={current.fechaEntrega}
                  onChange={(e) => updateField("fechaEntrega", e.target.value)}
                />
              </Field>
              <Field label="Validez (días)">
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={current.validezDias ?? 10}
                  onChange={(e) =>
                    updateField(
                      "validezDias",
                      Math.max(1, Number(e.target.value)),
                    )
                  }
                />
              </Field>
              <Field label="Estado">
                <select
                  className="input"
                  value={current.estadoPresupuesto ?? "Pendiente"}
                  onChange={(e) =>
                    updateField("estadoPresupuesto", e.target.value)
                  }
                >
                  {["Pendiente", "Aceptado", "Rechazado"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
          <div className="quote-section">
            <h2>Cliente</h2>
            <div className="grid gap-3">
              <Field label="Nombre del cliente *">
                <input
                  className="input"
                  required
                  list="clientes"
                  placeholder="Ej: Tienda Aurora"
                  value={current.clienteNombre}
                  onChange={(e) => applyClient(e.target.value)}
                />
                <datalist id="clientes">
                  {clients.map((c) => (
                    <option key={c.id} value={c.nombre} />
                  ))}
                </datalist>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Correo">
                  <input
                    className="input"
                    type="email"
                    placeholder="cliente@correo.com"
                    value={current.correo}
                    onChange={(e) => updateField("correo", e.target.value)}
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    className="input"
                    type="tel"
                    placeholder="+54 9…"
                    value={current.telefono}
                    onChange={(e) => updateField("telefono", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Lugar / entrega">
                <input
                  className="input"
                  placeholder="Retira en local"
                  value={current.lugar}
                  onChange={(e) => updateField("lugar", e.target.value)}
                />
              </Field>
            </div>
          </div>
          <div className="quote-section">
            <div className="quote-section-title">
              <h2>Ítems</h2>
              <button
                className="quote-add"
                type="button"
                onClick={() =>
                  updateField("items", [...current.items, createEmptyItem()])
                }
              >
                <Plus size={14} /> Agregar ítem
              </button>
            </div>
            <datalist id="productos">
              {products.map((p) => (
                <option key={p.id} value={p.descripcion} />
              ))}
            </datalist>
            <div className="space-y-3">
              {current.items.map((item, index) => (
                <div className="quote-item" key={item.id}>
                  <div className="quote-item-title">
                    <span>ÍTEM {index + 1}</span>
                    <strong>{formatARS(itemAmount(item))}</strong>
                  </div>
                  <div className="grid gap-3">
                    <Field label="Descripción">
                      <input
                        className="input"
                        list="productos"
                        placeholder="Descripción del producto"
                        value={item.descripcion}
                        onChange={(e) => applyProduct(item.id, e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Cantidad">
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="1"
                          value={item.cantidad}
                          onChange={(e) =>
                            updateItem(item.id, {
                              cantidad:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </Field>
                      <Field label="Precio unitario ARS">
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.precioUnitario}
                          onChange={(e) =>
                            updateItem(item.id, {
                              precioUnitario:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </Field>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      className="quote-small-button"
                      type="button"
                      onClick={() =>
                        updateField("items", [
                          ...current.items.slice(0, index + 1),
                          { ...item, id: createId("item") },
                          ...current.items.slice(index + 1),
                        ])
                      }
                    >
                      Duplicar
                    </button>
                    <button
                      className="quote-small-button text-red-600"
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm("¿Eliminar este producto del pedido?")
                        )
                          updateField(
                            "items",
                            current.items.length === 1
                              ? [createEmptyItem()]
                              : current.items.filter((i) => i.id !== item.id),
                          );
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="quote-section">
            <h2>Cálculos</h2>
            <div className="quote-calculations">
              <Field label="Descuento">
                <div className="flex gap-1">
                  {(["percent", "amount"] as const).map((type) => (
                    <button
                      className={
                        "quote-toggle " +
                        ((current.descuentoTipo ?? "percent") === type
                          ? "active"
                          : "")
                      }
                      aria-pressed={
                        (current.descuentoTipo ?? "percent") === type
                      }
                      key={type}
                      type="button"
                      onClick={() => updateField("descuentoTipo", type)}
                    >
                      {type === "percent" ? "%" : "$"}
                    </button>
                  ))}
                  <input
                    aria-label="Valor del descuento"
                    className="input"
                    type="number"
                    min="0"
                    max={current.descuentoTipo === "amount" ? undefined : 100}
                    step="0.01"
                    value={current.descuento ?? 0}
                    onChange={(e) =>
                      updateField(
                        "descuento",
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                  />
                </div>
              </Field>
              <Field label="Anticipo / seña (%)">
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={current.anticipoPorcentaje ?? 0}
                  onChange={(e) =>
                    updateField(
                      "anticipoPorcentaje",
                      Math.min(100, Math.max(0, Number(e.target.value))),
                    )
                  }
                />
              </Field>
              <div className="quote-live-total">
                <span>TOTAL EN VIVO</span>
                <strong>{formatARS(totals.total)}</strong>
                <small>
                  Seña {formatARS(totals.advance)} · Saldo{" "}
                  {formatARS(totals.balance)}
                </small>
              </div>
            </div>
          </div>
          <div className="quote-section">
            <Field label="Observaciones">
              <textarea
                className="input"
                rows={3}
                placeholder="Detalles, colores, medidas, plazos…"
                value={current.observaciones}
                onChange={(e) => updateField("observaciones", e.target.value)}
              />
            </Field>
          </div>
          <div className="quote-section">
            <Field label="Notas / condiciones">
              <textarea
                className="input"
                rows={3}
                value={current.condiciones ?? ""}
                onChange={(e) => updateField("condiciones", e.target.value)}
              />
            </Field>
          </div>
          {errors.length > 0 && (
            <div className="mb-3 text-sm text-red-700" role="alert">
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
          {message && (
            <p role="status" className="mb-3 text-sm text-emerald-700">
              {message}
            </p>
          )}
          <div className="quote-actions">
            <button type="submit" className="quote-primary" disabled={saving}>
              {saving ? "Guardando…" : "Guardar presupuesto"}
            </button>
            <button
              type="button"
              className="quote-small-button"
              disabled={saving}
              onClick={() => resetOrder(true)}
            >
              Nuevo en blanco
            </button>
            <button
              type="button"
              className="quote-small-button"
              disabled={saving}
              onClick={() => resetOrder(false)}
            >
              Limpiar
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              className="quote-small-button"
              disabled={saving}
              onClick={() => void persist("draft")}
            >
              Guardar borrador
            </button>
            <PdfDownloadButton order={current} />
            <CalendarButton order={current} />
          </div>
        </form>
      </div>
      <aside
        className="quote-preview-pane"
        aria-label="Vista previa del presupuesto"
      >
        <QuotePreview order={current} />
      </aside>
    </section>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="quote-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
