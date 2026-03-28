const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Forzar que Metro ignore archivos .mjs y use los .js de CommonJS
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => ext !== 'mjs'
);

module.exports = config;