module.exports = class Message {
  constructor(content,date,sender) {
    this.content = content;
	this.sender = sender;
	if (date==null)
		this.date = new Date();
  }

  get sender() {
    return this.sender;
  }

  set sender(newSender) {
    this.sender = newSender;
  }

  get receiver() {
    return this.receiver;
  }

  set receiver(newReceiver) {
    this.receiver = newReceiver;
  }

  get content() {
    return this.content;
  }

  set sender(newContent) {
    this.content = newContent;
  }
  
    serialize(){
        return JSON.stringify({
            "sch:text":this.content,
            "sch:dateSent":this.date,
			"sch:sender":this.sender
        });
	}
}