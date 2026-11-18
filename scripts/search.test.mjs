import assert from "node:assert/strict";
import test from "node:test";
import { matchesSearch, normalizeSearch } from "../src/lib/search.ts";

test("busca ignora maiúsculas, acentos e espaços externos", () => {
  const query = normalizeSearch("  PROJECAO  ");
  assert.equal(matchesSearch(query, "Projeção arquitetônica"), true);
  assert.equal(matchesSearch(query, "Cálculo"), false);
});

test("busca encontra texto em qualquer campo, inclusive descrições", () => {
  const query = normalizeSearch("maquete");
  assert.equal(matchesSearch(query, "Ateliê", undefined, "Entrega da maquete"), true);
  assert.equal(matchesSearch(query, "Ateliê", undefined), false);
});
