import { ConsoleLevel, ConsoleLine } from "./ConsoleLine";
import { TODO } from "../../util/TODO";

type C = Omit<typeof window.console,"Console">;


export const realConsole:C = Object.fromEntries(
    Object.entries(console)
        .filter(([,v])=>v instanceof Function)
        .map(([k,v]:[string,Function])=>[
            k, v.bind(console),
        ]),
) as C;


export const consoleLines:ConsoleLine[] = []
export const onConsoleLinesChange = new Set<()=>void>();

export function addInternalConsoleLine(line: ConsoleLine) {
    consoleLines.push(line);
    onConsoleLinesChange.forEach(h=>h());
}

const consoleInterceptionMap:C = {
    
    debug(...data: any[]) {
        addInternalConsoleLine(ConsoleLine.basic(ConsoleLevel.VERBOSE, data));
    },
    info(...data: any[]) {
        addInternalConsoleLine(ConsoleLine.basic(ConsoleLevel.INFO, data));
    },
    log(...data: any[]) {
        addInternalConsoleLine(ConsoleLine.basic(ConsoleLevel.LOG, data));
    },
    warn(...data: any[]) {
        addInternalConsoleLine(ConsoleLine.basic(ConsoleLevel.WARN, data));
    },
    error(...data: any[]) {
        addInternalConsoleLine(ConsoleLine.basic(ConsoleLevel.ERROR, data));
    },

    assert(condition?: boolean, ...data: any[]) {
        if (!condition)
            addInternalConsoleLine(ConsoleLine.assertionFail(data));
    },

    clear() {
        consoleLines.length = 0;
        addInternalConsoleLine(ConsoleLine.control("Cleared console."));
    },

    trace(...data: any[]) {
        const trace = new Error().stack!.split("\n").slice(1)
            .map(v=>v.trim().substring(3));
        addInternalConsoleLine(ConsoleLine.trace(trace))
    },

    count(label?: string) {
        TODO("handle console.count");
    },
    countReset(label?: string) {
        TODO("handle console.countReset");
    },
    dir(item?: any, options?: any) {
        TODO("handle console.dir");
    },
    dirxml(...data: any[]) {
        TODO("handle console.dirxml");
    },
    group(...data: any[]) {
        TODO("handle console.group");
    },
    groupCollapsed(...data: any[]) {
        TODO("handle console.groupCollapsed");
    },
    groupEnd() {
        TODO("handle console.groupEnd");
    },
    table(tabularData?: any, properties?: string[]) {
        TODO("handle console.table");
    },
    time(label?: string) {
        TODO("handle console.time");
    },
    timeEnd(label?: string) {
        TODO("handle console.timeEnd");
    },
    timeLog(label?: string, ...data: any[]) {
        TODO("handle console.timeLog");
    },
    timeStamp(label?: string) {
        TODO("handle console.timeStamp");
    },
    profile(label) {},
    profileEnd(label) {},
}

export type ConsoleInterceptions = {[k in keyof C]:Set<(...p:Parameters<C[k]>)=>void>};
export const consoleInterceptions = Object.fromEntries(
    Object.keys(realConsole).map(v=>[v,new Set()])
) as ConsoleInterceptions;

for (const key of Object.keys(realConsole) as (keyof ConsoleInterceptions)[]) {
    console[key] = (...params:any[])=>{
        consoleInterceptions[key].forEach(handler => handler(...params));
        (consoleInterceptionMap[key] as (...params:any[])=>void)(...params as any[]);
        (realConsole[key] as (...params:any[])=>void)(...params as any[]);
    }
}
window.addEventListener("error",e=>{
    consoleInterceptionMap.error("Uncaught",e.error)
})