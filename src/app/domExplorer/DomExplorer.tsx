import { rootElt } from "../..";
import { css } from "@emotion/css";
import { useEffect, useRef, useState, Fragment, useCallback } from "react";

enum NodeType {
    ELEMENT = 1,
    ATTRIBUTE,
    TEXT,
    CDATA_SECTION,
    PROCESSING_INSTRUCTION = 7,
    COMMENT,
    DOCUMENT,
    DOCUMENT_TYPE,
    DOCUMENT_FRAGMENT,
}

const isNode = {
    element(node: Node): node is HTMLElement {
        return node.nodeType === NodeType.ELEMENT;
    },
    comment(node: Node): node is Comment {
        return node.nodeType === NodeType.COMMENT;
    },
    document(node: Node): node is Document {
        return node.nodeType === NodeType.DOCUMENT;
    },
    documentFragment(node: Node): node is DocumentFragment {
        return node.nodeType === NodeType.DOCUMENT_FRAGMENT;
    },
    doctype(node: Node): node is Document {
        return node.nodeType === NodeType.DOCUMENT_TYPE;
    },
    html(node: Node): node is HTMLElement {
        return node.nodeType === NodeType.ELEMENT;
    },
    text(node: Node): node is Text {
        return node.nodeType === NodeType.TEXT;
    },
}

function TextZone({text,setText,hideQuotes,tabbable}:{text?:string,setText:(txt:string)=>void,hideQuotes?:boolean,tabbable?:boolean}) {
    const [editing,setEditing] = useState(false);
    const [liveText,setLiveText] = useState(text);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const beginEditing = ()=>{
        setEditing(true);
        setLiveText(text);
        const n = setInterval(()=>{
            if (inputRef.current) {
                inputRef.current.focus();
                clearInterval(n);
            }
        });
    }

    return (
        <span
            style={editing ? {
                background: "#b8f",
                color: "#428",
                whiteSpace: "pre",
                fontFamily: "monospace",
            } : {
                whiteSpace: "pre",
            }}
            tabIndex={tabbable ? 0 : undefined}
            onDoubleClick={e=>{
                beginEditing();
            }}
            onKeyDown={e=>{
                if ((e.key === "Enter" || e.key === " ") && !editing)
                    beginEditing();
            }}
        >
            {hideQuotes?"":`"`}{
                editing ? (
                    <textarea
                        ref={inputRef}
                        onChange={e=>setLiveText(e.currentTarget.value)}
                        onKeyDown={e=>{
                            if (e.key === "Enter" && !e.shiftKey) {
                                setText(e.currentTarget.value);
                                setEditing(false);
                            }
                        }}
                        style={{
                            paddingInline: 3,
                            border: "1px dashed",
                            display: "inline-block",
                            appearance: "none",
                            height: 15.335 * Math.max(1,liveText?.split("\n").length ?? 1),
                            width: "60%",
                        }}
                        onBlur={e=>{
                            setText(e.currentTarget.value);
                            setEditing(false);
                        }}
                        value={liveText}
                    />
                ) : (
                    text?.trim() ? text : <span style={{opacity: .5}}>{"<whitespace>"}</span>
                )
            }{hideQuotes?"":`"`}
        </span>
    )
}

function DomEltHeader({
    node,
    level,
    hidden,
    setHidden,
    isOnlyChild,
    htmlRef,
}:{
    node:Node,
    level:number,
    hidden:boolean,
    setHidden:(h:boolean)=>void,
    isOnlyChild:boolean,
    htmlRef:React.Ref<HTMLDivElement>,
}) {
    const [,setRefresher] = useState(0);

    useEffect(()=>{
        const mo = new MutationObserver((e)=>{
            setRefresher(Math.random());
        })
        mo.observe(node,{attributes:true,characterData:true});

        return ()=>{
            mo.disconnect();
        };
    },[node]);

    let color = "#f57";
    let content = <>unknown elt type {node.nodeType}</>;
    if (isNode.element(node)) {
        color = "#37f";
        content = <>
            {`<${node.tagName.toLowerCase()}`}
            {[...node.attributes].map(v=>(
                <Fragment key={v.name}>
                    {" "}
                    <span style={{
                        color: "#70f",
                    }}>
                        <TextZone
                            text={v.name}
                            setText={t=>{
                                if (t === v.name) return;
                                node.setAttribute(t,v.value)
                                node.removeAttribute(v.name)
                            }}
                            hideQuotes
                        />
                    </span>
                    {"="}
                    <span style={{
                        color: "#f70",
                    }}>
                        <TextZone
                            text={v.value ?? "true"}
                            setText={t=>{
                                v.textContent = t;
                            }}
                        />
                    </span>
                </Fragment>
            ))}
            {`>`}</>
    }
    if (isNode.document(node)) {
        color = "#f0f";
        content = <>#document</>
    }
    if (isNode.text(node)) {
        if (isOnlyChild || node.textContent?.trim()) {
            color = "#000";
            content = <TextZone text={node.textContent ?? undefined} setText={v=>node.textContent=v} tabbable />;
        } else {
            content = <></>;
        }
    }
    if (isNode.doctype(node)) {
        color = "#7777";
        content = <>{`<!DOCTYPE html>`}</>;
    }
    if (isNode.comment(node)) {
        color = "#0707";
        content = <div style={{whiteSpace:"pre"}}>{`<!--\n${node.data.trim().split("\n").map(v=>"    "+v.trim()).join("\n")}\n-->`}</div>;
    }

    return (
        <div
            ref={htmlRef}
            onClick={e=>{
                setHidden(!hidden);
            }}
            tabIndex={isNode.text(node) ? undefined : 0}
            onKeyDown={e=>{
                if (document.activeElement !== e.currentTarget)
                    return;
                if (e.key === "Enter" || e.key === " ")
                    setHidden(!hidden);
                if (e.key === "Backspace")
                    node.parentNode?.removeChild(node);
            }}
            className={css({
                color,
                paddingLeft: 20 * level,
            },{
                "&:hover:not(:focus)": {
                    background: "#73f4",
                },
                "&:focus": {
                    background: "#73f6"
                },
                [`.${domEltExporerClassName}:hover > &:not(:hover)`]: {
                    background: "#73f2",
                },
            })}
        >
            <div
                style={{
                    borderLeft: (node.childNodes.length > 0 && hidden ? 5 : 1)+"px solid",
                    paddingLeft: 10,
                }}
            >
                {content}
            </div>
        </div>
    )
}

function DomEltChildren({
    node,
    level,
    hidden,
    showingNode,
    showParents,
}:{
    node:Node,
    level:number,
    hidden?:boolean,
    showingNode:Node|null,
    showParents:()=>void,
}) {
    const [children,setChildren] = useState([...node.childNodes].filter(v=> v !== rootElt));

    useEffect(()=>{
        const mo = new MutationObserver((e)=>{
            for (const r of e) {
                if (r.addedNodes.length || r.removedNodes.length)
                    setChildren([...node.childNodes].filter(v=> v !== rootElt));
            }
        })
        mo.observe(node,{childList:true});

        return ()=>{
            mo.disconnect();
        };
    },[node]);

    return (
        <div style={{
            userSelect: "none",
            fontFamily: "monospace",
            display: hidden ? "none" : "block",
        }}>
            {children.map((v,i)=>(
                <DomEltExporer
                    node={v}
                    level={level+1}
                    key={i}
                    isOnlyChild={children.length===1}
                    showingNode={showingNode}
                    showParents={showParents}
                />
            ))}
        </div>
    );
}

const domEltExporerClassName = "dom-elt-explorer";
function DomEltExporer({
    node,
    level,
    isOnlyChild,
    showingNode,
    showParents,
}:{
    node:Node,
    level:number,
    isOnlyChild:boolean,
    showingNode:Node|null,
    showParents:()=>void,
}) {
    const [hidden_,setHidden] = useState(
        !(
            node === document.body || node === document.body.parentNode
        )
    );
    const focusableRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        if (showingNode === node) {
            setHidden(false);
            showParents();
            setTimeout(()=>{
                focusableRef.current?.focus();
                focusableRef.current?.scrollIntoView();
            });
        }
    },[showingNode,node,showParents]);

    const hidden = hidden_ && !(node.childNodes.length === 1 && isNode.text(node.childNodes[0]))

    return (
        <div className={domEltExporerClassName}>
            <DomEltHeader {...{node,level,hidden,setHidden,isOnlyChild}}
                htmlRef={focusableRef}
            />
            <DomEltChildren {...{node,level,hidden,showingNode}}
                showParents={useCallback(()=>{
                    showParents();
                    setHidden(false);
                },[showParents])}/>
        </div>
    )
}

export default function DomExplorer({height}:{height:number}) {
    const [showingNode,setShowingNode] = useState<Node|null>(null);
    const [picking,setPicking] = useState(false); 
    
    return (
        <div style={{
            height,
        }}>
            <div style={{
                height: 19,
                display: "flex",
            }}>
                <button
                    className={css({
                        border: "none",
                        background: picking ? "#8df" : "#eee",
                        color: "#334",
                        height: 20,
                        flex: "1 1",
                        fontFamily: "monospace",
                        "&:hover": {
                            background: picking ? "#8df" : "#eef",
                        },
                    })}
                    onClick={()=>{
                        setPicking(true);
                        setTimeout(()=>{
                            window.addEventListener("click",e=>{
                                e.preventDefault();
                                setPicking(false);
                                setShowingNode(e.target as Node);
                            },{once: true, capture:true});
                        })
                    }}
                >pick elt</button>
            </div>
            <div style={{
                overflow: "scroll",
                height: height - 20,
            }}>
                <DomEltChildren node={document} level={0} showingNode={showingNode} showParents={()=>{}}/>
            </div>
        </div>
    )
}