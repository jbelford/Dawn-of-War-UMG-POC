import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Alert from 'reactstrap/lib/Alert';
import Col from 'reactstrap/lib/Col';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import ListGroupItemHeading from 'reactstrap/lib/ListGroupItemHeading';
import ListGroupItemText from 'reactstrap/lib/ListGroupItemText';
import Row from 'reactstrap/lib/Row';
import { Subject } from 'rxjs';
import { Soulstorm } from '../../../../common/soulstorm';
import { GameRule } from '../../../../typings/campaign';
import FormModal from '../../util/modal';

const React = require('react');

type GameRuleItem = { title: string, description: string, mod: string, victory: boolean };

type GameRulesProps = { className?: string, rules: GameRule[], onChange: (rules: GameRule) => void };

export default function GameRules({ className, rules }: GameRulesProps) {
  const mods = Soulstorm.getModData();
  const ruleItems: GameRuleItem[] = [];

  for (const rule of rules) {
    const mod = mods.find(mod => mod.name === rule.mod);
    let description = '<You might not have the required mods to use this>';
    if (mod) {
      const winCondition = mod.winConditions.find(wc => wc.title === rule.title);
      if (winCondition) {
        description = winCondition.description;
      }
    }
    ruleItems.push({
      title: rule.title,
      description: description,
      mod: rule.mod,
      victory: rule.victoryCondition
    });
  }

  return (
    <Row className={className}>
      <Col xs={6}>
        <GameRuleListGroup title='Victory Conditions' list={ruleItems.filter(wc => wc.victory)} />
      </Col>
      <Col>
        <GameRuleListGroup title='Addons' list={ruleItems.filter(wc => !wc.victory)} />
      </Col>
    </Row>
  );
}


type GameRuleListGroupProps = { title: string, list: GameRuleItem[] };

function GameRuleListGroup({ title, list }: GameRuleListGroupProps) {
  const toggleStream = new Subject<void>();

  return (
    <div>
      <div className='d-flex flex-row justify-content-between'>
        <p className='lead'>{title}</p>
        <div className='cursor-pointer align-self-center' onClick={() => toggleStream.next()}>
          <FontAwesomeIcon icon={faPlus} />
        </div>
      </div>
      {list.length ?
        <ListGroup className='mb-2'>
          {list.map((wc, i) => (
            <WinConditionItem key={i}
              active={false}
              title={wc.title}
              description={wc.description}
              mod={wc.mod} />))}
        </ListGroup>
        : <Alert color='info' className='mb-2'>No rules selected.</Alert>}
      <FormModal title='Select Rules' onSave={() => null} toggle={toggleStream}>
      </FormModal>
    </div>
  );
}

type WinConditionItemProps = { active?: boolean, title: string, description: string, mod: string };

function WinConditionItem({ active, title, description, mod }: WinConditionItemProps) {
  return (
    <ListGroupItem active={active}>
      <ListGroupItemHeading>
        {title}
        <span className='float-right'>Mod: {mod}</span>
      </ListGroupItemHeading>
      <ListGroupItemText>
        {description}
      </ListGroupItemText>
    </ListGroupItem>
  );
}