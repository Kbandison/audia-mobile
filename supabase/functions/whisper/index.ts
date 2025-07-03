/* eslint-disable import/no-unresolved */
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// @ts-ignore

// supabase/functions/whisper/index.ts
import { serve } from "https://deno.land/std@0.202.0/http/server.ts";


// Your OpenAI API key (already set as a secret/env var in Supabase)
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  // Ensure request is multipart/form-data (audio upload)
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response("Expected multipart/form-data", { status: 400 });
  }

  // Parse incoming form data (Edge Functions use Web APIs!)
  const form = await req.formData();
  const audio = form.get("audio") as File | null;

  if (!audio) {
    return new Response("No audio file uploaded", { status: 400 });
  }

  // Prepare request to OpenAI Whisper
  const openaiForm = new FormData();
  openaiForm.append("file", audio, audio.name || "audio.wav");
  openaiForm.append("model", "whisper-1");
  // openaiForm.append("language", "en"); // Optional: set language

  // Send request to OpenAI
  const openaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: openaiForm,
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.text();
    return new Response(err, { status: 500 });
  }

  const data = await openaiRes.json();
  return new Response(JSON.stringify({ text: data.text }), {
    headers: { "Content-Type": "application/json" },
  });
});
