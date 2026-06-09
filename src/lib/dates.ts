export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatInputDate(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year.slice(-2)}`;
}

export function sortByDateDesc<T extends { fecha: string; updatedAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const dateDiff = b.fecha.localeCompare(a.fecha);
    return dateDiff || b.updatedAt.localeCompare(a.updatedAt);
  });
}
