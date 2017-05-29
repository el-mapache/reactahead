import React from 'react';
import nodeOf from './utils/node-of';
import SearchResult from './search-result';

const noop = function() {};

const propTypes = {
  elements: React.PropTypes.array.isRequired,
  focusedIndex: React.PropTypes.number,
  onSelect: React.PropTypes.func,
  visible: React.PropTypes.bool,
  width: React.PropTypes.number
};

const defaultProps = {
  onSelect: noop
};

class SearchResults extends React.Component {
  constructor(props) {
    super(props);

    this.shouldScrollToView = this.shouldScrollToView.bind(this);
  }

  getStyle() {
    const { width, visible } = this.props;

    return {
      display: visible ? 'block' : 'none',
      width: `${width}px`
    };
  }

  shouldScrollToView(targetNode, index) {
    if (!targetNode) return;

    // The dom node the <SearchResults /> component backs
    const thisNode = nodeOf(this);

    // THe height of thisNode divided in half
    const halfHeight = thisNode.getBoundingClientRect().height >> 1;

    // The height of the DOM node being scrolled to
    const nodeHeight = targetNode.getBoundingClientRect().height;

    // The offset of the result <li> node
    const offset = nodeHeight * index;

    // the next offset will be greater than the height of all result nodes combined,
    // i.e. user is scrolling from the last item in the list to the first.

    // Offset exceeds height of the container, user is moving from last element to the first
    if (offset >= thisNode.scrollHeight) {
      thisNode.scrollTop = 0;
    } else if (offset > halfHeight) {
      thisNode.scrollTop = offset - halfHeight;
    } else if (offset < (thisNode.scrollTop  + halfHeight) && thisNode.scrollTop > 0) {
      thisNode.scrollTop = offset - nodeHeight - thisNode.scrollHeight;
    }
  }

  mapResults(list, focusedIndex) {
    const { selected } = this.props;

    return list.reduce((memo, el, index) => {
      const focused = index === focusedIndex;

      let content;
      let subcontent;

      if (typeof el === 'string') {
        content = el
      } else {
        content = el.name;
        subcontent = el.text;
      }

      memo.push(
        <SearchResult
          key={index}
          index={index}
          content={content}
          focused={focused}
          subcontent={subcontent}
          shouldScrollToView={this.shouldScrollToView}
          onSelect={this.props.onSelect}
        />
      );

      return memo;
    }, []);
  }

  loading() {
    return <li>LOADING!!!!</li>;
  }

  render() {
    const { elements, focusedIndex } = this.props;

    return (
      <ul className="react-typeahead-results" style={this.getStyle()}>
        { this.props.loading ? this.loading() : this.mapResults(elements, focusedIndex) }
      </ul>
    )
  }
}

SearchResults.propTypes = propTypes;
SearchResults.defaultProps = defaultProps;

export default SearchResults;
