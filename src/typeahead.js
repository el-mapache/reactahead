import React from 'react';
import nodeOf from './utils/node-of';
import KeyCodes from './utils/key-codes';
import Label from './label';
import SearchBar from './search-bar';
import SearchResults from './search-results';
import defaultFilter from './utils/generic-filter';

/**
 * TODO:
 *
 * ENHANCEMENTS:
 * windowed results, only load and render what is visible in the 'window' (
     based on its height and the height of all the items in the list
   )
 * add hidden field to enable form submission, although
   it doesnt really matter if js is disabled...
 * need to make all labels configurable I guess
 * add 'type to search' help text
 * get this into its own repo with css to be included
 *
 * BUGS:
 * User should not be able to select 'no results match that query' fallback
*/

const propTypes = {
  elements: React.PropTypes.array,
  // Callback when item is selected from the list
  onSelect: React.PropTypes.func,
  // Callback when the search input field is updated
  onChange: React.PropTypes.func,
  // Optional function to filter dataset based on search query. Can also be
  // combined with fromCache: false to allow a parent component to execute an
  // API call to dynamically fetch results.
  //
  // ALSO CONTROLS
  // Should the component depend on a cached list of results when displaying
  // elements to the user. Defaults to 'true'. Typically, one would set this to
  // false when using this component to display a list of results pulled
  // dynamically via API.
  filterBy: React.PropTypes.func,
  // Text to instruct the user how to interact with component
  helpText: React.PropTypes.string,
  // Whether or not the list of element is visible. If unused,
  // delegates this property to internal state
  visible: React.PropTypes.bool,
  // Set whether or not the typeahead input should be focused when the component mounts
  autofocus: React.PropTypes.bool
};

const defaultProps = {
  elements: []
};

const filterResultsFallback = 'No results match that query.';
const defaultSearchName = 'search';

class Typeahead extends React.Component {
  constructor(props) {
    super(props);

    const { elements, visible } = props;

    this.state = {
      elementCache: this.shouldUseCache() ? elements.slice(0) : null,
      focusedIndex: null,
      inputFocused: false,
      query: '',
      resultsListWidth: 0,
      showResults: !!visible,
      selected: []
    };

    this.handleKeyInput = this.handleKeyInput.bind(this);
    this.checkKeyCode = this.checkKeyCode.bind(this);
    this.setResultFocus = this.setResultFocus.bind(this);
    this.setResultsListWidth = this.setResultsListWidth.bind(this);
    this.showResults = this.showResults.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.unfocusComponent = this.unfocusComponent.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleUnselect = this.handleUnselect.bind(this);
  }

  componentWillReceiveProps(nextProps, nextState) {
    const { clickOutside } = nextProps;

    if (typeof clickOutside !== null) {
      clickOutside ? this.unfocusComponent() : this.handleInputFocus(true)
    }
  }

  checkKeyCode(event) {
    const { keyCode } = event;

    switch(keyCode) {
      case KeyCodes.ESC:
        event.preventDefault();
        this.unfocusComponent();
        break;
      case KeyCodes.UP:
        event.preventDefault();
        this.setResultFocus(-1);
        break;
      case KeyCodes.DOWN:
        event.preventDefault();
        this.setResultFocus(1);
        break;
      case KeyCodes.ENTER:
        event.preventDefault();
        if (this.state.focusedIndex !== null) {
          this.handleSelect(this.state.focusedIndex);
        }

        break;
    }
  }

  setResultsListWidth(width) {
    this.setState({
      resultsListWidth: width
    });
  }

  /**
   * set the index of the next item to be focused
   * @param {Number} direction Positive or negative integer indicating next focused item
   */
  setResultFocus(direction) {
    // How many results available to move through
    const resultsLength = this.getElementsForDisplay().length;

    // which search result, if any, in the dropdown list is currently focused
    const currentFocalIndex = this.state.focusedIndex;

    // if the sign bit is 1, direction was negative and user is paging up
    const pagingUp = direction >>> 31;

    // search result being moved to
    let nextFocalIndex;

    // Either nothing to focus or only a single element to select
    if (!resultsLength) return;

    if (resultsLength === 1) {
      this.setState({
        focusedIndex: 0
      })

      return;
    }

    if (currentFocalIndex === null) {
      nextFocalIndex = pagingUp ? resultsLength - 1 : 0;
    } else if (pagingUp) {
      nextFocalIndex = !currentFocalIndex ? resultsLength - 1 : currentFocalIndex + direction;
    } else {
      // are we on the last list item?
      nextFocalIndex = (currentFocalIndex === resultsLength - 1) ? 0 : currentFocalIndex + direction;
    }

    this.setState({
      focusedIndex: nextFocalIndex
    });
  }

  handleKeyInput(value) {
    // !!TODO!!
    // filterBy is a poorly named property that actually indicates that the user
    // is providing some function that will execute an async request to some
    // external service for filtered search results.
    // However, that filter function is still expected to pass new elements down..
    // which might not be a great idea?
    //
    // I think that i can remove fromCache, and just depends on filterBy or loadAsync or
    // whatever I call it, and just depend on that prop to control the type of
    // select.
    // Think about this!
    const { filterBy, elements } = this.props;

    if (!filterBy) {
      this.setState({
        elementCache: this.normalizeFilteredResults(value, elements, 'name'),
        query: value,
        focusedIndex: 0
      }, () => {
        if (this.state.query) {
          this.props.onChange && this.props.onChange(value);
        }
      });
    } else {
      filterBy(value);
    }
  }

  normalizeFilteredResults(value, elements, key) {
    const filtered = defaultFilter(value, elements, key);

    return (filtered.length && filtered) || [ filterResultsFallback ];
  }

  shouldUseCache() {
    const { filterBy } = this.props;
    return (typeof filterBy === 'undefined') ? true : !!filterBy;
  }

  getElementsForDisplay() {
    const { selected } = this.state;
    const rawElements = this.shouldUseCache() ?
      this.state.elementCache : this.props.elements;

    return rawElements.filter(el => selected.indexOf(el) === -1);
  }

  showResults(event) {
    if (!this.getElementsForDisplay().length) {
      return;
    }

    this.setState({
      showResults: true
    });
  }

  handleInputFocus(focused) {
    if (this.state.inputFocused && focused) {
      return;
    }

    this.setState({
      inputFocused: focused
    });
  }

  handleSelect(index) {
    const { onSelect } = this.props;
    const item = this.getElementsForDisplay()[index];
    const maybeItemIndex = this.state.selected.indexOf(item);
    let nextSelectedList;

    if (maybeItemIndex !== -1) {
      nextSelectedList = this.state.selected.filter(el => el !== item);
    } else {
      nextSelectedList = this.state.selected.slice(0).concat([item]);
    }

    this.setState({
      selected: nextSelectedList,
    }, () => {
      onSelect && onSelect(item, index);
      this.handleKeyInput('');
    });
  }

  handleUnselect(index) {
    const { onUnselect } = this.props;
    const selectedClone = this.state.selected.slice(0);

    selectedClone.splice(index, 1);

    this.setState({
      selected: selectedClone
    }, () => {
      onUnselect && onUnselect(index);
    });
  }

  unfocusComponent() {
    this.setState({
      inputFocused: false,
      showResults: false
    });
  }

  render() {
    const { autofocus } = this.props;
    const { state, handleKeyInput } = this;
    const elements = this.getElementsForDisplay();

    return (
      <div
        onFocus={ this.showResults }
        onKeyDown={ this.checkKeyCode }
      >
        <Label
          fieldName={ this.props.fieldName || defaultSearchName }
          labelText={ this.props.labelText }
        />
        <SearchBar
          doAutoFocus={ autofocus }
          isFocused={ state.inputFocused }
          name={ this.props.fieldName || defaultSearchName }
          onFocus={ this.handleInputFocus }
          onBlur={ this.handleInputFocus }
          onKeyInput={ handleKeyInput }
          onUnselect={this.handleUnselect}
          query={ this.state.query }
          reportWidth={ this.setResultsListWidth }
          selected={ state.selected }
        />
        <SearchResults
          elements={ elements }
          focusedIndex={ state.focusedIndex }
          onSelect={ this.handleSelect }
          visible={ state.showResults }
          width={ state.resultsListWidth }
        />
      </div>
    );
  }
};

Typeahead.propTypes = propTypes;
Typeahead.defaultProps = defaultProps;

// Export for ease of testing
export { filterResultsFallback, defaultSearchName }

export default Typeahead;
