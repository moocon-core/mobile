const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Cache transforms per project; the machine-wide Metro cache can serve stale transforms from other projects.
config.cacheStores = ({ FileStore }) => [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
]

// vendor/ (aliased as @moocon/shared and ts-sdk/* in tsconfig) must resolve these from the app's node_modules,
// never a copy of its own; force the app's.
const singletons = ['react', 'zustand', '@solana/web3.js', '@solana/spl-token', '@coral-xyz/anchor', 'buffer']
const appOrigin = path.join(__dirname, 'index.js')
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (singletons.some((name) => moduleName === name || moduleName.startsWith(`${name}/`))) {
    return context.resolveRequest({ ...context, originModulePath: appOrigin }, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
