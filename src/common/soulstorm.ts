import * as fs from 'fs';
import * as ini from 'ini';
import * as lua from 'luaparse';
import * as path from 'path';
import { AppData } from './appdata';
import { LocalData } from './data';
import { MapData, Mod, WinCondition } from './types';

export namespace Soulstorm {

  let mods: Mod[];
  let localeData: { [key: string]: string };

  export async function loadModData(): Promise<Mod[]> {
    if (!mods) {
      const startDate = Date.now();
      mods = await Promise.all((await getModules())
        .map(mod => Promise.all([getModWinConditions(mod), getModMaps(mod)])
          .then<Mod>(results => ({
            name: mod.name,
            winConditions: results[0],
            maps: results[1]
          }))));

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
      console.log(`Fetch time: ${Date.now() - startDate} ms`);
    }
    console.log(mods);
    return mods;
  }

  /**
   * This will throw an error if mod data has not yet been loaded into memory.
   */
  export function getModData() {
    if (!mods) {
      throw 'Attempted to fetch mod data before loading into memory';
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

  async function getModules(): Promise<Module[]> {
    const { dir } = AppData.getSettings();
    const files = fs.readdirSync(dir, { withFileTypes: true });

    const readFilesPromise = files.filter(file => file.isFile() && /\.module$/.test(file.name))
      .map(file => path.join(dir, file.name))
      .map(filepath => readFilePromise(filepath, 'utf8'));

    const moduleFileData = await Promise.all(readFilesPromise);
    const modules = moduleFileData.map((data: string) => ini.parse(data).global)
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

    localeData = await getLocaleData(modules);

    modules.forEach(replaceLocales);

    return modules;
  }

  async function getLocaleData(mods: Module[]): Promise<{ [key: string]: string }> {
    const locales = {};

    (await Promise.all(mods.map(async mod => {
      const localePath = path.join(mod.modFolder, 'Locale', 'English');
      try {
        const files = await readdirPromise(localePath);

        return await Promise.all(files.filter(file => file.isFile() && /\.ucs$/.test(file.name))
          .map(file => readFilePromise(path.join(localePath, file.name), 'ucs2')));
      } catch (e) {
        // Do nothing
        return [];
      }
    }))).join('\n')
      .split(/\n+/g)
      .map(line => /^(\d+)\s+(.+)$/g.exec(line.trim()))
      .filter(match => !!match)
      .forEach((match: RegExpExecArray) => locales['$' + match[1]] = match[2]);

    return locales;
  }


  async function getModWinConditions(mod: Module): Promise<WinCondition[]> {
    const winConditionsPath = path.join(mod.modFolder, 'Data', 'scar', 'winconditions');
    let winConditions: WinCondition[];
    try {
      const wcFileData = await Promise.all(fs.readdirSync(winConditionsPath, { withFileTypes: true })
        .filter(file => file.isFile() && /\.lua$/.test(file.name))
        .map(file => path.join(winConditionsPath, file.name))
        .map(filepath => readFilePromise(filepath, 'utf8')));

      winConditions = wcFileData
        .map((data: string) => lua.parse(data))
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
    return winConditions;
  }

  async function getModMaps(mod: Module): Promise<MapData[]> {
    let maps: MapData[];
    try {
      async function readDir(dir: string): Promise<MapData[]> {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        const dirMaps = (await Promise.all(files.filter(file => file.isFile() && /\.sgb$/.test(file.name))
          .map(file => readMap(path.join(dir, file.name)))))
          .filter(map => !!map) as MapData[];

        return (await Promise.all(files.filter(file => file.isDirectory())
          .map(file => readDir(path.join(dir, file.name)))))
          .reduce((prev, maps) => prev.concat(maps), dirMaps);
      }

      maps = await readDir(path.join(mod.modFolder, 'Data', 'scenarios', 'mp'));

      maps.forEach(replaceLocales);
    } catch (e) {
      maps = [];
    }
    return maps;
  }

  async function readMap(filePath: string): Promise<MapData | null> {
    const stripExt = filePath.replace(/\.sgb$/, '');
    const imagePath = await existsPromise(stripExt + '_icon_custom.tga')
      .catch(() => existsPromise(stripExt + '_icon.tga'))
      .catch(() => existsPromise(stripExt + '.tga'))
      .catch(() => existsPromise(stripExt + '_mm.tga'))
      .catch(() => null);

    if (imagePath === null) {
      console.log(`Probably not valid: ${filePath}`);
      return null;
    }

    let mapDetails: MapData;
    try {
      const sgbBuffer = await readFilePromise(filePath) as Buffer;
      mapDetails = getMapDetails(sgbBuffer);
      mapDetails.pic = imagePath;
    } catch (e) {
      console.log(`Failed to read map data: ${e.stack || e}`);
      return null;
    }

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
      keys.forEach(key => {
        obj[key] = localeData[obj[key]];
      });
    }

    return obj;
  }

  function readdirPromise(path: string) {
    return new Promise<fs.Dirent[]>((resolve, reject) => {
      fs.readdir(path, { withFileTypes: true }, (err, files) => err ? reject(err) : resolve(files));
    });
  }

  function readFilePromise(path: string, encoding?: string): Promise<string | Buffer> {
    return new Promise((resolve, reject) => {
      if (encoding) {
        fs.readFile(path, { encoding: encoding }, (err, data) => err ? reject(err) : resolve(data));
      } else {
        fs.readFile(path, (err, data) => err ? reject(err) : resolve(data));
      }
    });
  }

  function existsPromise(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.exists(path, exists => exists ? resolve(path) : reject());
    });
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
  function getMapDetails(sgbBuffer: Buffer): MapData {
    if (sgbBuffer.toString('utf8', 0, 12) !== 'Relic Chunky') {
      throw 'Buffer is not a relic chunky';
    }

    // First we need to find the 'DATAWMHD' chunky type/id as this is where the metadata about the map is stored
    // I don't know if it's possible to find this without manually searching byte-by-byte
    const headerOffset = sgbBuffer.indexOf('DATAWMHD', 12, 'utf8');
    if (headerOffset < 0) {
      throw 'Buffer is not a valid SGB';
    }

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

    const mapDescSize = sgbBuffer.readInt32LE(mapNameOffset + mapNameSize) * 2;
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

