import React from 'react';
import nodeOf from './utils/node-of';

const propTypes = {
  doAutoFocus: React.PropTypes.bool,
  name: React.PropTypes.string,
  onBlur: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onFocus: React.PropTypes.func,
  value: React.PropTypes.string
};

class SearchInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = { focused: false }

    this.onFocusChange = this.onFocusChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // .blur() must be manually called based on new props from the parent
    // component, as there is no way to tell when this field should be
    // unfocused when the esc key is pressed
    if (prevProps.isFocused && !this.props.isFocused) {
      nodeOf(this).blur();
    } else if (this.props.isFocused) {
      nodeOf(this).focus();
    }
  }

  onFocusChange() {
    if (!this.props.isFocused) {
      this.props.onFocus();
    }
  }

  render() {
    return (
      <input
        autoComplete="off"
        autoFocus={ this.props.doAutoFocus }
        className="reactahead-inline-input"
        name={ this.props.name }
        onChange={ this.props.onChange }
        onFocus={ this.onFocusChange }
        type="text"
        value={ this.props.value }
      />
    );
  }
}

export default SearchInput;
