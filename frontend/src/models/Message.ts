class Message
{
    MessageID: number = 0;
    SenderID: number = 0;
    ReceiverID: number = 0;
    Content: string = '';
    SendTime: number = 0;
    KeyID: number = 0;
    
    static Init(dbMessage: {MessageID: number, Sender: number, Receiver: number, Content: string, SendTime: number, KeyUsed: number}) : Message
    {
        let msg = new Message();
        
        msg.MessageID = dbMessage.MessageID;
        msg.SenderID = dbMessage.Sender;
        msg.ReceiverID = dbMessage.Receiver;
        msg.Content = dbMessage.Content;
        msg.SendTime = dbMessage.SendTime;
        msg.KeyID = dbMessage.KeyUsed;
        
        return msg;
    }
}

export default Message;