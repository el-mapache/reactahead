import React from 'react';

const inputProvider = Component => {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        input: ''
      };

      this.handleInput = this.handleInput.bind(this);
    }

    handleInput(input) {
      this.setState({ input });
    }

    render() {
      const { input } = this.state;

      return (
        <Component { ...this.props }
          handleInput={ this.handleInput }
          input={ input }
        />
      );
    }
  }
};

export default inputProvider;
