"use client";

import { PackageCheck, TrendingUp, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatARS, total } from "@/lib/calculations";
import { formatInputDate } from "@/lib/dates";
import type { Order } from "@/types/order";

type Period = "day" | "week" | "month";
type SalesTab = "sales" | "investment";

type Row = {
  key: string;
  label: string;
  amount: number;
  orders: number;
  units: number;
};

type RankRow = {
  label: string;
  amount: number;
  units: number;
};

type InvestmentRow = RankRow & {
  investment: number;
  profit: number;
  profitPercent: number | null;
};

const INVESTMENT_STORAGE_KEY = "subliexpresate.salesInvestments.v1";

export function SalesDashboard({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState<SalesTab>("sales");
  const [period, setPeriod] = useState<Period>("day");
  const monthOptions = useMemo(() => saleMonths(orders), [orders]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [investments, setInvestments] = useState<Record<string, number>>({});
  const [investmentsLoaded, setInvestmentsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(INVESTMENT_STORAGE_KEY);
      if (stored) {
        setInvestments(JSON.parse(stored));
      }
    } catch {
      setInvestments({});
    } finally {
      setInvestmentsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!investmentsLoaded) return;
    window.localStorage.setItem(INVESTMENT_STORAGE_KEY, JSON.stringify(investments));
  }, [investments, investmentsLoaded]);

  useEffect(() => {
    if (!monthOptions.length) {
      setSelectedMonth("");
      return;
    }
    if (!selectedMonth || !monthOptions.some((month) => month.key === selectedMonth)) {
      setSelectedMonth(monthOptions[0].key);
    }
  }, [monthOptions, selectedMonth]);

  const report = useMemo(
    () => buildReport(orders, selectedMonth, investments),
    [orders, selectedMonth, investments]
  );
  const rows = period === "month" ? report.month : report[period];

  function updateInvestment(label: string, value: string) {
    const key = investmentKey(selectedMonth, label);
    const nextValue = Number(value);
    setInvestments((current) => {
      const next = { ...current };
      if (!value || !Number.isFinite(nextValue) || nextValue <= 0) {
        delete next[key];
      } else {
        next[key] = nextValue;
      }
      return next;
    });
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-5">
      <div className="mb-4">
        <p className="text-xs font-black uppercase text-brand-blue">Analisis</p>
        <h1 className="text-2xl font-black text-brand-ink">Ventas</h1>
        <p className="mt-1 text-sm text-slate-600">
          Totales por fecha de pedido para entender cuanto llevas vendido.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
        <TabButton active={tab === "sales"} onClick={() => setTab("sales")}>
          Ventas
        </TabButton>
        <TabButton active={tab === "investment"} onClick={() => setTab("investment")}>
          Inversion
        </TabButton>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tab === "sales" ? (
          <>
            <MetricCard label="Mes seleccionado" value={formatARS(report.selectedAmount)} highlight />
            <MetricCard label="Pedidos del mes" value={String(report.selectedOrderCount)} />
            <MetricCard label="Unidades del mes" value={String(report.selectedUnits)} />
            <MetricCard label="Total historico" value={formatARS(report.totalAmount)} />
          </>
        ) : (
          <>
            <MetricCard label="Ganancia del mes" value={formatARS(report.selectedProfit)} highlight />
            <MetricCard label="% ganancia del mes" value={formatPercent(report.selectedProfitPercent)} />
            <MetricCard label="Inversion del mes" value={formatARS(report.selectedInvestment)} />
            <MetricCard label="Ganancia historica" value={formatARS(report.totalProfit)} />
            <MetricCard label="% ganancia historica" value={formatPercent(report.totalProfitPercent)} />
            <MetricCard label="Inversion historica" value={formatARS(report.totalInvestment)} />
          </>
        )}
      </div>

      <div className="mt-5 rounded-lg bg-white p-3 shadow-soft">
        {monthOptions.length ? (
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-black uppercase text-slate-500">Mes</span>
            <select
              className="input"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month.key} value={month.key}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {tab === "sales" ? (
          <>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
              <PeriodButton active={period === "day"} onClick={() => setPeriod("day")}>
                Dia
              </PeriodButton>
              <PeriodButton active={period === "week"} onClick={() => setPeriod("week")}>
                Semana
              </PeriodButton>
              <PeriodButton active={period === "month"} onClick={() => setPeriod("month")}>
                Meses
              </PeriodButton>
            </div>

            <div className="mt-4 space-y-3">
              {rows.map((row) => (
                <SalesRow key={row.key} row={row} max={rows[0]?.amount ?? 0} />
              ))}
              {!rows.length ? (
                <EmptyState>Todavia no hay ventas para analizar.</EmptyState>
              ) : null}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {report.investmentProducts.map((row) => (
              <InvestmentProductRow
                key={row.label}
                row={row}
                onChange={(value) => updateInvestment(row.label, value)}
              />
            ))}
            {!report.investmentProducts.length ? (
              <EmptyState>Todavia no hay productos vendidos para cargar inversiones.</EmptyState>
            ) : null}
          </div>
        )}
      </div>

      {tab === "sales" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Ranking
            icon={<PackageCheck size={18} />}
            title="Productos mas vendidos"
            rows={report.products}
            empty="Sin productos vendidos."
          />
          <Ranking
            icon={<UserRound size={18} />}
            title="Clientes destacados"
            rows={report.clients}
            empty="Sin clientes para mostrar."
          />
        </div>
      ) : (
        <div className="mt-5">
          <Ranking
            icon={<TrendingUp size={18} />}
            title="Ganancia por producto"
            rows={report.profitProducts}
            empty="Sin ganancias para mostrar."
          />
        </div>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  highlight = false
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-4 shadow-soft ${highlight ? "bg-brand-ink text-white" : "bg-white"}`}>
      <p className={`text-xs font-black uppercase ${highlight ? "text-white/70" : "text-slate-500"}`}>
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black leading-tight ${highlight ? "text-white" : "text-brand-ink"}`}>
        {value}
      </p>
    </div>
  );
}

function PeriodButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`h-10 rounded-lg text-sm font-black ${
        active ? "bg-white text-brand-blue shadow-sm" : "text-slate-500"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`h-11 rounded-lg text-sm font-black ${
        active ? "bg-white text-brand-blue shadow-sm" : "text-slate-500"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SalesRow({ row, max }: { row: Row; max: number }) {
  const width = max > 0 ? Math.max(8, Math.round((row.amount / max) * 100)) : 0;

  return (
    <article className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-brand-ink">{row.label}</h2>
          <p className="text-xs font-semibold text-slate-500">
            {row.orders} pedido(s) - {row.units} unidad(es)
          </p>
        </div>
        <span className="text-sm font-black text-brand-ink">{formatARS(row.amount)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-blue" style={{ width: `${width}%` }} />
      </div>
    </article>
  );
}

function InvestmentProductRow({
  row,
  onChange
}: {
  row: InvestmentRow;
  onChange: (value: string) => void;
}) {
  return (
    <article className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-black text-brand-ink">{row.label}</h2>
          <p className="text-xs font-semibold text-slate-500">
            Vendido: {formatARS(row.amount)} - {row.units} unidad(es)
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-black ${row.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {formatARS(row.profit)}
          </p>
          <p className="text-xs font-black text-slate-500">{formatPercent(row.profitPercent)}</p>
        </div>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-black uppercase text-slate-500">Inversion</span>
        <input
          className="input"
          min="0"
          inputMode="decimal"
          placeholder="$ 0"
          type="number"
          value={row.investment || ""}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </article>
  );
}

function Ranking({
  icon,
  title,
  rows,
  empty
}: {
  icon: React.ReactNode;
  title: string;
  rows: RankRow[];
  empty: string;
}) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2 text-brand-ink">
        {icon}
        <h2 className="text-base font-black">{title}</h2>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 flex-1 truncate text-sm font-black text-brand-ink">{row.label}</p>
              <p className="text-sm font-black text-brand-blue">{formatARS(row.amount)}</p>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{row.units} unidad(es)</p>
          </div>
        ))}
        {!rows.length ? <p className="text-sm font-semibold text-slate-500">{empty}</p> : null}
      </div>
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500">
      {children}
    </div>
  );
}

function buildReport(
  orders: Order[],
  selectedMonth: string,
  investments: Record<string, number>
) {
  const soldOrders = orders.filter((order) => order.status === "saved");
  const selectedOrders = selectedMonth
    ? soldOrders.filter((order) => monthKey(order.fecha) === selectedMonth)
    : soldOrders;

  const day = groupOrders(selectedOrders, (order) => order.fecha, (key) => formatInputDate(key));
  const week = groupOrders(selectedOrders, (order) => weekKey(order.fecha), weekLabel);
  const month = groupOrders(soldOrders, (order) => monthKey(order.fecha), monthLabel);

  const totalAmount = soldOrders.reduce((sum, order) => sum + total(order.items), 0);
  const selectedAmount = selectedOrders.reduce((sum, order) => sum + total(order.items), 0);
  const totalInvestment = investmentTotalForAllMonths(soldOrders, investments);
  const selectedInvestment = investmentTotalForOrders(selectedOrders, selectedMonth, investments);
  const totalProfit = totalAmount - totalInvestment;
  const selectedProfit = selectedAmount - selectedInvestment;

  return {
    totalAmount,
    selectedAmount,
    selectedOrderCount: selectedOrders.length,
    selectedUnits: selectedOrders.reduce((sum, order) => sum + orderUnits(order), 0),
    totalInvestment,
    selectedInvestment,
    totalProfit,
    selectedProfit,
    totalProfitPercent: profitPercent(totalProfit, totalInvestment),
    selectedProfitPercent: profitPercent(selectedProfit, selectedInvestment),
    day,
    week,
    month,
    products: rankProducts(selectedOrders),
    clients: rankClients(selectedOrders),
    investmentProducts: investmentProducts(selectedOrders, selectedMonth, investments),
    profitProducts: investmentProducts(selectedOrders, selectedMonth, investments)
      .filter((row) => row.investment > 0)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)
  };
}

function saleMonths(orders: Order[]): Array<{ key: string; label: string }> {
  const keys = new Set(
    orders
      .filter((order) => order.status === "saved" && order.fecha)
      .map((order) => monthKey(order.fecha))
  );
  return Array.from(keys)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({ key, label: monthLabel(key) }));
}

function groupOrders(
  orders: Order[],
  keyGetter: (order: Order) => string,
  labelGetter: (key: string) => string
): Row[] {
  const map = new Map<string, Row>();
  orders.forEach((order) => {
    const key = keyGetter(order);
    const existing = map.get(key) ?? {
      key,
      label: labelGetter(key),
      amount: 0,
      orders: 0,
      units: 0
    };
    existing.amount += total(order.items);
    existing.orders += 1;
    existing.units += orderUnits(order);
    map.set(key, existing);
  });

  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
}

function rankProducts(orders: Order[]): RankRow[] {
  return productRows(orders).slice(0, 5);
}

function productRows(orders: Order[]): RankRow[] {
  const map = new Map<string, RankRow>();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const label = item.descripcion || "Sin descripcion";
      const existing = map.get(label) ?? { label, amount: 0, units: 0 };
      existing.amount += Number(item.cantidad || 0) * Number(item.precioUnitario || 0);
      existing.units += Number(item.cantidad || 0);
      map.set(label, existing);
    });
  });
  return Array.from(map.values())
    .sort((a, b) => b.amount - a.amount);
}

function rankClients(orders: Order[]): RankRow[] {
  const map = new Map<string, RankRow>();
  orders.forEach((order) => {
    const label = order.clienteNombre || "Sin cliente";
    const existing = map.get(label) ?? { label, amount: 0, units: 0 };
    existing.amount += total(order.items);
    existing.units += orderUnits(order);
    map.set(label, existing);
  });
  return Array.from(map.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

function investmentProducts(
  orders: Order[],
  selectedMonth: string,
  investments: Record<string, number>
): InvestmentRow[] {
  return productRows(orders)
    .map((row) => {
      const investment = investments[investmentKey(selectedMonth, row.label)] ?? 0;
      const profit = row.amount - investment;
      return {
        ...row,
        investment,
        profit,
        profitPercent: profitPercent(profit, investment)
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

function investmentTotalForOrders(
  orders: Order[],
  selectedMonth: string,
  investments: Record<string, number>
): number {
  const labels = new Set<string>();
  orders.forEach((order) => {
    order.items.forEach((item) => labels.add(item.descripcion || "Sin descripcion"));
  });
  return Array.from(labels).reduce(
    (sum, label) => sum + (investments[investmentKey(selectedMonth, label)] ?? 0),
    0
  );
}

function investmentTotalForAllMonths(orders: Order[], investments: Record<string, number>): number {
  const keys = new Set<string>();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      keys.add(investmentKey(monthKey(order.fecha), item.descripcion || "Sin descripcion"));
    });
  });
  return Array.from(keys).reduce((sum, key) => sum + (investments[key] ?? 0), 0);
}

function investmentKey(month: string, label: string): string {
  return `${month || "sin-mes"}::${label.trim().toLowerCase() || "sin descripcion"}`;
}

function profitPercent(profit: number, investment: number): number | null {
  if (investment <= 0) return null;
  return (profit / investment) * 100;
}

function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}%`;
}

function orderUnits(order: Order): number {
  return order.items.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${month}/${year}`;
}

function weekKey(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  const day = parsed.getDay() || 7;
  parsed.setDate(parsed.getDate() + 4 - day);
  const yearStart = new Date(parsed.getFullYear(), 0, 1);
  const week = Math.ceil(((parsed.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${parsed.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weekLabel(key: string): string {
  return `Semana ${key.split("-W")[1]} - ${key.split("-W")[0]}`;
}
