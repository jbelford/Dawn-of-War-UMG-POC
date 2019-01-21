import * as fs from 'fs';
import * as ini from 'ini';
import * as path from 'path';

export namespace Soulstorm {

  export function getModules(dir: string): Module[] {
    const modules = fs.readdirSync(dir, { withFileTypes: true })
      .filter(file => file.isFile() && /\.module$/.test(file.name))
      .map(file => path.join(dir, file.name))
      .map(filepath => fs.readFileSync(filepath, 'utf8'))
      .map(data => ini.parse(data).global)
      .map(config => (<Module>{
        name: config.UIName,
        description: config.Description,
        dllName: config.DllName,
        modFolder: config.ModFolder,
        version: config.ModVersion,
        textureFe: config.TextureFE,
        dataFolders: Object.keys(config).filter(key => /^DataFolder\.\d+$/.test(key)).map(key => config[key]),
        requiredMods: Object.keys(config).filter(key => /^RequiredMod\.\d+$/.test(key)).map(key => config[key])
      }))
      .map(mod => replaceLocales(dir, mod));


    return modules;
  }

  function replaceLocales(dir: string, mod: Module) {
    const keys = Object.keys(mod)
      .filter(key => typeof mod[key] === 'string')
      .filter(key => /^\$\d+$/.test(mod[key]));

    if (keys.length > 0) {
      const localeData = getLocaleData(dir, mod);
      keys.forEach(key => {
        mod[key] = localeData[mod[key]];
      });
    }

    return mod;
  }

  function getLocaleData(dir: string, mod: Module) {
    const localeData = {};
    const localePath = path.join(dir, mod.modFolder, 'locale', 'English');
    fs.readdirSync(localePath, { withFileTypes: true })
      .filter(file => file.isFile() && /\.ucs$/.test(file.name))
      .map(file => fs.readFileSync(path.join(localePath, file.name), { encoding: 'ucs2' }))
      .forEach(data => {
        data.trim().split(/\n+/g).map(line => line.split(/\s+/g)).forEach(parts => {
          localeData['$' + parts[0].trim()] = parts.slice(1).join(' ');
        });
      });
    return localeData;
  }

  export type Module = {
    name: string;
    description: string;
    dllName: string;
    modFolder: string;
    version: string;
    textureFe: string;
    dataFolders: string[];
    requiredMods: string[];
  };

}

