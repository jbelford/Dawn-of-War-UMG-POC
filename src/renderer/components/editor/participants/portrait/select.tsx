import { useState } from 'react';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { LocalData } from '../../../../../common/data';
import { SelectFormGroup } from '../../../util/formgroup';
const React = require('react');

const portraits = LocalData.getPortraits();
const categories = ['Imperium', 'Chaos', 'Xenos'];
const categoryKeyMap = {
  'Imperium': 'imperium',
  'Chaos': 'chaos',
  'Xenos': 'xenos'
};

type Props = { selected: { key: string, idx: number }, onChange: (key: string, idx: number) => void };

export default function PortraitSelect({ selected, onChange }: Props) {
  const [categoryIdx, setCategoryIdx] = useState(Object.keys(categoryKeyMap)
    .findIndex(key => categoryKeyMap[key] === selected.key));

  const category = categories[categoryIdx];
  const key = categoryKeyMap[category];
  const categoryPortraits: string[] = portraits[key];
  const portrait = portraits[selected.key][selected.idx];

  return (
    <Row>
      <Col className='overflow-auto pt-2'>
        <SelectFormGroup
          options={categories}
          onChange={setCategoryIdx}
          value={categoryIdx}
        />
        {categoryPortraits.map((portrait, i) => (
          <img key={i}
            className='img-thumbnail w-25 cursor-pointer'
            src={portrait}
            onClick={() => onChange(key, i)} />
        ))}
      </Col>
      <Col xs={4}>
        <p className='lead'>Selected</p>
        <img
          src={portrait}
          className='img-thumbnail'
          alt='Portrait Image' />
      </Col>
    </Row>
  );
}

