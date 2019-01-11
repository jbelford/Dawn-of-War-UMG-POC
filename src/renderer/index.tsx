import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { MemoryRouter, Route } from 'react-router-dom';
import { Editor } from './components/editor/editor';
import { Menu } from './components/menu';
import { Settings } from './components/settings';
import './css/global.css';


class App extends React.Component<any, any> {

  render() {
    return (
      <MemoryRouter>
        <div>
          <Route path='/' exact component={Menu} />
          <Route path={['/editor/:campaign', '/editor']} component={Editor} />
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