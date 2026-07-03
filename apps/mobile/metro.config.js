// Metro config per monorepo: permette di importare i design-token condivisi
// da packages/design-tokens senza pubblicarli come pacchetto npm separato.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Guarda anche la cartella packages/ del monorepo (per hot-reload dei token).
config.watchFolders = [workspaceRoot];

// Risolvi i moduli sia da apps/mobile/node_modules che dalla root del monorepo.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
