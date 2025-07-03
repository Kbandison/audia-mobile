// supabase/functions/summarize/index.ts

// Import OpenAI fetch polyfill for Deno Edge Functions
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

type SummarizeBody = {
  query: string;
  results: any[];
  detailLevel?: string;
  model?: string;
  memory?: string;
};

Deno.serve(async (req) => {
  try {
    const {
      query,
      results,
      detailLevel,
      model = "gpt-4o",
      memory,
    }: SummarizeBody = await req.json();

    const prompt = `
You are a helpful, accurate assistant. Use all provided conversation context and search results to answer the user's latest question. If the question is a follow-up, use earlier Q&A to infer what they mean.

Conversation so far:
${memory?.trim() ? memory : "(none yet)"}

Relevant search results:
${
  Array.isArray(results) && results.length > 0
    ? results
        .map(
          (r: any, i: number) =>
            r.title && r.description
              ? `${i + 1}. ${r.title}: ${r.description}`
              : r.title
              ? `${i + 1}. ${r.title}`
              : ""
        )
        .join("\n")
    : "(none found)"
}

User's latest question:
${query}

Instructions: 
- If the user asks about something from earlier (e.g., "how about the Cybertruck?"), infer the topic (e.g., price, specs) from previous Q&A.
- If the answer cannot be found in the search results, say so politely.
- Write your answer in a clear, friendly tone. Be ${detailLevel || "concise"}.
`;

    const openaiRes = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        temperature: 0.4,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return new Response(
        JSON.stringify({ error: "OpenAI request failed", detail: errText }),
        { status: 500 }
      );
    }

    const data = await openaiRes.json();
    const summary =
      data.choices?.[0]?.message?.content?.trim() || "(No summary returned)";

    return new Response(JSON.stringify({ summary }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Summarization failed",
        detail: err?.message || String(err),
      }),
      { status: 500 }
    );
  }
});
