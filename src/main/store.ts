import * as electron from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Campaign } from '../typings/campaign';

export namespace Store {

  function getApp() {
    return electron.app || electron.remote.app;
  }

  function getUserDataPath() {
    const userDataPath = getApp().getPath('userData');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath);
    }
    return userDataPath;
  }

  function getSettingsPath() {
    const userDataPath = getUserDataPath();
    return path.join(userDataPath, 'settings.json');
  }

  function getCampaignsPath() {
    const userDataPath = getUserDataPath();
    const campaignsFolderPath = path.join(userDataPath, 'campaigns');
    if (!fs.existsSync(campaignsFolderPath)) {
      fs.mkdirSync(campaignsFolderPath);
    }
    return campaignsFolderPath;
  }

  export function getCampaigns(): Campaign[] {
    return fs.readdirSync(getCampaignsPath())
      .filter(file => file.match(/^cpn_.+\.json$/g))
      .map(file => {
        try {
          return <Campaign>JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (e) {
          return null;
        }
      }).filter(file => !!file) as Campaign[];
  }

  export function getSettings(): UserSettings {
    let settings: UserSettings = { dir: '' };
    const settingsPath = getSettingsPath();
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (!validateSettings(settings)) {
        settings = { dir: '' };
      }
    } catch (e) {
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    }
    return settings;
  }

  export function saveSettings(settings: UserSettings) {
    const settingsPath = getSettingsPath();
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }

  export function validateSettings(settings: UserSettings) {
    return fs.existsSync(path.join(settings.dir, 'W40k.exe'));
  }
}

export type UserSettings = {
  dir: string;
};