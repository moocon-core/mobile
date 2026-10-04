#!/usr/bin/env bash
# Builds a signed arm64 release APK locally and publishes it as a GitHub Release.
#   bun run release:apk            # build + publish release v<version>
#   bun run release:apk --draft    # same, but as a draft release
#   bun run release:apk --no-publish  # build only (dist/moocon-<version>.apk)
# Version comes from app.json (expo.version + expo.android.versionCode): bump both before releasing.
set -euo pipefail
cd "$(dirname "$0")/.."

PUBLISH=1
DRAFT=""
for arg in "$@"; do
  case "$arg" in
    --draft) DRAFT="--draft" ;;
    --no-publish) PUBLISH=0 ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

die() { echo "✗ $*" >&2; exit 1; }

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
APKSIGNER="$(ls -d "$ANDROID_HOME"/build-tools/*/ | sort -V | tail -1)apksigner"

VERSION=$(node -p "require('./app.json').expo.version")
VERSION_CODE=$(node -p "require('./app.json').expo.android.versionCode ?? ''")
TAG="v$VERSION"
APK="dist/moocon-$VERSION.apk"
[ -n "$VERSION_CODE" ] || die "Set expo.android.versionCode in app.json"

# The release key lives outside the repo; without it the APK would be debug-signed and un-updatable.
grep -q '^MOOCON_RELEASE_STORE_FILE=' "$HOME/.gradle/gradle.properties" 2>/dev/null ||
  die "Release key not configured: add MOOCON_RELEASE_* to ~/.gradle/gradle.properties"
# The RPC key is baked into the bundle at build time; without it the app would ship the rate-limited public RPC.
RPC_URL="${EXPO_PUBLIC_SOLANA_RPC_URL:-$(grep -E '^EXPO_PUBLIC_SOLANA_RPC_URL=' .env.local 2>/dev/null | cut -d= -f2- || true)}"
[ -n "$RPC_URL" ] || die "Set EXPO_PUBLIC_SOLANA_RPC_URL in .env.local (keyed mainnet RPC)"
grep -q '^EXPO_PUBLIC_MOCK_WALLET=' .env.local 2>/dev/null &&
  echo "• Note: EXPO_PUBLIC_MOCK_WALLET is set but is ignored in release builds"

if [ "$PUBLISH" = 1 ]; then
  [ -z "$(git status --porcelain)" ] || die "Working tree not clean; commit first so the release matches a commit"
  git fetch -q origin
  [ "$(git rev-parse HEAD)" = "$(git rev-parse '@{u}')" ] || die "Push your branch first (HEAD differs from upstream)"
  gh release view "$TAG" >/dev/null 2>&1 && die "Release $TAG already exists; bump expo.version"
fi

echo "• Building Moocon $VERSION ($VERSION_CODE), arm64-v8a"
npx expo prebuild -p android --clean --no-install >/dev/null
# Capped at 6 cores / ~18 GB: 6 Gradle workers, one JVM (8 GB heap + 1 GB metaspace) with Kotlin compiled in-process (no separate
# Kotlin daemon), C++ jobs limited to 6, and no daemon left running afterwards.
export CMAKE_BUILD_PARALLEL_LEVEL=6
(cd android && ./gradlew assembleRelease \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=6 --no-daemon \
  -Dorg.gradle.jvmargs="-Xmx8g -XX:MaxMetaspaceSize=1g -Dfile.encoding=UTF-8" \
  -Pkotlin.compiler.execution.strategy=in-process \
  -q)

mkdir -p dist
cp android/app/build/outputs/apk/release/app-release.apk "$APK"

# Refuse to ship anything signed with the debug key.
CERT=$("$APKSIGNER" verify --print-certs "$APK" | grep -m1 'certificate DN' || true)
[ -n "$CERT" ] || die "APK is not signed"
echo "$CERT" | grep -qi 'Android Debug' && die "APK is debug-signed; check MOOCON_RELEASE_* properties"
# Confirm the configured RPC really is in the bundle.
# (not grep -q: exiting early SIGPIPEs strings and pipefail reports a miss)
unzip -p "$APK" assets/index.android.bundle | strings | grep -F "$RPC_URL" >/dev/null ||
  die "Bundle doesn't contain EXPO_PUBLIC_SOLANA_RPC_URL; check .env.local"
SHA=$(shasum -a 256 "$APK" | cut -d' ' -f1)
echo "• $APK ($(du -h "$APK" | cut -f1)) sha256 $SHA"

[ "$PUBLISH" = 1 ] || exit 0

gh release create "$TAG" "$APK" $DRAFT \
  --target "$(git rev-parse HEAD)" \
  --title "Moocon Mobile v$VERSION" \
  --notes "Android APK (arm64-v8a), version $VERSION ($VERSION_CODE).

Install: download \`moocon-$VERSION.apk\` on the phone and open it (allow installs from that app if asked).

SHA-256: \`$SHA\`"
echo "✓ Published $TAG"
