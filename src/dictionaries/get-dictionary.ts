import "server-only";
import type { Dictionary } from "./types";

export type Locale = "en" | "zh-hk" | "zh-cn";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./en.json").then((m) => m.default),
  "zh-hk": () => import("./zh-hk.json").then((m) => m.default),
  "zh-cn": () => import("./zh-cn.json").then((m) => m.default),
};

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const key = (locale in dictionaries ? locale : "en") as Locale;
  return dictionaries[key]();
};
