import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import Col from 'reactstrap/lib/Col';
import Fade from 'reactstrap/lib/Fade';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import Nav from 'reactstrap/lib/Nav';
import NavItem from 'reactstrap/lib/NavItem';
import NavLink from 'reactstrap/lib/NavLink';
import Row from 'reactstrap/lib/Row';
import TabContent from 'reactstrap/lib/TabContent';
import TabPane from 'reactstrap/lib/TabPane';
import { Participant, Team } from '../../../typings/campaign';
import classnames = require('classnames');

type TeamTabsProps = {
  teams: Team[];
  participants: Participant[];
  onChange?: (teams: Team[]) => void;
};

type TeamTabsState = {
  teams: (Team & { locked: boolean })[]
  activeTab: number;
};

export class TeamTabs extends React.Component<TeamTabsProps, TeamTabsState> {

  constructor(props: any) {
    super(props);
    const teams = this.props.teams.map(t => ({ ...t, locked: true }));
    this.state = { teams: teams, activeTab: 0 };
  }

  private toggle = (i: number) => {
    this.setState({ ...this.state, activeTab: i });
  }

  private createTeam = () => {
    const newId = this.state.teams.reduce((id, t) => Math.max(id, t.id), 0) + 1;
    this.state.teams.push({ id: newId, name: '', about: '', locked: false });
    this.setState({ ...this.state, activeTab: this.state.teams.length - 1 });
    this.emitUpdate();
  }

  private handleTeamChange = (i: number, key: string, value: string) => {
    const teams = this.state.teams;
    teams[i][key] = value;
    this.setState({ ...this.state, teams: teams });
    this.emitUpdate();
  }

  private toggleLock = (i: number) => {
    const teams = this.state.teams;
    teams[i].locked = !teams[i].locked;
    this.setState({ ...this.state, teams: teams });
  }

  private deleteTeam = () => {
    if (this.state.teams.length > 1) {
      this.state.teams.splice(this.state.activeTab, 1);
      const activeTab = this.state.activeTab;
      this.setState({ ...this.state, activeTab: activeTab - Math.sign(activeTab) });
      this.emitUpdate();
    }
  }

  private emitUpdate = () => {
    if (this.props.onChange) {
      this.props.onChange(this.state.teams.map(team => ({
        id: team.id,
        name: team.name,
        about: team.about
      })));
    }
  }

  private renderParticipants = (team: Team) => {
    const participants = this.props.participants.map((p, i) => ({ ...p, i: i }))
      .filter(p => p.team === team.id);
    return <Col className='w-25'>
      <ListGroup>
        <Label>Armies</Label>
        {!participants.length && <p>No armies assigned!</p>}
        {participants.map((p) => {
          let text = p.race.trim() && `[${p.race}] `;
          text += p.army.trim() ? p.army.trim() : `<Army-${p.i + 1}>`;
          return <ListGroupItem>{text}</ListGroupItem>;
        })}
      </ListGroup>
    </Col>;
  }

  render() {
    return <div>
      <Nav tabs>
        {this.state.teams.map((team, i) => (
          <NavItem>
            <NavLink className={classnames({ active: this.state.activeTab === i })}
              onClick={() => this.toggle(i)}>
              {team.name.trim() ? team.name.trim() : `<Team-${i + 1}>`}
            </NavLink>
          </NavItem>
        ))}
        <Button outline color='' onClick={this.createTeam}>Add</Button>
      </Nav>
      <TabContent className='p-3' activeTab={this.state.activeTab} >
        {this.state.teams.map((team, i) =>
          <TabPane tabId={i}>
            <Fade in={this.state.activeTab === i} >
              <Row>
                {this.renderParticipants(team)}
                <Col className='d-flex flex-column'>
                  <FormGroup>
                    <Label>Name</Label>
                    <Input type='text' placeholder='What is the name of this team?'
                      value={team.name}
                      onChange={(e) => this.handleTeamChange(i, 'name', e.target.value)}
                      disabled={team.locked} />
                  </FormGroup>
                  <FormGroup>
                    <Label>About</Label>
                    <Input type='textarea' placeholder='What is the goal of this team? Why are they involved? Why are they allied?'
                      value={team.about}
                      onChange={(e) => this.handleTeamChange(i, 'about', e.target.value)}
                      disabled={team.locked} />
                  </FormGroup>
                  <div className='align-self-end'>
                    <Button color={team.locked ? 'dark' : 'primary'}
                      onClick={() => this.toggleLock(i)}
                      style={{ width: '75px' }}>
                      {team.locked ? 'Unlock' : 'Lock'}
                    </Button>
                    {this.state.teams.length > 2
                      && <Button color='danger' className='ml-2'
                        onClick={() => this.deleteTeam()}
                        style={{ width: '75px' }}
                        disabled={team.locked}>Delete</Button>}
                  </div>
                </Col>
              </Row>
            </Fade>
          </TabPane>
        )}
      </TabContent>
    </div>;
  }


}