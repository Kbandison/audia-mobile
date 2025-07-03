import { useAudioRecorder } from "@/hooks/useAudioRecorder"; // Import the hook from previous code
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// -- Replace these endpoints with your own! --
const WHISPER_ENDPOINT =
  "https://pmrpogghlpviwuurjyrl.supabase.co/functions/v1/whisper";
const AI_SEARCH_ENDPOINT =
  "https://pmrpogghlpviwuurjyrl.supabase.co/functions/v1/search-proxy";

export default function VoiceAssistantScreen() {
  const {
    recording,
    audioPath,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>(
    undefined
  );

  // Get available TTS voices on mount
  useEffect(() => {
    Speech.getAvailableVoicesAsync().then(setVoices);
  }, []);

  // When a new audioPath is set (finished recording), auto-transcribe!
  useEffect(() => {
    if (audioPath) {
      handleTranscribe(audioPath);
    }
  }, [audioPath]);

  const handleTranscribe = async (uri: string) => {
    setTranscript("");
    setAnswer("");
    setPrompt("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", {
        uri,
        type: "audio/m4a",
        name: "audio.m4a",
      } as any);
      const response = await fetch(WHISPER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      setTranscript(data.text);
      setPrompt(data.text);
    } catch (e: any) {
      Alert.alert("Transcription error", e.message || String(e));
    }
    setLoading(false);
  };

  const handleAskAI = async () => {
    setAnswer("");
    setLoading(true);
    try {
      const response = await fetch(AI_SEARCH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      const text = data.answer ?? data.result ?? JSON.stringify(data);
      setAnswer(text);
      speak(text);
    } catch (e: any) {
      Alert.alert("AI Error", e.message || String(e));
    }
    setLoading(false);
  };

  const speak = (text: string) => {
    if (!text) return;
    setTtsSpeaking(true);
    Speech.speak(text, {
      voice: selectedVoice,
      onDone: () => setTtsSpeaking(false),
      onStopped: () => setTtsSpeaking(false),
      language: "en-US",
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setTtsSpeaking(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🎤 AI Voice Assistant Demo</Text>

      {/* --- Voice Recording --- */}
      <View style={styles.section}>
        <Button
          title={recording ? "Recording... Tap to Stop" : "Tap to Speak"}
          onPress={recording ? stopRecording : startRecording}
          color={recording ? "red" : undefined}
        />
        <Button
          title="Reset"
          onPress={resetRecording}
          disabled={recording}
          color="gray"
        />
        <Text style={styles.hint}>
          {recording
            ? "Listening... (auto-stops when you stop talking for ~1s)"
            : "Tap to record your question"}
        </Text>
      </View>

      {/* --- Transcript --- */}
      {loading && <ActivityIndicator style={{ marginBottom: 20 }} />}
      {transcript ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcript:</Text>
          <Text style={styles.transcript}>{transcript}</Text>
        </View>
      ) : null}

      {/* --- Prompt Edit / Text Input --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prompt to AI:</Text>
        <TextInput
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Type or edit your question..."
          multiline
        />
        <Button
          title="Ask AI"
          onPress={handleAskAI}
          disabled={!prompt.trim() || loading}
        />
      </View>

      {/* --- AI Answer and TTS --- */}
      {answer ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Answer:</Text>
          <Text style={styles.answer}>{answer}</Text>
          <Button
            title="🔊 Speak"
            onPress={() => speak(answer)}
            disabled={!answer}
          />
          <Button
            title="🛑 Stop Speaking"
            onPress={stopSpeaking}
            disabled={!ttsSpeaking}
            color="red"
          />
        </View>
      ) : null}

      {/* --- Voice Picker --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TTS Voices</Text>
        {voices.length === 0 && <Text>Loading voices...</Text>}
        {voices.map((v) => (
          <Button
            key={v.identifier}
            title={`${v.name} (${v.language})`}
            color={selectedVoice === v.identifier ? "green" : undefined}
            onPress={() => setSelectedVoice(v.identifier)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, backgroundColor: "#fff" },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
  },
  section: { marginBottom: 26 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  transcript: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 4,
    color: "#555",
  },
  input: {
    borderColor: "#bbb",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
    minHeight: 40,
    fontSize: 16,
  },
  answer: { marginTop: 8, fontSize: 16, fontStyle: "italic", color: "#222" },
  hint: { marginTop: 8, fontSize: 14, color: "#888" },
});
