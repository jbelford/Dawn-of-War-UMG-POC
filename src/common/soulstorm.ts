import * as fs from 'fs';
import * as ini from 'ini';
import * as lua from 'luaparse';
import * as NodeCache from 'node-cache';
import * as path from 'path';
import { AppData } from './appdata';
import { LocalData } from './data';
import { MapData, Mod, WinCondition } from './types';

export namespace Soulstorm {

  const cache = new NodeCache({ stdTTL: 30 });

  let mods: Mod[];

  export function getModData(): Mod[] {
    if (!mods) {
      mods = getModules()
        .map(mod => ({
          name: mod.name,
          winConditions: getModWinConditions(mod),
          maps: getModMaps(mod)
        }));

      mods = mergeDuplicates(mods);

      const w40kData = LocalData.getW40kData();
      mods.forEach(mod => {
        mod.winConditions = mod.winConditions.filter(wc1 => w40kData.winConditions.every(wc2 => wc1.title !== wc2.title))
          .filter((wc1: WinCondition, i: number, arr) => arr.slice(i + 1).every((wc2: WinCondition) => wc2.title !== wc1.title))
          .sort((a, b) => a.title.localeCompare(b.title));

        mod.maps = mod.maps.filter(m1 => w40kData.maps.every(m2 => m1.name !== m2.name))
          .filter((map1: MapData, i: number, arr) => arr.slice(i + 1).every((map2: MapData) => map2.name !== map1.name))
          .sort((a, b) => a.players === b.players ? a.name.localeCompare(b.name) : a.players - b.players);
      });

      mods = mods.filter(mod => mod.winConditions.length + mod.maps.length > 0);

      mods.unshift(w40kData);
    }

    return mods;
  }

  function mergeDuplicates(mods: Mod[]) {
    const data = {};
    mods.forEach(mod => {
      if (!data[mod.name]) {
        data[mod.name] = mod;
      } else {
        data[mod.name].winConditions = data[mod.name].winConditions.concat(mod.winConditions);
        data[mod.name].maps = data[mod.name].maps.concat(mod.maps);
      }
    });
    return Object.keys(data).map(key => data[key]);
  }

  function getModules(): Module[] {
    let modules = <Module[]>cache.get('modules');
    if (!modules) {
      const { dir } = AppData.getSettings();
      modules = fs.readdirSync(dir, { withFileTypes: true })
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
      cache.set('modules', modules);
      console.log(modules);

      // A bit of goofy recursion happens here but whatever
      modules.forEach(replaceLocales);

    }
    return modules;
  }

  function getModWinConditions(mod: Module): WinCondition[] {
    const key = `winconditions#${mod.name}`;
    let winConditions = <WinCondition[]>cache.get(key);
    if (!winConditions) {
      const winConditionsPath = path.join(mod.modFolder, 'Data', 'scar', 'winconditions');
      try {
        winConditions = fs.readdirSync(winConditionsPath, { withFileTypes: true })
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
              title: values['title'],
              description: values['description'],
              victoryCondition: values['victory_condition'],
              alwaysOn: values['always_on'],
              exclusive: values['exclusive'],
            });
          })
          .filter(wc => !!wc && !!wc.title && !!wc.title.trim()) as WinCondition[];
      } catch (e) {
        winConditions = [];
      }

      cache.set(key, winConditions);
    }
    return winConditions;
  }

  function getModMaps(mod: Module): MapData[] {
    let maps: MapData[];
    try {
      function readDir(dir: string): MapData[] {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        const dirMaps = files.filter(file => file.isFile() && /\.sgb$/.test(file.name))
          .map(file => readMap(path.join(dir, file.name)))
          .filter(map => !!map) as MapData[];

        return files.filter(file => file.isDirectory())
          .map(file => readDir(path.join(dir, file.name)))
          .reduce((prev, maps) => prev.concat(maps), dirMaps);
      }

      maps = readDir(path.join(mod.modFolder, 'Data', 'scenarios', 'mp'));

      maps.forEach(replaceLocales);
    } catch (e) {
      maps = [];
    }
    return maps;
  }

  function readMap(filePath: string): MapData | null {
    const stripExt = filePath.replace(/\.sgb$/, '');
    let imagePath: string;
    if (fs.existsSync(stripExt + '_icon_custom.tga')) {
      imagePath = stripExt + '_icon_custom.tga';
    } else if (fs.existsSync(stripExt + '_icon.tga')) {
      imagePath = stripExt + '_icon.tga';
    } else if (fs.existsSync(stripExt + '.tga')) {
      imagePath = stripExt + '.tga';
    } else if (fs.existsSync(stripExt + '_mm.tga')) {
      imagePath = stripExt + '_mm.tga';
    } else {
      console.log(`Probably not valid: ${filePath}`);
      return null;
    }

    const mapDetails = getMapDetails(filePath);
    mapDetails.pic = imagePath;

    if (mapDetails.players < 2 || mapDetails.players > 8) {
      console.log(`Ignoring bad file: ${filePath}`);
      return null;
    }

    return mapDetails;
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


  function getMapDetails(filePath: string): MapData {
    let mapBuffer = fs.readFileSync(filePath);

    let offset = 0;
    for (; ;) {
      const val = mapBuffer.slice(offset, offset + 8).toString();
      if (val === 'DATAWMHD') {
        // 4 byte chunk type, 4 byte chunk id, 4 byte chunk version, 4 byte chunk size
        offset += 16;

        const namesize = mapBuffer.readIntLE(offset, 4);
        offset += 4 + namesize;
        break;
      }

      offset++;
    }

    mapBuffer = mapBuffer.slice(offset);

    // The number of players the map supports is always at offset 64 (0x40).
    const players = mapBuffer[0];

    // I'm not entirely sure the format of the Relic Chunky for determining offsets but one pattern
    // that seems to be present is that each section of data is separated by 3 NULL bytes (\u0000 OR 0x00)
    // The next chunk is always labelled by 'FOLDWSTC', preceded by 3 NULL bytes, then the description,
    // then 2 more null bytes + 2 special bytes, then the name of the map, then 3 more null bytes.
    let endIdx = 0;
    while (true) {
      const val = mapBuffer.slice(endIdx, endIdx + 8).toString();
      if (val === 'FOLDWSTC') {
        endIdx = endIdx - 2;
        break;
      }
      endIdx++;
    }

    let midIdx = endIdx - 2;
    while (true) {
      if (mapBuffer[midIdx] === 0 && mapBuffer[midIdx + 1] === 0) {
        break;
      }
      midIdx--;
    }

    let startIdx = midIdx - 3;
    while (true) {
      if (mapBuffer[startIdx] === 0 && mapBuffer[startIdx + 1] === 0 && mapBuffer[startIdx + 2] === 0) {
        break;
      }
      startIdx--;
    }

    // (1) There appears to be a leftover byte at the end. This is part of the 3 byte separator but I'm not sure what it indicates
    // since it's a different value each time. It's easiest to just cut it off by subtracting 1.
    // (2) The NULL bytes appear between each character so we remove them using regex replace.
    const mapName = mapBuffer.slice(startIdx + 3, midIdx - 2).toString('utf8').replace(/\0/g, '');
    const description = mapBuffer.slice(midIdx + 2, endIdx - 2).toString('utf8').replace(/\0/g, '');

    return { name: mapName, description: description, players: players, pic: '' };
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

