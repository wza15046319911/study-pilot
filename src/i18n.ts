import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const supportedLocales = new Set(["en", "zh"]);
  const locale =
    localeCookie && supportedLocales.has(localeCookie) ? localeCookie : "en";

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
