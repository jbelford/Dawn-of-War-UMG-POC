import * as electron from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export namespace Store {

  function getApp() {
    return electron.app || electron.remote.app;
  }

  function getSettingsPath() {
    const userDataPath = getApp().getPath('userData');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath);
    }
    const settingsPath = path.join(userDataPath, 'settings.json');
    return settingsPath;
  }

  export function getSettings(): UserSettings {
    let settings: UserSettings = { dir: '' };
    const settingsPath = getSettingsPath();
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    }
    return settings;
  }

  export function saveSettings(settings: UserSettings) {
    const settingsPath = getSettingsPath();
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }

}

export type UserSettings = {
  dir: string;
};