import React from "react";
import { createStyles } from "@mui/material"
export const MainElement = (props)=>{

    const style = createStyles({
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        gap: "2vh",
    });
    
    return (
        <div style={style}>{props.children}</div>
    )
};
