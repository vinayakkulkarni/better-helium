import type { GtagHandle } from '~/types/analytics';
import { isAutomationBrowser } from '~/utils/automation-browser';

export default defineNuxtPlugin(() => {
  // GA4 is optional: no measurement ID yet means no gtag at all.
  const gtagId = useRuntimeConfig().public.gtagId;
  if (!gtagId || isAutomationBrowser()) return;

  const { proxy } = useScriptGoogleAnalytics({ id: gtagId });

  const ga: GtagHandle = {
    gtag: (...args: unknown[]) => {
      (proxy.gtag as (...a: unknown[]) => void)(...args);
    },
  };

  return { provide: { ga } };
});

declare module '#app' {
  interface NuxtApp {
    $ga?: GtagHandle;
  }
}
