import classnames from 'classnames';
import { useState } from 'react';
import Button from 'reactstrap/lib/Button';
import Fade from 'reactstrap/lib/Fade';
import Nav from 'reactstrap/lib/Nav';
import NavItem from 'reactstrap/lib/NavItem';
import NavLink from 'reactstrap/lib/NavLink';
import TabContent from 'reactstrap/lib/TabContent';
import TabPane from 'reactstrap/lib/TabPane';
import { LocalData } from '../../../../common/data';
import { Participant, Team } from '../../../../typings/campaign';
import ParticipantForm from './pform';
const React = require('react');

type ParticipantTabProps = {
  participants: Participant[];
  teams: Team[];
  onChange: (participants: Participant[]) => void;
};

export default function ParticipantTabs({ participants, teams, onChange }: ParticipantTabProps) {
  const [activeTab, setActiveTab] = useState(0);

  const portraits = LocalData.getPortraits();

  function createParticipant() {
    const newId = participants.reduce((id, p) => Math.max(id, p.id), 0);
    const newParticipants = [...participants, {
      id: newId, portrait: portraits.imperium[0],
      race: '', army: '', about: '', team: 0
    }];
    setActiveTab(newParticipants.length - 1);
    onChange(newParticipants);
  }

  function participantChange(p: Participant, i: number) {
    const newParticipants = participants;
    newParticipants[i] = p;
    onChange(newParticipants);
  }

  function deleteParticipant(i: number) {
    if (participants.length > 1) {
      const newParticipants = participants.slice(0, i).concat(participants.slice(i + 1));
      if (i <= activeTab) {
        setActiveTab(activeTab - Math.sign(activeTab));
      }
      onChange(newParticipants);
    }
  }

  const showDelete = participants.length > 2;

  return (
    <div>
      <Nav tabs>
        {participants.map((participant, i) => (
          <NavItem key={participant.id}>
            <NavLink className={classnames({ active: activeTab === i })}
              onClick={() => setActiveTab(i)}>
              {participant.army.trim() ? participant.army.trim() : `<Army-${i + 1}>`}
            </NavLink>
          </NavItem>
        ))}
        <Button outline color='' onClick={createParticipant}>Add</Button>
      </Nav>
      <TabContent className='p-3' activeTab={activeTab} >
        {participants.map((participant, i) => (
          <TabPane tabId={i} key={i}>
            <Fade className='d-flex flex-column' in={activeTab === i} >
              <ParticipantForm
                participant={participant}
                teams={teams}
                showDelete={showDelete}
                onChange={p => participantChange(p, i)}
                onDelete={() => deleteParticipant(i)} />
            </Fade>
          </TabPane>
        ))}
      </TabContent>
    </div>
  );
}
