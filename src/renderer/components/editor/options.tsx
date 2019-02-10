import * as React from 'react';
import { GameOptions } from '../../../typings/campaign';
import { SelectFormGroup } from '../util/formgroup';

type GameOptionsFormProps = {
  className?: string;
  options: GameOptions;
  onChange: (options: GameOptions) => void;
};

export default function GameOptionsForm(props: GameOptionsFormProps) {

  const onChange = (i: number, key: string) => {
    const options = props.options;
    options[key] = i;
    props.onChange(options);
  };

  return <div className={props.className}>
    <SelectFormGroup
      label='Difficulty'
      value={props.options.difficulty}
      options={['Any', 'Easy', 'Standard', 'Hard', 'Harder', 'Insane']}
      onChange={i => onChange(i, 'difficulty')} />
    <SelectFormGroup
      label='Starting Resources'
      value={props.options.startingResources}
      options={['Any', 'Standard', 'Quick']}
      onChange={i => onChange(i, 'startingResources')} />
    <SelectFormGroup
      label='Game Speed'
      value={props.options.gameSpeed}
      options={['Any', 'Very Slow', 'Slow', 'Normal', 'Fast']}
      onChange={i => onChange(i, 'gameSpeed')} />
    <SelectFormGroup
      label='Resource Rate'
      value={props.options.resourceRate}
      options={['Any', 'Low', 'Standard', 'High']}
      onChange={i => onChange(i, 'resourceRate')} />
  </div>;

}