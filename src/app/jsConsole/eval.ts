import { ConsoleLine } from "./ConsoleLine";
import { addInternalConsoleLine } from "./logIntercept";

let evalOk = false;
// eslint-disable-next-line no-eval
try {evalOk = eval("true")} catch (e) {}

export { evalOk };

export function evalAndLog(
    jsSource: string,
) {
    if (!evalOk) console.error("!! Page disabled javascript injection !!");
    
    addInternalConsoleLine(ConsoleLine.evalIn(jsSource));
    try {
        // eslint-disable-next-line no-eval
        const result = eval(jsSource);
        addInternalConsoleLine(ConsoleLine.evalOut(result));
    } catch (e) {
        console.error(e);
    }

    
}