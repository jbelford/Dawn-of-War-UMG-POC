import classnames from 'classnames';
import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import Fade from 'reactstrap/lib/Fade';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import Media from 'reactstrap/lib/Media';
import Nav from 'reactstrap/lib/Nav';
import NavItem from 'reactstrap/lib/NavItem';
import NavLink from 'reactstrap/lib/NavLink';
import TabContent from 'reactstrap/lib/TabContent';
import TabPane from 'reactstrap/lib/TabPane';
import { Participant, Team } from '../../../typings/campaign';
const spaceMarinePortrait = require('../../img/spacemarine.jpg');

type ParticipantTabProps = {
  participants: Participant[];
  teams: Team[];
  onChange?: (participants: Participant[]) => void;
};

type ParticipantTabState = {
  participants: (Participant & { locked: boolean })[];
  activeTab: number;
};

export class ParticipantTabs extends React.Component<ParticipantTabProps, ParticipantTabState> {

  constructor(props: any) {
    super(props);
    const participants = this.props.participants.map(p => ({ ...p, locked: true }));
    this.state = { activeTab: 0, participants: participants };
  }
  private toggle = (tab: number) => {
    if (this.state.activeTab !== tab) {
      this.setState({ ...this.state, activeTab: tab });
    }
  }

  private handleParticipantChange = (i: number, key: string, value: any) => {
    const participants = this.state.participants;
    participants[i][key] = value;
    this.setState({ ...this.state, participants: participants });
    this.emitUpdate();
  }

  private deleteParticipant = () => {
    if (this.state.participants.length > 1) {
      this.state.participants.splice(this.state.activeTab, 1);
      const activeTab = this.state.activeTab;
      this.setState({ ...this.state, activeTab: activeTab - Math.sign(activeTab) });
      this.emitUpdate();
    }
  }

  private createParticipant = () => {
    const newId = this.state.participants.reduce((id, p) => Math.max(id, p.id), 0);
    this.state.participants.push({
      id: newId, portrait: spaceMarinePortrait,
      race: '', army: '', about: '', team: 0,
      locked: false
    });
    this.setState({ ...this.state, activeTab: this.state.participants.length - 1 });
    this.emitUpdate();
  }

  private toggleLock = (i: number) => {
    const participants = this.state.participants;
    participants[i].locked = !participants[i].locked;
    this.setState({ ...this.state, participants: participants });
  }

  private emitUpdate = () => {
    if (this.props.onChange) {
      this.props.onChange(this.state.participants.map(p => ({
        portrait: p.portrait,
        id: p.id,
        race: p.race,
        army: p.army,
        about: p.about,
        team: p.team
      })));
    }
  }

  render() {
    return <div>
      <Nav tabs>
        {this.state.participants.map((participant, i) => (
          <NavItem>
            <NavLink className={classnames({ active: this.state.activeTab === i })}
              onClick={() => this.toggle(i)}>
              {participant.army.trim() ? participant.army.trim() : `<Army-${i + 1}>`}
            </NavLink>
          </NavItem>
        ))}
        <Button outline color='' onClick={this.createParticipant}>Add</Button>
      </Nav>
      <TabContent className='p-3' activeTab={this.state.activeTab} >
        {this.state.participants.map((participant, i) => (
          <TabPane tabId={i}>
            <Fade className='d-flex flex-column' in={this.state.activeTab === i} >
              <Media>
                <Media left href='#' className='w-25 mr-2'>
                  <Media object
                    src={participant.portrait}
                    className='img-thumbnail'
                    alt='Portrait Image' />
                </Media>
                <Media body>
                  <FormGroup>
                    <Label>Army</Label>
                    <Input type='text' placeholder='What is the name of the army? (Ex: Blood Angels)'
                      value={participant.army}
                      onChange={(e) => this.handleParticipantChange(i, 'army', e.target.value)}
                      disabled={participant.locked} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Race</Label>
                    <Input type='text' placeholder='What race is this participant? (Ex: Space Marines)'
                      value={participant.race}
                      onChange={(e) => this.handleParticipantChange(i, 'race', e.target.value)}
                      disabled={participant.locked} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Team</Label>
                    <Input type='select'
                      value={participant.team}
                      disabled={participant.locked}
                      onChange={(e) => this.handleParticipantChange(i, 'team', +e.target.value)}>
                      {this.props.teams.map((team, i) => (
                        <option value={team.id}>
                          {team.name.trim() ? `Team ${i + 1}: ${team.name.trim()}` : `Team ${i + 1}: <Team-${i + 1}>`}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label>About</Label>
                    <Input type='textarea' placeholder='Who are they? Why are they involved in this campaign?'
                      value={participant.about} onChange={(e) => this.handleParticipantChange(i, 'about', e.target.value)}
                      disabled={participant.locked} />
                  </FormGroup>
                  <div>
                    <Button color={participant.locked ? 'dark' : 'primary'}
                      onClick={() => this.toggleLock(i)}
                      style={{ width: '75px' }}>
                      {participant.locked ? 'Unlock' : 'Lock'}
                    </Button>
                    {this.state.participants.length > 2
                      && <Button color='danger' className='ml-2 float-right'
                        onClick={() => this.deleteParticipant()}
                        style={{ width: '75px' }}
                        disabled={participant.locked}>Delete</Button>}
                  </div>
                </Media>
              </Media>
            </Fade>
          </TabPane>
        ))}
      </TabContent>
    </div>;
  }

}
