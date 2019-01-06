import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

class App extends React.Component<any, AppState> {

  constructor(props: any) {
    super(props);

    this.state = { component: Options.Menu };
  }

  render() {
    switch (this.state.component) {
      case Options.New:
      case Options.Load:
      case Options.Settings:
      default:
        return (
          <div>
            <h1>Dawn of War: Ultimate Matchup Generator</h1>
            <button>New</button>
            <button>Load</button>
            <button>Settings</button>
            <button>Quit</button>
          </div>
        );
    }
  }
}

type AppState = {
  component: Options;
};

enum Options {
  Menu,
  New,
  Load,
  Settings
}

let render = () => {
  ReactDOM.render(<AppContainer><App></App></AppContainer>, document.getElementById('App'));
};

render();
// @ts-ignore
if (module.hot) { module.hot.accept(render); }