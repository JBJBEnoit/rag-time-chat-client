import { useEffect, useRef } from "react";
import { ListItem } from "@mui/material";
import Bubble from "./bubble";

const ChatMessage = (props) => {
 
    const msgRef = useRef(null);
    useEffect(() => {
        msgRef.current.scrollIntoView(true);
    }, []);

    const fromUser = props.msg.from === props.currentUser;
    
    return (
        <div>
        <ListItem
        ref={msgRef}
        style={{ textAlign: "left", marginBottom: "2vh", justifyContent: fromUser ? "right" : "left" }}
        >
            <Bubble msg={props.msg} fromCurrentUser={fromUser} color="rgba(65, 117, 5, 1)" />
        </ListItem>
        <p></p>
        </div>
    );
};
export default ChatMessage;