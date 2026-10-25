import type { InstallMethod } from '../data/site';

/** Where on the page a tracked element lives. */
export type PageSection =
  | 'header'
  | 'hero'
  | 'install'
  | 'services'
  | 'how'
  | 'footer';

/** Closed event map: event name → its properties. */
export interface AnalyticsEventMap {
  install_copy: {
    method: InstallMethod;
    section: PageSection;
  };
  outbound_click: {
    /** Absolute URL of the link target. */
    target: string;
    section: PageSection;
  };
  theme_changed: {
    preference: 'light' | 'dark' | 'system';
  };
}

export type AnalyticsEvent = keyof AnalyticsEventMap;

// Shape of the Plausible `pa-*.js` global: callable, plus the loader's
// bookkeeping — q (pre-load queue), o (init options the loader boots from), init.
export interface PlausibleFn {
  (...args: unknown[]): void;
  q?: unknown[];
  o?: Record<string, unknown>;
  init?: (options?: Record<string, unknown>) => void;
}

export interface GtagHandle {
  gtag: (...args: unknown[]) => void;
}

export interface PlausibleHandle {
  plausible: (...args: unknown[]) => void;
}

export interface OpenPanelHandle {
  track: (name: string, properties?: Record<string, unknown>) => void;
}

export interface AnalyticsHandles {
  ga?: GtagHandle;
  plausible?: PlausibleHandle;
  openpanel?: OpenPanelHandle;
}
