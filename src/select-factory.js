import React from 'react';

const SelectFactory = options => {
  // Does this return a higher order component? I dont think so. I think
  // it probably needs to determine whether to return a AsyncSelect or a
  // VanillaSelect component.
  //
  // Both of those could probably be wrapped in a higher order component
  // that provides the common functionality?
};

export default SelectFactory;
