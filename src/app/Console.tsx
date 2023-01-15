import { useEffect, useState } from "react";
import { ConsoleLevelMap, ConsoleLine } from "./ConsoleLine";
import { evalAndLog } from "./eval";
import { consoleLines, onConsoleLinesChange } from "./logIntercept";

function ConsoleInput() {
    const [code, setCode] = useState("");
    return (
        <textarea
            style={{
                display: "block",
                border: "none",
                borderTop: "1px solid #7777",

                background: "#0002",
                
                flex: "0 1",
                resize: "none",

                minHeight: 50,
            }}
            onKeyDown={e=>{
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    // setCode("");
                    
                    if (code.trim().length > 0)
                        evalAndLog(code);
                }
            }}
            value={code}
            onChange={e=>setCode(e.currentTarget.value)}
        />
    )
}

export default function Console({height}:{height: number}) {
    const [[lines],setLines] = useState([consoleLines]);
    const [levels,] = useState([false,true,true,true,true] as ConsoleLevelMap);
    // TODO set visible log levels

    useEffect(()=>{
        const updateLines = ()=>setLines([consoleLines]);

        onConsoleLinesChange.add(updateLines);
        return ()=>{
            onConsoleLinesChange.delete(updateLines);
        };
    })

    return (
        <div style={{
            display: "flex",
            flexDirection: "column-reverse",
            overflowY: "scroll",
            height,
        }}>
            <ConsoleInput />
            {
                lines.filter(v=>v.isShown(levels)).reverse().map(v=>(
                    <ConsoleLine.Element line={v} key={v.id} />
                ))
            }
        </div>
    )
}