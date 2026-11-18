export function normalizeSearch(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function matchesSearch(query: string, ...fields: (string | undefined)[]): boolean {
  return fields.some((field) => field !== undefined && normalizeSearch(field).includes(query));
}
