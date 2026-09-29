export function cop(value: number | null | undefined): string {
  if (value == null) return "—";
  return "$" + value.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}
