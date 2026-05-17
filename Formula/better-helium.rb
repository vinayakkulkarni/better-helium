# typed: false
# frozen_string_literal: true

# Homebrew formula for better-helium.
#
# Stable install (recommended — pinned to v1.0.0 tarball):
#
#   brew install https://raw.githubusercontent.com/vinayakkulkarni/better-helium/main/Formula/better-helium.rb
#
# Bleeding-edge install (always tracks main branch):
#
#   brew install --HEAD https://raw.githubusercontent.com/vinayakkulkarni/better-helium/main/Formula/better-helium.rb
#
# Tap-based install (cleaner upgrades — `brew upgrade better-helium`):
#
#   brew tap vinayakkulkarni/better-helium https://github.com/vinayakkulkarni/better-helium
#   brew install better-helium
#
# Once installed, the binary lives at $(brew --prefix)/bin/better-helium and is
# reachable from any shell. Drop the .zshrc snippet from the project README
# into your config to surface a DRM-status indicator in your prompt.
class BetterHelium < Formula
  desc "Give Helium browser the DRM playback it ships without"
  homepage "https://github.com/vinayakkulkarni/better-helium"
  url "https://github.com/vinayakkulkarni/better-helium/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "7e1f9757978bfc8329f9fb691bf891a4fb6ce38d292e4861aab70ae9a391e463"
  license "MIT"
  version "1.0.0"

  head "https://github.com/vinayakkulkarni/better-helium.git", branch: "main"

  depends_on :macos

  def install
    bin.install "better-helium"
  end

  def caveats
    <<~EOS
      better-helium is now on your PATH.

      Quick start:
        better-helium --check        # status (exit 0=patched, 1=not, 2=error)
        better-helium                # patch Helium (downloads Chrome.dmg first run)
        better-helium --uninstall    # revert

      The patch needs your macOS password once because Apple's App Management
      protection blocks writes inside /Applications/*.app — the script moves
      Helium to /tmp, patches it, and moves it back.

      RCA (the full why): https://github.com/vinayakkulkarni/better-helium/blob/main/RCA.md

      Re-run after every Helium update — the cached WidevineCdm is reused so
      subsequent patches take ~30 seconds.
    EOS
  end

  test do
    assert_match "better-helium 1.0.0", shell_output("#{bin}/better-helium --version")
    assert_match "better-helium", shell_output("#{bin}/better-helium --help")
    # --check returns 2 when not on macOS or Helium is missing.
    # In the test sandbox there's no Helium, so we accept exit 2.
    output = shell_output("#{bin}/better-helium --check 2>&1", 2)
    assert_match(/Helium|macOS|not (installed|found)/i, output)
  end
end
