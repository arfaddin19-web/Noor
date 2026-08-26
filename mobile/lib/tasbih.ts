import AsyncStorage from "@react-native-async-storage/async-storage";

const COUNT_KEY = "noor.tasbih.count";
const TARGET_KEY = "noor.tasbih.target";
const ROUNDS_KEY = "noor.tasbih.rounds";

export async function loadTasbihState(): Promise<{
  count: number;
  target: number;
  rounds: number;
}> {
  const [count, target, rounds] = await Promise.all([
    AsyncStorage.getItem(COUNT_KEY),
    AsyncStorage.getItem(TARGET_KEY),
    AsyncStorage.getItem(ROUNDS_KEY),
  ]);
  return {
    count: count ? parseInt(count, 10) : 0,
    target: target ? parseInt(target, 10) : 33,
    rounds: rounds ? parseInt(rounds, 10) : 0,
  };
}

export async function saveTasbihState(state: {
  count: number;
  target: number;
  rounds: number;
}): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(COUNT_KEY, String(state.count)),
    AsyncStorage.setItem(TARGET_KEY, String(state.target)),
    AsyncStorage.setItem(ROUNDS_KEY, String(state.rounds)),
  ]);
}
