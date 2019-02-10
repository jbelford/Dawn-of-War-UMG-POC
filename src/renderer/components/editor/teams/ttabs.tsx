import classnames from 'classnames';
import { useState } from 'react';
import Button from 'reactstrap/lib/Button';
import Fade from 'reactstrap/lib/Fade';
import Nav from 'reactstrap/lib/Nav';
import NavItem from 'reactstrap/lib/NavItem';
import NavLink from 'reactstrap/lib/NavLink';
import TabContent from 'reactstrap/lib/TabContent';
import TabPane from 'reactstrap/lib/TabPane';
import { Participant, Team } from '../../../../typings/campaign';
import TeamTabsForm from './tform';
const React = require('react');

type TeamTabsProps = {
  teams: Team[];
  participants: Participant[];
  onChange: (teams: Team[]) => void;
};

export default function TeamTabs({ teams, participants, onChange }: TeamTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  function createTeam() {
    const newId = teams.reduce((id, t) => Math.max(id, t.id), 0) + 1;
    const newTeams = [...teams, { id: newId, name: '', about: '' }];
    setActiveTab(newTeams.length - 1);
    onChange(newTeams);
  }

  function onChangeTeam(team: Team, i: number) {
    const newTeams = teams;
    newTeams[i] = team;
    onChange(newTeams);
  }

  function deleteTeam(i: number) {
    if (teams.length > 1) {
      const newTeams = teams.slice(0, i).concat(teams.slice(i + 1));
      if (i <= activeTab) {
        setActiveTab(activeTab - Math.sign(activeTab));
      }
      onChange(newTeams);
    }
  }

  const showDelete = teams.length > 2;

  return (
    <div>
      <Nav tabs>
        {teams.map((team, i) => (
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === i })}
              onClick={() => setActiveTab(i)}>
              {team.name.trim() ? team.name.trim() : `<Team-${i + 1}>`}
            </NavLink>
          </NavItem>
        ))}
        <Button outline color='' onClick={createTeam}>Add</Button>
      </Nav>
      <TabContent className='p-3' activeTab={activeTab} >
        {teams.map((team, i) =>
          <TabPane tabId={i} key={i}>
            <Fade in={activeTab === i}>
              <TeamTabsForm
                team={team}
                showDelete={showDelete}
                participants={participants}
                onChange={(t) => onChangeTeam(t, i)}
                onDelete={() => deleteTeam(i)} />
            </Fade>
          </TabPane>
        )}
      </TabContent>
    </div>
  );
}
