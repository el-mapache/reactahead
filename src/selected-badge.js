import React from 'react';

const propTypes = {
  onClick: React.PropTypes.func.isRequired,
  index: React.PropTypes.number.isRequired,
  item: React.PropTypes.string.isRequired
};

class SelectedBadge extends React.Component {
  constructor(props) {
    super(props);
    this.handleDeselect = this.handleDeselect.bind(this);
  }

  handleDeselect() {
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
