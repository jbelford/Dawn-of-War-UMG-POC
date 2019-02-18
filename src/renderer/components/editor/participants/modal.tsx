import { useState } from 'react';
import { Observable } from 'rxjs';
import { LocalData } from '../../../../common/data';
import FormModal from '../../util/modal';
import PortraitSelect from './select';

const React = require('react');

const portraits = LocalData.getPortraits();

type PortraitModalProps = { portrait: string, onChange: (portrait: string) => void, toggle: Observable<void> };

export default function PortraitModal({ portrait, onChange, toggle }: PortraitModalProps) {
  const [selected, setSelected] = useState(getPortraitSelected(portrait));

  return (
    <FormModal
      title='Choose a Portrait'
      onSave={() => onChange(portraits[selected.key][selected.idx])}
      toggle={toggle}>
      <PortraitSelect
        selected={selected}
        onChange={(key, idx) => setSelected({ key: key, idx: idx })} />
    </FormModal>
  );
}


function getPortraitSelected(portrait: string): { key: string, idx: number } {
  return Object.keys(portraits).map(key => ({
    key: key,
    idx: portraits[key].findIndex((p: string) => p === portrait)
  })).find(portraits => portraits.idx >= 0) as any;
}