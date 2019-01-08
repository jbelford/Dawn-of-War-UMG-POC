import { remote } from 'electron';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Store, UserSettings } from '../../common/store';
const { dialog } = remote;

export class Settings extends React.Component<any, SettingsState> {

  constructor(props: any) {
    super(props);
    this.state = { settings: Store.getSettings(), changed: false };
  }

  selectFolder = () => {
    const directories = dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (directories.length && directories[0] !== this.state.settings.dir) {
      const newSettings = { ...this.state.settings, dir: directories[0] };
      this.setState({ settings: newSettings, changed: true });
    }
  }

  onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    Store.saveSettings(this.state.settings);
    this.setState({ ...this.state, changed: false });
  }

  render() {
    return (
      <div>
        <h1>Settings</h1>
        <form onSubmit={this.onSubmit} >
          Dawn of War Directory: <input type='text' name='dir' value={this.state.settings.dir} readOnly />
          <button onClick={this.selectFolder} type='button'>📁</button>
          {this.state.changed ? <input type='submit' value='Save Changes' /> : <input type='submit' value='Saved' disabled />}
        </form>
        <Link to='/' className='btn'>Go Back</Link>
      </div>
    );
  }

}

type SettingsState = {
  settings: UserSettings;
  changed: boolean;
};