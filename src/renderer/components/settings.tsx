import { remote } from 'electron';
import * as React from 'react';
import { Link } from 'react-router-dom';
const { dialog } = remote;


export class Settings extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = { dir: '' };
  }


  selectFolder = () => {
    const directories = dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (directories.length) this.setState({ dir: directories[0] });
  }

  folderOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dir = event.target.value;
    this.setState({ dir: dir });
  }

  onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    return false;
  }

  render() {
    return (
      <div>
        <h1>Settings</h1>
        <form onSubmit={this.onSubmit} >
          Dawn of War Directory: <input type='text' name='dir' value={this.state.dir} onChange={this.folderOnChange} />
          <button onClick={this.selectFolder}>📁</button>
          <input type='submit' value='Save' />
        </form>
        <Link to='/' className='btn'>Go Back</Link>
      </div>
    );
  }

}