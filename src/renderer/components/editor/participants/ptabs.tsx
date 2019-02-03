import classnames from 'classnames';
import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import Fade from 'reactstrap/lib/Fade';
import Nav from 'reactstrap/lib/Nav';
import NavItem from 'reactstrap/lib/NavItem';
import NavLink from 'reactstrap/lib/NavLink';
import TabContent from 'reactstrap/lib/TabContent';
import TabPane from 'reactstrap/lib/TabPane';
import { LocalData, PortraitList } from '../../../../common/data';
import { Participant, Team } from '../../../../typings/campaign';
import { ParticipantForm } from './pform';

type ParticipantTabProps = {
  participants: Participant[];
  teams: Team[];
  onChange: (participants: Participant[]) => void;
};

type ParticipantTabState = {
  activeTab: number;
};

export class ParticipantTabs extends React.Component<ParticipantTabProps, ParticipantTabState> {

  private portraits: PortraitList;

  constructor(props: any) {
    super(props);
    this.state = { activeTab: 0 };
    this.portraits = LocalData.getPortraits();
  }
  private toggle = (tab: number) => {
    if (this.state.activeTab !== tab) {
      this.setState({ ...this.state, activeTab: tab });
    }
  }

  private createParticipant = () => {
    const newId = this.props.participants.reduce((id, p) => Math.max(id, p.id), 0);
    const participants = [...this.props.participants, {
      id: newId, portrait: this.portraits.imperium[0],
      race: '', army: '', about: '', team: 0
    }];
    this.setState({ ...this.state, activeTab: participants.length - 1 });
    this.props.onChange(participants);
  }

  private participantChange = (p: Participant, i: number) => {
    const participants = this.props.participants;
    participants[i] = p;
    this.props.onChange(participants);
  }

  private deleteParticipant = (i: number) => {
    if (this.props.participants.length > 1) {
      const participants = this.props.participants.slice(0, i).concat(this.props.participants.slice(i + 1));
      const activeTab = this.state.activeTab;
      if (i <= activeTab) {
        this.setState({ ...this.state, activeTab: activeTab - Math.sign(activeTab) });
      }
      this.props.onChange(participants);
    }
  }

  render() {
    const showDelete = this.props.participants.length > 2;
    return <div>
      <Nav tabs>
        {this.props.participants.map((participant, i) => (
          <NavItem key={participant.id}>
            <NavLink className={classnames({ active: this.state.activeTab === i })}
              onClick={() => this.toggle(i)}>
              {participant.army.trim() ? participant.army.trim() : `<Army-${i + 1}>`}
            </NavLink>
          </NavItem>
        ))}
        <Button outline color='' onClick={this.createParticipant}>Add</Button>
      </Nav>
      <TabContent className='p-3' activeTab={this.state.activeTab} >
        {this.props.participants.map((participant, i) => (
          <TabPane tabId={i} key={i}>
            <Fade className='d-flex flex-column' in={this.state.activeTab === i} >
              <ParticipantForm
                participant={participant}
                teams={this.props.teams}
                showDelete={showDelete}
                onChange={p => this.participantChange(p, i)}
                onDelete={() => this.deleteParticipant(i)} />
            </Fade>
          </TabPane>
        ))}
      </TabContent>
    </div>;
  }

}
