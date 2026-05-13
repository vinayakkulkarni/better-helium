# better-helium

Give the [Helium browser](https://helium.computer) the DRM playback it ships without — Netflix, Hotstar, Disney+, Spotify, YouTube Premium DRM titles. One script. Idempotent. Re-run after every Helium update.

```sh
git clone https://github.com/vinayakkulkarni/better-helium.git
cd better-helium
./better-helium
```

That's it. macOS will prompt for your password once; we'll explain why below.

---

## What this does

Helium is a privacy-focused Chromium fork by [imput.net](https://imput.net). Because Widevine licensing requires a commercial agreement with Google that Helium doesn't have, the Helium bundle ships **without** the `WidevineCdm` library — so Netflix, Disney+, Spotify, and friends refuse to play.

`better-helium`:

1. Downloads Google's official `Chrome.dmg` (~250 MB, one time, cached locally).
2. Extracts the `WidevineCdm` library from inside Chrome.
3. Copies it into `Helium.app/Contents/Frameworks/Helium Framework.framework/Versions/<ver>/Libraries/`.
4. Strips macOS extended attributes and ad-hoc re-signs the bundle.

After it runs, Helium can decrypt Widevine-protected streams.

---

## Requirements

- macOS 13 (Ventura) or later
- Apple Silicon **or** Intel — auto-detected
- [Helium](https://helium.computer) installed in `/Applications/`
- An active internet connection on first run (~250 MB Chrome.dmg download, cached after)

You **do not** need Google Chrome installed. The script downloads the DMG, extracts what it needs, throws the rest away.

---

## Usage

```sh
./better-helium             # Patch Helium. No-op if already patched.
./better-helium --check     # Report status without changing anything.
./better-helium --force     # Re-patch even if Helium already has Widevine.
./better-helium --refresh   # Re-download Widevine from Chrome (get newer version).
./better-helium --uninstall # Remove Widevine from Helium, ad-hoc re-sign.
```

When Helium auto-updates, just re-run `./better-helium`. The cached Widevine is reused — patch takes ~30 seconds.

### `--check` for scripts and shell prompts

`--check` is read-only and exits with a meaningful code:

| Exit | Meaning |
|------|---------|
| `0` | Helium has WidevineCdm installed (patched) |
| `1` | Helium present but unpatched |
| `2` | Error (Helium not installed, unreadable, etc.) |

Useful in `.zshrc` / Starship / Powerlevel10k:

```sh
# Show a shield in your prompt only when Helium is patched
better-helium --check >/dev/null 2>&1 && echo "🛡️"
```

Or in a CI / health-check script:

```sh
if better-helium --check >/dev/null; then
    echo "Helium DRM ready"
else
    better-helium  # auto-repair
fi
```

---

## What works after patching

| Service | Resolution | Notes |
|---|---|---|
| Netflix | up to 720p | Widevine L3 cap — same as Chrome itself on macOS |
| Hotstar (Disney+) | up to 1080p | Amazon is uniquely generous on L3 |
| Disney+ (.com) | up to 720p | |
| YouTube | full | Widevine optional here, just helps with paid DRM titles |
| Spotify web player | full | |
| Apple Music web | full | Uses FairPlay, but Widevine path is also exercised |

## What still won't work

| Service | Why |
|---|---|
| **Amazon Prime Video** | Caps at **SD**. Amazon checks **VMP signing** on the browser binary, not just Widevine. Helium isn't on Google's licensed-publisher list, so the check fails. **Use Safari for HD Prime Video.** |
| Anything requiring Widevine **L1** | L1 needs a hardware TEE (Trusted Execution Environment). macOS Chromium browsers — including Chrome itself — are all L3-only. This is an architectural limit of macOS, not Helium. |

The full technical story lives in [**RCA.md**](./RCA.md).

---

## Why does it ask for my password?

Because macOS's **App Management TCC** protection blocks all writes inside `/Applications/*.app` — even with `sudo` — when the `com.apple.provenance` extended attribute is set. The workaround is to move the entire bundle to `/tmp`, modify it there, and move it back. Moving in and out of `/Applications` requires elevation, which only the macOS GUI authentication dialog can grant. AppleScript's `do shell script ... with administrator privileges` triggers that dialog.

In short: your password goes only to macOS's own prompt, never to this script. The script never sees or stores it.

---

## How re-signing affects Helium

We re-sign the modified bundle ad-hoc (`codesign --force --deep -s -`). This means:

- The bundle is no longer signed by imput.net.
- macOS Gatekeeper won't complain because the original signature is replaced with a valid (if anonymous) one.
- Helium continues to work normally for everything except features that depend on the original Team ID. **One known side effect**: iCloud Passwords browser extension stops working with ad-hoc signed Chromium forks. If you use it, you'll need a different password manager (1Password, Bitwarden, etc.) while Helium is patched.

---

## Uninstall

```sh
./better-helium --uninstall
```

Removes `WidevineCdm` from the Helium bundle and re-signs. Helium goes back to its original DRM-less state. The cached Widevine in `~/.cache/better-helium/` is kept; delete it manually if you want it gone.

---

## Prior art

- [vikas5914/helium-drm-fixer](https://github.com/vikas5914/helium-drm-fixer) — the original gist that documented the patch by hand.
- [nicholasraimbault/neon](https://github.com/nicholasraimbault/neon) — a much more ambitious fork: multi-browser support, menu-bar app, LaunchDaemon for auto-patching on update, brew install. If you want all that, use Neon. `better-helium` is deliberately minimal: one script, Helium-only, no daemon, no UI.
- [claudiodekker's Ungoogled-Chromium gist](https://gist.github.com/claudiodekker/4c9f40654106ff6717865d73cca7580e) — the Chrome.dmg extraction technique we use.

---

## License

MIT — see [LICENSE](./LICENSE).
