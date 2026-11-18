import assert from "node:assert/strict";
import test from "node:test";
import { getHolidays } from "../src/lib/holidays.ts";

function holidaysOn(year, month, day) {
  return getHolidays(year)
    .filter(({ date }) => date.getMonth() === month - 1 && date.getDate() === day)
    .map(({ name }) => name);
}

test("calcula os feriados móveis em anos diferentes", () => {
  assert.deepEqual(holidaysOn(2026, 4, 3), ["Sexta-feira da Paixão"]);
  assert.deepEqual(holidaysOn(2026, 6, 4), ["Corpus Christi"]);
  assert.deepEqual(holidaysOn(2027, 3, 26), ["Sexta-feira da Paixão"]);
  assert.deepEqual(holidaysOn(2028, 6, 15), ["Corpus Christi"]);
});

test("inclui feriados locais e as transferências estaduais conhecidas", () => {
  assert.deepEqual(holidaysOn(2026, 5, 24), ["Nossa Senhora Auxiliadora"]);
  assert.deepEqual(holidaysOn(2026, 10, 24), ["Aniversário de Goiânia"]);
  assert.match(holidaysOn(2025, 7, 28)[0], /Fundação da Cidade de Goiás/);
  assert.match(holidaysOn(2026, 7, 20)[0], /Fundação da Cidade de Goiás/);
  assert.deepEqual(holidaysOn(2026, 7, 26), []);
});

test("distingue feriado nacional de ponto facultativo", () => {
  assert.deepEqual(holidaysOn(2023, 11, 20), []);
  assert.deepEqual(holidaysOn(2026, 11, 20), ["Dia da Consciência Negra"]);
  assert.deepEqual(holidaysOn(2026, 2, 17), []);
});
