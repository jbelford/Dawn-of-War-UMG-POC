import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import Card from 'reactstrap/lib/Card';
import CardBody from 'reactstrap/lib/CardBody';
import CardHeader from 'reactstrap/lib/CardHeader';
import CardText from 'reactstrap/lib/CardText';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import { Campaign, Participant, Team } from '../../../typings/campaign';
import { ParticipantTabs } from './participants';
import { TeamTabs } from './teams';
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

  private campaignNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const campaign = this.state.campaign;
    campaign.name = e.target.value;
    this.setState({ ... this.state, campaign: campaign, changed: true });
  }

  private descriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const campaign = this.state.campaign;
    campaign.about = e.target.value;
    this.setState({ ... this.state, campaign: campaign, changed: true });
  }

  private teamsChange = (teams: Team[]) => {
    const campaign = this.state.campaign;
    campaign.teams = teams;
    campaign.involved = this.state.campaign.involved
      .map(participant => teams.every(team => team.id !== participant.team)
        ? { ...participant, team: teams[0].id } : participant);

    this.setState({ ... this.state, campaign: campaign, changed: true });
  }

  private participantsChange = (participants: Participant[]) => {
    const campaign = this.state.campaign;
    campaign.involved = participants;
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
          <Input type='textarea'
            placeholder='What is the story of this campaign? Talk about as much as you like.'
            value={this.state.campaign.about}
            onChange={this.descriptionChange} />
        </FormGroup>
        <FormGroup>
          <Card>
            <CardHeader tag='h4' className='text-center'>Participants</CardHeader>
            <CardText className='lead text-center'>
              Here you can configure armies that are involved in this campaign.
              <br />Once configured here, you can reference them in later parts of the setup.
            </CardText>
            <CardBody className='p-0'>
              <ParticipantTabs participants={this.state.campaign.involved}
                teams={this.state.campaign.teams}
                onChange={this.participantsChange} />
            </CardBody>
          </Card>
        </FormGroup>
        <FormGroup>
          <Card>
            <CardHeader tag='h4' className='text-center'>Teams</CardHeader>
            <CardText className='lead text-center'>
              Here you can name the parties involved and provide some details for teams as a whole.
              <br />Once configured here, you can reference them in later parts of the setup.
            </CardText>
            <CardBody className='p-0'>
              <TeamTabs teams={this.state.campaign.teams}
                participants={this.state.campaign.involved}
                onChange={this.teamsChange} />
            </CardBody>
          </Card>
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

