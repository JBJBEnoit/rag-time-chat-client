import "../App.css";
import {useRef, useEffect} from 'react'
import Showdown from "showdown";
import { Typography } from "@mui/material";
import { theme } from "../theme";

const Bubble = (props) => {

    const textBody = useRef();
    const textAdded = useRef(false);

    useEffect (() => {

        //let text = '<p>' + props.msg.text.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
        let isHTML = props.msg.text.indexOf('<p>') >= 0;

        let text = props.msg.text;
        if (!isHTML)
        {
            const converter = new Showdown.Converter();
            text = converter.makeHtml(text);
        }

        textBody.current.innerHTML = text;

    }, [props])



    // Make text colour white if background is dark
    // let colourStr = props.msg.colour.replace('#', '0x');
    // let colorNum = Number.parseInt(colourStr);
    // let textColour = 'black';

    // // This is just an approximation - the actual formula
    // // provided by the WCAG is much more involved
    // if (colorNum < 10388608)
    // {
    //     textColour = "white";
    // }

    const bgColour = props.fromCurrentUser ? "#E2231A" : "#646469";

 return (
    <div className="userBubble" style={{ backgroundColor: bgColour, color: "white" }}>
        <div ref={textBody}></div>
    </div>
 );
};
export default Bubble;