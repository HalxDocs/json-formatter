import { notify } from "../notify";

export function safeParse(jsonString: string): unknown | null {
  try {
    return JSON.parse(jsonString);
  } catch {
    notify({ type: "error", message: "Invalid JSON" });
    return null;
  }
}
