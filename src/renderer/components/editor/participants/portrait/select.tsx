import * as React from 'react';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { LocalData } from '../../../../../common/data';
import { SelectFormGroup } from '../../../util/formgroup';

type Props = {
  portrait: { key: string, idx: number };
  onChange: (key: string, idx: number) => void;
};

type State = {
  selectedCategory: number;
};

export class PortraitSelect extends React.Component<Props, State> {

  private portraits = LocalData.getPortraits();
  private categories = ['Imperium', 'Chaos', 'Xenos'];

  private categoryKeyMap = {
    'Imperium': 'imperium',
    'Chaos': 'chaos',
    'Xenos': 'xenos'
  };

  constructor(props: any) {
    super(props);
    this.state = { selectedCategory: 0 };
  }

  onCategoryChange = (i: number) => {
    this.setState({ ...this.state, selectedCategory: i });
  }

  render() {
    const category = this.categories[this.state.selectedCategory];
    const key = this.categoryKeyMap[category];
    const categoryPortraits: string[] = this.portraits[key];
    const portrait = this.portraits[this.props.portrait.key][this.props.portrait.idx];

    return <Row>
      <Col className='overflow-auto pt-2'>
        <SelectFormGroup
          options={this.categories}
          onChange={this.onCategoryChange}
          value={this.state.selectedCategory}
        />
        {categoryPortraits.map((portrait, i) => (
          <img key={i}
            className='img-thumbnail w-25 cursor-pointer'
            src={portrait}
            onClick={() => this.props.onChange(key, i)} />
        ))}
      </Col>
      <Col xs={4}>
        <p className='lead'>Selected</p>
        <img
          src={portrait}
          className='img-thumbnail'
          alt='Portrait Image' />
      </Col>
    </Row>;
  }

}

