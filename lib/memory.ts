// lib/memory.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveMemory(memory: any) {
  await AsyncStorage.setItem("audia-memory", JSON.stringify(memory));
}
export async function loadMemory() {
  const val = await AsyncStorage.getItem("audia-memory");
  return val ? JSON.parse(val) : null;
}
export async function clearMemory() {
  await AsyncStorage.removeItem("audia-memory");
}
