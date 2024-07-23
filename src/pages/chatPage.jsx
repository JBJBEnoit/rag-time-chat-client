import React, {useReducer, useEffect, useRef} from 'react'
import io from "socket.io-client";
import ChatMessageList from '../components/chatmessagelist'
import { TextField, Box, Modal } from '@mui/material';
import {RotatingSquare} from 'react-loader-spinner';

const ChatPage = () => {


const alreadyConnected = useRef(false);
const outputDiv = useRef();

const initialState = {
    socket: {},
    query: '',
    response: '',
    messages: [],
    showSpinner: false
}

const reducer = (state, newState) => ({...state, ...newState});
const [state, setState] = useReducer(reducer, initialState);
const instructions = "You are a helpful academic success advisor at Fanshawe College. Please answer student questions about how to be a successful student at Fanshawe College. Please base your answers to any inquiries on the provided context from the FanshaweSOAR textbook.";

useEffect(() => {

    if (alreadyConnected.current)
    {
        return;
    }
        connectToServer();
        alreadyConnected.current = true;

}, []);

const connectToServer = ()=>{
    try {
        const socket = io.connect(process.env.REACT_APP_API_URL, {
        forceNew: true,
        transports: ["websocket"],
        autoConnect: true,
        reconnection: false,
        timeout: 5000,
        });

        console.info("Socket: %o", socket);
        setState({socket: socket});

    } catch (err) {

        console.log(err);
        setState({ snackbarMsg: "some other problem occurred" });
    }
}


const socketEmit = ()=>{

    state.socket.emit("query", {query_string: state.query, title: "Fanshawe SOAR", instructions: instructions});
    state.socket.on("response", (response) => {console.info("%o", response); setState({response: response.response_string, showSpinner: false, messages: [...state.messages, {from: "student-user", text: state.query}, {from: "chatbot", text: response.response_string}]})});
};

const handleSendMessage = ()=>{

    if (state.btnDisabled){
        return;
    }

    console.info("State socket: %o", state.socket);
    // Check if connected (more dynamic than code in lab doc
    // since no page refresh required)
    if (state.socket && state.socket.connected)
    {
        setState({showSpinner: true, messages: [...state.messages, {from: "student-user", text: state.query}]});
        socketEmit();
    }
    else
    {
        //try to connect again
        connectToServer();

        if (!state.socket || !state.socket.connected) {
            //setState({snackbarMsg: "can't get connection - try again later!"});
            console.log("can't connect");
        } 

        setState({showSpinner: true, messages: [...state.messages, {from: "student-user", text: state.query}]});
        socketEmit();
        
    }

    // Reset fields
    setState({query: ''});
};

return (
    <div className="chatContainer">
    <h2 style={{color: "#b3272d"}}>Chat About Fanshawe SOAR</h2>
    <p>This chatbot provides responses based on the <a href="https://ecampusontario.pressbooks.pub/fanshawesoar/" target="_blank" rel="noreferrer">Fanshawe SOAR</a> student success handbook</p>
    <div className="usersList">
        <ChatMessageList messages={state.messages} currentUser={"student-user"}></ChatMessageList>
    </div>
    <Box width={"85%"}>
    
    <TextField
        fullWidth={true}
        style={{marginBottom: "1.5rem"}}
        onChange={(e) => {setState({query: e.target.value})}}
        placeholder="Ask me anything about how to be a successful student at Fanshawe..."
        autoFocus={true}
        required
        onKeyPress={(e) => {
            if (e.key === "Enter") {
            handleSendMessage();
            }
        }}
        value={state.query}
        />

        {/* <button onClick={btnHandler}>Submit</button> */}
    </Box>

    <Modal onClose={()=>{}} 
        open={state.showSpinner}
        style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
    <div id="loading-dots" className="spinner-box">
            <p>Composing my best response</p>
            <RotatingSquare color="#e2231a"/>
            <p>This may take a few moments</p>
        </div>

    </Modal>
    </div>
)

}

export default ChatPage;