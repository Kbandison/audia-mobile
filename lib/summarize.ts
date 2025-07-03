const SUMMARIZE_URL =
  "https://pmrpogghlpviwuurjyrl.supabase.co/functions/v1/summarize";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcnBvZ2dobHB2aXd1dXJqeXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjc4ODQsImV4cCI6MjA2Njk0Mzg4NH0.HunIf-8jSvByPyP-3If3q523tNr6QnZMbk2c0V-9jzM";

export async function summarizeRemote({
  query,
  results,
  detailLevel,
  model = "gpt-4o",
  memory,
}: {
  query: string;
  results: any[];
  detailLevel?: string;
  model?: string;
  memory?: string;
}): Promise<string> {
  const res = await fetch(SUMMARIZE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      query,
      results,
      detailLevel,
      model,
      memory,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Summarize proxy failed: ${errText}`);
  }
  const data = await res.json();
  return data.summary || "";
}
