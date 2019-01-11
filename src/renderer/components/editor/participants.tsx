import classnames from 'classnames';
import * as React from 'react';
import Container from 'reactstrap/lib/Container';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import Nav from 'reactstrap/lib/Nav';
import NavItem from 'reactstrap/lib/NavItem';
import NavLink from 'reactstrap/lib/NavLink';
import Row from 'reactstrap/lib/Row';
import TabContent from 'reactstrap/lib/TabContent';
import TabPane from 'reactstrap/lib/TabPane';
import { Participant } from '../../../typings/campaign';

type ParticipantTabProps = {
  participants: Participant[];
};

type ParticipantTabState = {
  participants: Participant[];
  activeTab?: number;
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

  participantsOnChange = (i: number, key: string, value: string) => {
    const participants = this.state.participants;
    participants[i][key] = value;
    this.setState({ ...this.state, participants: participants });
  }
  render() {
    return <div>
      <Nav tabs>
        {this.state.participants.map((participant, i) => (
          <NavItem>
            <NavLink className={classnames({ active: this.state.activeTab === i })}
              onClick={() => this.toggle(i)}>
              {participant.army ? participant.army : '<Army>'}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <TabContent activeTab={this.state.activeTab}>
        {this.state.participants.map((participant, i) => (
          <TabPane tabId={i}>
            <Container>
              <Row>
                <Label>Army</Label>
                <Input type='text' placeholder='What is the name of the army? (Ex: Blood Angels)'
                  value={participant.army} onChange={(e) => this.participantsOnChange(i, 'army', e.target.value)} />
              </Row>
              <Row>
                <Label>Race</Label>
                <Input type='text' placeholder='What race is this participant? (Ex: Space Marine)'
                  value={participant.race} onChange={(e) => this.participantsOnChange(i, 'race', e.target.value)} />
              </Row>
              <Row>
                <Label>About</Label>
                <Input type='textarea' placeholder='Who are they? Why are they involved in this campaign?'
                  value={participant.about} onChange={(e) => this.participantsOnChange(i, 'about', e.target.value)} />
              </Row>
            </Container>
          </TabPane>
        ))}
      </TabContent>
    </div>;
  }

}
