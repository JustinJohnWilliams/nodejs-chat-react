import { Component } from 'react';
import { trim, each } from 'lodash';

class ChatView extends Component {

  sendMessageOrNothing(e) {
    e.preventDefault();
    if(e.keyCode == 13) {
      this.props.sendMessage(this.props.currentMessage, this.props.currentUser);
    }
  }

  update(e) {
    e.preventDefault();
    this.props.setCurrentMessage(e.target.value);
  }

  render() {
    each(this.props.chats, (name, message) => console.log(name, message))
      return (
        <div>
          <div className="col-md-8">
            <input className="col-md-12 col-sm-12"
                   onKeyUp={this.sendMessageOrNothing.bind(this)}
                   onChange={this.update.bind(this)}
                   value={this.props.currentMessage}
                   placeholder={`send message as ${this.props.currentUser}`} />

          </div>
        </div>
      );
  }
}

class ChatContainer extends Component {
  constructor() {
    super();

    var name = this.getName();

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

  getName() {
    var name = window.names[Math.floor(Math.random() * window.names.length)];
    var tokens = name.split(',');

    if(tokens.length > 1) {
      return trim(tokens[1]) + " " + trim(tokens[0]);
    }

    return name;
  }

  sendMessage(message, user) {
    this.setState({chats: this.state.chats.concat({ name: user, message: message })});
  }

  setCurrentMessage(m) {
    this.setState({currentMessage: m});
  }

  createSocket() {
    var socket = io.connect('/');

    socket.on('connect', function() {
      socket.emit('adduser', name);
    });

    socket.on('updatechat', function (username, data) {
      //$('#conversation').append('<b>'+ escaped(username) + ':</b> ' + escaped(data) + "<br/>");
      console.log(username + " " + data);
    });

    socket.on('updateusers', function(data) {
      //$('#users').empty();
      each(data, function(key, value) {
        //$('#users').append('<div><a href="' + searchUrlFor(key) + '" target="_blank">' + key + '</div>');
        console.log(key + " " + value);
      });
    });

    socket.on('servernotification', function (data) {
      var searchUrl = searchUrlFor(data.username);
      if(data.connected) {
        if(data.to_self) data.username = "you";

        //$('#conversation').append('connected: <a href="' + searchUrl + '" target="_blank">' + escaped(data.username) + "</a><br/>");
        console.log('connected: ' + data.username);
      } else {
        //$('#conversation').append('disconnected: <a href="' + searchUrl + '" target="_blank">' + escaped(data.username) + "</a><br/>");
        console.log('disconnected: ' + data.username);
      }
    });

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
