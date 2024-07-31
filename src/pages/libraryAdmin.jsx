import React, {useReducer, useRef} from 'react';
import {TextField, Button, Modal} from '@mui/material';
import { RotatingSquare } from 'react-loader-spinner';

const LibraryAdmin = () => {

    const initialState = {
        bookUrl: '',
        users: [],
        username: '',
        password: '',
        instructions: '',
        chatGreeting: '',
        bookTitle: '',
        bookId: '',
        currentUserToAdd: '',
        apiError: '',
        showSpinner: false
    }

    const reducer = (state, newState) => {return {...state, ...newState}};
    const [state, setState] = useReducer(reducer, initialState);

    const bookDetails = useRef();

    const addBook = async () => {

        if (!state.bookUrl || !state.users.length || !state.username || !state.password || !state.instructions || !state.chatGreeting) {
            setState({apiError: 'All fields are required and book must have at least one user.'});
            return;
        }

        setState({showSpinner: true});

        const bookUsers = state.users.map(user => {return {id: user, role: 'user'}}); 

        const response = await fetch(`${process.env.REACT_APP_API_URL}api/add-book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: state.bookUrl,
                users: bookUsers,
                userId: state.username,
                password: state.password,
                instructions: state.instructions,
                chatIntro: state.chatGreeting
            })
        });

        setState({showSpinner: false});

        if (response.ok) {
            const data = await response.json();
            setState({bookTitle: data.title, bookId: data.id});
            bookDetails.current.scrollIntoView({behavior: "smooth"});
        }
        else {
            const data = await response.json();
            setState({apiError: data.error});
        }
    }

    const clear = () => {
        setState(initialState);
    }

    return (
        <div className='adminWrapper'>
            <div className='adminContainer'>
                <h1>RAGTime Library Admin</h1>
                <h2>Add Book</h2>
                <TextField className='adminTextInput' label="Book URL" value={state.bookUrl} onChange={(e) => setState({bookUrl: e.target.value})} />
                <div id="usersAdded" style={{borderRadius: "15px", width: "30%", backgroundColor: "#efefef", padding: 10}}>
                    <div style={{display: "flex", justifyContent: "center"}}>
                    <h3>Users</h3>
                    </div>
                    {state.users.length > 0 ? state.users.map((user, index) => <p key={index} style={{paddingLeft: "2rem"}}>{user}</p>) : <p style={{textAlign: "center"}}>No users added</p>}
                </div>
                <TextField label="User" value={state.currentUserToAdd} onChange={(e) => setState({currentUserToAdd: e.target.value})} />
                <Button onClick={() => setState({users: [...state.users, state.currentUserToAdd], currentUserToAdd: ''})}>Add User</Button>
                <TextField label="Role Instructions" multiline={true} value={state.instructions} onChange={(e) => setState({instructions: e.target.value})} />
                <TextField label="Chat Greeting" multiline={true} value={state.chatGreeting} onChange={(e) => setState({chatGreeting: e.target.value})} />
                <TextField label="Admin Username" value={state.username} onChange={(e) => setState({username: e.target.value})} />
                <TextField label="Admin Password" type="password" value={state.password} onChange={(e) => setState({password: e.target.value})} />
                <Button onClick={addBook}>Add Book</Button>
                {state.bookTitle && <div ref={bookDetails}>
                    <h2>Book Added</h2>
                    <p>Title: {state.bookTitle}</p>
                    <p>Book ID: {state.bookId}</p>
                    <p>Access your book at: {process.env.REACT_APP_HOST}#?ecampusontarioName={state.bookId}&user=YOUR_USER_NAME</p>
                    <Button onClick={clear} variant="contained">Add Another Book</Button>
                </div>}
                <Modal open={state.apiError} onClose={() => setState({apiError: ''})}>
                    <div className='modal'>
                        <h2>Error</h2>
                        <p>{state.apiError}</p>
                        <Button onClick={() => setState({apiError: ''})}>Close</Button>
                    </div>
                </Modal>
                <Modal onClose={()=>{}} 
                open={state.showSpinner}
                style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                    <div id="loading-dots" className="spinner-box">
                    <p>Adding book to library</p>
                    <RotatingSquare color="#e2231a"/>
                    <p>This takes a few minutes</p>
                    </div>
                </Modal>
            </div>
        </div>
    );
}


export default LibraryAdmin;