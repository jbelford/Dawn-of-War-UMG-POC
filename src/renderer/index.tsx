import 'bootstrap/dist/css/bootstrap.min.css';
import { ipcRenderer } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Link, MemoryRouter, Route } from 'react-router-dom';
import { Settings } from './components/settings';



const Menu = () => {
  return <div>
    <h1>Dawn of War: Ultimate Matchup Generator</h1>
    <Link to='/game/new' className='btn'>New</Link>
    <Link to='/game/load' className='btn'>Load</Link>
    <Link to='/settings' className='btn'>Settings</Link>
    <button className='btn' onClick={() => ipcRenderer.send('Main#Quit')}>Quit</button>
  </div>;
};

class App extends React.Component<any, any> {

  render() {
    return (
      <MemoryRouter>
        <div>
          <Route path='/' exact component={Menu} />
          <Route path='/game/new' />
          <Route path='/game/load' />
          <Route path='/settings' component={Settings} />
        </div>
      </MemoryRouter>
    );
  }

}

let render = () => {
  ReactDOM.render(<AppContainer><App></App></AppContainer>, document.getElementById('App'));
};

render();
// @ts-ignore
if (module.hot) { module.hot.accept(render); }