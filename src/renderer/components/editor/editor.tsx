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
import { Campaign, GameOptions, Participant, Team } from '../../../typings/campaign';
import { GameOptionsComponent } from './options';
import { ParticipantTabs } from './participants/tabs';
import { TeamTabs } from './teams/tabs';
const spaceMarinePortrait = require('../../img/spacemarine.jpg');

type EditorState = {
  campaign: Campaign,
  editorHeight: number,
  changed: boolean;
  file?: string;
};

export class Editor extends React.Component<any, EditorState> {

  private headerRef: React.RefObject<HTMLDivElement>;

  constructor(props: any) {
    super(props);
    this.state = {
      campaign: {
        name: '',
        about: '',
        involved: [{
          id: 0, portrait: spaceMarinePortrait,
          race: '', army: '', about: '', team: 0
        }, {
          id: 1, portrait: spaceMarinePortrait,
          race: '', army: '', about: '', team: 1
        }],
        teams: [{ id: 0, name: '', about: '' }, { id: 1, name: '', about: '' }],
        missions: [],
        gameOptions: {},
        gameRules: [],
        customRules: '',
        loseRules: {
          ironman: false
        }
      },
      editorHeight: 0,
      changed: false
    };
    this.headerRef = React.createRef();
  }

  componentDidMount() {
    if (this.headerRef.current) {
      this.updateWindowDimensions();
      window.addEventListener('resize', this.updateWindowDimensions);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    if (this.headerRef.current) {
      const newHeight = window.innerHeight - this.headerRef.current.scrollHeight;
      this.setState({ ...this.state, editorHeight: newHeight });
    }
  }

  private campaignNameChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const campaign = this.state.campaign;
    campaign.name = e.target.value;
    this.setState({ ... this.state, campaign: campaign, changed: true });
  }

  private descriptionChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    const campaign = this.state.campaign;
    campaign.about = e.target.value;
    this.setState({ ... this.state, campaign: campaign, changed: true });
  }

  private customRulesChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    const campaign = this.state.campaign;
    campaign.customRules = e.target.value;
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
    return <div className='container'>
      <div ref={this.headerRef} className='lead text-center'>
        <h1 className='display-4'>Campaign Editor</h1>
        <p>On this screen you can setup or edit a campaign.</p>
      </div>
      <Form className='overflow-auto pl-2 pr-2' style={{ height: this.state.editorHeight, paddingBottom: '200px' }}>
        <FormGroup>
          <Label>Campaign Title</Label>
          <Input type='text'
            placeholder='What is this campaign called?'
            value={this.state.campaign.name}
            onChange={this.campaignNameChange} />
        </FormGroup>
        <FormGroup>
          <Label>Description</Label>
          <TextAreaAutosize
            minRows={4}
            maxRows={12}
            className='form-control'
            placeholder='What is the story of this campaign? Talk about as much as you like.'
            value={this.state.campaign.about}
            onChange={this.descriptionChange} />
        </FormGroup>
        <CardForm
          title='Participants'
          details={['Here you can configure armies that are involved in this campaign.',
            'Once configured here, you can reference them in later parts of the setup.']}>
          <ParticipantTabs
            participants={this.state.campaign.involved}
            teams={this.state.campaign.teams}
            onChange={this.participantsChange} />
        </CardForm>
        <CardForm
          title='Teams'
          details={['Here you can name the parties involved and provide some details for teams as a whole.',
            'Once configured here, you can reference them in later parts of the setup.']}>
          <TeamTabs
            teams={this.state.campaign.teams}
            participants={this.state.campaign.involved}
            onChange={this.teamsChange} />
        </CardForm>
        <CardForm
          title='Global Game Options'
          details='These options will be applied across all missions unless overriden.'>
          <GameOptionsComponent onChange={this.gameOptionsChange} />
        </CardForm>
        <FormGroup>
          <Label>Global Game Rules</Label>
        </FormGroup>
        <FormGroup>
          <Label>Lose Rules</Label>
        </FormGroup>
        <FormGroup>
          <Label>Custom Rules</Label>
          <TextAreaAutosize
            className='form-control'
            placeholder='What are custom rules that you would like to be played by? Write anything extra here.'
            minRows={4}
            maxRows={12}
            value={this.state.campaign.customRules}
            onChange={this.customRulesChange}
          />
        </FormGroup>
        <div className='fixed-top m-3'>
          <Link to='/' className='btn'>Back</Link>
          <Button type='submit'
            className='float-right'
            disabled={!this.state.changed && !!this.state.file}>
            {this.state.changed || !this.state.file ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </Form>
    </div>;
  }

}

function CardForm(props: { title: string, details?: string | string[], children?: any }) {
  return <FormGroup>
    <Card>
      <CardHeader tag='h4' className='text-center'>{props.title}</CardHeader>
      {props.details && <CardText className='lead text-center'>{
        typeof props.details === 'string' ? props.details : props.details.map(detail => <span>{detail}<br /></span>)
      }</CardText>}
      <CardBody className='p-0'>
        {props.children}
      </CardBody>
    </Card>
  </FormGroup>;
}

