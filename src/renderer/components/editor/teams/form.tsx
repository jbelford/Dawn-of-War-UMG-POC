import * as React from 'react';
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
  onChange: (team: Team) => void;
};

type TeamTabsFormState = {
  team: Team;
  locked: boolean;
};

export class TeamTabsForm extends React.Component<TeamTabsFormProps, TeamTabsFormState> {

  constructor(props: any) {
    super(props);
    this.state = { team: this.props.team, locked: true };
  }


  private handleTeamChange = (key: string, value: string) => {
    const team = this.state.team;
    team[key] = value;
    this.setState({ ...this.state, team: team });
    this.props.onChange(team);
  }

  private toggleLock = () => {
    this.setState({ ...this.state, locked: !this.state.locked });
  }

  render() {
    return <Row>
      <Col className='d-flex flex-column' sm={8}>
        <FormGroup>
          <Label>Name</Label>
          <Input type='text' placeholder='What is the name of this team?'
            value={this.state.team.name}
            onChange={(e) => this.handleTeamChange('name', e.target.value)}
            disabled={this.state.locked} />
        </FormGroup>
        <FormGroup>
          <Label>About</Label>
          <Input type='textarea' placeholder='What is the goal of this team? Why are they involved? Why are they allied?'
            value={this.state.team.about}
            onChange={(e) => this.handleTeamChange('about', e.target.value)}
            disabled={this.state.locked} />
        </FormGroup>
        <div>
          <Button color={this.state.locked ? 'dark' : 'primary'}
            onClick={this.toggleLock}
            style={{ width: '75px' }}>
            {this.state.locked ? 'Unlock' : 'Lock'}
          </Button>
          {/* {this.state.teams.length > 2
            && <Button color='danger' className='ml-2 float-right'
              onClick={() => this.deleteTeam()}
              style={{ width: '75px' }}
              disabled={team.locked}>Delete</Button>} */}
        </div>
      </Col>
      <ParticipantsList participants={this.props.participants} teamId={this.state.team.id} />
    </Row>;
  }

}

function ParticipantsList(props: { participants: Participant[], teamId: number }) {
  const participants = props.participants.map((p, i) => ({ ...p, i: i }))
    .filter(p => p.team === props.teamId);
  return <Col sm={4}>
    <ListGroup>
      <Label>Armies</Label>
      {!participants.length && <p>No armies assigned!</p>}
      {participants.map((p) => {
        return <ListGroupItem>
          <ListGroupItemHeading>{p.army.trim() ? p.army.trim() : `<Army-${p.i + 1}>`}</ListGroupItemHeading>
          {p.race.trim() && <ListGroupItemText><i>{p.race.trim()}</i></ListGroupItemText>}
        </ListGroupItem>;
      })}
    </ListGroup>
  </Col>;
}