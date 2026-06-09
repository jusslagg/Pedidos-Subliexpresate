"use client";

import { fileSafeName } from "@/lib/calculations";
import { formatInputDate } from "@/lib/dates";
import type { Order } from "@/types/order";

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function yyyymmdd(value: string): string {
  return value.replaceAll("-", "");
}

function addDays(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function stamp(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function downloadDeliveryCalendar(order: Order): void {
  if (!order.fechaEntrega) {
    window.alert("Cargá la fecha de entrega antes de agregarlo al calendario.");
    return;
  }

  const client = order.clienteNombre || "Cliente";
  const summary = `Entrega Subliexpresate - ${client}`;
  const description = [
    `Cliente: ${client}`,
    order.telefono ? `Telefono: ${order.telefono}` : "",
    order.lugar ? `Lugar: ${order.lugar}` : "",
    order.items.length
      ? `Productos: ${order.items.map((item) => item.descripcion).filter(Boolean).join(" / ")}`
      : "",
    order.observaciones ? `Observaciones: ${order.observaciones}` : ""
  ]
    .filter(Boolean)
    .join("\\n");

  const start = yyyymmdd(order.fechaEntrega);
  const end = yyyymmdd(addDays(order.fechaEntrega, 1));
  const now = stamp();
  const uid = `${order.id}-${order.fechaEntrega}@subliexpresate`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Subliexpresate//Pedidos//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `CREATED:${now}`,
    `LAST-MODIFIED:${now}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(`Recordatorio de entrega para ${client}`)}`,
    "TRIGGER:-P2D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Entrega_${fileSafeName(client)}_${formatInputDate(order.fechaEntrega).replaceAll("-", "")}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
