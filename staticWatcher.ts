//const chokidar = require("chokidar")
import chokidar from "chokidar"
import child_process from "child_process"

const staticWatcher = chokidar.watch(["./src/public/**"], {ignored:"./src/public/js/**"}); // Watching all static files (except js files)
const bundlejsWatcher = chokidar.watch("./src/public/js/"); 


staticWatcher.on("ready", () => {
    console.log("[static-watcher] ready for file changes...");
    staticWatcher.on("all", (event, path) => {
        console.log(`[static-watcher] Event [${event}] on file/folder [${path}].`);
        child_process.execSync("npm run copy-static-assets");
        console.log(`[static-watcher] Copied static assets.`);
    })
});

bundlejsWatcher.on("ready", () => {
    console.log("[bundlejs-watcher] ready for file changes...");
    bundlejsWatcher.on("change", path => {
        console.log(`[bundlejs-watcher] The file/folder [${path}] has been changed.`);
        child_process.execSync("npm run build-bundle-js");
        console.log(`[bundlejs-watcher] Rebuilt and bundled JS files.`);
    });
});