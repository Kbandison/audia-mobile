// lib/search.ts

const SUPABASE_URL = "https://pmrpogghlpviwuurjyrl.supabase.co/functions/v1/search-proxy";

const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcnBvZ2dobHB2aXd1dXJqeXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjc4ODQsImV4cCI6MjA2Njk0Mzg4NH0.HunIf-8jSvByPyP-3If3q523tNr6QnZMbk2c0V-9jzM"; // Replace with your actual anon key

export async function searchBrave(query: string) {
  const res = await fetch(SUPABASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase search-proxy failed: ${errorText}`);
  }
  const data = await res.json();
  return data.results || [];
}
