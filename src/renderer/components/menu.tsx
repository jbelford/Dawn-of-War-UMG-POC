import { ipcRenderer } from 'electron';
import * as React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button } from 'reactstrap';
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';


export class Menu extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = { campaignSelected: false, editorSelected: false, selectedCampaign: '' };
  }

  onQuit = () => {
    ipcRenderer.send('Main#Quit');
  }

  selectedCampaign = (selected: 0 | 1) => {
    return selected;
  }

  selectedEditor = (selected: 0 | 1) => {
    if (selected) {
    } else {
      this.setState({ ...this.state, editorSelected: true });
    }
  }

  render() {
    if (this.state.editorSelected) return <Redirect to={`/editor/${this.state.selectedCampaign}`} />;

    return <div className='container flex' style={{ textAlign: 'center' }}>
      <h1 className='display-2'>Dawn of War</h1>
      <h1 className='display-4'>Ultimate Matchup Generator</h1>
      <Dropdown color='' options={['New', 'Load']} onSelect={this.selectedCampaign}>Campaign</Dropdown>
      <Dropdown color='' options={['New', 'Load']} onSelect={this.selectedEditor}>Editor</Dropdown>
      <Button color=''>Matchup</Button>
      <Link to='/settings' className='btn'>Settings</Link>
      <Button color='' onClick={this.onQuit}>Quit</Button>
    </div>;
  }

}

type DropdownProps = {
  options: string[];
  color?: string;
  onSelect: (selected: number) => void;
};

class Dropdown extends React.Component<DropdownProps, any> {

  constructor(props: any) {
    super(props);

    this.state = {
      dropdownOpen: false
    };
  }

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
    return <ButtonDropdown direction='down' isOpen={this.state.dropdownOpen} toggle={this.toggle}>
      <DropdownToggle color={this.props.color} caret>
        {this.props.children}
      </DropdownToggle>
      <DropdownMenu>
        {this.props.options.map((option, i) => <DropdownItem onClick={() => this.props.onSelect(i)}>{option}</DropdownItem>)}
      </DropdownMenu>
    </ButtonDropdown>;
  }

}