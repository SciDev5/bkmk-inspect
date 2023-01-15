const moddedWindow = window as {bkmkInstalled?:boolean};

if (moddedWindow.bkmkInstalled) {
    alert("There may only be one inspect window");
    throw new Error();
}

moddedWindow.bkmkInstalled = true;

export {};