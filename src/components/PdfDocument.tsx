import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatARS, itemAmount, subtotal, total } from "@/lib/calculations";
import { formatInputDate } from "@/lib/dates";
import type { Order, OrderItem } from "@/types/order";

const styles = StyleSheet.create({
  page: {
    padding: 26,
    fontSize: 9,
    color: "#000000",
    fontFamily: "Helvetica"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10
  },
  logo: {
    width: 210,
    height: 84,
    objectFit: "contain"
  },
  dateBox: {
    flexDirection: "row",
    gap: 24,
    marginTop: 8,
    fontWeight: 700
  },
  centered: {
    textAlign: "center",
    fontWeight: 700,
    marginBottom: 8
  },
  grid: {
    gap: 5,
    marginBottom: 8
  },
  row: {
    flexDirection: "row"
  },
  label: {
    fontWeight: 700
  },
  half: {
    width: "50%"
  },
  title: {
    textAlign: "center",
    fontWeight: 700,
    marginTop: 5,
    marginBottom: 2
  },
  table: {
    borderTop: "1px solid #000000",
    borderLeft: "1px solid #000000"
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 18
  },
  headCell: {
    backgroundColor: "#2f80bd",
    color: "#000000",
    textAlign: "center",
    borderRight: "1px solid #000000",
    borderBottom: "1px solid #000000",
    paddingVertical: 3,
    fontSize: 8
  },
  cell: {
    borderRight: "1px solid #000000",
    borderBottom: "1px solid #000000",
    padding: 3
  },
  desc: {
    width: "53%"
  },
  qty: {
    width: "12%",
    textAlign: "center"
  },
  price: {
    width: "17%"
  },
  amount: {
    width: "18%"
  },
  totals: {
    marginLeft: "65%",
    borderLeft: "1px solid #000000"
  },
  totalLabel: {
    width: "50%",
    padding: 5,
    borderRight: "1px solid #000000",
    borderBottom: "1px solid #000000",
    textAlign: "center"
  },
  finalLabel: {
    width: "50%",
    padding: 6,
    borderRight: "1px solid #000000",
    borderBottom: "1px solid #000000",
    backgroundColor: "#2f80bd",
    fontWeight: 700,
    textAlign: "center"
  },
  totalValue: {
    width: "50%",
    padding: 5,
    borderRight: "1px solid #000000",
    borderBottom: "1px solid #000000",
    textAlign: "center"
  },
  notes: {
    marginTop: 10,
    fontSize: 8
  }
});

export function OrderPdfDocument({ order }: { order: Order }) {
  const visibleItems = order.items.filter(
    (item) => item.descripcion.trim() || item.cantidad !== "" || item.precioUnitario !== ""
  );
  const rows: Array<OrderItem | undefined> = [
    ...visibleItems,
    ...Array.from<OrderItem | undefined>({ length: Math.max(0, 16 - visibleItems.length) })
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/subliepresate.png" style={styles.logo} />
          </View>
          <View style={styles.dateBox}>
            <Text>Fecha</Text>
            <Text>{formatInputDate(order.fecha)}</Text>
          </View>
        </View>

        <Text style={styles.centered}>NOMBRE DEL CLIENTE: {order.clienteNombre}</Text>

        <View style={styles.grid}>
          <View style={styles.row}>
            <Text style={[styles.half, styles.label]}>DNI: {order.dni}</Text>
            <Text style={[styles.half, styles.label]}>CORREO: {order.correo}</Text>
          </View>
          <Text style={styles.label}>LUGAR: {order.lugar}</Text>
          <Text style={styles.label}>TELEFONO: {order.telefono}</Text>
          <Text style={styles.label}>Fecha de entrega: {formatInputDate(order.fechaEntrega)}</Text>
        </View>

        <Text style={styles.title}>Presupuesto</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.headCell, styles.desc]}>DESCRIPCION</Text>
            <Text style={[styles.headCell, styles.qty]}>CANT</Text>
            <Text style={[styles.headCell, styles.price]}>P/U ARS</Text>
            <Text style={[styles.headCell, styles.amount]}>MONTO</Text>
          </View>
          {rows.map((item, index) => (
            <View key={item?.id ?? `empty-${index}`} style={styles.tableRow}>
              <Text style={[styles.cell, styles.desc]}>{item?.descripcion ?? ""}</Text>
              <Text style={[styles.cell, styles.qty]}>{item?.cantidad ? String(item.cantidad) : ""}</Text>
              <Text style={[styles.cell, styles.price]}>
                {item?.precioUnitario !== "" && item ? formatARS(item.precioUnitario) : ""}
              </Text>
              <Text style={[styles.cell, styles.amount]}>
                {item && item.cantidad !== "" && item.precioUnitario !== ""
                  ? formatARS(itemAmount(item))
                  : ""}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Sub-total</Text>
            <Text style={styles.totalValue}>{visibleItems.length ? formatARS(subtotal(order.items)) : ""}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.finalLabel}>Total $:</Text>
            <Text style={styles.totalValue}>{visibleItems.length ? formatARS(total(order.items)) : ""}</Text>
          </View>
        </View>

        {order.observaciones ? (
          <Text style={styles.notes}>Observaciones: {order.observaciones}</Text>
        ) : null}
      </Page>
    </Document>
  );
}
