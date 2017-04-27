import React from 'react'
import firebase from 'APP/fire'

const users = firebase.database().ref('users')
    , nickname = uid => users.child(uid)

class ChatMessage extends React.Component {
  componentDidMount() {
    // When the component mounts, start listening for the
    // nickname of this user.
    this.listenTo(nickname(this.props.uid))
  }

  componentWillUnmount() {
    // When we unmount, stop listening.
    this.unsubscribe()
  }

  componentWillReceiveProps(incoming, outgoing) {
    // When the props sent to us by our parent component change,
    // start listening to the new firebase reference.
    this.listenTo(nickname(incoming.uid))
  }

  listenTo(fireRef) {
    // If we're already listening to a ref, stop listening there.
    if (this.unsubscribe) this.unsubscribe()

    // Whenever our ref's value changes, set {from} on our state.
    const listener = fireRef.on('value', snapshot =>
      this.setState({from: snapshot.val()}))

    // Set unsubscribe to be a function that detaches the listener.
    this.unsubscribe = () => fireRef.off('value', listener)
  }

  render() {
    const { from=''
          , body='' } = this.state || {}
    return <div className='chat-message'>
      <span className='chat-message-from'>{from}</span>
      <span className='chat-message-body'>{body}</span>
    </div>
  }
}

export default class extends React.Component {
  componentDidMount() {
    // When the component mounts, start listening to the fireRef
    // we were given.
    this.listenTo(this.props.fireRef)
  }

  componentWillUnmount() {
    // When we unmount, stop listening.
    this.unsubscribe()
  }

  componentWillReceiveProps(incoming, outgoing) {
    // When the props sent to us by our parent component change,
    // start listening to the new firebase reference.
    this.listenTo(incoming.fireRef)
  }

  listenTo(fireRef) {
    // If we're already listening to a ref, stop listening there.
    if (this.unsubscribe) this.unsubscribe()

    // Whenever our ref's value changes, set {value} on our state.
    const listener = fireRef.on('value', snapshot =>
      this.setState({value: snapshot.val()}))

    // Set unsubscribe to be a function that detaches the listener.
    this.unsubscribe = () => fireRef.off('value', listener)
  }

  // Write is defined using the class property syntax.
  // This is roughly equivalent to saying,
  //
  //    this.sendMessage = event => (etc...)
  //
  // in the constructor. Incidentally, this means that write
  // is always bound to this.
  sendMessage = event => {
    event.preventDefault()
    if (!this.props.fireRef) return
    this.props.fireRef.push({
      from: firebase.auth().currentUser.uid,
      body: event.target.body.value
    })
  }

  render() {
    // {messages=[]} means "pluck messages out of this.state, and give me
    // an empty array if it's not there".
    const {messages=[]} = this.state || {}
    return <div>
      <div className='chat-log'> {
        messages.map(message => <ChatMessage {...message}/>)
      } </div>
      <form onSubmit={this.sendMessage}>
        <input name='nick' onChange={this.setNickname}/>
        <input name='body'/>
        <input type='submit'/>
      </form>
    </div>
  }
}
