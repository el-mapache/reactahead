import React from 'react';

const propTypes = {
  onClick: React.PropTypes.func.isRequired,
  index: React.PropTypes.number,
  item: React.PropTypes.string
};

class SelectedBadge extends React.Component {
  constructor(props) {
    super(props);
    this.handleDeselect = this.handleDeselect.bind(this);
  }

  handleDeselect(event) {
    const { index, onClick } = this.props;

    onClick(index);
  }

  render() {
    const { item } = this.props;

    return (
      <button className='reactahead-badge' onClick={this.handleDeselect}>
        { item }
        <span>x</span>
      </button>
    )
  }
}

SelectedBadge.propTypes = propTypes;

export default SelectedBadge;
