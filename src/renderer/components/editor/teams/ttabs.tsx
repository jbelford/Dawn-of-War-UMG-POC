import classnames from 'classnames';
import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import Fade from 'reactstrap/lib/Fade';
import Nav from 'reactstrap/lib/Nav';
import NavItem from 'reactstrap/lib/NavItem';
import NavLink from 'reactstrap/lib/NavLink';
import TabContent from 'reactstrap/lib/TabContent';
import TabPane from 'reactstrap/lib/TabPane';
import { Participant, Team } from '../../../../typings/campaign';
import TeamTabsForm from './tform';

type TeamTabsProps = {
  teams: Team[];
  participants: Participant[];
  onChange: (teams: Team[]) => void;
};

type TeamTabsState = {
  activeTab: number;
};

export class TeamTabs extends React.Component<TeamTabsProps, TeamTabsState> {

  constructor(props: any) {
    super(props);
    this.state = { activeTab: 0 };
  }

  private toggle = (i: number) => {
    this.setState({ ...this.state, activeTab: i });
  }

  private createTeam = () => {
    const newId = this.props.teams.reduce((id, t) => Math.max(id, t.id), 0) + 1;
    const teams = [...this.props.teams, { id: newId, name: '', about: '' }];
    this.setState({ ...this.state, activeTab: teams.length - 1 });
    this.props.onChange(teams);
  }

  private onChangeTeam = (team: Team, i: number) => {
    const teams = this.props.teams;
    teams[i] = team;
    this.props.onChange(teams);
  }

  private deleteTeam = (i: number) => {
    if (this.props.teams.length > 1) {
      const teams = this.props.teams.slice(0, i).concat(this.props.teams.slice(i + 1));
      const activeTab = this.state.activeTab;
      if (i <= activeTab) {
        this.setState({ ...this.state, activeTab: activeTab - Math.sign(activeTab) });
      }
      this.props.onChange(teams);
    }
  }

  render() {
    const showDelete = this.props.teams.length > 2;
    return <div>
      <Nav tabs>
        {this.props.teams.map((team, i) => (
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === i })}
              onClick={() => this.toggle(i)}>
              {team.name.trim() ? team.name.trim() : `<Team-${i + 1}>`}
            </NavLink>
          </NavItem>
        ))}
        <Button outline color='' onClick={this.createTeam}>Add</Button>
      </Nav>
      <TabContent className='p-3' activeTab={this.state.activeTab} >
        {this.props.teams.map((team, i) =>
          <TabPane tabId={i} key={i}>
            <Fade in={this.state.activeTab === i}>
              <TeamTabsForm
                team={team}
                showDelete={showDelete}
                participants={this.props.participants}
                onChange={(t) => this.onChangeTeam(t, i)}
                onDelete={() => this.deleteTeam(i)} />
            </Fade>
          </TabPane>
        )}
      </TabContent>
    </div>;
  }


}
