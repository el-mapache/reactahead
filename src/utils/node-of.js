import { findDOMNode } from 'react-dom';

const nodeOf = component => findDOMNode(component);

export default nodeOf;
