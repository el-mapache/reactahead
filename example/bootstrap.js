import React from 'react';
import ReactDOM from 'react-dom';
import Typeahead from '../src';
import pokemon from './data/pokemon';

ReactDOM.render(<Typeahead elements={pokemon} />, document.getElementById('app'));
