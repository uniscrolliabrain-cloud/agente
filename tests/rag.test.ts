import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { embedTexts, RagService, RAG_MAX_CHUNKS_PER_SOURCE } from "../apps/server/src/engine/rag.ts";

/** Stub del endpoint de embeddings: devuelve un vector fijo y mide el paralelismo. */
function stubEmbeddings(values: number[]) {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.GEMINI_API_KEY;
  const state = { calls: 0, inFlight: 0, maxInFlight: 0 };
  process.env.GEMINI_API_KEY = "test-key";
  globalThis.fetch = (async () => {
    state.calls += 1;
    state.inFlight += 1;
    state.maxInFlight = Math.max(state.maxInFlight, state.inFlight);
    await new Promise((resolve) => setTimeout(resolve, 5));
    state.inFlight -= 1;
    return new Response(JSON.stringify({ embedding: { values } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof globalThis.fetch;
  return {
    state,
    restore() {
      globalThis.fetch = previousFetch;
      if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
      else process.env.GEMINI_API_KEY = previousKey;
    },
  };
}

test("embedTexts embeds in parallel under a bounded number of in-flight calls", async () => {
  const stub = stubEmbeddings([1, 0, 0]);
  try {
    const texts = Array.from({ length: 9 }, (_, i) => `chunk ${i}`);
    const vectors = await embedTexts(texts, 3);
    assert.equal(stub.state.calls, 9);
    // Antes la ingesta era un bucle serial: maxInFlight era siempre 1.
    assert.ok(stub.state.maxInFlight > 1, `esperaba paralelismo, maximo en vuelo ${stub.state.maxInFlight}`);
    assert.ok(stub.state.maxInFlight <= 3, `el techo se paso: ${stub.state.maxInFlight}`);
    assert.equal(vectors.length, 9);
    assert.ok(vectors.every((vector) => Array.isArray(vector) && vector.length === 3));
  } finally {
    stub.restore();
  }
});

test("embedTexts without an API key returns nulls instead of throwing", async () => {
  const previous = process.env.GEMINI_API_KEY;
  const previousGoogle = process.env.GOOGLE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  try {
    const vectors = await embedTexts(["a", "b"]);
    assert.deepEqual(vectors, [null, null]);
  } finally {
    if (previous !== undefined) process.env.GEMINI_API_KEY = previous;
    if (previousGoogle !== undefined) process.env.GOOGLE_API_KEY = previousGoogle;
  }
});

test("RagService.search ranks the best hits across pages of the index", async () => {
  const db = await createStore();
  const stub = stubEmbeddings([1, 0]);
  const owner = "rag-owner";
  try {
    // 620 chunks: mas de una pagina de 500, con un unico vector alineado con la consulta.
    const total = 620;
    for (let start = 0; start < total; start += 50) {
      await Promise.all(
        Array.from({ length: Math.min(50, total - start) }, (_, offset) => {
          const i = start + offset;
          return db.put(owner, "rag-chunks", {
            id: `c-${i}`,
            sourceId: "src",
            sourceName: "doc.txt",
            chunkIndex: i,
            text: `chunk ${i}`,
            embedding: i === total - 1 ? [1, 0] : [0, 1],
            createdAt: new Date().toISOString(),
          });
        }),
      );
    }
    const hits = await new RagService(db).search(owner, "consulta", 3);
    // El indice se recorre por keyset, no entero: 620 chunks, dos paginas de 500.
    assert.ok(hits.length <= 3, `la busqueda no debe superar el limite, devolvio ${hits.length}`);
    // Solo sobrevive el chunk alineado con la consulta. Los demas tienen coseno 0 y
    // BM25 0 ("chunk N" no contiene "consulta"), asi que la busqueda hibrida los descarta
    // antes de ordenar. No hay hits de relleno con score 0.
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, `c-${total - 1}`);
    // Score hibrido: 0.7 * coseno(1) + 0.3 * bm25Norm(0) = 0.7.
    assert.ok(
      Math.abs(hits[0].score - 0.7) < 0.01,
      `esperaba score ~0.7, obtuve ${hits[0].score}`,
    );
  } finally {
    stub.restore();
    await db.close();
  }
});

test("ingestion caps the number of chunks per source", async () => {
  const db = await createStore();
  const stub = stubEmbeddings([1, 0, 0, 0]);
  const owner = "rag-cap-owner";
  try {
    // 5 capitulos largos dan ~15 chunks; con tope 3 solo se guardan 3.
    const chapter = `${"palabra ".repeat(200)}\n\n`;
    const text = chapter.repeat(5);
    const capped = await new RagService(db).ingestText(owner, "src", "grande.txt", text, 3);
    assert.equal(capped.chunks, 3);
    assert.equal(await db.count(owner, "rag-chunks"), 3);
    assert.equal(RAG_MAX_CHUNKS_PER_SOURCE, 1000);
  } finally {
    stub.restore();
    await db.close();
  }
});

test("the pgvector path is never attempted on PGlite", async () => {
  const db = await createStore();
  const stub = stubEmbeddings([1, 0]);
  const owner = "rag-pglite-owner";
  try {
    assert.equal(db.backend, "pglite");
    // Si la ruta vectorial se intentara, este select reventaria y la busqueda caeria.
    db.select = async () => {
      throw new Error("la busqueda vectorial no debe tocar el motor embebido");
    };
    await db.put(owner, "rag-chunks", {
      id: "c-0",
      sourceId: "src",
      sourceName: "doc.txt",
      chunkIndex: 0,
      text: "chunk 0",
      embedding: [1, 0],
      createdAt: new Date().toISOString(),
    });
    const hits = await new RagService(db).search(owner, "consulta", 3);
    // El fallback en JS responde igual que antes: PGlite no se rompe.
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "c-0");
  } finally {
    stub.restore();
    await db.close();
  }
});
