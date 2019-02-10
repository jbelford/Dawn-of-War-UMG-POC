import { ipcRenderer } from 'electron';
import { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button } from 'reactstrap';
import Dropdown from './util/dropdown';
const React = require('react');

export default function Menu() {
  const [editorSelected, setEditorSelected] = useState(false);
  const [campaign] = useState('');

  function onEditorSelect() {
    setEditorSelected(true);
  }

  function onQuit() {
    ipcRenderer.send('Main#Quit');
  }

  return (
    <div className='container flex' style={{ textAlign: 'center' }}>
      {editorSelected && <Redirect to={`/editor/${campaign}`} />}
      <h1 className='display-2'>Dawn of War</h1>
      <h1 className='display-4'>Ultimate Matchup Generator</h1>
      <Dropdown color='' options={['New', 'Load']} onSelect={() => null}>Campaign</Dropdown>
      <Dropdown color='' options={['New', 'Load']} onSelect={onEditorSelect}>Editor</Dropdown>
      <Button color=''>Matchup</Button>
      <Link to='/settings' className='btn'>Settings</Link>
      <Button color='' onClick={onQuit}>Quit</Button>
    </div>
  );
}
