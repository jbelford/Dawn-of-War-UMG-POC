import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from 'reactstrap';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import Media from 'reactstrap/lib/Media';
import { Participant, Team } from '../../../../typings/campaign';

type ParticipantFormProps = {
  participant: Participant;
  teams: Team[];
  onChange: (p: Participant) => void;
};

type ParticipantFormState = {
  participant: Participant;
  locked: boolean;
};

export class ParticipantForm extends React.Component<ParticipantFormProps, ParticipantFormState> {

  constructor(props: any) {
    super(props);
    this.state = { participant: this.props.participant, locked: true };
  }

  private handleParticipantChange = (key: string, value: any) => {
    const participant = this.state.participant;
    participant[key] = value;
    this.setState({ ...this.state, participant: participant });
    this.props.onChange(participant);
  }

  private toggleLock = () => {
    this.setState({ ...this.state, locked: !this.state.locked });
  }

  render() {
    return <Media>
      <Media left href='#' className='w-25 mr-2'>
        <Media object
          src={this.state.participant.portrait}
          className='img-thumbnail'
          alt='Portrait Image' />
      </Media>
      <Media body>
        <FormGroup>
          <Label>Army</Label>
          <Input type='text'
            placeholder='What is the name of the army? (Ex: Blood Angels)'
            value={this.state.participant.army}
            onChange={(e) => this.handleParticipantChange('army', e.target.value)}
            disabled={this.state.locked} />
        </FormGroup>
        <FormGroup>
          <Label>Race</Label>
          <Input type='text'
            placeholder='What race is this participant? (Ex: Space Marines)'
            value={this.state.participant.race}
            onChange={(e) => this.handleParticipantChange('race', e.target.value)}
            disabled={this.state.locked} />
        </FormGroup>
        <FormGroup>
          <Label>Team</Label>
          <Input type='select'
            value={this.state.participant.team}
            disabled={this.state.locked}
            onChange={(e) => this.handleParticipantChange('team', +e.target.value)}>
            {this.props.teams.map((team, i) => (
              <option value={team.id}>
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
            value={this.state.participant.about} onChange={(e) => this.handleParticipantChange('about', e.target.value)}
            disabled={this.state.locked} />
        </FormGroup>
        <div>
          <Button
            color={this.state.locked ? 'dark' : 'primary'}
            onClick={this.toggleLock}
            style={{ width: '75px' }}>
            {this.state.locked ? 'Unlock' : 'Lock'}
          </Button>
          {/* <Button color='danger' className='ml-2 float-right'
              onClick={() => this.deleteParticipant()}
              style={{ width: '75px' }}
              disabled={participant.locked}>Delete</Button> */}
        </div>
      </Media>
    </Media>;
  }

}