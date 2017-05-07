import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { spy } from 'sinon';
import proxyquire from 'proxyquire';


import KeyCodes from '../../src/utils/key-codes';
import { filterResultsFallback, defaultSearchName } from '../../src/typeahead';
import {
  expectStateIsTruthy,
  expectStateIsFalsey,
  expectStateToBe,
  setState
} from '../helpers/state-helpers';

proxyquire.noCallThru();

const Label = () => <div></div>;
const SearchBar = () => <div></div>;
const SearchResults = () => <div></div>;

const Fixture = proxyquire('../../src/typeahead', {
  './label': Label,
  './search-bar': SearchBar,
  './search-results': SearchResults
}).default;

const elements = ['tom', 'dick', 'harry'];

describe('<Typeahead />', () => {
  it('exists when instantiated, event without props', () => {
    expect(shallow(<Fixture />)).to.exist;
  });

  describe('general operation', () => {
    let component;

    beforeEach(() => {
      component = shallow(<Fixture elements={ elements } />);
    });

    it('renders Label, SearchBar, and SearchResults components', () => {
      expect(component.find(Label)).to.have.length(1);
      expect(component.find(SearchBar)).to.have.length(1);
      expect(component.find(SearchResults)).to.have.length(1);
    });

    it('sets width of results list when <SearchBar/> callback fires', () => {
      component.find(SearchBar).prop('reportWidth')(100);

      expectStateToBe(component, 'resultsListWidth', 100);
    });

    it('filters elements when <SearchBar/> reports users input', () => {
      component.find(SearchBar).prop('onKeyInput')('to');

      expect(component.state('elementCache')).to.deep.equal(['tom']);
    });

    it('sets a default when query doesnt match dataset', () => {
      component.find(SearchBar).prop('onKeyInput')('zz');

      const filtered = component.state('elementCache')

      expect(filtered).to.have.length(1);
      expect(filtered).to.deep.equal([filterResultsFallback]);
    });

    it('updates its selected elements cache when an item is selected', () => {
      const instance = component.instance();
      instance.handleSelect(0);

      expect(component.state('selected')).to.have.length(1);
      expect(component.state('selected')[0]).to.equal('tom');
    });

    it('removes the element from `selected` upon a second select', () => {
      const instance = component.instance();
      instance.handleSelect(0);
      instance.handleSelect(1);
      instance.handleSelect(0);

      expect(component.state('selected')).to.have.length(1);
      expect(component.state('selected')[0]).to.equal('dick');
    });

    context('when cache is not set', () => {
      beforeEach(() => {
        component = shallow(<Fixture elements={elements} filterBy={() => {}}/>);
      });

      // this sucks, so it will be refactored into separate components
      it('passes elements from props to <SearchResults/>', () => {
        component.find(SearchBar).prop('onKeyInput')('zz');

        expect(component.find(SearchResults).prop('elements')).to.deep.equal(elements);
      });

      it('does not call setState', () => {
        const stateSpy = spy(component.instance(), 'setState');
        component.find(SearchBar).prop('onKeyInput')('zz');

        expect(stateSpy.called).to.be.false;
      });
    });

    context('when cache is set', () => {
      beforeEach(() => {
        component = shallow(<Fixture elements={elements}/>);
      });

      it('passes elements from cache to <SearchResults />', () => {
        component.find(SearchBar).prop('onKeyInput')('zz');
        expect(component.find(SearchResults).prop('elements')).to.deep.equal([filterResultsFallback]);
      });

      it('calls set state', () => {
        const stateSpy = spy(component.instance(), 'setState');
        component.find(SearchBar).prop('onKeyInput')('zz');

        expect(stateSpy.called).to.be.true;
      });
    });
  });

  describe('state', () => {
    it('initializes as with the proper default state', () => {
      const component = shallow(<Fixture elements={elements} />);
      const state = component.state();

      expect(state.focusedIndex).to.eq(null);
      expect(state.inputFocused).to.eq(false);
      expect(state.showResults).to.eq(false);
      expect(state.elementCache).to.deep.equals(elements);
      expect(state.resultsListWidth).to.eq(0);
      expect(state.selected).to.have.length(0);
    });
  });

  describe('events', () => {
    context('with elements', () => {
      let component;

      beforeEach(() => {
        component = shallow(<Fixture elements={ elements } />);
      });

      describe('onFocus', () => {
        it('sets state property `showResults` to true', () => {
          expectStateIsFalsey(component, 'showResults');
          component.simulate('focus');
          expectStateIsTruthy(component, 'showResults');
        });
      });

      describe('key bindings', () => {
        it('responds to ESC by losing focus and hiding results list', () => {
          component.setState({
            inputFocused: true,
            showResults: true
          });
          component.update();

          component.simulate('keydown', { keyCode: KeyCodes.ESC });
          expectStateIsFalsey(component, 'showResults');
          expectStateIsFalsey(component, 'inputFocused');
        });

        describe('UP and DOWN arrow keys', () => {
          let preventDefaultSpy;
          let event;

          context('when UP is pressed', () => {
            beforeEach(() => {
              preventDefaultSpy = spy();

              event = {
                keyCode: KeyCodes.UP,
                preventDefault: preventDefaultSpy
              };
            });

            it('prevents the default event behavior', () => {
              component.simulate('keydown', event);

              expect(preventDefaultSpy.calledOnce).to.be.true;
            });

            it('moves to the last element when focusedIndex is null', () => {
              component.simulate('keydown', event);

              expectStateToBe(component, 'focusedIndex', elements.length - 1);
            });

            it('moves to the last index when focused index is 0', () => {
              setState(component, { focusedIndex: 0 });
              component.simulate('keydown', event);

              expectStateToBe(component, 'focusedIndex', elements.length - 1);
            });

            it('moves to the previous element otherwise', () => {
              component.setState({ focusedIndex: 1 });
              component.update();
              component.simulate('keydown', event);
              expectStateToBe(component, 'focusedIndex', 0);
            });
          });

          context('when DOWN is pressed', () => {
            beforeEach(() => {
              preventDefaultSpy = spy();

              event = {
                keyCode: KeyCodes.DOWN,
                preventDefault: preventDefaultSpy
              };
            });

            it('prevents the default event behavior', () => {
              component.simulate('keydown', event);
              expect(preventDefaultSpy.calledOnce).to.be.true;
            });

            it('moves to the first index when focusedIndex is null', () => {
              component.simulate('keydown', event);
              expectStateToBe(component, 'focusedIndex', 0);
            });

            it('moves to the first index from the last', () => {
              setState(component, { focusedIndex: elements.length -1 });
              component.simulate('keydown', event);

              expectStateToBe(component, 'focusedIndex', 0);
            });

            it('moves to the next index from the previous', () => {
              setState(component, { focusedIndex: 0 });
              component.simulate('keydown', event);
              expectStateToBe(component, 'focusedIndex', 1);
            });
          });
        });
      });
    });

    context('with no elements', () => {
      let component;

      beforeEach(() => {
        component = shallow(<Fixture />);
      });

      describe('onFocus, onBlur', () => {
        it('leaves showResults unaltered', () => {
          expect(component.state('showResults')).to.be.false;
          component.simulate('focus');
          expect(component.state('showResults')).to.be.false;

          component.simulate('blur');
          expect(component.state('showResults')).to.be.false;
        });
      });

      describe('key bindings', () => {
        it('doesnt alter focusedIndex when the element list is empty', () => {
          component.simulate('keydown', {
            keyCode: KeyCodes.DOWN,
            preventDefault() {}
          });

          expectStateToBe(component, 'focusedIndex', null);

          component.simulate('keydown', {
            keyCode: KeyCodes.UP,
            preventDefault() {}
          });

          expectStateToBe(component, 'focusedIndex', null);
        });
      });
    });
  });

  describe('props', () => {
    context('<Label/ > child component', () => {
      it('passes `fieldName` and `labelText` props when supplied', () => {
        const props = { fieldName: 'search', labelText: 'type here!' };
        const component = shallow(<Fixture {...props} />);

        expect(component.find(Label).props()).to.deep.equals(props);
      });
    });

    context('<SearchBar /> child component', () => {
      const component = shallow(<Fixture />);
      const instance = component.instance();
      const props = {
        name: defaultSearchName,
        onFocus: instance.handleInputFocus,
        onBlur: instance.handleInputFocus,
        isFocused: instance.state.inputFocused,
        doAutoFocus: instance.props.autofocus,
        onKeyInput: instance.handleKeyInput,
        reportWidth: instance.setResultsListWidth
      };

      expect(component.find(SearchBar).props()).to.deep.equal(props);
    });

    context('<SearchResults /> child component', () => {
      const component = shallow(<Fixture />);
      const instance = component.instance();
      const props = {
        selected: instance.state.selected,
        elements: instance.props.elements,
        visible: instance.state.showResults,
        width: instance.state.resultsListWidth,
        focusedIndex: instance.state.focusedIndex,
        onSelect: instance.handleSelect
      };

      expect(component.find(SearchResults).props()).to.deep.equals(props);
    });
  });
});
