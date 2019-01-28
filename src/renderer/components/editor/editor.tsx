import * as React from 'react';
import { CampaignForm } from './form';

type EditorState = {
  editorHeight: number,
};

export class CampaignEditor extends React.Component<any, EditorState> {

  private headerRef: React.RefObject<HTMLDivElement>;

  constructor(props: any) {
    super(props);
    this.state = { editorHeight: 0 };
    this.headerRef = React.createRef();
  }

  componentDidMount() {
    if (this.headerRef.current) {
      this.updateWindowDimensions();
      window.addEventListener('resize', this.updateWindowDimensions);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    if (this.headerRef.current) {
      const newHeight = window.innerHeight - this.headerRef.current.scrollHeight;
      this.setState({ ...this.state, editorHeight: newHeight });
    }
  }


  render() {
    return <div className='container'>
      <div ref={this.headerRef} className='lead text-center'>
        <h1 className='display-4'>Campaign Editor</h1>
        <p>On this screen you can setup or edit a campaign.</p>
      </div>
      <CampaignForm
        className='overflow-auto pl-2 pr-2'
        style={{ height: this.state.editorHeight, paddingBottom: '200px' }} />
    </div>;
  }

}
