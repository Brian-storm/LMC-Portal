import "server-only";

export type Locale = "en" | "zh-hk" | "zh-cn";

const dictionaries = {
  en: () => import("./en.json").then((module) => module.default),
  "zh-hk": () => import("./zh-hk.json").then((module) => module.default),
  "zh-cn": () => import("./zh-cn.json").then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  // Check if locale exists as a key in dictionaries
  const key = (locale in dictionaries ? locale : "en") as Locale;
  return dictionaries[key]();
};

// Export dictionary type for usage across your components
export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
