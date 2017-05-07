import React from 'react';

const defaultText = 'Start typing to search';
const propTypes = {
  fieldName: React.PropTypes.string,
  labelText: React.PropTypes.string
};

const Label = ({ fieldName, labelText }) =>
  <div>
    <label htmlFor={fieldName}>
      {labelText || defaultText}
    </label>
  </div>;

Label.propTypes = propTypes;

export {
  defaultText
};

export default Label;
