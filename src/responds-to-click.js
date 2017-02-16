import React from 'react';

function RespondsToClick(Component) {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
      window.addEventListener('click', this.handleClick);
    }

    componentWillUnmount() {
      window.removeEventListener('click', this.handleClick);
    }

    handleClick() {

    }

    render() {
      return <Component {...this.props} />
    }
  };
};


export default RespondsToClick;
