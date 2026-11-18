import assert from "node:assert/strict";
import { test } from "node:test";

const baseURL = process.env.OWNERSHIP_TEST_URL;
if (!baseURL) throw new Error("OWNERSHIP_TEST_URL deve apontar para um servidor de teste isolado.");

async function request(path, { method = "GET", cookie, body } = {}) {
  const headers = { origin: baseURL };
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers["content-type"] = "application/json";
  const response = await fetch(new URL(path, baseURL), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  return response;
}

async function signIn(username) {
  const response = await request("/api/auth/sign-in/username", {
    method: "POST",
    body: { username, password: "fixture-only-password" },
  });
  assert.equal(response.status, 200);
  return response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
}

test("isola eventos, cadernos e páginas por conta", async () => {
  const owner = await signIn("binha");
  const other = await signIn("outra");

  assert.equal((await request("/api/events")).status, 401);
  const ownerEvents = await (await request("/api/events", { cookie: owner })).json();
  const ownerNotebooks = await (await request("/api/notebooks", { cookie: owner })).json();
  assert.equal(ownerEvents.length, 1);
  assert.equal(ownerNotebooks.length, 1);
  assert.deepEqual(await (await request("/api/events", { cookie: other })).json(), []);
  assert.deepEqual(await (await request("/api/notebooks", { cookie: other })).json(), []);

  const eventId = ownerEvents[0].id;
  const notebookId = ownerNotebooks[0].id;
  const pages = await (await request(`/api/notebooks/${notebookId}/pages`, { cookie: owner })).json();
  assert.equal(pages.length, 1);
  const pageId = pages[0].id;

  for (const [path, method, body] of [
    ["/api/events", "PUT", { id: eventId, title: "invasão" }],
    [`/api/events?id=${eventId}`, "DELETE"],
    [`/api/notebooks/${notebookId}`, "GET"],
    [`/api/notebooks/${notebookId}`, "PUT", { name: "invasão" }],
    [`/api/notebooks/${notebookId}`, "DELETE"],
    [`/api/notebooks/${notebookId}/pages`, "GET"],
    [`/api/notebooks/${notebookId}/pages`, "POST", { title: "invasão" }],
    [`/api/pages/${pageId}`, "PUT", { title: "invasão" }],
    [`/api/pages/${pageId}`, "DELETE"],
  ]) {
    const response = await request(path, { method, cookie: other, body });
    assert.equal(response.status, 404, `${method} ${path}`);
  }

  const createdEvent = await request("/api/events", {
    method: "POST", cookie: other, body: { title: "outro evento", date: "2026-11-18", type: "other" },
  });
  const createdNotebook = await request("/api/notebooks", {
    method: "POST", cookie: other, body: { name: "outro caderno" },
  });
  assert.equal(createdEvent.status, 201);
  assert.equal(createdNotebook.status, 201);
  const otherEvent = await createdEvent.json();
  const otherNotebook = await createdNotebook.json();
  const createdPage = await request(`/api/notebooks/${otherNotebook.id}/pages`, {
    method: "POST", cookie: other, body: { title: "outra página" },
  });
  assert.equal(createdPage.status, 201);
  assert.equal((await (await request("/api/events", { cookie: owner })).json()).length, 1);
  assert.equal((await (await request("/api/notebooks", { cookie: owner })).json()).length, 1);
  assert.equal((await (await request("/api/events", { cookie: other })).json())[0].id, otherEvent.id);
  assert.equal((await (await request("/api/notebooks", { cookie: other })).json())[0].id, otherNotebook.id);

  const editedEvent = await request("/api/events", {
    method: "PUT", cookie: other, body: { id: otherEvent.id, title: "evento editado" },
  });
  assert.equal(editedEvent.status, 200);
  assert.equal((await editedEvent.json()).title, "evento editado");
  assert.equal((await request(`/api/notebooks/${otherNotebook.id}`, {
    method: "PUT", cookie: other, body: { name: "caderno editado" },
  })).status, 200);
  const otherPage = await createdPage.json();
  assert.equal((await request(`/api/pages/${otherPage.id}`, {
    method: "PUT", cookie: other, body: { title: "página editada" },
  })).status, 200);
  assert.equal((await request(`/api/pages/${otherPage.id}`, { method: "DELETE", cookie: other })).status, 200);
  assert.equal((await request(`/api/notebooks/${otherNotebook.id}`, { method: "DELETE", cookie: other })).status, 200);
  assert.equal((await request(`/api/events?id=${otherEvent.id}`, { method: "DELETE", cookie: other })).status, 200);
});
