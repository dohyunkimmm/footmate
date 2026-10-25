
import { Buffer } from "node:buffer";
import aiHandler from "./ai-handler.cjs";

function send(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extra
    }
  });
}

// 기존 Supabase 설정 API
function betaConfig(request, env) {
  if (request.method !== "GET") {
    return send(
      { connected: false, code: "METHOD_NOT_ALLOWED" },
      405,
      { allow: "GET" }
    );
  }

  const url = String(env.SUPABASE_URL || "")
    .trim()
    .replace(/\/$/, "");

  const publishableKey = String(
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    ""
  ).trim();

  if (!url || !publishableKey) {
    return send({
      connected: false,
      code: "BETA_BACKEND_NOT_CONFIGURED"
    }, 503);
  }

  try {
    if (new URL(url).protocol !== "https:") {
      throw new Error("Invalid Supabase URL");
    }
  } catch {
    return send({
      connected: false,
      code: "BETA_BACKEND_INVALID_CONFIG"
    }, 503);
  }

  return send({
    connected: true,
    url,
    publishableKey
  });
}

// 기존 Vercel AI 함수를 Cloudflare 요청과 연결
async function callAI(request) {
  const url = new URL(request.url);
  const headers = Object.fromEntries(request.headers);

  headers.host = url.host;
  headers["x-forwarded-for"] =
    request.headers.get("cf-connecting-ip") ||
    "127.0.0.1";

  const req = {
    method: request.method,
    headers,
    socket: {
      remoteAddress: headers["x-forwarded-for"]
    },

    async *[Symbol.asyncIterator]() {
      if (!request.body) return;

      const reader = request.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield Buffer.from(value);
        }
      } finally {
        reader.releaseLock();
      }
    }
  };

  const res = {
    statusCode: 200,
    headers: new Headers(),
    body: null,

    setHeader(name, value) {
      this.headers.set(name, String(value));
    },

    end(value) {
      this.body = value;
    }
  };

  await aiHandler(req, res);

  return new Response(res.body, {
    status: res.statusCode,
    headers: res.headers
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Supabase 설정 API
    if (path === "/api/beta-config") {
      return betaConfig(request, env);
    }

    // AI 추천 API
   
if (path === "/api/ai-match-assistant") {
  if (request.method === "POST") {
    const { success } = await env.AI_RATE_LIMITER.limit({
      key: "footmate-ai-post"
    });

    if (!success) {
      return send({
        error: "rate_limited",
        retryable: true
      }, 429, {
        "retry-after": "60"
      });
    }
  }

  return callAI(request);
}
    if (path.startsWith("/api/")) {
      return send({ error: "not_found" }, 404);
    }

    // FootMate 첫 화면
    if (path === "/") {
      url.pathname = "/index.html";
      return env.ASSETS.fetch(
        new Request(url.toString(), request)
      );
    }

    // 기존 리디렉션
    const redirects = [
      "/app",
      "/app.html",
      "/demo.html",
      "/next",
      "/next.html"
    ];

    if (redirects.includes(path)) {
      return Response.redirect(
        `${url.origin}/demo?entry=footmate`,
        302
      );
    }

    // 기존 페이지 경로
    const pages = {
      "/demo": "/beta.html",
      "/beta": "/beta.html",
      "/beta/operator": "/beta-operator.html",
      "/prototype": "/app.html"
    };

    if (pages[path]) {
      url.pathname = pages[path];
      return env.ASSETS.fetch(
        new Request(url.toString(), request)
      );
    }

    return env.ASSETS.fetch(request);
  }
};