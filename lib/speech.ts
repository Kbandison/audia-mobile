export function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  // Optional: Set voice or rate
  utterance.rate = 1; // Normal speed
  utterance.pitch = 1; // Normal pitch

  // Optional: pick a specific voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) => v.name.includes("Google") || v.default
  );
  if (preferredVoice) utterance.voice = preferredVoice;

  window.speechSynthesis.speak(utterance);
}
