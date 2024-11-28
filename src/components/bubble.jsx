import "../App.css";
import {useRef, useEffect} from 'react'
import Showdown from "showdown";

const Bubble = (props) => {

    const textBody = useRef();

    useEffect (() => {
        let isHTML = props.msg.text.indexOf('<p>') >= 0;

        let text = props.msg.text;
        if (!isHTML)
        {
            const converter = new Showdown.Converter();
            text = converter.makeHtml(text);
        }

        textBody.current.innerHTML = text;

    }, [props])

    const bgColour = props.fromCurrentUser ? "#E2231A" : "#646469";

 return (
    <div className="userBubble" style={{ backgroundColor: bgColour, color: "white" }}>
        <div ref={textBody}></div>
    </div>
 );
};
export default Bubble;