const debounce = (fn, wait) => {
  let timeout;

  return function() {
    const args = [].slice.call(arguments);

    const later = () => {
      timeout = null;
      fn.apply(null, args);
    };

    let callNow = !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      fn.apply(null, args);
    }
  };
};

export default debounce;
