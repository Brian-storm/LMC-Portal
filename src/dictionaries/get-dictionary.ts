import "server-only";

export type Locale = "en" | "zh-hk" | "zh-cn";

const dictionaries = {
  en: () => import("./en.json").then((module) => module.default),
  "zh-hk": () => import("./zh-hk.json").then((module) => module.default),
  "zh-cn": () => import("./zh-cn.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};
