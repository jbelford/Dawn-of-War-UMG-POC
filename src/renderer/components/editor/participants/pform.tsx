import { useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from 'reactstrap';
import Col from 'reactstrap/lib/Col';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import Row from 'reactstrap/lib/Row';
import { Participant, Team } from '../../../../typings/campaign';
import PortraitModal from './portrait/modal';
const React = require('react');

type ParticipantFormProps = {
  participant: Participant;
  teams: Team[];
  showDelete: boolean;
  onChange: (p: Participant) => void;
  onDelete: () => void;
};

export default function ParticipantForm({ participant, teams, showDelete, onChange, onDelete }: ParticipantFormProps) {
  const [locked, setLocked] = useState(true);
  const modalRef = useRef(null);

  // @ts-ignore
  const toggleModal = () => modalRef.current && modalRef.current.toggle();

  const toggleLock = () => setLocked(!locked);

  return (
    <Row>
      <PortraitModal
        ref={modalRef}
        onSave={p => onChange({ ...participant, portrait: p })}
        portrait={participant.portrait}
        disabled={locked} />
      <Col xs={3}>
        <img
          src={participant.portrait}
          className='img-thumbnail cursor-pointer'
          alt='Portrait Image'
          title='Click to choose portrait'
          onClick={toggleModal} />
      </Col>
      <Col>
        <FormGroup>
          <Label>Army</Label>
          <Input type='text'
            placeholder='What is the name of the army? (Ex: Blood Angels)'
            value={participant.army}
            onChange={(e) => onChange({ ...participant, army: e.target.value })}
            disabled={locked} />
        </FormGroup>
        <FormGroup>
          <Label>Race</Label>
          <Input type='text'
            placeholder='What race is this participant? (Ex: Space Marines)'
            value={participant.race}
            onChange={(e) => onChange({ ...participant, race: e.target.value })}
            disabled={locked} />
        </FormGroup>
        <FormGroup>
          <Label>Team</Label>
          <Input type='select'
            value={participant.team}
            disabled={locked}
            onChange={(e) => onChange({ ...participant, team: +e.target.value })}>
            {teams.map((team, i) => (
              <option value={team.id} key={i}>
                {team.name.trim() ? `Team ${i + 1}: ${team.name.trim()}` : `Team ${i + 1}: <Team-${i + 1}>`}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>About</Label>
          <TextareaAutosize
            className='form-control'
            minRows={2}
            maxRows={10}
            placeholder='Who are they? Why are they involved in this campaign?'
            value={participant.about} onChange={(e) => onChange({ ...participant, about: e.target.value })}
            disabled={locked} />
        </FormGroup>
        <div>
          <Button
            color={locked ? 'dark' : 'primary'}
            onClick={toggleLock}
            style={{ width: '75px' }}>
            {locked ? 'Unlock' : 'Lock'}
          </Button>
          {showDelete && <Button color='danger' className='ml-2 float-right'
            onClick={onDelete}
            style={{ width: '75px' }}
            disabled={locked}>Delete</Button>}
        </div>
      </Col>
    </Row>
  );
}
