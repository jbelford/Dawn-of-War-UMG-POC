import { remote } from 'electron';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import InputGroup from 'reactstrap/lib/InputGroup';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
import Label from 'reactstrap/lib/Label';
import { AppData, UserSettings } from '../../common/appdata';
import { Soulstorm } from '../../common/soulstorm';
const { dialog } = remote;

export class Settings extends React.Component<any, SettingsState> {

  constructor(props: any) {
    super(props);
    this.state = { settings: AppData.getSettings(), changed: false, isValid: true };
  }

  selectFolder = (e: React.MouseEvent) => {
    e.preventDefault();
    const directories = dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (directories.length) {
      if (directories[0] !== this.state.settings.dir) {
        const newSettings = { ...this.state.settings, dir: directories[0] };
        this.setState({ settings: newSettings, changed: true, isValid: AppData.validateSettings(newSettings) });
      }
    }
  }

  onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    AppData.saveSettings(this.state.settings);
    this.setState({ ...this.state, changed: false });
  }

  render() {
    Soulstorm.getModData().then(mods => console.log(mods));
    return (
      <div className='container'>
        <h1 className='display-4'>Settings</h1>
        <Form onSubmit={this.onSubmit} className='d-flex flex-column'>
          <FormGroup>
            <Label>Dawn of War Directory :</Label>
            <InputGroup>
              <InputGroupAddon addonType='prepend'><Button onClick={this.selectFolder}>📁</Button></InputGroupAddon>
              <Input placeholder='Select Directory...' value={this.state.settings.dir} readOnly
                valid={this.state.isValid}
                invalid={!this.state.isValid} />
            </InputGroup>
          </FormGroup>
          <div className='align-self-end'>
            <Link to='/' className='btn btn-primary'>Go Back</Link>
            <Button type='submit'
              className='ml-2'
              disabled={!this.state.changed || !this.state.isValid}>
              {this.state.changed ? 'Save Changes' : 'Saved'}
            </Button>
          </div>
        </Form>
      </div>
    );
  }

}

type SettingsState = {
  settings: UserSettings;
  changed: boolean;
  isValid: boolean;
};