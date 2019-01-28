import * as React from 'react';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import { GameOptions } from '../../../typings/campaign';

type GameOptionsFormProps = {
  className?: string;
  options: GameOptions;
  onChange: (options: GameOptions) => void;
};

export function GameOptionsForm(props: GameOptionsFormProps) {

  const onChange = (i: number, key: string) => {
    const options = props.options;
    options[key] = i;
    props.onChange(options);
  };

  return <div className={props.className}>
    <SelectFormGroup
      label='Difficulty'
      value={props.options.difficulty}
      options={['Easy', 'Standard', 'Hard', 'Harder', 'Insane']}
      onChange={i => onChange(i, 'difficulty')} />
    <SelectFormGroup
      label='Starting Resources'
      value={props.options.startingResources}
      options={['Standard', 'Quick']}
      onChange={i => onChange(i, 'startingResources')} />
    <SelectFormGroup
      label='Game Speed'
      value={props.options.gameSpeed}
      options={['Very Slow', 'Slow', 'Normal', 'Fast']}
      onChange={i => onChange(i, 'gameSpeed')} />
    <SelectFormGroup
      label='Resource Rate'
      value={props.options.resourceRate}
      options={['Low', 'Standard', 'High']}
      onChange={i => onChange(i, 'resourceRate')} />
  </div>;

}

type SelectFormGroupProps = {
  label: string,
  options: string[],
  value?: number;
  onChange: (i: number) => void
};

function SelectFormGroup(props: SelectFormGroupProps) {
  const value = props.value || 0;
  const options = ['Any'].concat(props.options);
  return <FormGroup>
    <Label>{props.label}</Label>
    <Input type='select' name='select' onChange={e => props.onChange(+e.target.value)} value={value}>
      {options.map((text, i) =>
        <option key={i} value={i}>
          {text}
        </option>)}
    </Input>
  </FormGroup>;
}