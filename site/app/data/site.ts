/**
 * Every fact on the page comes from README.md and RCA.md at the repo root.
 * Change those first, then mirror the change here.
 */
export const REPO = 'https://github.com/vinayakkulkarni/better-helium';

export const SITE = {
  name: 'better-helium',
  url: 'https://better-helium.vinayakkulkarni.dev',
  title: 'better-helium — DRM playback for the Helium browser',
  description:
    'Helium ships without Widevine, so Netflix, Hotstar, Disney+ and Spotify refuse to play. better-helium copies Widevine in from Google’s own Chrome installer. One bash script, idempotent, re-run after every Helium update.',
  repo: REPO,
  rca: `${REPO}/blob/main/RCA.md`,
  readme: `${REPO}#readme`,
  license: `${REPO}/blob/main/LICENSE`,
  helium: 'https://helium.computer',
  maintainer: {
    name: 'Vinayak Kulkarni',
    url: 'https://vinayakkulkarni.dev',
  },
} as const;

export type InstallMethod = 'brew' | 'git';

export interface InstallCommand {
  method: InstallMethod;
  label: string;
  /** What the copy button puts on the clipboard: one pasteable line. */
  copy: string;
  /** What the page shows: the same command split for narrow screens. */
  lines: string[];
}

const TAP = 'vinayakkulkarni/better-helium';

export const INSTALL: Record<InstallMethod, InstallCommand> = {
  brew: {
    method: 'brew',
    label: 'Homebrew',
    copy: `brew tap ${TAP} ${REPO} && brew trust ${TAP} && brew install better-helium`,
    lines: [
      `brew tap ${TAP} ${REPO}`,
      `brew trust ${TAP}`,
      'brew install better-helium',
    ],
  },
  git: {
    method: 'git',
    label: 'Git clone',
    copy: `git clone ${REPO}.git && cd better-helium && ./better-helium`,
    lines: [`git clone ${REPO}.git`, 'cd better-helium', './better-helium'],
  },
};

export interface Flag {
  flag: string;
  does: string;
}

export const FLAGS: Flag[] = [
  { flag: 'better-helium', does: 'Patch Helium. No-op if already patched.' },
  {
    flag: '--check',
    does: 'Report status without changing anything. Exit 0 patched, 1 unpatched, 2 error.',
  },
  { flag: '--force', does: 'Re-patch even if Helium already has Widevine.' },
  {
    flag: '--refresh',
    does: 'Re-download Widevine from Chrome to get a newer version.',
  },
  { flag: '--uninstall', does: 'Remove Widevine from Helium and re-sign.' },
];

export interface Service {
  name: string;
  quality: string;
  note: string;
}

export const WORKS: Service[] = [
  {
    name: 'Netflix',
    quality: 'up to 720p',
    note: 'Widevine L3 cap, same as Chrome itself on macOS',
  },
  {
    name: 'Hotstar (Disney+)',
    quality: 'up to 1080p',
    note: 'Generous on L3',
  },
  { name: 'Disney+ (.com)', quality: 'up to 720p', note: 'L3 + HDCP' },
  {
    name: 'YouTube',
    quality: 'full',
    note: 'Widevine helps with paid DRM titles',
  },
  { name: 'Spotify web player', quality: 'full', note: '' },
  {
    name: 'Apple Music web',
    quality: 'full',
    note: 'FairPlay, with the Widevine path also exercised',
  },
];

export const LIMITS: Service[] = [
  {
    name: 'Amazon Prime Video',
    quality: 'SD only',
    note: 'Amazon also checks VMP signing on the browser binary. Only Google can grant VMP, and Helium is not on its licensed-publisher list. Use Safari for HD Prime Video.',
  },
  {
    name: 'Widevine L1 content',
    quality: 'not possible',
    note: 'L1 needs a hardware TEE. Every Chromium browser on macOS, Chrome included, is L3-only.',
  },
];

export type GateState = 'pass' | 'fail' | 'na';

export interface Gate {
  name: string;
  before: { state: GateState; text: string };
  after: { state: GateState; text: string };
}

/** RCA.md TL;DR table. */
export const GATES: Gate[] = [
  {
    name: 'Widevine CDM',
    before: { state: 'fail', text: 'Missing' },
    after: { state: 'pass', text: 'Present, 4.10.x' },
  },
  {
    name: 'Security level',
    before: { state: 'na', text: 'n/a' },
    after: { state: 'pass', text: 'L3, same as Chrome' },
  },
  {
    name: 'VMP signing',
    before: { state: 'fail', text: 'Not licensed' },
    after: { state: 'fail', text: 'Only Google can grant it' },
  },
  {
    name: 'Gatekeeper',
    before: { state: 'pass', text: 'Signed by imput.net' },
    after: { state: 'pass', text: 'Ad-hoc re-signed' },
  },
];

export interface Step {
  title: string;
  body: string;
  code?: string;
}

export const STEPS: Step[] = [
  {
    title: 'Detect Helium and the CPU',
    body: 'Finds the Helium framework version inside /Applications/Helium.app. Apple Silicon maps to mac_arm64, Intel to mac_x64.',
  },
  {
    title: 'Take Widevine from Chrome',
    body: 'Downloads Google’s public Chrome.dmg once (~250 MB), mounts it, copies the WidevineCdm directory to ~/.cache/better-helium and throws the rest away. You do not need Chrome installed.',
  },
  {
    title: 'Move Helium out of /Applications',
    body: 'macOS App Management blocks writes inside app bundles in /Applications, even with sudo. The script quits Helium and moves the bundle to /tmp, where it can write.',
    code: 'sudo mv /Applications/Helium.app /tmp/Helium.app.better-helium.<pid>',
  },
  {
    title: 'Inject, strip, re-sign',
    body: 'Copies WidevineCdm into the Helium framework, strips extended attributes and ad-hoc re-signs the bundle, then verifies the signature.',
    code: 'codesign --force --deep -s - "<tmp_app>"',
  },
  {
    title: 'Move it back',
    body: 'Returns the bundle to /Applications. Open helium://components to see the Widevine Content Decryption Module listed.',
  },
];

export const REQUIREMENTS = [
  'macOS 13 (Ventura) or later',
  'Apple Silicon or Intel, auto-detected',
  'Helium installed in /Applications',
  'Internet on the first run for the Chrome.dmg download',
];
