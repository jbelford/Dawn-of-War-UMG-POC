import { remote } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import Container from 'reactstrap/lib/Container';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import InputGroup from 'reactstrap/lib/InputGroup';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
import Label from 'reactstrap/lib/Label';
import { AppData, UserSettings } from '../../common/appdata';
const React = require('react');
const { dialog } = remote;

const validateDir = (dir: string) => fs.existsSync(path.join(dir, 'W40K.exe'));

function getInitialState(): { settings: UserSettings, changed: boolean, validation: { dir: boolean } } {
  const settings = AppData.getSettings();
  return { settings: settings, changed: false, validation: { dir: validateDir(settings.dir) } };
}

export default function Settings() {
  const [state, setState] = useState(getInitialState());

  function onSubmit() {
    AppData.saveSettings(state.settings);
    setState({ ...state, changed: false });
  }

  function setDir(dir: string) {
    setState({
      ...state,
      settings: { ...state.settings, dir: dir },
      validation: { ...state.validation, dir: validateDir(dir) },
      changed: true
    });
  }

  return (
    <Container>
      <h1 className='display-4'>Settings</h1>
      <Form onSubmit={onSubmit} className='d-flex flex-column'>
        <SelectDirFormGroup dir={state.settings.dir} isValid={state.validation.dir} onSelect={setDir} />
        <SubmitButtons className='align-self-end' changed={state.changed} isValid={state.validation.dir} />
      </Form>
    </Container>
  );
}

type SelectDirFormGroupProps = { dir: string, isValid: boolean, onSelect: (dir: string) => void };

function SelectDirFormGroup({ dir, isValid, onSelect }: SelectDirFormGroupProps) {
  function selectDir() {
    const directories = dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (directories.length && directories[0] !== dir) {
      onSelect(directories[0]);
    }
  }

  return (
    <FormGroup>
      <Label>Dawn of War Directory :</Label>
      <InputGroup>
        <InputGroupAddon addonType='prepend'>
          <Button onClick={selectDir}>📁</Button>
        </InputGroupAddon>
        <Input readOnly
          placeholder='Select Directory...'
          value={dir}
          valid={isValid}
          invalid={!isValid} />
      </InputGroup>
    </FormGroup>
  );
}

type SubmitButtonsProps = { className?: string, changed: boolean, isValid: boolean };

function SubmitButtons({ className, changed, isValid }: SubmitButtonsProps) {
  return (
    <div className={className}>
      <Link to='/' className='btn btn-primary'>Go Back</Link>
      <Button type='submit'
        className='ml-2'
        disabled={!changed || !isValid}>
        {changed ? 'Save Changes' : 'Saved'}
      </Button>
    </div>
  );
}
