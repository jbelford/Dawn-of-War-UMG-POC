import * as React from 'react';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import { GameDiff, GameOptions, GameResourceRate, GameSpeed, GameStartResource } from '../../../typings/campaign';

export class GameOptionsComponent extends React.Component<{ onChange: (options: GameOptions) => void }, { options: GameOptions }> {

  constructor(props: any) {
    super(props);
    this.state = {
      options: {
        difficulty: GameDiff.STANDARD,
        startingResources: GameStartResource.STANDARD,
        gameSpeed: GameSpeed.NORMAL,
        resourceRate: GameResourceRate.STANDARD
      }
    };
  }

  onChange = (i: number, key: string) => {
    const options = this.state.options;
    options[key] = i;
    this.setState({ ...this.state, options: options });
    this.props.onChange(this.state.options);
  }

  render() {
    return <div className='p-3'>
      <IndexFormDropdown label='Difficulty' value={this.state.options.difficulty}
        options={['Easy', 'Standard', 'Hard', 'Harder', 'Insane']}
        onChange={i => this.onChange(i, 'difficulty')} />
      <IndexFormDropdown label='Starting Resources' value={this.state.options.startingResources}
        options={['Standard', 'Quick']}
        onChange={i => this.onChange(i, 'startingResources')} />
      <IndexFormDropdown label='Game Speed' value={this.state.options.gameSpeed}
        options={['Very Slow', 'Slow', 'Normal', 'Fast']}
        onChange={i => this.onChange(i, 'gameSpeed')} />
      <IndexFormDropdown label='Resource Rate' value={this.state.options.resourceRate}
        options={['Low', 'Standard', 'High']}
        onChange={i => this.onChange(i, 'resourceRate')} />
    </div>;
  }

}

type IndexFormDropdownProps = {
  label: string,
  options: string[],
  value?: number;
  onChange: (i: number) => void
};

class IndexFormDropdown extends React.Component<IndexFormDropdownProps, any> {

  constructor(props: any) {
    super(props);
    this.state = { value: this.props.value || 0 };
  }

  onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    this.props.onChange(value);
    this.setState({ value: value });
  }

  render() {
    return <FormGroup>
      <Label>{this.props.label}</Label>
      <Input type='select' name='select' onChange={this.onSelect}>
        {this.props.options.map((text, i) => <option key={i} value={i} selected={i === this.state.value}>{text}</option>)}
      </Input>
    </FormGroup>;
  }
}