# Moocon Mobile

Android / Solana Seeker app for [Moocon](https://app.moocon.xyz): Expo + React Native, Expo Router, Solana Web3.js, and Mobile Wallet Adapter via `@wallet-ui/react-native-web3js`.

## Run (development)

Needs Node, Bun, JDK 17 and the Android SDK (`npx solana-mobile@latest doctor` checks all of it).

```sh
bun install
bun run android    # build + install the dev client on an emulator or USB device
bun run dev        # later sessions: start Metro, reopen the installed app
```

Expo Go can't run this app (it uses native modules such as Mobile Wallet Adapter); use the dev client above. The device needs an MWA wallet (Phantom, Solflare, Seed Vault…).

Config: copy `.env.example` to `.env.local` to override `EXPO_PUBLIC_SOLANA_RPC_URL` / `EXPO_PUBLIC_API_URL`. For UI previews, `EXPO_PUBLIC_MOCK_WALLET=<address>` reads the app as that wallet in dev builds (signing is disabled while it's set).

## Release (signed APK → GitHub Release)

1. Bump `expo.version` and `expo.android.versionCode` in `app.json`, commit and push.
2. `bun run release:apk` builds a signed arm64 APK and publishes release `v<version>` (`--draft`, `--no-publish` to only build).

Signing uses the upload key referenced by `MOOCON_RELEASE_*` in `~/.gradle/gradle.properties`; without it, release builds are debug-signed and the script refuses to publish. The key must never change, or installed apps can't update.

Wallets verify the app's identity through `https://app.moocon.xyz/.well-known/assetlinks.json`, which must list package `xyz.moocon.mobile` and the release key's SHA-256 fingerprint.

## Vendored code

`vendor/shared` and `vendor/ts-sdk` (imported as `@moocon/shared` and `ts-sdk/*` via `tsconfig.json` paths) are copies of the shared client code and program SDK from the Moocon monorepo. Change them there first and copy them over, so web and mobile stay in step.
