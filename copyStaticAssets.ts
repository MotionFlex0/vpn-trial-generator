import * as shell from "shelljs";
import path from "path";
import fs from "fs";

//Wrapper for shell.cp + creates folder structure as needed
const shell_cp = (options: string, source: string, dest: string) => { 
    const destFolder = dest.endsWith("/") ? dest : path.join(path.dirname(dest), "/");

    if (destFolder.includes("/src/"))
    {
        console.log("[clean-up] destPath included /src/ dir. Aborting...");
        return;
    }
    

    if (!fs.existsSync(destFolder))
        shell.mkdir("-p", destFolder);

    shell.cp(options, source, dest);
}

shell_cp("-R", "src/public/css/.", "dist/public/css/");
shell_cp("-R", "src/public/img/.", "dist/public/img/");
console.log("***cp error here is not a problem***")
