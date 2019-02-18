import { ReactNode, useEffect, useState } from 'react';
import Button from 'reactstrap/lib/Button';
import Modal from 'reactstrap/lib/Modal';
import ModalBody from 'reactstrap/lib/ModalBody';
import ModalFooter from 'reactstrap/lib/ModalFooter';
import ModalHeader from 'reactstrap/lib/ModalHeader';
import { Observable } from 'rxjs';

const React = require('react');

type FormModalProps = { title: string, children: ReactNode, onSave: () => void, toggle: Observable<void> };

export default function FormModal({ title, children, onSave, toggle }: FormModalProps) {
  const [modal, setModal] = useState(false);

  const toggleModal = () => setModal(!modal);

  useEffect(() => {
    const sub = toggle.subscribe(toggleModal);
    return () => sub.unsubscribe();
  });

  function onSaveClick() {
    toggleModal();
    onSave();
  }

  return (
    <Modal
      isOpen={modal}
      toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>{title}</ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={toggleModal}>Cancel</Button>
        <Button color='primary' onClick={onSaveClick}>Save</Button>
      </ModalFooter>
    </Modal>
  );
}