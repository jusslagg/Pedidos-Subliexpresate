"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { sortByDateDesc } from "@/lib/dates";
import type { Client, FrequentProduct, Order } from "@/types/order";

type StoreShape = {
  orders: Order[];
  clients: Client[];
  products: FrequentProduct[];
};

const STORAGE_KEY = "subliexpresate_store_v1";

const emptyStore: StoreShape = {
  orders: [],
  clients: [],
  products: []
};

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined";
}

function readStore(): StoreShape {
  if (!canUseBrowserStorage()) return emptyStore;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyStore;
  try {
    return { ...emptyStore, ...JSON.parse(raw) };
  } catch {
    return emptyStore;
  }
}

function writeStore(store: StoreShape): void {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

async function listCollection<T>(name: string): Promise<T[]> {
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, name), orderBy("updatedAt", "desc")));
  return snapshot.docs.map((item) => item.data() as T);
}

async function saveCollectionDoc<T extends { id: string }>(name: string, value: T): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, name, value.id), value);
}

async function deleteCollectionDoc(name: string, id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, name, id));
}

export async function listOrders(): Promise<Order[]> {
  if (isFirebaseConfigured) return sortByDateDesc(await listCollection<Order>("orders"));
  return sortByDateDesc(readStore().orders);
}

export async function saveOrder(order: Order): Promise<void> {
  if (isFirebaseConfigured) {
    await saveCollectionDoc("orders", order);
    return;
  }
  const store = readStore();
  store.orders = [order, ...store.orders.filter((item) => item.id !== order.id)];
  writeStore(store);
}

export async function deleteOrder(id: string): Promise<void> {
  if (isFirebaseConfigured) {
    await deleteCollectionDoc("orders", id);
    return;
  }
  const store = readStore();
  store.orders = store.orders.filter((item) => item.id !== id);
  writeStore(store);
}

export async function listClients(): Promise<Client[]> {
  if (isFirebaseConfigured) return listCollection<Client>("clients");
  return readStore().clients.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function saveClient(client: Client): Promise<void> {
  if (isFirebaseConfigured) {
    await saveCollectionDoc("clients", client);
    return;
  }
  const store = readStore();
  store.clients = [client, ...store.clients.filter((item) => item.id !== client.id)];
  writeStore(store);
}

export async function deleteClient(id: string): Promise<void> {
  if (isFirebaseConfigured) {
    await deleteCollectionDoc("clients", id);
    return;
  }
  const store = readStore();
  store.clients = store.clients.filter((item) => item.id !== id);
  writeStore(store);
}

export async function listProducts(): Promise<FrequentProduct[]> {
  if (isFirebaseConfigured) return listCollection<FrequentProduct>("products");
  return readStore().products.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
}

export async function saveProduct(product: FrequentProduct): Promise<void> {
  if (isFirebaseConfigured) {
    await saveCollectionDoc("products", product);
    return;
  }
  const store = readStore();
  store.products = [product, ...store.products.filter((item) => item.id !== product.id)];
  writeStore(store);
}

export async function deleteProduct(id: string): Promise<void> {
  if (isFirebaseConfigured) {
    await deleteCollectionDoc("products", id);
    return;
  }
  const store = readStore();
  store.products = store.products.filter((item) => item.id !== id);
  writeStore(store);
}
