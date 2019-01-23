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

  if (!fs.existsSync('mimgs')) {
    fs.mkdirSync('mimgs');
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
  png.pack().pipe(fs.createWriteStream(path.join('mimgs', `${name}.png`)));

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
  const mapBuffer = fs.readFileSync(filePath).slice(64);

  // The number of players the map supports is always at offset 64 (0x40).
  const players = mapBuffer[0];

  // I'm not entirely sure the format of the Relic Chunky for determining offsets but one pattern
  // that seems to be present is that each section of data is separated by 3 NULL bytes (\u0000 OR 0x00)
  // The next chunk is always labelled by 'FOLDWSTC', preceded by 3 NULL bytes, then the description,
  // then 3 more null bytes, then the name of the map, then 3 more null bytes.
  let endIdx = 0;
  while (true) {
    const val = mapBuffer.slice(endIdx, endIdx + 8).toString()
    if (val === 'FOLDWSTC') {
      endIdx = endIdx - 3;
      break;
    }
    endIdx++;
  }

  let midIdx = endIdx - 3;
  while (true) {
    if (mapBuffer[midIdx] === 0 && mapBuffer[midIdx + 1] === 0 && mapBuffer[midIdx + 2] === 0) {
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
  const mapName = mapBuffer.slice(startIdx + 3, midIdx - 1).toString('utf8').replace(/\0/g, '');
  const description = mapBuffer.slice(midIdx + 3, endIdx - 1).toString('utf8').replace(/\0/g, '');

  return { name: mapName, description: description, players: players };
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
    mod: -1,
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