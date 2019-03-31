module.exports = class Message {
  constructor(sender, receiver, content) {
    this._sender = sender;
    this._receiver = receiver;
    this._content = content;
  }

  get sender() {
    return this._sender;
  }

  set sender(newSender) {
    this._sender = newSender;
  }

  get receiver() {
    return this._receiver;
  }

  set receiver(newReceiver) {
    this._receiver = newReceiver;
  }

  get content() {
    return this._content;
  }

  set content(newContent) {
    this._content = newContent;
  }
}