// @ts-check
'use strict';

/**
 * This is a data mining script to get information from unpacked SGA archives for the base
 * dawn of war. Extracting info from SGA at runtime is difficult and would be too slow anyway so we'll just
 * bundle the base game info we need with this application when publishing.
 * 
 * This script has no knowledge about what directories it's reading and will recursively read every directory.
 * It will only read files which are of specific types that we are looking for.
 */

const fs = require('fs');
const path = require('path');
const lua = require('luaparse');
const TGA = require('tga');
const PNG = require('pngjs').PNG;

if (process.argv.length < 3) {
  console.log('Missing argument: <dir>');
  process.exit(1);
}

const dir = process.argv[2];
const data = { maps: [], wcs: [] };
const locale = {};

fs.readdir(dir, { withFileTypes: true }, (err, files) => {
  if (err) {
    return console.log(`Error: ${err.stack || err}`);
  }

  if (!fs.existsSync('maps')) {
    fs.mkdirSync('maps');
  }

  readDir(dir, files);

  data.maps.forEach(replaceLocales);
  data.wcs.forEach(replaceLocales);

  data.maps = data.maps.sort((a, b) => a.players === b.players ? a.name.localeCompare(b.name) : a.players - b.players);

  fs.writeFileSync('data.json', JSON.stringify(data), { encoding: 'utf8' });
});

function replaceLocales(obj) {
  const keys = Object.keys(obj)
    .filter(key => typeof obj[key] === 'string')
    .filter(key => /^\$\d+$/.test(obj[key]));

  if (keys.length > 0) {
    keys.forEach(key => {
      obj[key] = locale[obj[key]];
    });
  }
}

/**
 * @param {string} dir 
 * @param {fs.Dirent[]} files 
 */
function readDir(dir, files) {
  for (const file of files) {
    const newPath = path.join(dir, file.name);
    if (file.isFile()) {
      if (newPath.match(/\\mp\\\dp[^\\]+\.sgb$/)) {
        readMap(newPath);
      } else if (file.name.match(/_local\.lua$/)) {
        readWinCondition(newPath);
      } else if (file.name.match(/\.ucs$/)) {
        readLocale(newPath);
      }
    } else {
      const files = fs.readdirSync(newPath, { withFileTypes: true });
      readDir(newPath, files);
    }
  }
}

/**
 * @param {string} filePath 
 */
function readMap(filePath) {
  const stripExt = filePath.replace(/\.sgb$/, '');
  let imageData;
  try {
    try {
      imageData = fs.readFileSync(stripExt + '_icon_custom.tga');
    } catch (e) {
      imageData = fs.readFileSync(stripExt + '_icon.tga');
    }
  } catch (e) {
    console.log(`Probably not valid: ${filePath}`)
    return;
  }

  const tga = new TGA(imageData);

  const png = new PNG({ width: tga.width, height: tga.height });
  // @ts-ignore
  png.data = tga.pixels;

  const name = /\\([^\\]+)\.sgb$/g.exec(filePath)[1];
  // @ts-ignore
  png.pack().pipe(fs.createWriteStream(path.join('maps', `${name}.png`)));

  const mapDetails = getMapDetails(filePath);
  mapDetails.pic = `${name}.png`;

  // All base game maps are prefixed with the # of players the map supports.
  // If the map name # is not the same as the actual value set then there is something fishy here.
  const expectedPlayers = parseInt(name[0]);
  if (expectedPlayers !== mapDetails.players) {
    console.log(`Ignoring bad file: ${filePath}`);
    return;
  }

  data.maps.push(mapDetails);
}

/**
 * @param {string} filePath 
 */
function getMapDetails(filePath) {
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

/**
 * @param {string} filePath 
 */
function readWinCondition(filePath) {
  const luaData = lua.parse(fs.readFileSync(filePath, 'utf8'));
  // @ts-ignore
  const body = luaData.body.find(body => body.type === 'AssignmentStatement'
    && body.variables.every(v => v.type === 'Identifier' && v.name === 'Localization'));
  if (!body) return null;

  const init = body.init.find(init => init.type === 'TableConstructorExpression');
  if (!init) return null;

  const values = {};
  init.fields.forEach(field => values[field.key.name] = field.value.value);

  data.wcs.push({
    title: values['title'],
    description: values['description'],
    victoryCondition: values['victory_condition'],
    alwaysOn: values['always_on'],
    exclusive: values['exclusive'],
  });
}

/**
 * @param {string} filePath 
 */
function readLocale(filePath) {
  const ucsData = fs.readFileSync(filePath, { encoding: 'ucs2' });
  ucsData.split(/\n+/g)
    .map(line => /^(\d+)\s+(.+)$/g.exec(line.trim()))
    .filter(match => !!match)
    .forEach(match => locale['$' + match[1]] = match[2]);
}