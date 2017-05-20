import React from 'react';
import nodeOf from './utils/node-of';

const propTypes = {
  autoFocus: React.PropTypes.bool
};

class SearchInput extends React.Component {
  constructor(props) {
    super(props);

    this.onFocusChange = this.onFocusChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // .blur() must be manually called based on new props from the parent
    // component, as there is no way to tell when this field should be
    // unfocused when the esc key is pressed
    if (prevProps.isFocused && !this.props.isFocused) {
      nodeOf(this).blur();
    } else if (this.props.isFocused){
      nodeOf(this).focus();
    }
  }

  onFocusChange(event) {
    let type;

    if (event.type === 'focus') {
      this.props.onFocus(true, event);
    } else if (event.type === 'blur') {
      this.props.onFocus(false, event);
    }
  }

  render() {
    return (
      <input
        autoComplete="off"
        autoFocus={ this.props.doAutoFocus }
        className="reactahead-inline-input"
        name={ this.props.name }
        onBlur={ this.onFocusChange }
        onChange={ this.props.onChange }
        onFocus={ this.onFocusChange }
        type="text"
        value={ this.props.value }
      />
    );
  }
}

export default SearchInput;
