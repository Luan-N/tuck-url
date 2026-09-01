interface ShortenRequest {
  url?: string;
  expiration?: string;
  customCode?: string;
}

interface StoredLink {
  original_url: string;
  expires_at: string | null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {
    const requestUrl = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (
      request.method === "POST" &&
      requestUrl.pathname === "/shorten"
    ) {
      return handleShorten(request, env);
    }

    if (
      request.method === "GET" &&
      requestUrl.pathname !== "/"
    ) {
      const code = requestUrl.pathname.slice(1);

      return handleRedirect(code, env);
    }

    return Response.json(
      { error: "Route not found" },
      {
        status: 404,
        headers: corsHeaders
      }
    );
  }
};

async function handleShorten(
  request: Request,
  env: Env
): Promise<Response> {
  {
    try {
      const data = await request.json() as ShortenRequest;
      
      // Use custom code if provided, otherwise generate one
      const code = data.customCode?.trim() || generateShortCode();

      const workerUrl = new URL(request.url);
      const shortUrl = `${workerUrl.origin}/${code}`;

      const expiresAt = calculateExpiration(data.expiration);

      const result = await env.tuck_url_db
  .prepare(
    `INSERT INTO links (
      code,
      original_url,
      expires_at
    ) VALUES (?, ?, ?)
    ON CONFLICT(code) DO NOTHING`
  )
  .bind(code, data.url, expiresAt)
  .run();

if (result.meta.changes === 0) {
  // Nothing was inserted because this code already exists
  return Response.json(
    { error: "That short code is already taken" },
    {
      status: 409,
      headers: corsHeaders
    }
  );
}

      return Response.json(
        { message: "Short URL created", shortUrl, code },
        { status: 201, headers: corsHeaders }
      );
    } catch (error) {
      return Response.json(
        { error: "Failed to create short URL" },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  function generateShortCode(length = 7): string {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(
        Math.random() * characters.length
      );

      code += characters[randomIndex];
    }

    return code;
  }
}

async function handleRedirect(
  code: string,
  env: Env
): Promise<Response> {
  const link = await env.tuck_url_db
    .prepare(
      `SELECT original_url, expires_at
       FROM links
       WHERE code = ?`
    )
    .bind(code)
    .first<StoredLink>();

  if (!link) {
    return new Response("Short URL not found", {
      status: 404
    });
  }

  if (
    link.expires_at &&
    Date.now() >= new Date(link.expires_at).getTime()
  ) {
    return new Response("This short URL has expired", {
      status: 410
    });
  }

  return Response.redirect(link.original_url, 302);
}

function calculateExpiration(
  expiration: string | undefined
): string | null {
  const durations: Record<string, number> = {
    "1h": 60 * 60 * 1000,          // 1 Hour
    "1d": 24 * 60 * 60 * 1000,        // 1 Day
    "1w": 7 * 24 * 60 * 60 * 1000,   // 1 Week
    "1mo": 30 * 24 * 60 * 60 * 1000,  // 1 Month
    "1y": 365 * 24 * 60 * 60 * 1000   // 1 Year
  };

  if (!expiration || expiration === "never") {
    return null;
  }

  const duration = durations[expiration];

  if (!duration) {
    throw new Error("Invalid expiration option");
  }

  return new Date(Date.now() + duration).toISOString();
}