import * as React from 'react';
import { Link } from 'react-router-dom';

export class Settings extends React.Component<any, any> {

  render() {
    return (
      <div>
        <h1>Test</h1>
        <div>
          <Link to='/' className='btn'>Go Back</Link>
          <button className='btn'>Save</button>
        </div>
      </div>
    );
  }

}