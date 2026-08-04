import { Hono } from "hono";
import { checkPassword, issueToken, verifyToken } from "./auth";

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  BUCKET: R2Bucket;
  ADMIN_PASSWORD: string;
  AUTH_SECRET: string;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const META_PIXEL_ID_RE = /^\d+$/;
const GA4_ID_RE = /^G-[A-Za-z0-9]+$/;

type Variables = Record<string, never>;

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ----------------------------------------------------------------------------
// Tabelas com CRUD genérico. A whitelist evita injeção de nomes de tabela/coluna.
// ----------------------------------------------------------------------------
const TABLES: Record<string, string[]> = {
  rooms: ["title", "subtitle", "description", "image_url", "amenities", "sort_order"],
  highlights: ["title", "image_url", "sort_order"],
  amenities: ["icon", "label", "description", "sort_order"],
  testimonials: ["title", "quote", "author", "rating", "sort_order"],
  gallery: ["image_url", "caption", "sort_order"],
  experiences: ["title", "description", "image_url", "sort_order"],
  promotions: ["title", "description", "discount", "valid_until", "image_url", "sort_order"],
  packages: ["title", "description", "price", "inclusions", "image_url", "featured", "sort_order"],
  posts: ["title", "slug", "excerpt", "content", "cover_image", "category", "published_at", "sort_order"],
};

async function listTable(db: D1Database, table: string) {
  const { results } = await db
    .prepare(`SELECT * FROM ${table} ORDER BY sort_order ASC, id ASC`)
    .all();
  return results;
}

// ----------------------------------------------------------------------------
// API pública
// ----------------------------------------------------------------------------
const api = new Hono<{ Bindings: Env }>();

api.get("/content", async (c) => {
  const db = c.env.DB;
  const [settingsRows, rooms, highlights, amenities, testimonials, gallery, experiences, promotions, packages, posts] =
    await Promise.all([
      db.prepare("SELECT key, value FROM settings").all(),
      listTable(db, "rooms"),
      listTable(db, "highlights"),
      listTable(db, "amenities"),
      listTable(db, "testimonials"),
      listTable(db, "gallery"),
      listTable(db, "experiences"),
      listTable(db, "promotions"),
      listTable(db, "packages"),
      listTable(db, "posts"),
    ]);

  const settings: Record<string, unknown> = {};
  for (const row of settingsRows.results as { key: string; value: string }[]) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }

  // amenities (campo JSON) parseado nos quartos
  const parsedRooms = (rooms as Record<string, unknown>[]).map((r) => ({
    ...r,
    amenities: safeJson(r.amenities as string, []),
  }));

  // inclusions (campo JSON) parseado nos pacotes
  const parsedPackages = (packages as Record<string, unknown>[]).map((p) => ({
    ...p,
    inclusions: safeJson(p.inclusions as string, []),
  }));

  return c.json({
    settings,
    rooms: parsedRooms,
    highlights,
    amenities,
    testimonials,
    gallery,
    experiences,
    promotions,
    packages: parsedPackages,
    posts,
  });
});

function safeJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ----------------------------------------------------------------------------
// Autenticação
// ----------------------------------------------------------------------------
api.post("/admin/login", async (c) => {
  const body = await c.req.json<{ password?: string }>().catch(() => ({}) as { password?: string });
  const ok = await checkPassword(body.password ?? "", c.env.ADMIN_PASSWORD);
  if (!ok) return c.json({ error: "Senha incorreta" }, 401);
  const token = await issueToken(c.env.AUTH_SECRET);
  return c.json({ token });
});

// Middleware: protege tudo sob /admin (exceto /admin/login)
api.use("/admin/*", async (c, next) => {
  if (c.req.path.endsWith("/admin/login")) return next();
  const auth = c.req.header("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const valid = await verifyToken(c.env.AUTH_SECRET, token);
  if (!valid) return c.json({ error: "Não autorizado" }, 401);
  return next();
});

api.get("/admin/me", (c) => c.json({ ok: true }));

// ----------------------------------------------------------------------------
// Admin: upload de imagem para o R2
// Corpo = bytes binários da imagem; query ?ext=webp define a extensão/key.
// ----------------------------------------------------------------------------
const SAFE_EXT = /^[a-z0-9]{1,5}$/;
api.post("/admin/upload", async (c) => {
  const contentType = c.req.header("Content-Type") || "application/octet-stream";
  if (!contentType.startsWith("image/")) {
    return c.json({ error: "Envie um arquivo de imagem" }, 400);
  }
  const ext = (c.req.query("ext") || "bin").toLowerCase();
  if (!SAFE_EXT.test(ext)) return c.json({ error: "Extensão inválida" }, 400);

  const body = await c.req.arrayBuffer();
  if (!body.byteLength) return c.json({ error: "Arquivo vazio" }, 400);
  if (body.byteLength > MAX_UPLOAD_BYTES) return c.json({ error: "Arquivo muito grande" }, 413);

  const key = `uploads/${crypto.randomUUID()}.${ext}`;
  await c.env.BUCKET.put(key, body, { httpMetadata: { contentType } });
  return c.json({ url: `/files/${key}`, key }, 201);
});

// ----------------------------------------------------------------------------
// Admin: settings (key/value JSON)
// ----------------------------------------------------------------------------

// Valida/normaliza settings sensíveis antes de gravar. Hoje só "tracking"
// precisa: os IDs de Meta Pixel/GA4 viram scripts injetados no HTML público,
// então o formato é restrito a dígitos/"G-..." para impedir HTML/JS solto.
function validateSettingValue(key: string, value: unknown): { value: unknown; error?: string } {
  if (key !== "tracking") return { value };
  if (typeof value !== "object" || value === null) {
    return { value, error: "Formato inválido para as configurações de rastreamento" };
  }
  const v = value as Record<string, unknown>;
  const metaPixelId = String(v.metaPixelId ?? "").trim();
  const ga4MeasurementId = String(v.ga4MeasurementId ?? "").trim();
  const metaPixelEnabled = !!v.metaPixelEnabled;
  const ga4Enabled = !!v.ga4Enabled;

  if (metaPixelId && !META_PIXEL_ID_RE.test(metaPixelId)) {
    return { value, error: "O ID do Pixel da Meta deve conter apenas números" };
  }
  if (metaPixelEnabled && !metaPixelId) {
    return { value, error: "Informe o ID do Pixel da Meta para ativá-lo" };
  }
  if (ga4MeasurementId && !GA4_ID_RE.test(ga4MeasurementId)) {
    return { value, error: "O ID de medição do GA4 deve iniciar com \"G-\"" };
  }
  if (ga4Enabled && !ga4MeasurementId) {
    return { value, error: "Informe o ID de medição do GA4 para ativá-lo" };
  }

  return { value: { metaPixelEnabled, metaPixelId, ga4Enabled, ga4MeasurementId } };
}

api.put("/admin/settings/:key", async (c) => {
  const key = c.req.param("key");
  const body = await c.req.json<{ value: unknown }>().catch(() => ({ value: undefined }));
  if (body.value === undefined) return c.json({ error: "value ausente" }, 400);

  const { value, error } = validateSettingValue(key, body.value);
  if (error) return c.json({ error }, 400);

  const json = JSON.stringify(value);
  await c.env.DB.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  )
    .bind(key, json)
    .run();
  return c.json({ ok: true, key, value });
});

// ----------------------------------------------------------------------------
// Admin: CRUD genérico de tabelas
// ----------------------------------------------------------------------------
api.get("/admin/:table", async (c) => {
  const table = c.req.param("table");
  if (!TABLES[table]) return c.json({ error: "Tabela inválida" }, 404);
  return c.json(await listTable(c.env.DB, table));
});

api.post("/admin/:table", async (c) => {
  const table = c.req.param("table");
  const cols = TABLES[table];
  if (!cols) return c.json({ error: "Tabela inválida" }, 404);
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}) as Record<string, unknown>);
  const values = cols.map((col) => normalize(col, body[col]));
  const placeholders = cols.map(() => "?").join(", ");
  const res = await c.env.DB.prepare(
    `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`,
  )
    .bind(...values)
    .run();
  return c.json({ ok: true, id: res.meta.last_row_id }, 201);
});

api.put("/admin/:table/:id", async (c) => {
  const table = c.req.param("table");
  const cols = TABLES[table];
  if (!cols) return c.json({ error: "Tabela inválida" }, 404);
  const id = Number(c.req.param("id"));
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}) as Record<string, unknown>);
  const setCols = cols.filter((col) => col in body);
  if (setCols.length === 0) return c.json({ error: "Nada para atualizar" }, 400);
  const assignments = setCols.map((col) => `${col} = ?`).join(", ");
  const values = setCols.map((col) => normalize(col, body[col]));
  await c.env.DB.prepare(`UPDATE ${table} SET ${assignments} WHERE id = ?`)
    .bind(...values, id)
    .run();
  return c.json({ ok: true });
});

api.delete("/admin/:table/:id", async (c) => {
  const table = c.req.param("table");
  if (!TABLES[table]) return c.json({ error: "Tabela inválida" }, 404);
  const id = Number(c.req.param("id"));
  await c.env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
  return c.json({ ok: true });
});

// Reordenar itens em lote: body = { ids: [3,1,2] } -> sort_order conforme posição
api.post("/admin/:table/reorder", async (c) => {
  const table = c.req.param("table");
  if (!TABLES[table]) return c.json({ error: "Tabela inválida" }, 404);
  const body = await c.req.json<{ ids?: number[] }>().catch(() => ({}) as { ids?: number[] });
  const ids: number[] = body.ids ?? [];
  const stmts = ids.map((id, i) =>
    c.env.DB.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`).bind(i + 1, id),
  );
  if (stmts.length) await c.env.DB.batch(stmts);
  return c.json({ ok: true });
});

// Converte arrays/objetos (ex.: amenities) em string JSON para colunas TEXT.
function normalize(col: string, value: unknown): string | number | null {
  if (value === undefined || value === null) return col === "sort_order" ? 0 : "";
  if (Array.isArray(value) || typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? 1 : 0;
  return value as string | number;
}

app.route("/api", api);

// ----------------------------------------------------------------------------
// Arquivos do R2 (público, somente leitura). Ex.: /files/uploads/<uuid>.webp
// ----------------------------------------------------------------------------
app.get("/files/*", async (c) => {
  const key = decodeURIComponent(c.req.path.replace(/^\/files\//, ""));
  if (!key) return c.notFound();

  // Revalidação por ETag: se o cliente já tem a versão atual, devolve 304 sem
  // corpo. Assim, sobrescrever um arquivo mantendo o mesmo nome (ex.: o vídeo
  // do banner) passa a refletir sozinho — sem precisar versionar a URL.
  const ifNoneMatch = c.req.header("if-none-match");
  const obj = await c.env.BUCKET.get(
    key,
    ifNoneMatch ? { onlyIf: { etagDoesNotMatch: ifNoneMatch } } : undefined,
  );
  if (!obj) return c.notFound();

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  // Cache curto + revalidação: guardado por 5 min no navegador/CDN e, depois,
  // revalidado via ETag (304 barato quando nada mudou).
  headers.set("Cache-Control", "public, max-age=300, must-revalidate");

  // Quando o ETag bate (objeto não mudou), o R2 devolve um R2Object sem corpo.
  if (!("body" in obj)) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(obj.body, { headers });
});

// ----------------------------------------------------------------------------
// Integrações e Rastreamento: injeta Meta Pixel / GA4 no HTML público quando
// ativos e com ID válido. Feito no HTML (não no React) para que o <noscript>
// do Meta Pixel funcione mesmo com JavaScript desativado no navegador.
// ----------------------------------------------------------------------------
async function injectTracking(res: Response, db: D1Database): Promise<Response> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return res;

  const row = await db
    .prepare("SELECT value FROM settings WHERE key = 'tracking'")
    .first<{ value: string }>();
  if (!row) return res;

  let tracking: Record<string, unknown>;
  try {
    tracking = JSON.parse(row.value);
  } catch {
    return res;
  }

  const metaPixelId = String(tracking.metaPixelId ?? "").trim();
  const ga4MeasurementId = String(tracking.ga4MeasurementId ?? "").trim();
  const metaOn = !!tracking.metaPixelEnabled && META_PIXEL_ID_RE.test(metaPixelId);
  const ga4On = !!tracking.ga4Enabled && GA4_ID_RE.test(ga4MeasurementId);
  if (!metaOn && !ga4On) return res;

  const rewriter = new HTMLRewriter();

  if (ga4On) {
    rewriter.on("head", {
      element(el) {
        el.append(
          `<script async src="https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}"></script>` +
            `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}` +
            `gtag('js',new Date());gtag('config','${ga4MeasurementId}');</script>`,
          { html: true },
        );
      },
    });
  }

  if (metaOn) {
    rewriter.on("head", {
      element(el) {
        el.append(
          "<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?" +
            "n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;" +
            "n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;" +
            "t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document," +
            `'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');` +
            "fbq('track','PageView');</script>",
          { html: true },
        );
      },
    });
    rewriter.on("body", {
      element(el) {
        el.prepend(
          `<noscript><img height="1" width="1" style="display:none" ` +
            `src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1" /></noscript>`,
          { html: true },
        );
      },
    });
  }

  return rewriter.transform(res);
}

// ----------------------------------------------------------------------------
// Fallback: serve o SPA (assets). Qualquer rota não-API vai para o index.html.
// ----------------------------------------------------------------------------
app.all("*", async (c) => {
  if (c.req.path.startsWith("/api/")) return c.json({ error: "Not found" }, 404);
  let res = await c.env.ASSETS.fetch(c.req.raw);
  // Fallback de SPA: deep links (ex.: /blog/post) que não casam com um arquivo
  // estático devolvem o index.html para o roteador do React assumir.
  if (res.status === 404 && c.req.method === "GET") {
    const url = new URL(c.req.url);
    url.pathname = "/";
    res = await c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  }
  if (c.req.method === "GET") {
    res = await injectTracking(res, c.env.DB);
  }
  return res;
});

export default app;
