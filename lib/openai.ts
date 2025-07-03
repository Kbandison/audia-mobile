import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateSummary(
  prompt: string,
  model: "gpt-4o" | "gpt-3.5-turbo"
) {
  const res = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant who summarizes and reports.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 800,
  });

  return res.choices[0].message.content;
}
