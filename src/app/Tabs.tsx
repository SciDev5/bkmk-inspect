import { css } from "@emotion/css";
import React, { useState } from "react";

export const TAB_HEADER_HEIGHT = 20;

export default function Tabs<T extends number|string>(props:{children:{[k in T]: React.ReactNode},tabs:{[k in T]: string}}) {
    const [tabId,setTabId] = useState<T>(0 as T);
    
    return <>
        <div style={{
            display: "flex",
            height: TAB_HEADER_HEIGHT - 1,
            borderBottom: "1px solid #7777",
        }}>
            {(Object.entries(props.tabs) as [T,string][]).map(([id,name])=>(
                <button
                    key={id}
                    onClick={e=>{
                        setTabId(id);
                    }}
                    className={css({
                        border: "none",
                        fontFamily: "monospace",
                        background: "#fff",
                        // eslint-disable-next-line eqeqeq
                        borderBottom: tabId == id ? "2px solid #47f" : "none",
                    })}
                    // eslint-disable-next-line eqeqeq
                    disabled={tabId == id}
                >{name}</button>
            ))}
        </div>
        {props.children[tabId]}
    </>
}