import React from 'react';
import nodeOf from './utils/node-of';
import KeyCodes from './utils/key-codes';
import Label from './label';
import SearchBar from './search-bar';
import SearchResults from './search-results';
import defaultFilter from './utils/generic-filter';

/**
 * TODO
 * users shouldn't be able to select the same thing twice
 * add a tiny triangle!
 * add a tiny 'x' to clear the selection text
 * add a badge with an x maybe, for easy delecting
 * search value probably needs to live on top level
 * add hidden field to enable form submission, although
   it doesnt really matter if js is disabled...
 * need to make all labels configurable I guess
 * add 'no results' placeholder
 * add 'type to search' help text
 * get this into its own repo with css to be included
 * windowed results, only load and render what is visible in the 'window' (
   based on its height and the height of all the items in the list
 )
 */

const propTypes = {
  elements: React.PropTypes.array,
  // Callback function to run when item is selected from the list
  onSelect: React.PropTypes.func,
  // Callback to run when the search input field is updated
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
      focusedIndex: null,
      inputFocused: false,
      selected: [],
      showResults: !!visible,
      elementCache: this.shouldUseCache() ? elements.slice(0) : null,
      resultsListWidth: 0
    };

    this.handleKeyInput = this.handleKeyInput.bind(this);
    this.checkKeyCode = this.checkKeyCode.bind(this);
    this.setResultFocus = this.setResultFocus.bind(this);
    this.setResultsListWidth = this.setResultsListWidth.bind(this);
    this.showResults = this.showResults.bind(this);
    this.hideResults = this.hideResults.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.unfocusComponent = this.unfocusComponent.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    window.addEventListener('click', (event) => {
      const findNextParent = (node) => {
        return node.parentNode;
      };

      const stop = 10;
      let count = 0;
      let next = event.target;

      while(next = findNextParent(next)) {
        // bail out early, hide the results list
        if (count === stop) {
          break;
        }

        if (next === nodeOf(this)) {
          // the node emitting the blur event is a child of the parent node
          // we don't want to hide the results list
          next = null;
          return;
        } else {
          count += 1;
        }
      }

      this.hideResults();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.elements.length) {
      this.hideResults();
    }
  }

  checkKeyCode(event) {
    const { keyCode } = event;

    switch(keyCode) {
      case KeyCodes.ESC:
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

  hideResults() {
    this.setState({
      showResults: false
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
        showResults: true
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
    return this.shouldUseCache() ? this.state.elementCache : this.props.elements;
  }

  showResults(event) {
    console.log('show', event && event.nativeEvent)
    if (!this.getElementsForDisplay().length) {
      return;
    }

    this.setState({
      showResults: true
    });
  }

  handleInputFocus(focused, event) {
    this.setState({
      inputFocused: focused
    });
  }

  handleSelect(index) {
    const { onSelect } = this.props;
    const item = this.getElementsForDisplay()[index];

    this.setState({
      selected: [item].concat(this.state.selected.slice(0))
    }, () => {
      onSelect && onSelect(item, index);
    });
  }

  unfocusComponent() {
    this.setState({
      inputFocused: false,
      showResults: false
    });
  }

  render() {
    const { elements, autofocus } = this.props;
    const { state, handleKeyInput } = this;

    return (
      <div
        onKeyDown={this.checkKeyCode}
        onFocus={this.showResults}
      >
        {this.state.selected.map((item, index) => {
          return <p key={index}>{item}</p>;
        })}
        <Label
          fieldName={this.props.fieldName || defaultSearchName}
          labelText={this.props.labelText}
        />
        <SearchBar
          name={this.props.fieldName || defaultSearchName}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputFocus}
          isFocused={state.inputFocused}
          doAutoFocus={autofocus}
          onKeyInput={handleKeyInput}
          reportWidth={this.setResultsListWidth}
        />
        <SearchResults
          elements={this.getElementsForDisplay()}
          visible={state.showResults}
          width={state.resultsListWidth}
          focusedIndex={state.focusedIndex}
          onSelect={this.handleSelect}
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
