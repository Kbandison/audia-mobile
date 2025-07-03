import { useRef, useState } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

type UseAudioRecorderOptions = {
  silenceThreshold?: number;   // dB for iOS. -50 is usually good, -60 is more sensitive.
  silenceDuration?: number;    // ms. How long silence must last before auto-stop.
  androidVolumeThreshold?: number; // 0-100, usually 5–10.
};

export function useAudioRecorder({
  silenceThreshold = -50,       // dB (iOS)
  silenceDuration = 1200,       // ms
  androidVolumeThreshold = 70,   // Android 0–100
}: UseAudioRecorderOptions = {}) {
  const [recording, setRecording] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(null);

  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  const startRecording = async () => {
    setAudioPath(null);
    setRecording(true);

    await audioRecorderPlayer.startRecorder();

    audioRecorderPlayer.addRecordBackListener((e) => {
      audioRecorderPlayer.addRecordBackListener((e) => {
  console.log("Metering:", e.currentMetering, "Volume:", (e as any).currentVolume);
  // ... rest of logic
});

      let silent = false;

      // iOS: currentMetering is dB (-160=quiet, 0=loud)
      if (typeof e.currentMetering === "number") {
        silent = e.currentMetering < silenceThreshold;
      }
      // Android: currentVolume (0-100), not always typed
      else if (typeof (e as any).currentVolume === "number") {
        silent = (e as any).currentVolume < androidVolumeThreshold;
      }

      if (silent) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            stopRecording();
          }, silenceDuration);
        }
      } else {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }
      return;
    });
  };

  const stopRecording = async () => {
    audioRecorderPlayer.removeRecordBackListener();
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const uri = await audioRecorderPlayer.stopRecorder();
    setAudioPath(uri);
    setRecording(false);
    return uri;
  };

  const resetRecording = () => setAudioPath(null);

  return { recording, audioPath, startRecording, stopRecording, resetRecording };
}
