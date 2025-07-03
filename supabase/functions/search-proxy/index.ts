const BRAVE_API_KEY = Deno.env.get("BRAVE_API_KEY");

Deno.serve(async (req) => {
  try {
    const { query } = await req.json();
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": BRAVE_API_KEY as string,
      },
    });
    const data = await res.json();
    const results = (data.web?.results || []).map((r: any) => ({
      title: r.title,
      description: r.description || "",
      url: r.url || "",
    }));
    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", detail: err?.message || err }),
      { status: 500 }
    );
  }
});
