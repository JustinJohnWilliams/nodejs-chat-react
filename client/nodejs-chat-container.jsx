import { Component } from 'react';
import { trim, each, bind, map } from 'lodash';

class ChatResultItem extends Component {
  render() {
    return (
      <div>
        <b>{this.props.name}</b>: {this.props.message}
        <br />
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

  render() {
      return (
        <div>
          <div className="col-md-8">
            <input className="col-md-12 col-sm-12"
                   onKeyUp={this.sendMessageOrNothing.bind(this)}
                   onChange={this.update.bind(this)}
                   value={this.props.currentMessage}
                   placeholder={`send message as ${this.props.currentUser}`} />

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
    var url = this.assignUrl(name);

    this.initEvents();
    this.state = { chats: [],
                   users:[],
                   serverNotifications: [],
                   currentMessage: "",
                   currentUser: name,
                   currentUserUrl: url};
  }

  render() {
      return (<ChatView chats={this.state.chats}
                users={this.state.users}
                serverNotifications={this.state.serverNotifications}
                currentMessage={this.state.currentMessage}
                currentUser={this.state.currentUser}
                currentUserUrl={this.state.currentUserUrl}
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

  assignUrl(name) {
    return 'https://www.google.com/search?q=' + encodeURIComponent(name) + '%20site:wikipedia.org&btnI=3564';
  }

  initEvents() {
    this.socket.on('connect', bind(() => {
      this.socket.emit('adduser', this.state.currentUser);
    }, this));

    this.socket.on('updatechat', bind((username, data) => {
      //$('#conversation').append('<b>'+ escaped(username) + ':</b> ' + escaped(data) + "<br/>");
      console.log(username + " " + data);
      this.setState({chats: this.state.chats.concat({ name: username, message: data })});
    }, this));

    this.socket.on('updateusers', bind((data) => {
      //$('#users').empty();
      each(data, function(key, value) {
        //$('#users').append('<div><a href="' + searchUrlFor(key) + '" target="_blank">' + key + '</div>');
        console.log(key + " " + value);
      });
    }, this));

    this.socket.on('servernotification', bind((data) => {
      var searchUrl = searchUrlFor(data.username);
      if(data.connected) {
        if(data.to_self) data.username = "you";

        //$('#conversation').append('connected: <a href="' + searchUrl + '" target="_blank">' + escaped(data.username) + "</a><br/>");
        console.log('connected: ' + data.username);
      } else {
        //$('#conversation').append('disconnected: <a href="' + searchUrl + '" target="_blank">' + escaped(data.username) + "</a><br/>");
        console.log('disconnected: ' + data.username);
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

  wireUpSocket() {

    $(function(){
      $('#data').keypress(function(e) {
        if(e.which == 13) {
          var message = $('#data').val();
          $('#data').val('');
          this.props.socket.emit('sendchat', message);
        }
      });
    });
  }
}


function initApp() {
  ReactDOM.render(
      <ChatContainer />,
    document.getElementById('content')
  );
}

module.exports.initApp = initApp;
