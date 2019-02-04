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


  /**
   * Chunky files are LITTLE-ENDIAN
   * 
   * Chunk Header Format:
   * 4 byte chunk type "DATA"
   * 4 byte chunk ID "WHMD"
   * 4 byte chunk version
   * 4 byte chunk size
   * 4 byte name size
   * X byte name
   * 
   * Map Chunk Format:
   * 4 byte player size
   * 4 byte map size
   * 4 byte mod/folder/something size 
   * X byte mod/folder/something
   * 4 16-bit map name size
   * X byte map
   * 4 16-bit map description size
   * X byte description 
   */
  function getMapDetails(filePath: string): MapData {
    let sgbBuffer = fs.readFileSync(filePath);

    // First we need to find the 'DATAWMHD' chunky type/id as this is where the metadata about the map is stored
    // I don't know if it's possible to find this without manually searching byte-by-byte
    const headerOffset = sgbBuffer.indexOf('DATAWMHD', 11, 'utf8');

    // The namesize is the number of bytes given to the name of this chunky header
    // Using this we calculate the offset where the meta data begins
    const namesize = sgbBuffer.readInt32LE(headerOffset + 16);
    const chunkOffset = headerOffset + 20 + namesize;

    const players = sgbBuffer.readInt32LE(chunkOffset);
    const mapSize = sgbBuffer.readInt32LE(chunkOffset + 4);
    const modNameSize = sgbBuffer.readInt32LE(chunkOffset + 8);

    const textOffset = chunkOffset + 12 + modNameSize;

    // Multiply by 2 because it's refering to UTF-16 characters
    const mapNameSize = sgbBuffer.readInt32LE(textOffset) * 2;
    const mapNameOffset = textOffset + 4;
    const mapName = sgbBuffer.toString('utf16le', mapNameOffset, mapNameOffset + mapNameSize);

    const mapDescSize = sgbBuffer.readIntLE(mapNameOffset + mapNameSize, 4) * 2;
    const mapDescOffset = mapNameOffset + mapNameSize + 4;
    const mapDesc = sgbBuffer.toString('utf16le', mapDescOffset, mapDescOffset + mapDescSize);

    return { name: mapName, description: mapDesc, players: players, size: mapSize, pic: '' };
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

