const fs = require("fs/promises");


(async()=>{


    try {
        let mainJSLoc = "";
        const dir = await fs.opendir("./build/static/js");
        for await (const {name} of dir) {
            if (/^main\.[0-9a-f]*?\.js$/.test(name)) {
                mainJSLoc = name;
                break;
            }
        }
        const js = await fs.readFile("./build/static/js/"+mainJSLoc,{encoding:"utf8"});

        const out = `javascript:${encodeURIComponent(js)}`;
        
        await fs.writeFile("./build/bookmarkified.txt",out,{encoding:"utf8"});

        console.log("done repacking. see /build/bookmarkified.txt");
    } catch (err) {
        console.error(err);
    }

})()