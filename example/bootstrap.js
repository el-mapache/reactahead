import React from 'react';
import ReactDOM from 'react-dom';
import Typeahead from '../src';
import pokemon from './data/pokemon';
import defaultFilter from '../src/utils/generic-filter';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filteredElements: this.props.elements
    };

    this.fetchData = this.fetchData.bind(this);
  }

  fetchData(value, callback) {
    const { elements } = this.props;

    setTimeout(() => {
      const filtered = defaultFilter(value, elements, 'name');

      this.setState({
        filteredElements: (filtered.length && filtered) || [ 'No results' ]
      }, callback);
    }, 150);
  }

  render() {
    return (
      <Typeahead
        requestAsync={this.fetchData}
        elements={this.state.filteredElements}
      />
    )
  }
}

ReactDOM.render(<App elements={pokemon} />, document.getElementById('app'));
