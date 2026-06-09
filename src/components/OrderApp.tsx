"use client";

import { Boxes, FilePlus2, Home, PackagePlus, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { ClientsManager, ProductsManager } from "@/components/DirectoryManagers";
import { OrderForm } from "@/components/OrderForm";
import { PinGate } from "@/components/PinGate";
import { SavedOrders } from "@/components/SavedOrders";
import { isFirebaseConfigured } from "@/lib/firebase";
import { listClients, listOrders, listProducts } from "@/lib/repository";
import type { Client, FrequentProduct, Order } from "@/types/order";

type View = "home" | "new" | "orders" | "clients" | "products";

export function OrderApp() {
  const [view, setView] = useState<View>("home");
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<FrequentProduct[]>([]);
  const [editing, setEditing] = useState<Order | undefined>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [nextOrders, nextClients, nextProducts] = await Promise.all([
      listOrders(),
      listClients(),
      listProducts()
    ]);
    setOrders(nextOrders);
    setClients(dedupeByName(nextClients));
    setProducts(dedupeProducts(nextProducts));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PinGate>
      <main className="min-h-screen pb-20">
        {view === "home" ? (
          <HomeScreen
            loading={loading}
            storageLabel={isFirebaseConfigured ? "Firebase conectado" : "Modo local"}
            onNavigate={(nextView) => {
              setEditing(undefined);
              setView(nextView);
            }}
          />
        ) : null}

        {view === "new" ? (
          <OrderForm
            key={editing?.id ?? "new"}
            order={editing}
            clients={clients}
            products={products}
            onCancel={() => {
              setEditing(undefined);
              setView("home");
            }}
            onSaved={async () => {
              await refresh();
            }}
          />
        ) : null}

        {view === "orders" ? (
          <SavedOrders
            orders={orders}
            onDeleted={refresh}
            onEdit={(order) => {
              setEditing(order);
              setView("new");
            }}
          />
        ) : null}

        {view === "clients" ? <ClientsManager clients={clients} onChanged={refresh} /> : null}
        {view === "products" ? <ProductsManager products={products} onChanged={refresh} /> : null}

        {view !== "home" ? <BottomNav active={view} onNavigate={setView} /> : null}
      </main>
    </PinGate>
  );
}

function HomeScreen({
  loading,
  storageLabel,
  onNavigate
}: {
  loading: boolean;
  storageLabel: string;
  onNavigate: (view: View) => void;
}) {
  const actions = [
    { label: "Nuevo pedido", view: "new" as View, icon: FilePlus2, color: "bg-brand-blue" },
    { label: "Pedidos guardados", view: "orders" as View, icon: Boxes, color: "bg-brand-ink" },
    { label: "Clientes", view: "clients" as View, icon: UsersRound, color: "bg-brand-teal" },
    { label: "Productos frecuentes", view: "products" as View, icon: PackagePlus, color: "bg-brand-gold" }
  ];

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8">
      <header className="mb-8 pt-3">
        <BrandLogo />
        <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-soft">
          <span className="text-sm font-bold text-slate-700">{storageLabel}</span>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
      </header>

      <div className="grid flex-1 content-start gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.view}
              className="flex min-h-24 items-center gap-4 rounded-lg bg-white p-4 text-left shadow-soft transition active:scale-[0.99]"
              type="button"
              onClick={() => onNavigate(action.view)}
            >
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-white ${action.color}`}>
                <Icon size={28} />
              </span>
              <span className="text-xl font-black text-brand-ink">{action.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? <p className="mt-4 text-center text-sm font-semibold text-slate-500">Cargando datos...</p> : null}
    </section>
  );
}

function BottomNav({ active, onNavigate }: { active: View; onNavigate: (view: View) => void }) {
  const items = [
    { view: "home" as View, icon: Home, label: "Inicio" },
    { view: "new" as View, icon: FilePlus2, label: "Pedido" },
    { view: "orders" as View, icon: Boxes, label: "Guardados" }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid h-16 max-w-3xl grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          const selected = active === item.view;
          return (
            <button
              key={item.view}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-bold ${
                selected ? "text-brand-blue" : "text-slate-500"
              }`}
              type="button"
              onClick={() => onNavigate(item.view)}
            >
              <Icon size={21} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function dedupeByName(clients: Client[]): Client[] {
  const seen = new Set<string>();
  return clients.filter((client) => {
    const key = client.nombre.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeProducts(products: FrequentProduct[]): FrequentProduct[] {
  const seen = new Set<string>();
  return products.filter((product) => {
    const key = product.descripcion.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
