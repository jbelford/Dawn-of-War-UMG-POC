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


export class Editor extends React.Component<any, { campaign: Campaign }> {

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
      }
    };
  }

  render() {
    return <div className='container'>
      <h1 className='display-3'>Campaign Editor</h1>
      <p>On this screen you can set up your own campaign.</p>

      <Form>
        <FormGroup>
          <Label>Campaign Title</Label>
          <Input type='text' placeholder='What is this campaign called...' value={this.state.campaign.name} />
        </FormGroup>
        <FormGroup>
          <Label>Description</Label>
          <Input type='textarea' placeholder='This is your opportunity to write about the story of this campaign'
            value={this.state.campaign.about} />
        </FormGroup>
        <Card>
          <CardHeader tag='h4' className='text-center'>Participants</CardHeader>
          <CardText className='lead text-center'>
            Here you can configure armies that are involved in this campaign.
            <br />Once configured here, you can reference them in later parts of the setup.
            <br />You can put whatever you want here.
          </CardText>
          <CardBody>
            <ParticipantTabs participants={this.state.campaign.involved} />
          </CardBody>
        </Card>
      </Form>
    </div>;
  }

}

