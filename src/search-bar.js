import React from 'react';
import nodeOf from './utils/node-of';
import scryWidthOfElement from './utils/scry-width-of-element';

const propTypes = {
  name: React.PropTypes.string.isRequired,
  onFocus: React.PropTypes.func.isRequired,
  onBlur: React.PropTypes.func,
  isFocused: React.PropTypes.bool,
  // Set whether or not the typeahead input should be focused when the component mounts
  doAutoFocus: React.PropTypes.bool,
  // Callback that filters current dataset; called each time search input is
  // updated
  onKeyInput: React.PropTypes.func.isRequired,
  // Internal prop, set by parent component. This component needs to
  // supply its width to the top level typeahead component, so it can
  // pass that width down to the search results component
  reportWidth: React.PropTypes.func.isRequired
};

class SearchBar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      query: ''
    };

    this.handleKeyInput = this.handleKeyInput.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  componentDidMount() {
    this.onWindowResize();

    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.query !== nextState.query ||
      nextProps.isFocused !== this.props.isFocused) {
      return true;
    }

    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    // Blur has to get manually called based on new props from the parent
    // component, since there is no way to tell when this field should be
    // unfocused when the esc key is pressed
    if (prevProps.isFocused && !this.props.isFocused) {
      console.log('blur')
      nodeOf(this).blur();
    }
  }

  onWindowResize() {
    this.props.reportWidth(scryWidthOfElement(nodeOf(this)));
  }

  handleKeyInput(e) {
    const { onKeyInput } = this.props;

    this.setState({
      query: e.target.value
    }, () => {
      onKeyInput(this.state.query);
    });
  }

  onFocusChange(event) {
    let type;

    if (event.type === 'focus') {
      this.props.onFocus(true);
    } else if (event.type === 'blur') {
      this.props.onFocus(false);
    }
  }

  render() {
    const { doAutoFocus, name } = this.props;
    const { state } = this;

    return (
      <input
        type="text"
        name={name}
        onChange={this.handleKeyInput}
        value={state.query}
        className="react-typeahead-input"
        autoFocus={doAutoFocus}
        autoComplete="off"
        onFocus={this.onFocusChange}
        onBlur={this.onFocusChange}
      />
    );
  }
};

SearchBar.propTypes = propTypes;

export default SearchBar;
