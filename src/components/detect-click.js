import React from 'react';
import nodeOf from '../utils/node-of';

const DetectClick = Component => {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        clickOutside: null
      };

      this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
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
          // the node emitting the blur event is a child of the parent node,
          // so we don't want to hide the results list
          next = null;

          return this.setState({
            clickOutside: false
          });
        } else {
          count += 1;
        }
      }

      this.setState({
        clickOutside: true
      });
    }

    render() {
      const { clickOutside } = this.state;

      return (
        <div onClick={this.handleClick}>
          <Component {...Object.assign({}, this.props, { clickOutside })} />
        </div>
      );
    }
  }
};

export default DetectClick;
