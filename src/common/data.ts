import * as fs from 'fs';
import * as path from 'path';
import { AppData } from './appdata';

export type PortraitList = {
  chaos: string[];
  imperium: string[];
  xenos: string[];
};

export namespace LocalData {

  const portraits = getPortraitsList();

  function getPortraitsList(): PortraitList {
    const appPath = AppData.getAppPath();

    const getPortraits = (subdir: string) => fs
      .readdirSync(path.join(appPath, 'data', 'portraits', subdir), { withFileTypes: true })
      .filter(file => /\.jpg$/.test(file.name))
      .map(file => 'data:image/jpg;base64, ' + fs.readFileSync(path.join(appPath, 'data', 'portraits', subdir, file.name)).toString('base64'));

    return {
      chaos: getPortraits('chaos'),
      imperium: getPortraits('imperium'),
      xenos: getPortraits('xenos')
    };
  }

  export function getPortraits() {
    return portraits;
  }

}