import * as React from 'react';
import Card from 'reactstrap/lib/Card';
import CardBody from 'reactstrap/lib/CardBody';
import CardHeader from 'reactstrap/lib/CardHeader';
import CardText from 'reactstrap/lib/CardText';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import { Campaign } from '../../../typings/campaign';
import { ParticipantTabs } from './participants';

export class Editor extends React.Component<any, { campaign: Campaign, editorHeight: number }> {

  private headerRef: React.RefObject<HTMLDivElement>;

  constructor(props: any) {
    super(props);
    this.state = {
      campaign: {
        name: '',
        about: '',
        involved: [],
        teams: [],
        missions: [],
        gameOptions: [],
        gameRules: [],
        customRules: '',
        loseRules: {
          ironman: false
        }
      },
      editorHeight: 0
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

  render() {
    return <div className='container'>
      <div ref={this.headerRef} className='lead pl-2'>
        <h1 className='display-3'>Campaign Editor</h1>
        <p>On this screen you can set up your own campaign.</p>
      </div>
      <Form className='overflow-auto p-2' style={{ height: this.state.editorHeight }}>
        <FormGroup>
          <Label>Campaign Title</Label>
          <Input type='text' placeholder='What is this campaign called?' value={this.state.campaign.name} />
        </FormGroup>
        <FormGroup>
          <Label>Description</Label>
          <Input type='textarea' placeholder='What is the story of this campaign? Talk about as much as you like.'
            value={this.state.campaign.about} />
        </FormGroup>
        <Card>
          <CardHeader tag='h4' className='text-center'>Participants</CardHeader>
          <CardText className='lead text-center'>
            Here you can configure armies that are involved in this campaign.
              <br />Once configured here, you can reference them in later parts of the setup.
              <br />You can put whatever you want here.
            </CardText>
          <CardBody className='p-0'>
            <ParticipantTabs participants={this.state.campaign.involved} />
          </CardBody>
        </Card>
      </Form>
    </div>;
  }

}

