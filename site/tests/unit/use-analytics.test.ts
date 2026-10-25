import { describe, expect, it, vi } from 'vitest';
import { createAnalytics } from '../../app/composables/use-analytics';

describe('createAnalytics', () => {
  it('sends one track() call to GA4, Plausible and OpenPanel', () => {
    const gtag = vi.fn();
    const plausible = vi.fn();
    const openpanel = vi.fn();
    const { track } = createAnalytics({
      ga: { gtag },
      plausible: { plausible },
      openpanel: { track: openpanel },
    });

    const props = { method: 'brew', section: 'hero' } as const;
    track('install_copy', props);

    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith('event', 'install_copy', props);
    expect(plausible).toHaveBeenCalledOnce();
    expect(plausible).toHaveBeenCalledWith('install_copy', { props });
    expect(openpanel).toHaveBeenCalledOnce();
    expect(openpanel).toHaveBeenCalledWith('install_copy', props);
  });

  it('skips trackers that did not boot (GA4 has no ID yet)', () => {
    const plausible = vi.fn();
    const openpanel = vi.fn();
    const { track } = createAnalytics({
      plausible: { plausible },
      openpanel: { track: openpanel },
    });

    expect(() => track('theme_changed', { preference: 'dark' })).not.toThrow();
    expect(plausible).toHaveBeenCalledOnce();
    expect(openpanel).toHaveBeenCalledWith('theme_changed', {
      preference: 'dark',
    });
  });
});
