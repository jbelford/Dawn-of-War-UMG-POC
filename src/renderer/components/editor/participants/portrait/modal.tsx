import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import Modal from 'reactstrap/lib/Modal';
import ModalBody from 'reactstrap/lib/ModalBody';
import ModalFooter from 'reactstrap/lib/ModalFooter';
import ModalHeader from 'reactstrap/lib/ModalHeader';
import { PortraitSelect } from './select';

type Props = {
  selected: { key: string, idx: number };
  onSave: (key: string, idx: number) => void;
};

type State = {
  modal: boolean;
  selected: { key: string, idx: number };
};

export class PortraitModal extends React.Component<Props, State> {

  constructor(props: any) {
    super(props);
    this.state = { modal: false, selected: this.props.selected };
  }

  public toggle = () => {
    this.setState({ ...this.state, modal: !this.state.modal });
  }

  public onChange = (key: string, idx: number) => {
    this.setState({ ...this.state, selected: { key: key, idx: idx } });
  }

  public save = () => {
    this.props.onSave(this.state.selected.key, this.state.selected.idx);
    this.toggle();
  }

  render() {
    return <Modal
      isOpen={this.state.modal}
      toggle={this.toggle}>
      <ModalHeader toggle={this.toggle}>Choose a Portrait</ModalHeader>
      <ModalBody>
        <PortraitSelect
          portrait={this.state.selected}
          onChange={this.onChange} />
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={this.toggle}>Cancel</Button>
        <Button color='primary' onClick={this.save}>Save</Button>
      </ModalFooter>
    </Modal>;
  }
}