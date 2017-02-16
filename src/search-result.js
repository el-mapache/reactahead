import React from 'react';
import nodeOf from './utils/node-of';

const propTypes = {
  focused: React.PropTypes.bool,
  index: React.PropTypes.number,
  content: React.PropTypes.string,
  subcontent: React.PropTypes.string,
  shouldScrollToView: React.PropTypes.func.isRequired,
  onSelect: React.PropTypes.func.isRequired
};

class SearchResult extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    this.checkShouldScroll(this.props.focused);
  }

  componentWillReceiveProps(nextProps) {
    this.checkShouldScroll(nextProps.focused);
  }

  shouldComponentUpdate(nextProps) {
    const props = this.props;

    // Will need to genericize these for sure.
    // Should allow user to pass in a comparison function
    // Perhaps should allow user to define a schema?????
    if (nextProps.focused !== props.focused ||
      (nextProps.subcontent !== props.subcontent || nextProps.content !== props.content)) {
        return true;
    }

    return false;
  }

  checkShouldScroll(nodeIsFocused) {
    if (nodeIsFocused) {
      this.props.shouldScrollToView(nodeOf(this), this.props.index);
    }
  }

  handleClick(event) {
    event.preventDefault();
    this.props.onSelect(this.props.index);
  }

  getClassNames() {
    let base = 'react-typeahead-result';

    if (this.props.focused) {
      base += ' focused';
    }

    return base;
  }

  getResultSubtext() {
    const { subcontent } = this.props;
    return (subcontent ?
      <p className="react-typeahead-text truncate">
        {subcontent}
      </p> : null);
  }

  getResultText() {
    const { content } = this.props;

    return (content ?
      <strong>
        {content}
      </strong> : null);
  }

  render() {
    return (
      <li className={this.getClassNames()} onClick={this.handleClick} id={this.props.index}>
        <div className="react-typeahead-info">
          { this.getResultText() }
          { this.getResultSubtext() }
        </div>
      </li>
    );
  }
}

SearchResult.propTypes = propTypes;

export default SearchResult;
