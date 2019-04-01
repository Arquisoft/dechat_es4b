module.exports = class Message {
  constructor(sender, dateTime, content) {
    this._sender = sender;
    this._dateTime = dateTime;
    this._content = content;
  }

  // constructor(sender, receiver, content, dateTime) {
    // this._sender = sender;
    // this._receiver = receiver;
    // this._content = content;
    // this._dateTime = dateTime;
  // }

  get sender() {
    return this._sender;
  }

  set sender(newSender) {
    this._sender = newSender;
  }

  get dateTime() {
    return this._dateTime;
  }

  set sender(newDateTime) {
    this._dateTime = newDateTime;
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

  set sender(newContent) {
    this._content = newContent;
  }
}