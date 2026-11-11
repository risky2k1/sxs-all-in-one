import vi from "@/locales/vi.json";

function lookup(key: string): string | undefined {
  let cur: unknown = vi;
  for (const part of key.split(".")) {
    if (typeof cur !== "object" || cur === null || !(part in cur))
      return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function t(key: string): string {
  return lookup(key) ?? key;
}
