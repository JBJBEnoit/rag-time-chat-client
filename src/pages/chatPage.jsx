import React, {useReducer, useEffect, useRef} from 'react'
import io from "socket.io-client";
import ChatMessageList from '../components/chatmessagelist'
import { TextField, Box, Modal } from '@mui/material';
import {RotatingSquare} from 'react-loader-spinner';
import { useLocation } from 'react-router-dom';

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
    chatIntro: ''
}

const reducer = (state, newState) => ({...state, ...newState});
const [state, setState] = useReducer(reducer, initialState);
const instructions = "You are a helpful academic success advisor at Fanshawe College. Please answer student questions about how to be a successful student at Fanshawe College. Please base your answers to any inquiries on the provided context from the FanshaweSOAR textbook.";
const location = useLocation();

useEffect(() => {

    const queryParams = new URLSearchParams(location.search);
    const bookId = queryParams.get('ecampusontarioName');
    const userId = queryParams.get('user');
    if (bookId && userId){
        console.log("Book ID: %o", bookId);
        console.log("User ID: %o", userId);
        getBookInfo(bookId, userId);
    }
    else {
        
        // For now make Fanshawe SOAR the default book
        getBookInfo("fanshawesoar", "jben");
    }

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
            setState({errorMessage: result.error.message, showErrorModal: true});
            return;
        }
        else {

            setState({bookName: result.bookName, bookURL: result.bookURL, chatIntro: result.chatIntro});
            console.log("Book Name: %o", result.bookName);
            console.log("Book URL: %o", result.bookURL);
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
    <>
    { state.bookName ? <div className="chatContainer">
    <h2 style={{color: "#b3272d"}}>Chat About {state.bookName}</h2>
    <p>This chatbot provides responses based on the <a href={state.bookURL} target="_blank" rel="noreferrer">{state.bookName}</a> text</p>
    <div className="usersList">
        <ChatMessageList messages={state.messages} currentUser={"student-user"}></ChatMessageList>
    </div>
    <Box width={"85%"}>
    
    <TextField
        fullWidth={true}
        style={{marginBottom: "1.5rem"}}
        onChange={(e) => {setState({query: e.target.value})}}
        placeholder={state.chatIntro}
        autoFocus={true}
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
        <div id="error-box">
            <h3>Oops! Something went wrong...</h3>
            <p>{state.errorMessage}</p>
        </div>
    </Modal>
    </>
)

}

export default ChatPage;