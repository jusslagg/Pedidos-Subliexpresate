"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatARS } from "@/lib/calculations";
import { createId } from "@/lib/orderFactory";
import { deleteClient, deleteProduct, saveClient, saveProduct } from "@/lib/repository";
import type { Client, FrequentProduct } from "@/types/order";

export function ClientsManager({
  clients,
  onChanged
}: {
  clients: Client[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <section className="mx-auto max-w-3xl px-4 py-5">
      <h1 className="text-2xl font-black text-brand-ink">Clientes</h1>
      <div className="mt-4 rounded-lg bg-white p-4 shadow-soft">
        <div className="grid gap-3">
          <input
            className="input"
            placeholder="Nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="input"
            placeholder="Telefono"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white"
            type="button"
            onClick={async () => {
              if (!name.trim()) return;
              const now = new Date().toISOString();
              await saveClient({
                id: createId("cliente"),
                nombre: name.trim(),
                telefono: phone.trim(),
                createdAt: now,
                updatedAt: now
              });
              setName("");
              setPhone("");
              onChanged();
            }}
          >
            <Plus size={18} />
            Guardar cliente
          </button>
        </div>
      </div>
      <List
        items={clients.map((client) => ({
          id: client.id,
          title: client.nombre,
          detail: client.telefono || client.correo || "",
          deleteLabel: "Borrar cliente"
        }))}
        emptyLabel="Todavia no hay clientes guardados."
        onDelete={async (id) => {
          if (!window.confirm("Borrar este cliente frecuente?")) return;
          await deleteClient(id);
          onChanged();
        }}
      />
    </section>
  );
}

export function ProductsManager({
  products,
  onChanged
}: {
  products: FrequentProduct[];
  onChanged: () => void;
}) {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  return (
    <section className="mx-auto max-w-3xl px-4 py-5">
      <h1 className="text-2xl font-black text-brand-ink">Productos frecuentes</h1>
      <div className="mt-4 rounded-lg bg-white p-4 shadow-soft">
        <div className="grid gap-3">
          <input
            className="input"
            placeholder="Descripcion"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <input
            className="input"
            inputMode="decimal"
            placeholder="Precio ARS"
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white"
            type="button"
            onClick={async () => {
              if (!description.trim()) return;
              const now = new Date().toISOString();
              await saveProduct({
                id: createId("producto"),
                descripcion: description.trim(),
                precioUnitario: Number(price) || 0,
                createdAt: now,
                updatedAt: now
              });
              setDescription("");
              setPrice("");
              onChanged();
            }}
          >
            <Plus size={18} />
            Guardar producto
          </button>
        </div>
      </div>
      <List
        items={products.map((product) => ({
          id: product.id,
          title: product.descripcion,
          detail: formatARS(product.precioUnitario),
          deleteLabel: "Borrar producto"
        }))}
        emptyLabel="Todavia no hay productos guardados."
        onDelete={async (id) => {
          if (!window.confirm("Borrar este producto frecuente?")) return;
          await deleteProduct(id);
          onChanged();
        }}
      />
    </section>
  );
}

type ListItem = {
  id: string;
  title: string;
  detail: string;
  deleteLabel: string;
};

function List({
  items,
  emptyLabel,
  onDelete
}: {
  items: ListItem[];
  emptyLabel: string;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="mt-4 space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 shadow-soft"
        >
          <div className="min-w-0">
            <p className="truncate font-black text-brand-ink">{item.title}</p>
            {item.detail ? <p className="truncate text-sm text-slate-600">{item.detail}</p> : null}
          </div>
          <button
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600"
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label={item.deleteLabel}
            title={item.deleteLabel}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      {!items.length ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-500">
          {emptyLabel}
        </div>
      ) : null}
    </div>
  );
}
