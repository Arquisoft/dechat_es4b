module.exports = class Message {
  constructor(content) {
    this.content = content;
	this.date = new Date();
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

  set sender(newContent) {
    this._content = newContent;
  }
  
    serialize(){
        return JSON.stringify({
            "sch:text":this.content,
            "sch:date":this.date
        });
	}
}