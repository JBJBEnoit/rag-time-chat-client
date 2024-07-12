import { List } from "@mui/material";
import ChatMessage from "./chatmessage";

const ChatMessageList = (props) => {
    let messages = props.messages.map((msg, idx) => {
        return <ChatMessage key={idx} msg={msg} currentUser={props.currentUser}/>;
    });
    
    return <List style={{overflowY: "auto", maxHeight: "35rem"}}>{messages}</List>;
};
export default ChatMessageList;