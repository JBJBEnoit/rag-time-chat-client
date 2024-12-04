import React, {useReducer, useRef} from 'react';
import {TextField, Button, Modal} from '@mui/material';
import { RotatingSquare } from 'react-loader-spinner';
import DOMPurfiy from 'dompurify';

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
        showSpinner: false,
        spinnerProgressMessage: ''
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

        if (response.ok) {
            const { clientId } = await response.json();
            listenForProgress(clientId);  
        }
        else {
            const data = await response.json();
            setState({apiError: data.error});
        }

        // if (response.ok) {
        //     const data = await response.json();
        //     setState({bookTitle: data.title, bookId: data.id});
        //     bookDetails.current.scrollIntoView({behavior: "smooth"});
        // }
        // else {
        //     const data = await response.json();
        //     setState({apiError: data.error});
        // }
    }

    const listenForProgress = async (clientId) => {

        const eventSource = new EventSource(`${process.env.REACT_APP_API_URL}api/add-book-progress/${clientId}`);

        eventSource.addEventListener('progress', (event) => {
            const data = JSON.parse(event.data);
            setState({spinnerProgressMessage: `${data.progress}% done`});
        });

        eventSource.addEventListener('complete', (event) => {
            const data = JSON.parse(event.data).data;
            console.info("Book Info: %o", data);
            setState({bookTitle: data.title, bookId: data.id, showSpinner: false});
            bookDetails.current.scrollIntoView({behavior: "smooth"});
            eventSource.close();
        });

        eventSource.addEventListener('error', (event) => {
            if (!event || !event.error) {
                setState({apiError: 'An error occurred', showSpinner: false});
                eventSource.close();
                return;
            }
            const data = JSON.parse(event.error);
            setState({apiError: data.error, showSpinner: false});
            eventSource.close();
        });
    }

    const clear = () => {
        setState(initialState);
    }

    return (
        <div className='adminWrapper'>
            <div className='adminContainer'>
                <h1>RAGTime Library Admin</h1>
                <h2>Add Book</h2>
                <TextField inputProps={{ maxLength: 100 }} className='adminTextInput' label="Book URL" value={state.bookUrl} onChange={(e) => setState({bookUrl: DOMPurfiy.sanitize(e.target.value)})} />
                <div id="usersAdded" style={{borderRadius: "15px", width: "30%", backgroundColor: "#efefef", padding: 10}}>
                    <div style={{display: "flex", justifyContent: "center"}}>
                    <h3>Users</h3>
                    </div>
                    {state.users.length > 0 ? state.users.map((user, index) => <p key={index} style={{paddingLeft: "2rem"}}>{user}</p>) : <p style={{textAlign: "center"}}>No users added</p>}
                </div>
                <TextField label="User" inputProps={{ maxLength: 50 }} value={state.currentUserToAdd} onChange={(e) => setState({currentUserToAdd: DOMPurfiy.sanitize(e.target.value)})} />
                <Button onClick={() => setState({users: [...state.users, state.currentUserToAdd], currentUserToAdd: ''})}>Add User</Button>
                <TextField label="Role Instructions" inputProps={{ maxLength: 1200 }} multiline={true} value={state.instructions} onChange={(e) => setState({instructions: DOMPurfiy.sanitize(e.target.value)})} />
                <TextField label="Chat Greeting" inputProps={{ maxLength: 500 }} multiline={true} value={state.chatGreeting} onChange={(e) => setState({chatGreeting: DOMPurfiy.sanitize(e.target.value)})} />
                <TextField label="Admin Username" inputProps={{ maxLength: 50 }} value={state.username} onChange={(e) => setState({username: DOMPurfiy.sanitize(e.target.value)})} />
                <TextField label="Admin Password" inputProps={{ maxLength: 50 }} type="password" value={state.password} onChange={(e) => setState({password: DOMPurfiy.sanitize(e.target.value)})} />
                <Button onClick={addBook}>Add Book</Button>
                <div ref={bookDetails} style={{backgroundColor: "#eee", borderRadius: "15px", padding: "5px"}}>
                    {state.bookTitle && state.bookTitle.length > 0 && <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <h2>Book Added</h2>
                    <div>
                    <p>Title: {state.bookTitle}</p>
                    <p>Book ID: {state.bookId}</p>
                    </div>
                    <p>Access your book at:</p> 
                    <p><a href={`${process.env.REACT_APP_HOST}#?ecampusontarioName=${state.bookId}&user=${state.users[0]}`}>{process.env.REACT_APP_HOST}#?id={state.bookId}&user={state.users[0]}</a></p>
                    <Button onClick={clear} variant="contained">Add Another Book</Button>
                    </div>}
                </div>
                <Modal open={state.apiError && state.apiError.length > 0} onClose={() => setState({apiError: ''})}>
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
                    <p>{state.spinnerProgressMessage}</p>
                    </div>
                </Modal>
            </div>
        </div>
    );
}


export default LibraryAdmin;