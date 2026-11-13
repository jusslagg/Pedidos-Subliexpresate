import { BrandLogo } from "@/components/BrandLogo";
import { formatARS, itemAmount, quoteTotals } from "@/lib/calculations";
import { formatQuoteDate } from "@/lib/dates";
import type { Order } from "@/types/order";

export function QuotePreview({ order }: { order: Order }) {
  const totals = quoteTotals(order);
  return (
    <article className="quote-paper">
      <header className="quote-paper-header">
        <div className="quote-paper-logo">
          <BrandLogo />
        </div>
        <div>
          <h2>PRESUPUESTO</h2>
          <p>{order.numero}</p>
        </div>
      </header>
      <div className="quote-paper-meta">
        <div>
          <span>FECHA</span>
          <strong>{formatQuoteDate(order.fecha)}</strong>
        </div>
        <div>
          <span>ENTREGA</span>
          <strong>
            {formatQuoteDate(order.fechaEntrega) || "A coordinar"}
          </strong>
        </div>
        <div>
          <span>VALIDEZ</span>
          <strong>{order.validezDias ?? 10} días</strong>
        </div>
        <div>
          <span>ESTADO</span>
          <strong className="quote-status">
            {order.estadoPresupuesto ?? "Pendiente"}
          </strong>
        </div>
      </div>
      <div className="quote-recipient">
        <span>PRESUPUESTO PARA</span>
        <h3>{order.clienteNombre || "Nombre del cliente"}</h3>
        <div>
          <p>{order.correo || "Correo"}</p>
          <p>{order.telefono || "Teléfono"}</p>
          <p>{order.lugar}</p>
        </div>
      </div>
      <table className="quote-table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Cant.</th>
            <th>P. Unit.</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          {order.items
            .filter(
              (i) =>
                i.descripcion || i.cantidad !== "" || i.precioUnitario !== "",
            )
            .map((item) => (
              <tr key={item.id}>
                <td>{item.descripcion}</td>
                <td>{item.cantidad}</td>
                <td>{formatARS(Number(item.precioUnitario))}</td>
                <td>{formatARS(itemAmount(item))}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="quote-paper-totals">
        <div>
          <span>Subtotal</span>
          <span>{formatARS(totals.subtotal)}</span>
        </div>
        <div>
          <span>
            Descuento{" "}
            {order.descuentoTipo === "amount"
              ? "($)"
              : "(" + (order.descuento ?? 0) + "%)"}
          </span>
          <span>− {formatARS(totals.discount)}</span>
        </div>
        <div className="quote-total-bar">
          <strong>TOTAL</strong>
          <strong>{formatARS(totals.total)}</strong>
        </div>
        <div>
          <span>Anticipo / Seña ({order.anticipoPorcentaje ?? 0}%)</span>
          <span>{formatARS(totals.advance)}</span>
        </div>
        <div>
          <strong>Saldo restante</strong>
          <strong>{formatARS(totals.balance)}</strong>
        </div>
      </div>
      {order.observaciones && (
        <div className="quote-paper-observations">
          <h4>OBSERVACIONES</h4>
          <p>{order.observaciones}</p>
        </div>
      )}
      <div className="quote-paper-bottom">
        <div className="quote-transfer">
          <h4>DATOS PARA TRANSFERENCIA</h4>
          <p>
            <b>Alias:</b> {order.empresa?.alias || "—"}
          </p>
          <p>
            <b>A nombre de:</b> {order.empresa?.titular || "—"}
          </p>
          <p>
            <b>Forma de pago:</b>{" "}
            {order.empresa?.formaPago || "Transferencia / Efectivo"}
          </p>
        </div>
        <div>
          <h4>CONDICIONES</h4>
          <p>{order.condiciones}</p>
        </div>
      </div>
      <footer>
        <span>{order.empresa?.nombre || "NÖR — Diseño en Evolución"}</span>
        <span>Gracias por elegirnos</span>
      </footer>
    </article>
  );
}
