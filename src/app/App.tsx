import React, {useState} from "react";
import Console from "./Console";
import DomExplorer from "./DomExplorer";
import Panel from "./Panel";
import Tabs, { TAB_HEADER_HEIGHT } from "./Tabs";


enum TabIds {
    DOMEX,
    CONSOLE,
}

export default function App() {
    const [width,setWidth] = useState(400);
    const [height,setHeight] = useState(500);
    
    return (
        <Panel {...{width,height}} setSize={(w,h)=>{
            setWidth(Math.max(150,w));
            setHeight(Math.max(200,h));
        }}>
            <Tabs
                tabs={{
                    [TabIds.DOMEX]: "Inspector",
                    [TabIds.CONSOLE]: "Console",
                }}
            >{{
                [TabIds.CONSOLE]: <Console height={height-TAB_HEADER_HEIGHT}/>,
                [TabIds.DOMEX]: <DomExplorer height={height-TAB_HEADER_HEIGHT}/>,
            }}</Tabs>
        </Panel>
    )
}