import { CSSProperties, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TextAreaAutosize from 'react-textarea-autosize';
import Button from 'reactstrap/lib/Button';
import Card from 'reactstrap/lib/Card';
import CardBody from 'reactstrap/lib/CardBody';
import CardHeader from 'reactstrap/lib/CardHeader';
import CardText from 'reactstrap/lib/CardText';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import { LocalData } from '../../../common/data';
import { Campaign, GameDiff, GameResourceRate, GameSpeed, GameStartResource } from '../../../typings/campaign';
import GameOptionsForm from './options';
import ParticipantTabs from './participants/ptabs';
import TeamTabs from './teams/ttabs';
const React = require('react');

function getInitialCampaign(): Campaign {
  const portraits = LocalData.getPortraits();
  return {
    name: '',
    about: '',
    involved: [{
      id: 0, portrait: portraits.imperium[0],
      race: '', army: '', about: '', team: 0
    }, {
      id: 1, portrait: portraits.imperium[0],
      race: '', army: '', about: '', team: 1
    }],
    teams: [{ id: 0, name: '', about: '' }, { id: 1, name: '', about: '' }],
    missions: [],
    gameOptions: {
      difficulty: GameDiff.ANY,
      startingResources: GameStartResource.ANY,
      gameSpeed: GameSpeed.ANY,
      resourceRate: GameResourceRate.ANY
    },
    gameRules: [],
    customRules: '',
    loseRules: {
      ironman: false
    }
  };
}

type CampaignFormProps = { className?: string, style?: CSSProperties };

export default function CampaignForm({ className, style }: CampaignFormProps) {
  const [campaign, setCampaign] = useState(getInitialCampaign());
  const [changed, setChanged] = useState(false);

  useEffect(() => setChanged(true), [campaign]);

  return (
    <Form className={className} style={style}>
      <FormGroup>
        <Label>Campaign Title</Label>
        <Input type='text'
          placeholder='What is this campaign called?'
          value={campaign.name}
          onChange={e => setCampaign({ ...campaign, name: e.target.value })} />
      </FormGroup>
      <TextAreaFormGroup
        label='Description'
        placeholder='What is the story of this campaign? Talk about as much as you like.'
        value={campaign.about}
        onChange={about => setCampaign({ ...campaign, about })} />
      <CardFormGroup
        title='Participants'
        details={'Here you can configure armies that are involved in this campaign.'
          + '\nOnce configured here, you can reference them in later parts of the setup.'}>
        <ParticipantTabs
          participants={campaign.involved}
          teams={campaign.teams}
          onChange={involved => setCampaign({ ...campaign, involved })} />
      </CardFormGroup>
      <CardFormGroup
        title='Teams'
        details={'Here you can name the parties involved and provide some details for teams as a whole.'
          + '\nOnce configured here, you can reference them in later parts of the setup.'}>
        <TeamTabs
          teams={campaign.teams}
          participants={campaign.involved}
          onChange={teams => setCampaign({ ...campaign, teams })} />
      </CardFormGroup>
      <CardFormGroup
        title='Global Game Options'
        details='These options will be applied across all missions unless overriden.'>
        <GameOptionsForm
          className='p-3'
          options={campaign.gameOptions}
          onChange={gameOptions => setCampaign({ ...campaign, gameOptions })} />
      </CardFormGroup>
      <FormGroup>
        <Label>Global Game Rules</Label>
      </FormGroup>
      <FormGroup>
        <Label>Lose Rules</Label>
      </FormGroup>
      <TextAreaFormGroup
        label='Custom Rules'
        placeholder='What are custom rules that you would like to be played by? Write anything extra here.'
        value={campaign.customRules}
        onChange={customRules => setCampaign({ ...campaign, customRules })}
      />
      <div className='fixed-top m-3'>
        <Link to='/' className='btn'>Back</Link>
        <Button type='submit'
          className='float-right'
          disabled={!changed}>
          {changed ? 'Save Changes' : 'Saved'}
        </Button>
      </div>
    </Form>
  );
}

type CardFormGroup = { title: string, details?: string, children?: any };

function CardFormGroup({ title, details, children }: CardFormGroup) {
  return <FormGroup>
    <Card>
      <CardHeader tag='h4' className='text-center'>{title}</CardHeader>
      {details && <CardText className='lead text-center'>
        {details.split('\n').map((detail, i) => <span key={i}>{detail}<br /></span>)}
      </CardText>}
      <CardBody className='p-0'>
        {children}
      </CardBody>
    </Card>
  </FormGroup>;
}

type TextAreaFormGroupProps = { label: string, placeholder: string, value: string, onChange: (value: string) => void };

function TextAreaFormGroup({ label, placeholder, value, onChange }: TextAreaFormGroupProps) {
  return <FormGroup>
    <Label>{label}</Label>
    <TextAreaAutosize
      className='form-control'
      placeholder={placeholder}
      value={value}
      minRows={4}
      maxRows={12}
      onChange={e => onChange(e.target.value)} />
  </FormGroup>;
}