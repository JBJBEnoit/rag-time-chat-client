import React, {useReducer, useEffect, useRef} from 'react'
import io from "socket.io-client";
import ChatMessageList from '../components/chatmessagelist'
import { TextField, Box, Modal, Button } from '@mui/material';
import {RotatingSquare} from 'react-loader-spinner';
import { useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import Joi from 'joi';

const ChatPage = () => {

const alreadyConnected = useRef(false);
const outputDiv = useRef();

const initialState = {
    socket: {},
    query: '',
    response: '',
    messages: [],
    showSpinner: false,
    bookName: null,
    bookURL: null,
    showErrorModal: false,
    errorMessage: '',
    chatIntro: '',
    embedded: false
}

const reducer = (state, newState) => ({...state, ...newState});
const [state, setState] = useReducer(reducer, initialState);
const location = useLocation();


useEffect(() => {

    const parseBoolean = (value) => {
        if (value === "true") return true;
        if (value === "false" || !value) return false;
        throw new Error(`Invalid boolean parameter: ${value}`);
      };

      const validationSchema = Joi.object({
        ecampusontarioName: Joi.string().alphanum().optional(),
        user: Joi.string().alphanum().optional(),
        embed: Joi.boolean().optional()
      });

    
    const queryParams = new URLSearchParams(location.search);
    const bookId = queryParams.get('ecampusontarioName') || 'fanshawesoar';
    const userId = queryParams.get('user') || 'jben';
    const embedded = parseBoolean(queryParams.get('embed')) || false;
    const enteredParams = {ecampusontarioName: bookId, user: userId, embed: embedded};
    const {error} = validationSchema.validate(enteredParams);
    if (error){
        setState({errorMessage: error.details[0].message, showErrorModal: true});
        return;
    }

    setState({embedded: embedded});
    getBookInfo(bookId, userId);
    
}, [location.search]);

useEffect(() => {
    if (alreadyConnected.current || !state.bookName || !state.bookURL)
    {
        return;
    }
    connectToServer();
    alreadyConnected.current = true;

}, [state.bookName, state.bookURL]);

const getBookInfo = async (bookId, userId) => {
    let bookInfo = await fetch(`${process.env.REACT_APP_API_URL}api/book-info`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({bookId: bookId, userId: userId})
    });

    const result = await bookInfo.json();
    console.info("Book Info: %o", result);
        if (result.error){
            setState({errorMessage: "Could not load book. Check id and user in URL and try again.", showErrorModal: true});
            return;
        }
        else {

            setState({bookName: result.bookName, bookURL: result.bookURL, chatIntro: result.chatIntro});
            console.log("Book Name: %o", DOMPurify.sanitize(result.bookName));
            console.log("Book URL: %o", DOMPurify.sanitize(result.bookURL));
        }
};

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
        setState({ errorMessage: "some other problem occurred", showErrorModal: true });
    }
}


const socketEmit = ()=>{

    state.socket.emit("query", {query_string: state.query, title: state.bookName});
    state.socket.on("response", (response) => {console.info("%o", response); const responseStr = DOMPurify.sanitize(response.response_string); setState({response: responseStr, showSpinner: false, messages: [...state.messages, {from: "student-user", text: state.query}, {from: "chatbot", text: responseStr}]})});
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
    <>
    { state.bookName ? <div className="chatContainer" style={{paddingLeft: (!state.embedded ? '15%' : 0), paddingRight: (!state.embedded ? '15%' : 0)}}>
    <h2 style={{color: "#b3272d"}}>Chat About {state.bookName}</h2>
    <p>This chatbot provides responses based on the <a href={state.bookURL} target="_blank" rel="noreferrer">{state.bookName}</a> text</p>
    <div className="usersList">
        <ChatMessageList messages={state.messages} currentUser={"student-user"}></ChatMessageList>
    </div>
    <Box width={"85%"}>
    
    <TextField
        fullWidth={true}
        style={{marginBottom: "1.5rem"}}
        onChange={(e) => {setState({query: DOMPurify.sanitize(e.target.value)})}}
        placeholder={state.chatIntro}
        autoFocus={true}
        maxChars={500}
        required
        onKeyPress={(e) => {
            if (e.key === "Enter") {
            handleSendMessage();
            }
        }}
        value={state.query}
        />
    </Box>
    </div> : <div></div> }

    <Modal onClose={()=>{}} 
        open={state.showSpinner}
        style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
        <div id="loading-dots" className="spinner-box">
            <p>Composing my best response</p>
            <RotatingSquare color="#e2231a"/>
            <p>This may take a few moments</p>
        </div>
    </Modal>

    <Modal onClose={()=>{setState({showErrorModal: false})}}
        open={state.showErrorModal}
        style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
        <div id="error-box" className="error-box">
            <h3>Oops! Something went wrong...</h3>
            <p>{state.errorMessage}</p>
            <Button onClick={() => setState({showErrorModal: false})}>Close</Button>
        </div>
    </Modal>
    </>
)

}

export default ChatPage;