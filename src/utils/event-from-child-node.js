// Determines if a DOM event was fired from a child node of the supplied
// DOM node
import nextParentNode from './next-parent-node';

const eventFromChildNode = (parent, node, fromInsideFn, fromOutsideFn, depth=10) => {
  let count = 0;
  let next = node;

  while(next = nextParentNode(next)) {
    // bail out and trigger the fromOutside callback
    if (count === depth) {
      break;
    }

    if (next === parent) {
      // the node emitting the event is a child of the parent node
      next = null;

      return fromInsideFn();
    } else {
      count += 1;
    }
  }

  fromOutsideFn();
};

export default eventFromChildNode;
