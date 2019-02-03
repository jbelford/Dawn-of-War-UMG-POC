import * as React from 'react';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';


type SelectFormGroupProps = {
  label?: string,
  options: string[],
  value?: number;
  onChange: (i: number) => void
};

export function SelectFormGroup(props: SelectFormGroupProps) {
  const value = props.value || 0;
  const options = props.options;
  return <FormGroup>
    {props.label && <Label>{props.label}</Label>}
    <Input type='select' name='select' onChange={e => props.onChange(+e.target.value)} value={value}>
      {options.map((text, i) =>
        <option key={i} value={i}>
          {text}
        </option>)}
    </Input>
  </FormGroup>;
}