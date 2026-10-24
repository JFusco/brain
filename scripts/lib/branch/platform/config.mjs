import { at } from '../../leaf/paths.mjs';
import { json, readJSON } from '../../leaf/json.mjs';

let loadedConfig;
export function config() {
  if (loadedConfig) return loadedConfig;
  const publicConfig = json(at('brain.config.json'));
  const local = readJSON(at('brain.config.local.json'));
  loadedConfig = {
    ...publicConfig,
    ...local,
    toolchain: { ...publicConfig.toolchain, ...local.toolchain },
  };
  return loadedConfig;
}
