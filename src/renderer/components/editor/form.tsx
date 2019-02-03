import * as React from 'react';
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
import { LocalData, PortraitList } from '../../../common/data';
import { Campaign, GameDiff, GameOptions, GameResourceRate, GameSpeed, GameStartResource, Participant, Team } from '../../../typings/campaign';
import { GameOptionsForm } from './options';
import { ParticipantTabs } from './participants/ptabs';
import { TeamTabs } from './teams/ttabs';

type CampaignFormProps = {
  className?: string;
  style?: React.CSSProperties;
};

type CampaignFormState = {
  campaign: Campaign;
  changed: boolean;
  file?: string;
};

export class CampaignForm extends React.Component<CampaignFormProps, CampaignFormState> {

  private portraits: PortraitList;

  constructor(props: any) {
    super(props);
    this.portraits = LocalData.getPortraits();
    this.state = {
      campaign: {
        name: '',
        about: '',
        involved: [{
          id: 0, portrait: this.portraits.imperium[0],
          race: '', army: '', about: '', team: 0
        }, {
          id: 1, portrait: this.portraits.imperium[0],
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
      },
      changed: false
    };
  }


  private campaignNameChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const campaign = this.state.campaign;
    campaign.name = e.target.value;
    this.setState({ ... this.state, campaign: campaign, changed: true });
  }

  private descriptionChange = (about: string) => {
    const campaign = this.state.campaign;
    campaign.about = about;
    this.setState({ ... this.state, campaign: campaign, changed: true });
  }

  private customRulesChange = (customRules: string) => {
    const campaign = this.state.campaign;
    campaign.customRules = customRules;
    this.setState({ ...this.state, campaign: campaign, changed: true });
  }

  private teamsChange = (teams: Team[]) => {
    const campaign = this.state.campaign;
    campaign.teams = teams;
    campaign.involved.forEach(participant => {
      if (teams.every(team => team.id !== participant.team)) {
        participant.team = teams[0].id;
      }
    });

    this.setState({ ... this.state, campaign: campaign, changed: true });
  }

  private participantsChange = (participants: Participant[]) => {
    const campaign = this.state.campaign;
    campaign.involved = participants;
    this.setState({ ... this.state, campaign: campaign, changed: true });
  }

  private gameOptionsChange = (options: GameOptions) => {
    const campaign = this.state.campaign;
    campaign.gameOptions = options;
    this.setState({ ... this.state, campaign: campaign, changed: true });
  }


  render() {
    return <Form className={this.props.className} style={this.props.style}>
      <FormGroup>
        <Label>Campaign Title</Label>
        <Input type='text'
          placeholder='What is this campaign called?'
          value={this.state.campaign.name}
          onChange={this.campaignNameChange} />
      </FormGroup>
      <TextAreaFormGroup
        label='Description'
        placeholder='What is the story of this campaign? Talk about as much as you like.'
        value={this.state.campaign.about}
        onChange={this.descriptionChange} />
      <CardFormGroup
        title='Participants'
        details={'Here you can configure armies that are involved in this campaign.'
          + '\nOnce configured here, you can reference them in later parts of the setup.'}>
        <ParticipantTabs
          participants={this.state.campaign.involved}
          teams={this.state.campaign.teams}
          onChange={this.participantsChange} />
      </CardFormGroup>
      <CardFormGroup
        title='Teams'
        details={'Here you can name the parties involved and provide some details for teams as a whole.'
          + '\nOnce configured here, you can reference them in later parts of the setup.'}>
        <TeamTabs
          teams={this.state.campaign.teams}
          participants={this.state.campaign.involved}
          onChange={this.teamsChange} />
      </CardFormGroup>
      <CardFormGroup
        title='Global Game Options'
        details='These options will be applied across all missions unless overriden.'>
        <GameOptionsForm
          className='p-3'
          options={this.state.campaign.gameOptions}
          onChange={this.gameOptionsChange} />
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
        value={this.state.campaign.customRules}
        onChange={this.customRulesChange}
      />
      <div className='fixed-top m-3'>
        <Link to='/' className='btn'>Back</Link>
        <Button type='submit'
          className='float-right'
          disabled={!this.state.changed && !!this.state.file}>
          {this.state.changed || !this.state.file ? 'Save Changes' : 'Saved'}
        </Button>
      </div>
    </Form>;
  }

}

function CardFormGroup(props: { title: string, details?: string, children?: any }) {
  return <FormGroup>
    <Card>
      <CardHeader tag='h4' className='text-center'>{props.title}</CardHeader>
      {props.details && <CardText className='lead text-center'>
        {props.details.split('\n').map((detail, i) => <span key={i}>{detail}<br /></span>)}
      </CardText>}
      <CardBody className='p-0'>
        {props.children}
      </CardBody>
    </Card>
  </FormGroup>;
}

function TextAreaFormGroup(props: { label: string, placeholder: string, value: string, onChange: (value: string) => void }) {
  return <FormGroup>
    <Label>{props.label}</Label>
    <TextAreaAutosize
      className='form-control'
      placeholder={props.placeholder}
      value={props.value}
      minRows={4}
      maxRows={12}
      onChange={e => props.onChange(e.target.value)} />
  </FormGroup>;
}