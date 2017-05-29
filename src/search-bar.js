import React from 'react';
import nodeOf from './utils/node-of';
import scryWidthOfElement from './utils/scry-width-of-element';
import SelectedBadge from './selected-badge';
import SearchInput from './search-input';

const propTypes = {
  // Set whether or not the typeahead input should be focused when the component mounts
  doAutoFocus: React.PropTypes.bool,
  isFocused: React.PropTypes.bool,
  name: React.PropTypes.string.isRequired,
  onBlur: React.PropTypes.func,
  onFocus: React.PropTypes.func.isRequired,
  // Callback that filters current dataset; called each time search input is
  // updated
  onKeyInput: React.PropTypes.func.isRequired,
  // Callback to flag a selected item to be deselected by the parent typeahead
  // component
  onUnselect: React.PropTypes.func.isRequired,
  query: React.PropTypes.string.isRequired,
  // This component needs to supply its width to the top level typeahead
  // component. The width is needed by the SearchResults component to
  // render correctly.
  reportWidth: React.PropTypes.func.isRequired,
  selected: React.PropTypes.array.isRequired
};

class SearchBar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      width: null
    };

    this.handleKeyInput = this.handleKeyInput.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  componentDidMount() {
    this.onWindowResize();

    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.query !== nextProps.query ||
      nextProps.isFocused !== this.props.isFocused ||
      nextProps.selected.length !== this.props.selected.length) {
      return true;
    }

    return false;
  }

  onWindowResize() {
    const width = scryWidthOfElement(nodeOf(this));
    this.props.reportWidth(width);

    this.setState({
      width: width
    });
  }

  handleKeyInput(event) {
    this.props.onKeyInput(event.target.value);
  }

  mapSelectedItems() {
    const { selected, onUnselect } = this.props;

    return selected.map((item, index) =>
      <SelectedBadge
        index={index}
        item={item}
        key={index}
        onClick={this.props.onUnselect}
      />
    );
  }

  setWidth() {
    return {
      width: this.state.width
    }
  }

  render() {
    const { doAutoFocus, name, selected } = this.props;
    const { state } = this;

    return (
      <div className="clearfix react-typeahead-input" style={ this.setWidth() }>
        { this.mapSelectedItems() }
        <SearchInput
          autoFocus={ doAutoFocus }
          isFocused={ this.props.isFocused }
          name={ name }
          onFocus={ this.props.onFocus }
          onChange={ this.handleKeyInput }
          value={ this.props.query }
        />
      </div>
    );
  }
};

SearchBar.propTypes = propTypes;

export default SearchBar;
