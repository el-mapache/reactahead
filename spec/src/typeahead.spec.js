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
import stubKeyPressEvent from '../helpers/stubs';

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
  it('exists as a component', () => {
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

    // TODO: should I be reaching into the component to call this?
    it('sets width of results list when <SearchBar/> callback fires', () => {
      component.find(SearchBar).prop('reportWidth')(100);

      expectStateToBe(component, 'resultsListWidth', 100);
    });

    context('filtering search results', () => {
      it('stores the search query in its own state', () => {
        const query = 'hello';
        component.find(SearchBar).prop('onKeyInput')(query);

        expectStateToBe(component, 'query', query);
      });

      it('filters elements when <SearchBar/> reports input', () => {
        component.find(SearchBar).prop('onKeyInput')('to');

        expect(component.state('elementCache')).to.deep.equal(['tom']);
      });

      it('sets a default when query doesnt match dataset', () => {
        component.find(SearchBar).prop('onKeyInput')('zz');

        const filtered = component.state('elementCache')

        expect(filtered).to.have.length(1);
        expect(filtered).to.deep.equal([filterResultsFallback]);
      });
    });

    context('selecting elements', () => {
      let instance;

      beforeEach(() => {
        instance = component.instance();
      });

      context('on select', () => {
        it('updates its selected elements cache', () => {
          instance.handleSelect(0);

          expect(component.state('selected')).to.have.length(1);
          expect(component.state('selected')[0]).to.equal('tom');
        });

        it('removes element from the displayed results', () => {
          instance.handleSelect(0);
          component.update();

          const nextResults = component.find(SearchResults).prop('elements');

          expect(nextResults).to.have.length(2);
          expect(nextResults).to.deep.equal(['dick', 'harry']);
        });

        it('clears the current search query', () => {
          component.setState({query: 'tom'});
          instance.handleSelect(2);
          component.update();

          expectStateToBe(component, 'query', '');
        });

        it('sets focusedIndex back to zero', () => {
          component.setState({ focusedIndex: 1 });

          expectStateToBe(component, 'focusedIndex', 1);

          instance.handleSelect(2);
          component.update();

          expectStateToBe(component, 'focusedIndex', 0);
        });
      });

      context('on unselect', () => {
        it('removes element from elements cache', () => {
          instance.handleSelect(0);
          instance.handleSelect(0);
          instance.handleUnselect(0);

          expect(component.state('selected')).to.have.length(1);
          expect(component.state('selected')[0]).to.equal('dick');
        });
      });
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

      it('calls setState', () => {
        const stateSpy = spy(component.instance(), 'setState');
        component.find(SearchBar).prop('onKeyInput')('zz');

        expect(stateSpy.called).to.be.true;
      });
    });
  });

  describe('prop callback hooks', () => {
    const onSelectCallbackSpy = spy();
    const onChangeCallbackSpy = spy();
    const fixture =
      <Fixture elements={elements}
        onSelect={onSelectCallbackSpy}
        onChange={onChangeCallbackSpy} />;
    const component = shallow(fixture);
    const instance = component.instance();

    it('passes selected item and index to onSelect', () => {
      instance.handleSelect(0);

      expect(onSelectCallbackSpy.calledOnce).to.be.true;
      expect(onSelectCallbackSpy.getCall(0).args).to.deep.equal(['tom', 0])
    });

    it('passes the updated search query to onChange', () => {
      const query = 'El Topo';
      instance.handleKeyInput(query);

      expect(onChangeCallbackSpy.calledOnce).to.be.true;
      expect(onChangeCallbackSpy.getCall(0).args).to.deep.equal([query]);
    });
  });

  describe('state', () => {
    it('initializes as with the proper default state', () => {
      const component = shallow(<Fixture elements={elements} />);
      const state = component.state();

      expect(state.elementCache).to.deep.equals(elements);
      expect(state.focusedIndex).to.eq(null);
      expect(state.inputFocused).to.eq(false);
      expect(state.query).to.equal('');
      expect(state.resultsListWidth).to.eq(0);
      expect(state.showResults).to.eq(false);
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
          const escKeyPressEvent = stubKeyPressEvent(KeyCodes.ESC);

          component.setState({
            inputFocused: true,
            showResults: true
          });
          component.update();

          component.simulate('keydown', escKeyPressEvent);

          expect(escKeyPressEvent.preventDefault.calledOnce).to.be.true;
          expectStateIsFalsey(component, 'showResults');
          expectStateIsFalsey(component, 'inputFocused');
        });

        it('responds to ENTER by selected the focused element', () => {
          const downKeyPressEvent = stubKeyPressEvent(KeyCodes.DOWN);
          const enterKeyPressEvent = stubKeyPressEvent(KeyCodes.ENTER);

          component.setState({
            inputFocused: true,
            showResults: true
          });
          component.update();

          component.simulate('keydown', downKeyPressEvent);
          component.simulate('keydown', enterKeyPressEvent);

          expect(enterKeyPressEvent.preventDefault.calledOnce).to.be.true;
          expect(component.state('selected')[0]).to.eq('tom');
        });

        describe('UP and DOWN arrow keys', () => {
          let upKeyPressEvent;
          let downKeyPressEvent;

          context('when UP is pressed', () => {
            beforeEach(() => {
              upKeyPressEvent = stubKeyPressEvent(KeyCodes.UP)
            });

            it('prevents the default event behavior', () => {
              component.simulate('keydown', upKeyPressEvent);

              expect(upKeyPressEvent.preventDefault.calledOnce).to.be.true;
            });

            it('moves to the last element when focusedIndex is null', () => {
              component.simulate('keydown', upKeyPressEvent);

              expectStateToBe(component, 'focusedIndex', elements.length - 1);
            });

            it('moves to the last index when focused index is 0', () => {
              setState(component, { focusedIndex: 0 });
              component.simulate('keydown', upKeyPressEvent);

              expectStateToBe(component, 'focusedIndex', elements.length - 1);
            });

            it('moves to the previous element otherwise', () => {
              component.setState({ focusedIndex: 1 });
              component.update();
              component.simulate('keydown', upKeyPressEvent);
              expectStateToBe(component, 'focusedIndex', 0);
            });
          });

          context('when DOWN is pressed', () => {
            beforeEach(() => {
              downKeyPressEvent = stubKeyPressEvent(KeyCodes.DOWN);
            });

            it('prevents the default event behavior', () => {
              component.simulate('keydown', downKeyPressEvent);
              expect(downKeyPressEvent.preventDefault.calledOnce).to.be.true;
            });

            it('moves to the first index when focusedIndex is null', () => {
              component.simulate('keydown', downKeyPressEvent);
              expectStateToBe(component, 'focusedIndex', 0);
            });

            it('moves to the first index from the last', () => {
              setState(component, { focusedIndex: elements.length -1 });
              component.simulate('keydown', downKeyPressEvent);

              expectStateToBe(component, 'focusedIndex', 0);
            });

            it('moves to the next index from the previous', () => {
              setState(component, { focusedIndex: 0 });
              component.simulate('keydown', downKeyPressEvent);
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

  describe('child component props', () => {
    context('<Label/ >', () => {
      it('passes `fieldName` and `labelText` props when supplied', () => {
        const props = { fieldName: 'search', labelText: 'type here!' };
        const component = shallow(<Fixture {...props} />);

        expect(component.find(Label).props()).to.deep.equals(props);
      });
    });

    context('<SearchBar />', () => {
      const component = shallow(<Fixture />);
      const instance = component.instance();
      const props = {
        doAutoFocus: instance.props.autofocus,
        isFocused: instance.state.inputFocused,
        name: defaultSearchName,
        onBlur: instance.handleUnfocus,
        onFocus: instance.handleInputFocus,
        onKeyInput: instance.handleKeyInput,
        onUnselect: instance.handleUnselect,
        query: instance.state.query,
        reportWidth: instance.setResultsListWidth,
        selected: instance.state.selected
      };

      expect(component.find(SearchBar).props()).to.deep.equal(props);
    });

    context('<SearchResults />', () => {
      const component = shallow(<Fixture />);
      const instance = component.instance();
      const props = {
        elements: instance.props.elements,
        focusedIndex: instance.state.focusedIndex,
        onSelect: instance.handleSelect,
        visible: instance.state.showResults,
        width: instance.state.resultsListWidth
      };

      expect(component.find(SearchResults).props()).to.deep.equals(props);
    });
  });
});
