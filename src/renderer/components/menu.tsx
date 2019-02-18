import { ipcRenderer } from 'electron';
import { ReactNode, useEffect, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button } from 'reactstrap';
import Alert from 'reactstrap/lib/Alert';
import Row from 'reactstrap/lib/Row';
import Spinner from 'reactstrap/lib/Spinner';
import { AppData } from '../../common/appdata';
import { Soulstorm } from '../../common/soulstorm';
import Dropdown from './util/dropdown';
const React = require('react');

export default function Menu() {
  const settingsExist = AppData.validateSettings(AppData.getSettings());

  const [loading, setLoading] = useState(settingsExist);
  const [editorSelected, setEditorSelected] = useState(false);
  const [campaign] = useState('');

  function onEditorSelect() {
    setEditorSelected(true);
  }

  function onQuit() {
    ipcRenderer.send('Main#Quit');
  }

  useEffect(() => {
    if (loading) {
      Soulstorm.loadModData().then(() => setLoading(false));
    }
  }, [loading]);

  const disabled = !settingsExist || loading;

  return (
    <div className='container flex' style={{ textAlign: 'center' }}>
      {editorSelected && <Redirect to={`/editor/${campaign}`} />}
      <RowCenter>
        <h1 className='display-2'>Dawn of War</h1>
      </RowCenter>
      <RowCenter>
        <h1 className='display-4'>Ultimate Matchup Generator</h1>
      </RowCenter>
      <RowCenter>
        <Dropdown color='' options={['New', 'Load']} onSelect={() => null} disabled={disabled}>Campaign</Dropdown>
        <Dropdown color='' options={['New', 'Load']} onSelect={onEditorSelect} disabled={disabled}>Editor</Dropdown>
        <Button color='' disabled={disabled}>Matchup</Button>
        <Link to='/settings' className='btn'>Settings</Link>
        <Button color='' onClick={onQuit}>Quit</Button>
      </RowCenter>
      {loading && <Loading message='Loading Mods' />}
      {!settingsExist && <RowCenter><Alert color='warning'>Settings are not yet configured!</Alert></RowCenter>}
    </div>
  );
}

function RowCenter({ children }: { children: ReactNode }) {
  return <Row className='justify-content-center'>
    {children}
  </Row>;
}

function Loading({ message }: { message: string }) {
  return <RowCenter>
    <Spinner type='grow' />
    <span className='lead'>{message}</span>
  </RowCenter>;
}