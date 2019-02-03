import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import Modal from 'reactstrap/lib/Modal';
import ModalBody from 'reactstrap/lib/ModalBody';
import ModalFooter from 'reactstrap/lib/ModalFooter';
import ModalHeader from 'reactstrap/lib/ModalHeader';
import { PortraitSelect } from './portraits';

type State = {
  modal: boolean;
};

export class PortraitModal extends React.Component<any, State> {

  constructor(props: any) {
    super(props);
    this.state = { modal: false };
  }

  public toggle = () => {
    this.setState({ ...this.state, modal: !this.state.modal });
  }

  render() {
    return <Modal
      isOpen={this.state.modal}
      toggle={this.toggle}>
      <ModalHeader toggle={this.toggle}>Choose a Portrait</ModalHeader>
      <ModalBody>
        <PortraitSelect />
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={this.toggle}>Cancel</Button>
        <Button color='primary' onClick={this.toggle}>Save</Button>
      </ModalFooter>
    </Modal>;
  }
}