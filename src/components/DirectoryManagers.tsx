"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { createId } from "@/lib/orderFactory";
import { saveClient, saveProduct } from "@/lib/repository";
import { formatARS } from "@/lib/calculations";
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
            placeholder="Teléfono"
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
      <List items={clients.map((client) => [client.nombre, client.telefono || client.correo || ""])} />
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
            placeholder="Descripción"
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
        items={products.map((product) => [
          product.descripcion,
          formatARS(product.precioUnitario)
        ])}
      />
    </section>
  );
}

function List({ items }: { items: string[][] }) {
  return (
    <div className="mt-4 space-y-2">
      {items.map(([title, detail]) => (
        <div key={`${title}-${detail}`} className="rounded-lg bg-white px-4 py-3 shadow-soft">
          <p className="font-black text-brand-ink">{title}</p>
          {detail ? <p className="text-sm text-slate-600">{detail}</p> : null}
        </div>
      ))}
      {!items.length ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-500">
          Todavía no hay datos guardados.
        </div>
      ) : null}
    </div>
  );
}
