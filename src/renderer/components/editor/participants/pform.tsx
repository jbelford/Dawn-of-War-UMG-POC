import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from 'reactstrap';
import Col from 'reactstrap/lib/Col';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import Row from 'reactstrap/lib/Row';
import { Participant, Team } from '../../../../typings/campaign';
import { PortraitModal } from './modal';

type ParticipantFormProps = {
  participant: Participant;
  teams: Team[];
  showDelete: boolean;
  onChange: (p: Participant) => void;
  onDelete: () => void;
};

type ParticipantFormState = {
  locked: boolean;
  portraitModal: boolean;
};

export class ParticipantForm extends React.Component<ParticipantFormProps, ParticipantFormState> {

  private modalRef: React.RefObject<PortraitModal>;

  constructor(props: any) {
    super(props);
    this.state = { locked: true, portraitModal: false };
    this.modalRef = React.createRef();
  }

  private handleParticipantChange = (key: string, value: any) => {
    const participant = this.props.participant;
    participant[key] = value;
    this.props.onChange(participant);
  }

  private toggleLock = () => {
    this.setState({ ...this.state, locked: !this.state.locked });
  }

  private toggleModal = () => {
    if (this.modalRef.current) {
      this.modalRef.current.toggle();
    }
  }

  render() {
    return <Row>
      <PortraitModal ref={this.modalRef} isOpen={this.state.portraitModal} />
      <Col className='mr-2' xs={3}>
        <img
          src={this.props.participant.portrait}
          className='img-thumbnail cursor-pointer'
          alt='Portrait Image'
          onClick={this.toggleModal} />
      </Col>
      <Col>
        <FormGroup>
          <Label>Army</Label>
          <Input type='text'
            placeholder='What is the name of the army? (Ex: Blood Angels)'
            value={this.props.participant.army}
            onChange={(e) => this.handleParticipantChange('army', e.target.value)}
            disabled={this.state.locked} />
        </FormGroup>
        <FormGroup>
          <Label>Race</Label>
          <Input type='text'
            placeholder='What race is this participant? (Ex: Space Marines)'
            value={this.props.participant.race}
            onChange={(e) => this.handleParticipantChange('race', e.target.value)}
            disabled={this.state.locked} />
        </FormGroup>
        <FormGroup>
          <Label>Team</Label>
          <Input type='select'
            value={this.props.participant.team}
            disabled={this.state.locked}
            onChange={(e) => this.handleParticipantChange('team', +e.target.value)}>
            {this.props.teams.map((team, i) => (
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
            value={this.props.participant.about} onChange={(e) => this.handleParticipantChange('about', e.target.value)}
            disabled={this.state.locked} />
        </FormGroup>
        <div>
          <Button
            color={this.state.locked ? 'dark' : 'primary'}
            onClick={this.toggleLock}
            style={{ width: '75px' }}>
            {this.state.locked ? 'Unlock' : 'Lock'}
          </Button>
          {this.props.showDelete && <Button color='danger' className='ml-2 float-right'
            onClick={this.props.onDelete}
            style={{ width: '75px' }}
            disabled={this.state.locked}>Delete</Button>}
        </div>
      </Col>
    </Row>;
  }

}