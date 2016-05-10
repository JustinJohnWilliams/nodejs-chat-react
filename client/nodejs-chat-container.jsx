import { Component } from 'react';
import { trim, each, bind, map } from 'lodash';

class ChatResultItem extends Component {
  render() {
    if (!this.props.name) return (<div>{this.props.message}</div>);
    return (
      <div>
        <b>{this.props.name}</b>: {this.props.message}
        <br />
      </div>
    );
  }
}

class UserResultItem extends Component {
  render() {
    return (
      <div>
        <a href={`https://www.google.com/search?q='${encodeURIComponent(this.props.name)}'%20site:wikipedia.org&btnI=3564`} target="_blank">{this.props.name}</a>
      </div>
    );
  }
}

class ChatView extends Component {

  sendMessageOrNothing(e) {
    e.preventDefault();
    if(e.keyCode == 13) {
      this.props.sendMessage();
    }
  }

  update(e) {
    e.preventDefault();
    this.props.setCurrentMessage(e.target.value);
  }

  renderChats() {
    return map(this.props.chats,
               w => <ChatResultItem name={w.name}
                message={w.message}
                key={Math.random()} />);
  }

  renderUsers() {
    return map(this.props.users,
               u => <UserResultItem name={u} key={Math.random()} />);
  }

  render() {
      return (
        <div className="row">
          <div className="col-md-4">
            <b>Users</b>
            <hr />
            { this.renderUsers() }
            <hr className="visible-xs visible-sm" />
          </div>
          <div className="col-md-8">
            <input className="col-md-12 col-sm-12"
                   onKeyUp={this.sendMessageOrNothing.bind(this)}
                   onChange={this.update.bind(this)}
                   value={this.props.currentMessage}
                   placeholder={`send message as ${this.props.currentUser}`} />
            <hr />
            { this.renderChats() }
          </div>
        </div>
      );
  }
}

class ChatContainer extends Component {
  constructor() {
    super();

    this.socket = io.connect('/');

    var name = this.assignName();

    this.initEvents();
    this.state = { chats: [],
                   users:[],
                   serverNotifications: [],
                   currentMessage: "",
                   currentUser: name };
  }

  render() {
      return (<ChatView chats={this.state.chats}
                users={this.state.users}
                serverNotifications={this.state.serverNotifications}
                currentMessage={this.state.currentMessage}
                currentUser={this.state.currentUser}
                sendMessage={this.sendMessage.bind(this)}
                setCurrentMessage={this.setCurrentMessage.bind(this)} />
    );
  }

  assignName() {
    var name = window.names[Math.floor(Math.random() * window.names.length)];
    var tokens = name.split(',');

    if(tokens.length > 1) {
      return trim(tokens[1]) + " " + trim(tokens[0]);
    }

    this.setState({users: this.state.users.concat(name)});

    return name;
  }

  initEvents() {
    this.socket.on('connect', bind(() => {
      this.socket.emit('adduser', this.state.currentUser);
    }, this));

    this.socket.on('updatechat', bind((username, data) => {
      this.setState({chats: this.state.chats.concat({ name: username, message: data })});
    }, this));

    this.socket.on('updateusers', bind((data) => {
      this.setState({users: []});
      each(data, bind((username) => {
        this.setState({users: this.state.users.concat(username)});
      }, this));
    }, this));

    this.socket.on('servernotification', bind((data) => {
      if(data.connected) {
        if(data.to_self) data.username = "you";

        this.setState({chats: this.state.chats.concat({ message: 'connected: ' + data.username })});
      } else {
        this.setState({chats: this.state.chats.concat({ message: 'disconnected: ' + data.username })});
      }
    }, this));
  }

  sendMessage() {
    this.socket.emit('sendchat', this.state.currentMessage);
    this.setState({currentMessage: ""});
  }

  setCurrentMessage(m) {
    this.setState({currentMessage: m});
  }

  createSocket() {
    this.setState({socket: socket});
  }
}


function initApp() {
  ReactDOM.render(
      <ChatContainer />,
    document.getElementById('content')
  );
}

module.exports.initApp = initApp;
