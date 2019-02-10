import { forwardRef, Ref, useImperativeHandle, useState } from 'react';
import Button from 'reactstrap/lib/Button';
import Modal from 'reactstrap/lib/Modal';
import ModalBody from 'reactstrap/lib/ModalBody';
import ModalFooter from 'reactstrap/lib/ModalFooter';
import ModalHeader from 'reactstrap/lib/ModalHeader';
import { LocalData } from '../../../../../common/data';
import PortraitSelect from './select';
const React = require('react');

const portraits = LocalData.getPortraits();

function getPortraitSelected(portrait: string): { key: string, idx: number } {
  return Object.keys(portraits).map(key => ({
    key: key,
    idx: portraits[key].findIndex((p: string) => p === portrait)
  })).find(portraits => portraits.idx >= 0) as any;
}

type PortraitModalProps = { portrait: string, disabled?: boolean, onSave: (portrait: string) => void };

const PortraitModal = forwardRef(function ({ portrait, disabled, onSave }: PortraitModalProps, ref: Ref<any>) {
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(getPortraitSelected(portrait));

  const toggle = () => setModal(!modal);

  function save() {
    const portrait = portraits[selected.key][selected.idx];
    onSave(portrait);
    toggle();
  }

  useImperativeHandle(ref, () => ({ toggle: toggle }));

  return (
    <Modal
      isOpen={modal}
      toggle={toggle}>
      <ModalHeader toggle={toggle}>Choose a Portrait</ModalHeader>
      <ModalBody>
        <PortraitSelect
          selected={selected}
          onChange={(key, idx) => setSelected({ key: key, idx: idx })} />
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={toggle}>Cancel</Button>
        <Button color='primary' onClick={save} disabled={disabled}>Save</Button>
      </ModalFooter>
    </Modal>
  );
});

export default PortraitModal;