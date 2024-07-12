import React from 'react'


const ChatMsg = (props) => {

    // Make text colour white if background is dark
    let colourStr = props.msg.colour.replace('#', '0x');
    let colorNum = Number.parseInt(colourStr);
    let textColour = 'black';

    // This is just an approximation - the actual formula
    // provided by the WCAG is much more involved
    if (colorNum < 10388608)
    {
        textColour = "white";
    }

    return (
    <div
    className="scenario-message"
    style={{ backgroundColor: props.msg.colour, color: textColour, padding: 5 }}
    >
        <div style={{fontSize: 14}}>{`${props.msg.from} @${props.msg.timestamp}`}</div>
        <div>{props.msg.text}</div>
    </div>
    );
   };
   export default ChatMsg;