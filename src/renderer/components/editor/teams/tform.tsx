const React = require('react');
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from 'reactstrap/lib/Button';
import Col from 'reactstrap/lib/Col';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import ListGroupItemHeading from 'reactstrap/lib/ListGroupItemHeading';
import ListGroupItemText from 'reactstrap/lib/ListGroupItemText';
import Row from 'reactstrap/lib/Row';
import { Participant, Team } from '../../../../typings/campaign';

type TeamTabsFormProps = {
  team: Team;
  participants: Participant[];
  showDelete: boolean;
  onChange: (team: Team) => void;
  onDelete: () => void;
};

export default function TeamTabsForm({ team, participants, showDelete, onChange, onDelete }: TeamTabsFormProps) {
  const [locked, setLocked] = useState(true);

  const toggleLock = () => setLocked(!locked);

  return (
    <Row>
      <Col className='d-flex flex-column' sm={8}>
        <FormGroup>
          <Label>Name</Label>
          <Input type='text' placeholder='What is the name of this team?'
            value={team.name}
            onChange={(e) => onChange({ ...team, name: e.target.value })}
            disabled={locked} />
        </FormGroup>
        <FormGroup>
          <Label>About</Label>
          <TextareaAutosize className='form-control'
            minRows={2}
            maxRows={10}
            placeholder='What is the goal of this team? Why are they involved? Why are they allied?'
            value={team.about}
            onChange={(e) => onChange({ ...team, about: e.target.value })}
            disabled={locked} />
        </FormGroup>
        <div>
          <Button color={locked ? 'dark' : 'primary'}
            onClick={toggleLock}
            style={{ width: '75px' }}>
            {locked ? 'Unlock' : 'Lock'}
          </Button>
          {showDelete
            && <Button color='danger' className='ml-2 float-right'
              onClick={onDelete}
              style={{ width: '75px' }}
              disabled={locked}>Delete</Button>}
        </div>
      </Col>
      <ParticipantsList participants={participants} teamId={team.id} />
    </Row>
  );
}



function ParticipantsList(props: { participants: Participant[], teamId: number }) {
  const participants = props.participants.map((p, i) => ({ ...p, i: i }))
    .filter(p => p.team === props.teamId);
  return (
    <Col sm={4}>
      <ListGroup>
        <Label>Armies</Label>
        {!participants.length && <p>No armies assigned!</p>}
        {participants.map((p) => {
          return <ListGroupItem key={p.id}>
            <ListGroupItemHeading>{p.army.trim() ? p.army.trim() : `<Army-${p.i + 1}>`}</ListGroupItemHeading>
            {p.race.trim() && <ListGroupItemText><i>{p.race.trim()}</i></ListGroupItemText>}
          </ListGroupItem>;
        })}
      </ListGroup>
    </Col>
  );
}