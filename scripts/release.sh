#!/usr/bin/env bash
# scripts/release.sh — cut a new better-helium release.
#
# Usage:
#   scripts/release.sh 1.2.3                        # bump, tag, push, release
#   scripts/release.sh v1.2.3                       # leading 'v' is fine
#   scripts/release.sh 1.2.3 --notes-file notes.md  # custom release notes
#   scripts/release.sh 1.2.3 --dry-run              # print plan, change nothing
#   scripts/release.sh 1.2.3 --yes                  # skip confirmation prompt
#
# What it does (in order, fail-fast):
#   1. Validates env: clean tree, on main, in sync with origin, tag unused,
#      tools present, gh authenticated.
#   2. Bumps VERSION constant in `better-helium` (if different from arg).
#   3. Commits the bump (if any) and creates an annotated tag vX.Y.Z.
#   4. Pushes main + the tag to origin.
#   5. Retries the GitHub-generated tarball URL until it's available,
#      then computes its sha256.
#   6. Updates `Formula/better-helium.rb` url + sha256 + version.
#   7. Commits the formula bump and pushes to main.
#   8. Creates a GitHub release (auto-notes unless --notes-file given).
#      Pre-release versions (e.g. 1.0.0-beta.1) are marked --prerelease.

set -euo pipefail

# --- locate repo --------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"

# --- constants ----------------------------------------------------------
readonly REPO_SLUG="vinayakkulkarni/better-helium"
readonly REPO_URL="https://github.com/${REPO_SLUG}"
readonly SCRIPT_FILE="better-helium"
readonly FORMULA_FILE="Formula/better-helium.rb"

# --- colors -------------------------------------------------------------
if [[ -t 1 ]]; then
    RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'
    BLUE=$'\033[34m'; DIM=$'\033[2m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
    RED=; GREEN=; YELLOW=; BLUE=; DIM=; BOLD=; RESET=
fi

step()    { printf "%s→%s %s\n" "$BLUE" "$RESET" "$1"; }
ok()      { printf "%s✓%s %s\n" "$GREEN" "$RESET" "$1"; }
warn()    { printf "%s!%s %s\n" "$YELLOW" "$RESET" "$1"; }
err()     { printf "%s✗%s %s\n" "$RED" "$RESET" "$1" >&2; exit 1; }
dim()     { printf "%s%s%s\n" "$DIM" "$1" "$RESET"; }
heading() { printf "\n%s%s%s\n" "$BOLD" "$1" "$RESET"; }

# --- args ---------------------------------------------------------------
NEW_VERSION=""
NOTES_FILE=""
DRY_RUN=0
ASSUME_YES=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'
            exit 0
            ;;
        --notes-file)
            [[ -n "${2:-}" ]] || err "--notes-file requires a path"
            NOTES_FILE="$2"
            [[ -f "$NOTES_FILE" ]] || err "Notes file not found: $NOTES_FILE"
            shift
            ;;
        --dry-run) DRY_RUN=1 ;;
        --yes|-y)  ASSUME_YES=1 ;;
        -*) err "Unknown flag: $1" ;;
        *)
            [[ -z "$NEW_VERSION" ]] || err "Version specified twice: $NEW_VERSION and $1"
            NEW_VERSION="$1"
            ;;
    esac
    shift
done

[[ -n "$NEW_VERSION" ]] || err "Version required. Usage: scripts/release.sh X.Y.Z"

NEW_VERSION="${NEW_VERSION#v}"

if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
    err "Invalid version: $NEW_VERSION (expected X.Y.Z or X.Y.Z-prerelease)"
fi

readonly TAG="v${NEW_VERSION}"
readonly TARBALL_URL="${REPO_URL}/archive/refs/tags/${TAG}.tar.gz"

PRERELEASE=0
[[ "$NEW_VERSION" =~ - ]] && PRERELEASE=1

# --- preflight ----------------------------------------------------------
heading "Pre-flight checks"

for cmd in git gh curl shasum perl awk grep; do
    command -v "$cmd" >/dev/null || err "Missing required tool: $cmd"
done
ok "Required tools present"

gh auth status >/dev/null 2>&1 || err "gh is not authenticated. Run: gh auth login"
ok "gh authenticated"

git remote get-url origin 2>/dev/null | grep -q "$REPO_SLUG" \
    || err "Not in $REPO_SLUG repo (origin doesn't match)"
ok "Inside $REPO_SLUG repo"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
[[ "$CURRENT_BRANCH" == "main" ]] || err "Not on main (currently on $CURRENT_BRANCH)"
ok "On main branch"

if ! git diff-index --quiet HEAD --; then
    err "Working tree has uncommitted changes. Commit or stash first."
fi
ok "Working tree clean"

git fetch origin main >/dev/null 2>&1
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
[[ "$LOCAL" == "$REMOTE" ]] || err "main is not in sync with origin/main. Pull/push first."
ok "main is in sync with origin"

if git rev-parse "$TAG" >/dev/null 2>&1; then
    err "Tag $TAG already exists locally"
fi
if git ls-remote --tags origin "$TAG" 2>/dev/null | grep -q "refs/tags/${TAG}$"; then
    err "Tag $TAG already exists on origin"
fi
ok "Tag $TAG is available"

CURRENT_VERSION=$(grep '^readonly VERSION=' "$SCRIPT_FILE" \
    | sed -E 's/.*"([^"]+)".*/\1/')

# --- plan summary -------------------------------------------------------
heading "Release plan"
MODE="LIVE"
(( DRY_RUN )) && MODE="${YELLOW}dry-run${RESET}"
[[ -n "$NOTES_FILE" ]] && NOTES_DESC="$NOTES_FILE" || NOTES_DESC="${DIM}auto-generated by gh${RESET}"
PRE_DESC=""
(( PRERELEASE )) && PRE_DESC=" ${YELLOW}(pre-release)${RESET}"
cat <<EOF
  ${BOLD}From${RESET}     $CURRENT_VERSION
  ${BOLD}To${RESET}       $NEW_VERSION$PRE_DESC
  ${BOLD}Tag${RESET}      $TAG
  ${BOLD}Tarball${RESET}  $TARBALL_URL
  ${BOLD}Notes${RESET}    $NOTES_DESC
  ${BOLD}Mode${RESET}     $MODE
EOF

if (( DRY_RUN )); then
    warn "DRY RUN — no changes will be made or pushed."
    exit 0
fi

if (( ASSUME_YES == 0 )); then
    printf "\n%sProceed?%s [y/N] " "$BOLD" "$RESET"
    read -r answer
    [[ "$answer" =~ ^[Yy]$ ]] || { warn "Aborted."; exit 1; }
fi

# --- execute ------------------------------------------------------------

heading "Cutting release"

if [[ "$CURRENT_VERSION" != "$NEW_VERSION" ]]; then
    step "Bumping VERSION in $SCRIPT_FILE: $CURRENT_VERSION → $NEW_VERSION"
    perl -i -pe "s|^readonly VERSION=\"[^\"]+\"|readonly VERSION=\"$NEW_VERSION\"|" "$SCRIPT_FILE"
    grep -q "^readonly VERSION=\"$NEW_VERSION\"" "$SCRIPT_FILE" \
        || err "VERSION bump failed (perl replacement didn't take)"
    git add "$SCRIPT_FILE"
    git commit -m "Bump version to $NEW_VERSION"
    ok "Committed version bump"
else
    dim "  VERSION in $SCRIPT_FILE already $NEW_VERSION — no bump needed"
fi

step "Creating annotated tag $TAG"
git tag -a "$TAG" -m "better-helium $TAG"

step "Pushing main + tag to origin"
git push origin main
git push origin "$TAG"
ok "main + $TAG pushed"

step "Waiting for GitHub to generate $TAG tarball..."
TARBALL_TMP=$(mktemp)
trap 'rm -f "$TARBALL_TMP"' EXIT

NEW_SHA=""
for attempt in 1 2 3 4 5 6 7 8 9 10; do
    sleep 3
    if curl -sfL --max-time 30 "$TARBALL_URL" -o "$TARBALL_TMP" 2>/dev/null; then
        if [[ -s "$TARBALL_TMP" ]]; then
            NEW_SHA=$(shasum -a 256 "$TARBALL_TMP" | awk '{print $1}')
            break
        fi
    fi
    dim "  (attempt $attempt/10 — tarball not ready, retrying)"
done
[[ -n "$NEW_SHA" ]] || err "Couldn't fetch tarball from $TARBALL_URL after 10 attempts"
ok "Tarball ready — sha256: $NEW_SHA"

step "Updating $FORMULA_FILE (url + sha256 + version)"
perl -i -pe "s|^(\s*url \").*(\")|\${1}${REPO_URL}/archive/refs/tags/${TAG}.tar.gz\${2}|" "$FORMULA_FILE"
perl -i -pe "s|^(\s*sha256 \").*(\")|\${1}${NEW_SHA}\${2}|" "$FORMULA_FILE"
perl -i -pe "s|^(\s*version \").*(\")|\${1}${NEW_VERSION}\${2}|" "$FORMULA_FILE"

grep -q "url \"${REPO_URL}/archive/refs/tags/${TAG}.tar.gz\"" "$FORMULA_FILE" \
    || err "Formula url update failed"
grep -q "sha256 \"${NEW_SHA}\"" "$FORMULA_FILE" \
    || err "Formula sha256 update failed"
grep -q "version \"${NEW_VERSION}\"" "$FORMULA_FILE" \
    || err "Formula version update failed"

git add "$FORMULA_FILE"
git commit -m "Update formula to ${TAG} (sha256: ${NEW_SHA:0:12}...)"
git push origin main
ok "Formula updated + pushed"

step "Creating GitHub release"
RELEASE_FLAGS=(--title "$TAG")
if [[ -n "$NOTES_FILE" ]]; then
    RELEASE_FLAGS+=(--notes-file "$NOTES_FILE")
else
    RELEASE_FLAGS+=(--generate-notes)
fi
if (( PRERELEASE )); then
    RELEASE_FLAGS+=(--prerelease)
else
    RELEASE_FLAGS+=(--latest)
fi
gh release create "$TAG" "${RELEASE_FLAGS[@]}"

RELEASE_URL=$(gh release view "$TAG" --json url -q .url)

heading "Released"
printf "  %s%s✓ %s is live%s\n\n" "$GREEN" "$BOLD" "$TAG" "$RESET"
printf "  %sURL%s     %s\n" "$BOLD" "$RESET" "$RELEASE_URL"
printf "  %sTag%s     %s\n" "$BOLD" "$RESET" "$TAG"
printf "  %sSha256%s  %s\n\n" "$BOLD" "$RESET" "$NEW_SHA"
printf "  %sTest the install:%s\n" "$DIM" "$RESET"
printf "    brew reinstall https://raw.githubusercontent.com/%s/main/Formula/better-helium.rb\n" "$REPO_SLUG"
