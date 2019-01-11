import classnames from 'classnames';
import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import Nav from 'reactstrap/lib/Nav';
import NavItem from 'reactstrap/lib/NavItem';
import NavLink from 'reactstrap/lib/NavLink';
import TabContent from 'reactstrap/lib/TabContent';
import TabPane from 'reactstrap/lib/TabPane';
import { Participant } from '../../../typings/campaign';

type ParticipantTabProps = {
  participants: Participant[];
};

type ParticipantTabState = {
  participants: Participant[];
  activeTab: number;
};

export class ParticipantTabs extends React.Component<ParticipantTabProps, ParticipantTabState> {

  constructor(props: any) {
    super(props);
    const participants = this.props.participants;
    if (!participants.length) {
      participants.push({ race: '', army: '', about: '' });
      participants.push({ race: '', army: '', about: '' });
    }

    this.state = { activeTab: 0, participants: participants };
  }

  toggle = (tab: number) => {
    if (this.state.activeTab !== tab) {
      this.setState({ ...this.state, activeTab: tab });
    }
  }

  handleParticipantChange = (i: number, key: string, value: string) => {
    const participants = this.state.participants;
    participants[i][key] = value;
    this.setState({ ...this.state, participants: participants });
  }

  deleteParticipant = (i: number) => {
    if (this.state.participants.length > 1) {
      this.state.participants.splice(i, 1);
      const activeTab = this.state.activeTab;
      if (activeTab >= i) {
        this.setState({ ...this.state, activeTab: activeTab - Math.sign(activeTab) });
      }
    }
  }

  createParticipant = () => {
    const participants = [
      ...this.state.participants.splice(0, this.state.activeTab + 1),
      { race: '', army: '', about: '' },
      ...this.state.participants
    ];

    this.setState({ ...this.state, participants: participants, activeTab: this.state.activeTab + 1 });
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
      <TabContent activeTab={this.state.activeTab}>
        {this.state.participants.map((participant, i) => (
          <TabPane tabId={i}>
            <Form>
              <FormGroup>
                <Label>Army</Label>
                <Input type='text' placeholder='What is the name of the army? (Ex: Blood Angels)'
                  value={participant.army} onChange={(e) => this.handleParticipantChange(i, 'army', e.target.value)} />
              </FormGroup>
              <FormGroup>
                <Label>Race</Label>
                <Input type='text' placeholder='What race is this participant? (Ex: Space Marine)'
                  value={participant.race} onChange={(e) => this.handleParticipantChange(i, 'race', e.target.value)} />
              </FormGroup>
              <FormGroup>
                <Label>About</Label>
                <Input type='textarea' placeholder='Who are they? Why are they involved in this campaign?'
                  value={participant.about} onChange={(e) => this.handleParticipantChange(i, 'about', e.target.value)} />
              </FormGroup>
            </Form>
            {this.state.participants.length > 1
              && <Button className='float-right' color='danger'
                onClick={() => this.deleteParticipant(i)}>Delete</Button>}
          </TabPane>
        ))}
      </TabContent>
    </div>;
  }

}
