import * as fs from 'fs';
import * as ini from 'ini';
import * as lua from 'luaparse';
import * as NodeCache from 'node-cache';
import * as path from 'path';
import { AppData } from './appdata';

export namespace Soulstorm {

  const cache = new NodeCache({ stdTTL: 30 });

  export function getModules(): Module[] {
    let mods = <Module[]>cache.get('mods');
    if (!mods) {
      const { dir } = AppData.getSettings();
      mods = fs.readdirSync(dir, { withFileTypes: true })
        .filter(file => file.isFile() && /\.module$/.test(file.name))
        .map(file => path.join(dir, file.name))
        .map(filepath => fs.readFileSync(filepath, 'utf8'))
        .map(data => ini.parse(data).global)
        .map(config => ({
          name: config.UIName,
          description: config.Description,
          dllName: config.DllName,
          modFolder: path.join(dir, config.ModFolder),
          version: config.ModVersion,
          textureFe: config.TextureFE,
          dataFolders: Object.keys(config).filter(key => /^DataFolder\.\d+$/.test(key)).map(key => config[key]),
          requiredMods: Object.keys(config).filter(key => /^RequiredMod\.\d+$/.test(key)).map(key => config[key])
        }));
      cache.set('mods', mods);

      // A bit of goofy recursion happens here but whatever
      mods.forEach(replaceLocales);

    }
    return mods;
  }

  export function getModWinConditions(): WinCondition[] {
    let winConditions = <WinCondition[]>cache.get('winconditions');
    if (!winConditions) {
      winConditions = getModules().map((mod, i) => {
        const winConditionsPath = path.join(mod.modFolder, 'Data', 'scar', 'winconditions');
        try {
          return fs.readdirSync(winConditionsPath, { withFileTypes: true })
            .filter(file => file.isFile() && /\.lua$/.test(file.name))
            .map(file => path.join(winConditionsPath, file.name))
            .map(filepath => lua.parse(fs.readFileSync(filepath, 'utf8')))
            .map((data: any) => {
              const body = data.body.find((body: any) => body.type === 'AssignmentStatement'
                && body.variables.every((v: any) => v.type === 'Identifier' && v.name === 'Localization'));
              if (!body) return null;

              const init = body.init.find((init: any) => init.type === 'TableConstructorExpression');
              if (!init) return null;

              const values = {};
              init.fields.forEach((field: any) => values[field.key.name] = field.value.value);

              return replaceLocales(<WinCondition>{
                mod: i,
                title: values['title'],
                description: values['description'],
                victoryCondition: values['victory_condition'],
                alwaysOn: values['always_on'],
                exclusive: values['exclusive'],
              });
            })
            .filter(wc => !!wc && !!wc.title && !!wc.title.trim()) as WinCondition[];
        } catch (e) {
          return [];
        }
      })
        .reduce((prev, curr) => prev.concat(curr))
        .sort((a, b) => a.mod === b.mod ? a.title.localeCompare(b.title) : a.mod - b.mod);

      cache.set('winconditions', winConditions);
    }
    return winConditions;
  }

  function replaceLocales<T>(obj: T): T {
    const keys = Object.keys(obj)
      .filter(key => typeof obj[key] === 'string')
      .filter(key => /^\$\d+$/.test(obj[key]));

    if (keys.length > 0) {
      const localeData = getLocaleData();
      keys.forEach(key => {
        obj[key] = localeData[obj[key]];
      });
    }

    return obj;
  }

  function getLocaleData() {
    let localeData = <{ [key: string]: string }>cache.get('localeData');
    if (!localeData) {
      localeData = {};
      getModules().forEach(mod => {
        const localePath = path.join(mod.modFolder, 'Locale', 'English');
        try {
          fs.readdirSync(localePath, { withFileTypes: true })
            .filter(file => file.isFile() && /\.ucs$/.test(file.name))
            .map(file => fs.readFileSync(path.join(localePath, file.name), { encoding: 'ucs2' }))
            .forEach(data => {
              data.split(/\n+/g)
                .map(line => /^(\d+)\s+(.+)$/g.exec(line.trim()))
                .filter(match => !!match)
                .forEach((match: RegExpExecArray) => {
                  localeData['$' + match[1]] = match[2];
                });
            });
        } catch (e) {
          // Do nothing
        }
      });
      cache.set('localeData', localeData);
    }
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

  export type WinCondition = {
    mod: number;
    title: string;
    description: string;
    victoryCondition: boolean;
    exclusive: boolean;
    alwaysOn: boolean;
  };

}
