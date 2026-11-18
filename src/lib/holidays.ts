export interface Holiday {
  date: Date;
  name: string;
}

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function getHolidays(year: number): Holiday[] {
  const fixed: [number, number, string][] = [
    [1, 1, "Confraternização Universal"],
    [4, 21, "Tiradentes"],
    [5, 1, "Dia do Trabalho"],
    [5, 24, "Nossa Senhora Auxiliadora"],
    [9, 7, "Independência do Brasil"],
    [10, 12, "Nossa Senhora Aparecida"],
    [10, 24, "Aniversário de Goiânia"],
    [11, 2, "Finados"],
    [11, 15, "Proclamação da República"],
    [12, 25, "Natal"],
  ];
  if (year >= 2024) fixed.push([11, 20, "Dia da Consciência Negra"]);
  if (year >= 2020) {
    const foundationDay = year === 2025 ? 28 : year === 2026 ? 20 : 26;
    fixed.push([7, foundationDay, "Fundação da Cidade de Goiás (repartições estaduais; data sujeita a transferência)"]);
  }

  const holidays = fixed.map(([month, day, name]) => ({
    date: new Date(year, month - 1, day),
    name,
  }));
  const easter = easterSunday(year);
  for (const [offset, name] of [[-2, "Sexta-feira da Paixão"], [60, "Corpus Christi"]] as const) {
    const date = new Date(easter);
    date.setDate(date.getDate() + offset);
    holidays.push({ date, name });
  }
  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}
