"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { fileSafeName } from "@/lib/calculations";
import { formatInputDate } from "@/lib/dates";
import { OrderPdfDocument } from "@/components/PdfDocument";
import type { Order } from "@/types/order";

export function PdfDownloadButton({ order }: { order: Order }) {
  const client = fileSafeName(order.clienteNombre || "Cliente");
  const fileDate = formatInputDate(order.fecha).replaceAll("-", "");
  const filename = `Pedido_${client}_${fileDate}.pdf`;

  return (
    <PDFDownloadLink
      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-coral px-4 text-sm font-bold text-white shadow-soft"
      document={<OrderPdfDocument order={order} />}
      fileName={filename}
    >
      {({ loading }) => (
        <>
          <Download size={18} />
          {loading ? "Preparando PDF" : "Descargar PDF"}
        </>
      )}
    </PDFDownloadLink>
  );
}
