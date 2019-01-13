import classnames from 'classnames';
import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import Fade from 'reactstrap/lib/Fade';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import Media from 'reactstrap/lib/Media';
import Nav from 'reactstrap/lib/Nav';
import NavItem from 'reactstrap/lib/NavItem';
import NavLink from 'reactstrap/lib/NavLink';
import TabContent from 'reactstrap/lib/TabContent';
import TabPane from 'reactstrap/lib/TabPane';
import { Participant } from '../../../typings/campaign';
const spaceMarinePortrait = require('../../img/spacemarine.jpg');

type ParticipantTabProps = {
  participants: Participant[];
};

type ParticipantTabState = {
  participants: (Participant & { locked: boolean })[];
  activeTab: number;
};

export class ParticipantTabs extends React.Component<ParticipantTabProps, ParticipantTabState> {

  constructor(props: any) {
    super(props);
    const participants = this.props.participants.map(p => ({ ...p, locked: true }));
    if (!participants.length) {
      participants.push({ portrait: spaceMarinePortrait, race: '', army: '', about: '', locked: false });
      participants.push({ portrait: spaceMarinePortrait, race: '', army: '', about: '', locked: false });
    }

    this.state = { activeTab: 0, participants: participants };
  }

  private toggle = (tab: number) => {
    if (this.state.activeTab !== tab) {
      this.setState({ ...this.state, activeTab: tab });
    }
  }

  private handleParticipantChange = (i: number, key: string, value: string) => {
    const participants = this.state.participants;
    participants[i][key] = value;
    this.setState({ ...this.state, participants: participants });
  }

  private deleteParticipant = () => {
    if (this.state.participants.length > 1) {
      this.state.participants.splice(this.state.activeTab, 1);
      const activeTab = this.state.activeTab;
      this.setState({ ...this.state, activeTab: activeTab - Math.sign(activeTab) });
    }
  }

  private createParticipant = () => {
    this.state.participants.push({ portrait: spaceMarinePortrait, race: '', army: '', about: '', locked: false });
    this.setState({ ...this.state, activeTab: this.state.participants.length - 1 });
  }

  private toggleLock = (i: number) => {
    const participants = this.state.participants;
    participants[i].locked = !participants[i].locked;
    this.setState({ ...this.state, participants: participants });
  }

  render() {
    return <div>
      <Nav tabs>
        {this.state.participants.map((participant, i) => (
          <NavItem>
            <NavLink className={classnames({ active: this.state.activeTab === i })}
              onClick={() => this.toggle(i)}>
              {participant.army.trim() ? participant.army.trim() : '<Army>'}
            </NavLink>
          </NavItem>
        ))}
        <Button outline color='' onClick={this.createParticipant}>Add</Button>
      </Nav>
      <TabContent activeTab={this.state.activeTab} className='p-3'>
        {this.state.participants.map((participant, i) => (
          <TabPane tabId={i}>
            <Fade in={this.state.activeTab === i} className='d-flex flex-column'>
              <Media>
                <Media left href='#' className='w-25 mr-2'>
                  <Media object
                    src={participant.portrait}
                    className='img-thumbnail'
                    alt='Portrait Image' />
                </Media>
                <Media body>
                  <Form>
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
                      <Label>About</Label>
                      <Input type='textarea' placeholder='Who are they? Why are they involved in this campaign?'
                        value={participant.about} onChange={(e) => this.handleParticipantChange(i, 'about', e.target.value)}
                        disabled={participant.locked} />
                    </FormGroup>
                  </Form>
                </Media>
              </Media>
              <div className='align-self-end'>
                <Button color={participant.locked ? 'dark' : 'primary'}
                  onClick={() => this.toggleLock(i)}
                  style={{ width: '75px' }}>
                  {participant.locked ? 'Unlock' : 'Lock'}
                </Button>
                {this.state.participants.length > 1
                  && <Button color='danger' className='ml-2'
                    onClick={() => this.deleteParticipant()}
                    style={{ width: '75px' }}
                    disabled={participant.locked}>Delete</Button>}
              </div>
            </Fade>
          </TabPane>
        ))}
      </TabContent>
    </div>;
  }

}
