# RCA — Why Helium can't play DRM, and exactly what this patch does

> If `README.md` is the *what*, this is the *why*. Pour yourself a coffee.

---

## TL;DR

| Layer | Status on stock Helium | Status after `better-helium` |
|---|---|---|
| **WidevineCdm presence** | ❌ Missing — Helium ships without it | ✅ Present (4.10.x from Chrome.dmg) |
| **Widevine security level** | N/A | L3 (software) — same as Chrome itself on macOS |
| **VMP signing** | ❌ Helium is not on Google's licensed-publisher list | ❌ Still not — only Google can issue this |
| **macOS Gatekeeper** | ✅ Signed by imput.net | ✅ Ad-hoc re-signed (still valid) |

**Two services to think about:**

- **Netflix, Hotstar, Disney+, Spotify, YouTube Premium DRM**: only check Widevine presence + L3 level. → Work after this patch.
- **Amazon Prime Video**: also checks **VMP signing**. → Stays SD-locked even after this patch. Use Safari.

---

## The actors

There are five separate cryptographic / OS-level gates that DRM streaming on macOS browsers depends on. Most articles conflate them; let's separate them cleanly.

### 1. Widevine CDM — *the decryptor*

`libwidevinecdm.dylib` is a proprietary, closed-source library Google ships inside Chrome, Edge, Brave, Vivaldi, Arc, and any Chromium fork that has a commercial relationship with Google. It accepts encrypted media segments and license tokens, decrypts the segments, and hands them to the browser's video pipeline.

- **Without it, no Widevine-protected video plays. Period.**
- It ships as a 17 MB Mach-O dylib at `<Browser.app>/Contents/Frameworks/<Browser> Framework.framework/Versions/<ver>/Libraries/WidevineCdm/_platform_specific/mac_arm64/libwidevinecdm.dylib`.
- Helium *doesn't ship this library* because shipping it requires a license Helium doesn't have. That's the entire problem `better-helium` exists to solve.

### 2. Widevine security level — L1, L2, L3

The CDM advertises a *security level* to streaming services via the EME (Encrypted Media Extensions) API. There are three:

| Level | Crypto runs in | Video decode runs in | Where you find it |
|---|---|---|---|
| **L1** | Hardware TEE | Hardware TEE | Android phones, ChromeOS, Edge-on-Windows-with-PlayReady-SL3000 |
| **L2** | Hardware TEE | Software | Rare, transitional |
| **L3** | Software | Software | **All Chromium browsers on macOS**, all Chromium on Linux, Firefox on every desktop OS |

**There is no L1 Widevine for any Chromium browser on macOS.** Apple does not expose the Secure Enclave to Chromium for DRM use. Google does not ship an L1 macOS dylib. This is structural, not a missing feature.

That's why even Chrome itself caps Netflix at 720p on a Mac.

### 3. VMP — Verified Media Path

This one is rarely explained. Google requires that any browser that ships Widevine sign its **entire binary** with a special Google-issued certificate called the **Verified Media Path** signature. Streaming services can inspect the host process and refuse to license content to a non-VMP-signed browser, even one with a valid CDM at the correct security level.

- Chrome, Edge, Brave, Vivaldi, Arc, Opera, Whale, Yandex: all VMP-signed (Google has commercial agreements with each).
- **Helium, Thorium, Ungoogled-Chromium, and other open-source forks: not VMP-signed.** Google won't issue VMP to projects that aren't registered commercial entities meeting their security review bar — and even when one tries (Helium has, per [issue #116](https://github.com/imputnet/helium/issues/116)), the process is stalled.
- We cannot inject VMP. It's not a file. It's a cryptographic signature rooted in Google's CA, validated server-side by streaming services.

**This is why Prime Video stays SD even after our patch.** Amazon checks VMP explicitly. Most other services don't.

### 4. HDCP — High-bandwidth Digital Content Protection

The display-pipeline protection layer. Checks that the link from your Mac to its display is end-to-end encrypted with at least HDCP 2.2.

- Built-in Apple displays are always HDCP 2.2 compliant.
- External displays over Thunderbolt/USB-C with proper DP/HDMI cables are usually fine.
- Old DVI dongles, KVM switches, capture cards, and recording tools fail HDCP.
- HDCP is **separate** from Widevine and VMP. A browser can pass DRM checks but fail HDCP, and vice versa.

When Amazon shows the *"Your video will play in Standard Definition because your computer hardware, HDMI cables, and display must all meet content protection (HDCP) requirements"* warning, **that wording is misleading**. In 95% of macOS Chromium cases the actual failure is VMP, not HDCP. Amazon just reuses the HDCP error string as a generic "DRM trust failed" message.

### 5. Code signing — macOS Gatekeeper

Distinct from VMP. macOS itself requires that any app you run be code-signed by a recognized developer (or ad-hoc). When we modify the Helium bundle, the existing imput.net signature is invalidated. We re-sign with `codesign --force --deep -s -` (ad-hoc), which produces a valid local signature that Gatekeeper accepts. This satisfies macOS but does *not* satisfy VMP — VMP is rooted in Google's certificates, not Apple's.

---

## What `better-helium` actually does

Step by step:

### 1. Detect Helium and architecture

```text
/Applications/Helium.app/Contents/Frameworks/Helium Framework.framework/Versions/148.0.7778.96/
```

Apple Silicon → `mac_arm64`. Intel → `mac_x64`.

### 2. Download `WidevineCdm` from Google Chrome

We hit `https://dl.google.com/chrome/mac/universal/stable/GGRO/googlechrome.dmg` — Google's public Chrome installer. We mount the DMG, navigate to:

```text
Google Chrome.app/Contents/Frameworks/Google Chrome Framework.framework/Versions/<latest>/Libraries/WidevineCdm/
```

…and copy that directory to `~/.cache/better-helium/WidevineCdm/`. Then we unmount and delete the DMG.

Why not Google's CRX component-update endpoint? Because Google returns `204 No Content` to unauthenticated CRX requests as of 2023 (anti-piracy hardening). The Chrome DMG remains the canonical public source.

The cached `WidevineCdm` is reused on subsequent runs. `--refresh` forces re-download.

### 3. Quit Helium gracefully

`osascript -e 'tell application "Helium" to quit'`. If it doesn't quit within 5 seconds, we bail out — the user needs to close it manually rather than risk a forced kill leaving corrupted profile data.

### 4. Move the bundle to `/tmp`

This is the non-obvious part. macOS 14+ has **App Management TCC**, which blocks writes inside any app bundle under `/Applications/` whose `com.apple.provenance` extended attribute is set. **Even `sudo` cannot bypass this.** The trick is to move the entire bundle out of the protected location:

```sh
sudo mv /Applications/Helium.app /tmp/Helium.app.better-helium.<pid>
```

This needs administrator privileges, which we trigger via AppleScript's `do shell script ... with administrator privileges`. macOS shows the password dialog; the user authorizes. The password never reaches the script — only Apple's GUI prompt sees it.

### 5. Inject `WidevineCdm` and re-sign

In `/tmp` we have full write access:

```sh
cp -R ~/.cache/better-helium/WidevineCdm "<tmp_app>/Contents/Frameworks/Helium Framework.framework/Versions/<ver>/Libraries/"
xattr -cr "<tmp_app>"                              # strip quarantine + provenance
codesign --force --deep -s - "<tmp_app>"           # ad-hoc re-sign
codesign -v "<tmp_app>"                            # verify
```

### 6. Move the bundle back

Another `sudo mv` via AppleScript. This is a second password prompt unless macOS keeps the credential warm (it usually does — both moves happen within the same `osascript` cache window, so users typically see one prompt total).

### 7. Done

The user opens Helium → `helium://components` → sees `Widevine Content Decryption Module — Version: 4.10.x`. Status will say "Update error" because Helium isn't on Google's component-update allowlist — that's harmless. The local CDM is what playback uses.

---

## Why Netflix and Hotstar work, but Prime doesn't

After this patch:

- **Widevine present**: ✅ (we just installed it)
- **Widevine L3**: ✅ (the only level macOS Chromium can ever achieve)
- **VMP**: ❌ (only Google can grant this, ad-hoc resigning destroyed any chance)
- **HDCP**: ✅ (assuming a normal Mac setup)

**Netflix's gate**: Widevine present + L3-or-better → 720p.
→ ✅ Works.

**Hotstar's gate**: Widevine present + L3-or-better → 1080p.
→ ✅ Works.

**Disney+'s gate**: Widevine present + L3-or-better + HDCP → 720p.
→ ✅ Works.

**Amazon Prime Video's gate**: Widevine present + L3-or-better + **VMP** + HDCP → 1080p. Without VMP → 480p (SD).
→ ❌ SD-locked. **There is no software fix on macOS.** Use Safari, where Apple's system-level FairPlay+Widevine integration is functionally VMP-equivalent in Amazon's trust list.

---

## Frequently expected questions

**Q: Could you ship the `WidevineCdm` directly in this repo so I don't need to download Chrome?**
A: No. `libwidevinecdm.dylib` is proprietary and we'd be redistributing it without a license. Downloading from Google's official server keeps us legally clean — you're getting the same binary the same way Chrome itself does.

**Q: Will Helium auto-update break this?**
A: Yes. Helium updates rewrite the bundle and remove our injected `WidevineCdm`. Just re-run `./better-helium` after any update. Takes 30 seconds with the CDM already cached.

**Q: Can I get HD Prime Video on macOS without using Safari?**
A: Not in any Chromium browser, including Chrome itself. Use Safari. (Or the Prime Video app for iOS/iPadOS/Apple TV if you have those devices.)

**Q: Does this work on Intel Macs?**
A: Yes, the script auto-detects `x86_64` and copies the `mac_x64` Widevine binary instead.

**Q: Why not download Chromium's open-source Widevine binary?**
A: There isn't one. Widevine is closed-source and ships only inside commercial Chromium builds.

**Q: My iCloud Passwords browser extension broke after running this.**
A: Known side effect of ad-hoc re-signing. Apple's iCloud Passwords extension validates the browser's Team ID against a whitelist. Helium's Team ID is replaced by ad-hoc when we re-sign, so iCloud Passwords refuses to load. Use 1Password, Bitwarden, or another extension while Helium is patched.

**Q: Is this the same technique as `neon` or `helium-drm-fixer`?**
A: Same core technique, narrower scope. `helium-drm-fixer` was a manual gist; `neon` adds multi-browser support, menu-bar UI, and a LaunchDaemon for auto-patching. `better-helium` is a deliberately minimal version: Helium only, one script, no background processes.
