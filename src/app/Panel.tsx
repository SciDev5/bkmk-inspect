import React from "react"
import { destroyApp } from "..";

const HEADER_HEIGHT = 20;

export default function Panel(props:{
    children:React.ReactNode,
    width:number,
    height:number,
    setSize:(width:number,height:number)=>void,
}) {
    const [pos,setPos] = React.useState({x:20,y:20});
    const [minimize,setMinimize] = React.useState(false);
    const [mouseDown,setMouseDown] = React.useState(false);
    const z = React.useRef<HTMLDivElement>(null);
    const ze = z.current, {setSize} = props;

    const {width,height} = props;

    React.useEffect(()=>{
        if (!ze || minimize || !mouseDown) return;

        const r = new ResizeObserver((roe)=>{
            for(const {target} of roe) {
                const newWidth = target.clientWidth+1, newHeight = target.clientHeight-HEADER_HEIGHT;
                if (Math.abs(newWidth - width) > 3 ||Math.abs(newHeight - height) > 3)
                    setSize(
                        newWidth,
                        newHeight,
                    );
            }
        });

        r.observe(ze);
        return ()=>{
            r.disconnect();
        }
    },[ze,setSize,minimize,mouseDown,width,height])

    return (
        <div
            ref={z}
            style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                width: props.width,
                minWidth: 150,
                minHeight: minimize ? HEADER_HEIGHT : 200,
                height: (minimize ? HEADER_HEIGHT : props.height + HEADER_HEIGHT) + 1,
                
                background: "#ffffff",
                border: "1px solid #77777777",
                borderRadius: "3px",
                color: "#000000",

                overflow: "hidden",

                zIndex: 999999,

                resize: minimize ? "horizontal" : "both",
            }}
            onMouseDown={e=>{
                const elt = e.currentTarget;
                setMouseDown(true);
                const
                    oldWidth = elt.clientWidth+1,
                    oldHeight = elt.clientHeight-HEADER_HEIGHT;
                    
                window.addEventListener("mouseup",()=>{
                    setMouseDown(false);
                    const
                        newWidth = elt.clientWidth+1,
                        newHeight = elt.clientHeight-HEADER_HEIGHT;
                    
                    if (Math.abs(newWidth - oldWidth) > 3 ||Math.abs(newHeight - oldHeight) > 3)
                        setSize(
                            newWidth,
                            newHeight,
                        );
                },{once:true})
            }}
        >
            <PanelHeader 
                moveIt={(dx,dy)=>{
                    pos.x += dx;
                    pos.y += dy;
                    setPos({...pos});
                }}
                endDrag={()=>{
                    setPos({
                        x: Math.min(window.innerWidth-props.width,Math.max(0,pos.x)),
                        y: Math.min(window.innerHeight-30, Math.max(0,pos.y)),
                    });
                }}
                {...{minimize,setMinimize}}
            />
            {!minimize && (
                <PanelBody content={props.children} height={props.height} />
            )}
        </div>
    )
}

function PanelHeader(props:{
    moveIt:(dx:number,dy:number)=>void,
    endDrag:()=>void,
    minimize:boolean,setMinimize:(v:boolean)=>void},
) {
    return (
        <div
            style={{
                background: "#eee",
                height: HEADER_HEIGHT,
                lineHeight: HEADER_HEIGHT+"px",
                paddingLeft: "5px",
                userSelect: "none",
                position: "relative",

                fontFamily: "monospace",
            }}
            onMouseDown={({pageX:x0,pageY:y0})=>{
                let ended = false, x = x0, y = y0;
                const dragEv = ({pageX:nx,pageY:ny}:MouseEvent)=>{
                    const dx = nx - x, dy = ny - y;
                    x = nx;
                    y = ny;
                    props.moveIt(dx,dy);
                };
                const endDrag = (e:MouseEvent)=>{
                    if (ended) return;
                    ended = true;

                    window.removeEventListener("mousemove",dragEv);
                    props.endDrag();
                }
                window.addEventListener("mousemove",dragEv);
                window.addEventListener("mouseup",endDrag,{once:true});
                window.addEventListener("mouseleave",endDrag,{once:true});
            }}
        >
            :: CrInspect v{process.env.REACT_APP_VERSION}{process.env.NODE_ENV === "development" ? " [DEV BUILD]" : null}
            
            <button
                style={{
                    position: "absolute",
                    right: 40,
                    top: 0,
                    bottom: 0,
                    width: 40,
                    background: "#ddd",
                    border: "none",
                }}
                onClick={e=>{
                    props.setMinimize(!props.minimize);
                }}
            >
                {props.minimize ? "+" : "-"}
            </button>
            <button
                style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 40,
                    background: "#ebd5d9",
                    border: "none",
                }}
                onClick={e=>{
                    destroyApp();
                }}
            >
                x
            </button>
        </div>
    )
}

function PanelBody(props:{
    content:React.ReactNode,
    height:number,
}) {
    return (
        <div style={{
            height: props.height,
        }}>
            {props.content}
        </div>
    )
}