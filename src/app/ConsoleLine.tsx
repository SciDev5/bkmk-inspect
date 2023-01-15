import React from "react";

export enum ConsoleLevel {
    VERBOSE, INFO, LOG, WARN, ERROR,
}
export type ConsoleLevelMap = {[k in ConsoleLevel]: boolean};

export class ConsoleLine {
    readonly id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    private constructor(
        private readonly level: ConsoleLevel|null,
        private readonly text: string,
        private readonly timestamp = new Date(),
    ) { }

    isShown(map: ConsoleLevelMap) {
        return this.level ? map[this.level] : true;
    }

    static Element({ line }: { line: ConsoleLine; }) {
        return (
            <div style={{
                fontFamily: "monospace",
                borderBlockStart: "1px solid",
                color: [
                    "#777",
                    "#257",
                    "#235",
                    "#fd2",
                    "#f24",
                    "#320",
                ][line.level ?? 5]
            }}>
                {line.text}
            </div>
        );
    }

    static control(
        text: string,
    ) {
        return new ConsoleLine(
            null,
            text,
        )
    }
    static trace(
        trace: string[],
    ) {
        return new ConsoleLine(
            ConsoleLevel.LOG,
            ":: STACK TRACE (console.trace) ::\n"+trace.join("\n"),
        );
    }
    static basic(
        level: ConsoleLevel,
        data: any[],
    ) {
        return new ConsoleLine(
            level,
            data.join(" "),
        )
    }
    static assertionFail(data: any[]) {
        return this.basic(ConsoleLevel.ERROR, [":: ASSERTION FAIL ::", ...data]);
    }
    static evalIn(
        data: string,
    ) {
        return new ConsoleLine(
            null,
            ":: > " + data,
        )
    }
    static evalOut(
        data: any,
    ) {
        return new ConsoleLine(
            null,
            ":: < " + data,
        )
    }
}
