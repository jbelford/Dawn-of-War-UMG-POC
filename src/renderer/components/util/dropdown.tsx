import { ReactNode, useState } from 'react';
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';

const React = require('react');

type DropdownProps = {
  options: string[];
  color?: string;
  onSelect: (selected: number) => void;
  children?: ReactNode;
};

export default function Dropdown({ options, color, onSelect, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);
  return (
    <ButtonDropdown direction='down' isOpen={isOpen} toggle={toggleIsOpen}>
      <DropdownToggle color={color} caret>
        {children}
      </DropdownToggle>
      <DropdownMenu>
        {options.map((option, i) =>
          <DropdownItem key={i} onClick={() => onSelect(i)}>
            {option}
          </DropdownItem>)}
      </DropdownMenu>
    </ButtonDropdown>
  );
}