import { Component } from 'react';

class WordFinderContainer extends Component {
  constructor() {
    super();
  }

  render() {
      return (<h1>hello, world!</h1>
    );
  }

}


function initApp() {
  ReactDOM.render(
      <ChatContainer />,
    document.getElementById('content')
  );
}

module.exports.initApp = initApp;
