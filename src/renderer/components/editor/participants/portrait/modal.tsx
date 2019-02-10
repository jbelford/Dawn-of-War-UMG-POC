import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import Modal from 'reactstrap/lib/Modal';
import ModalBody from 'reactstrap/lib/ModalBody';
import ModalFooter from 'reactstrap/lib/ModalFooter';
import ModalHeader from 'reactstrap/lib/ModalHeader';
import { LocalData } from '../../../../../common/data';
import PortraitSelect from './select';

type Props = {
  portrait: string;
  disabled?: boolean;
  onSave: (portrait: string) => void;
};

type State = {
  modal: boolean;
  selected: { key: string, idx: number };
};

export class PortraitModal extends React.Component<Props, State> {

  private portraits = LocalData.getPortraits();

  constructor(props: any) {
    super(props);
    this.state = { modal: false, selected: this.getPortraitSelected(this.props.portrait) };
  }

  public toggle = () => {
    const newModal = !this.state.modal;
    let selected = this.state.selected;
    if (newModal) {
      selected = this.getPortraitSelected(this.props.portrait);
    }
    this.setState({ ...this.state, modal: newModal, selected: selected });
  }

  private getPortraitSelected(portrait: string): { key: string, idx: number } {
    return Object.keys(this.portraits).map(key => ({
      key: key,
      idx: this.portraits[key].findIndex((p: string) => p === portrait)
    })).find(portraits => portraits.idx >= 0) as any;
  }


  private onChange = (key: string, idx: number) => {
    this.setState({ ...this.state, selected: { key: key, idx: idx } });
  }

  private save = () => {
    const portrait = this.portraits[this.state.selected.key][this.state.selected.idx];
    this.props.onSave(portrait);
    this.toggle();
  }

  render() {
    return <Modal
      isOpen={this.state.modal}
      toggle={this.toggle}>
      <ModalHeader toggle={this.toggle}>Choose a Portrait</ModalHeader>
      <ModalBody>
        <PortraitSelect
          selected={this.state.selected}
          onChange={this.onChange} />
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={this.toggle}>Cancel</Button>
        <Button color='primary' onClick={this.save} disabled={this.props.disabled}>Save</Button>
      </ModalFooter>
    </Modal>;
  }
}