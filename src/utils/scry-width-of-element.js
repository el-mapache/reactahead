const scryWidthOfElement = node =>
  (node.getBoundingClientRect && node) ? node.getBoundingClientRect().width : 0;

export default scryWidthOfElement;
