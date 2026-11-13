import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatARS, itemAmount, quoteTotals } from "@/lib/calculations";
import { formatQuoteDate } from "@/lib/dates";
import type { Order } from "@/types/order";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: "#111111",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#e65018",
    paddingBottom: 22,
  },
  logoFrame: { width: 65, height: 38, overflow: "hidden" },
  logo: {
    position: "absolute",
    width: 158.35,
    height: 111.95,
    left: -46.6,
    top: -32.3,
  },
  title: { fontSize: 34, fontFamily: "Helvetica-Bold", textAlign: "right" },
  number: { fontSize: 11, color: "#e65018", textAlign: "right", marginTop: 8 },
  meta: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    paddingVertical: 16,
  },
  quarter: { width: "25%" },
  label: { fontSize: 7, color: "#777777", letterSpacing: 1, marginBottom: 5 },
  bold: { fontFamily: "Helvetica-Bold" },
  badge: {
    backgroundColor: "#fff1ce",
    color: "#946200",
    padding: 4,
    borderRadius: 8,
    fontSize: 9,
    alignSelf: "flex-start",
  },
  recipient: { marginVertical: 16 },
  accentLabel: {
    color: "#e65018",
    fontSize: 8,
    letterSpacing: 1,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },
  client: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 12 },
  contacts: { flexDirection: "row", gap: 10, fontSize: 9 },
  third: { width: "33.33%" },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#111111",
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  description: { width: "48%", padding: 10, fontSize: 9 },
  quantity: { width: "12%", padding: 10, fontSize: 9, textAlign: "right" },
  price: { width: "20%", padding: 10, fontSize: 9, textAlign: "right" },
  totals: { width: "50%", marginLeft: "50%", marginTop: 12, marginBottom: 18 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 5,
    fontSize: 9,
  },
  final: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    padding: 10,
    borderRadius: 7,
    backgroundColor: "#e65018",
    color: "#ffffff",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginVertical: 4,
  },
  bottom: { flexDirection: "row", gap: 16, marginTop: 14 },
  transfer: {
    width: "50%",
    backgroundColor: "#f7f5f2",
    padding: 13,
    borderRadius: 10,
  },
  conditions: { width: "50%", paddingTop: 2 },
  heading: {
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: "Helvetica-Bold",
    marginBottom: 9,
  },
  paragraph: { fontSize: 9, lineHeight: 1.6 },
  notes: { marginTop: 8 },
  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    paddingTop: 12,
    marginTop: 28,
    color: "#666666",
    fontSize: 8,
  },
  half: { width: "50%" },
});

export function OrderPdfDocument({ order }: { order: Order }) {
  const totals = quoteTotals(order);
  const items = order.items.filter(
    (i) => i.descripcion.trim() || i.cantidad !== "" || i.precioUnitario !== "",
  );
  return (
    <Document
      title={"Presupuesto " + (order.numero ?? "")}
      author={order.empresa?.nombre ?? "NÖR"}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.logoFrame}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/nor-logo.jpg" style={styles.logo} />
          </View>
          <View>
            <Text style={styles.title}>PRESUPUESTO</Text>
            <Text style={styles.number}>{order.numero ?? ""}</Text>
          </View>
        </View>
        <View style={styles.meta}>
          <View style={styles.quarter}>
            <Text style={styles.label}>FECHA</Text>
            <Text style={styles.bold}>{formatQuoteDate(order.fecha)}</Text>
          </View>
          <View style={styles.quarter}>
            <Text style={styles.label}>ENTREGA</Text>
            <Text style={styles.bold}>
              {formatQuoteDate(order.fechaEntrega) || "A coordinar"}
            </Text>
          </View>
          <View style={styles.quarter}>
            <Text style={styles.label}>VALIDEZ</Text>
            <Text style={styles.bold}>{order.validezDias ?? 10} días</Text>
          </View>
          <View style={styles.quarter}>
            <Text style={styles.label}>ESTADO</Text>
            <Text style={styles.badge}>
              {order.estadoPresupuesto ?? "Pendiente"}
            </Text>
          </View>
        </View>
        <View style={styles.recipient}>
          <Text style={styles.accentLabel}>PRESUPUESTO PARA</Text>
          <Text style={styles.client}>
            {order.clienteNombre || "Nombre del cliente"}
          </Text>
          <View style={styles.contacts}>
            <Text style={styles.third}>{order.correo}</Text>
            <Text style={styles.third}>{order.telefono}</Text>
            <Text style={styles.third}>{order.lugar}</Text>
          </View>
        </View>
        <View style={styles.tableHead}>
          <Text style={styles.description}>Descripción</Text>
          <Text style={styles.quantity}>Cant.</Text>
          <Text style={styles.price}>P. Unit.</Text>
          <Text style={styles.price}>Monto</Text>
        </View>
        {items.map((item) => (
          <View key={item.id} style={styles.row} wrap={false}>
            <Text style={styles.description}>{item.descripcion}</Text>
            <Text style={styles.quantity}>{String(item.cantidad)}</Text>
            <Text style={styles.price}>
              {formatARS(Number(item.precioUnitario))}
            </Text>
            <Text style={styles.price}>{formatARS(itemAmount(item))}</Text>
          </View>
        ))}
        <View style={styles.totals} wrap={false}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatARS(totals.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>
              Descuento{" "}
              {order.descuentoTipo === "amount"
                ? "($)"
                : "(" + (order.descuento ?? 0) + "%)"}
            </Text>
            <Text>− {formatARS(totals.discount)}</Text>
          </View>
          <View style={styles.final}>
            <Text>TOTAL</Text>
            <Text>{formatARS(totals.total)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Anticipo / Seña ({order.anticipoPorcentaje ?? 0}%)</Text>
            <Text>{formatARS(totals.advance)}</Text>
          </View>
          <View style={[styles.totalRow, styles.bold]}>
            <Text>Saldo restante</Text>
            <Text>{formatARS(totals.balance)}</Text>
          </View>
        </View>
        {order.observaciones && (
          <View style={styles.notes}>
            <Text style={styles.heading}>OBSERVACIONES</Text>
            <Text style={styles.paragraph}>{order.observaciones}</Text>
          </View>
        )}
        <View style={styles.bottom} wrap={false}>
          <View style={styles.transfer}>
            <Text style={styles.heading}>DATOS PARA TRANSFERENCIA</Text>
            <Text style={styles.paragraph}>
              Alias: {order.empresa?.alias || "—"}
            </Text>
            <Text style={styles.paragraph}>
              A nombre de: {order.empresa?.titular || "—"}
            </Text>
            <Text style={styles.paragraph}>
              Forma de pago:{" "}
              {order.empresa?.formaPago || "Transferencia / Efectivo"}
            </Text>
          </View>
          <View style={styles.conditions}>
            <Text style={styles.heading}>CONDICIONES</Text>
            <Text style={styles.paragraph}>{order.condiciones ?? ""}</Text>
          </View>
        </View>
        <View style={styles.footer} wrap={false}>
          <Text style={styles.half}>
            {order.empresa?.nombre || "NÖR — Diseño en Evolución"}
          </Text>
          <Text style={styles.half}>Gracias por elegirnos</Text>
        </View>
      </Page>
    </Document>
  );
}
