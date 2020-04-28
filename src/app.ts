import exphbs from 'express-handlebars'
import express, {Application, Request, Response, NextFunction} from 'express';
import http from "http"
import path from 'path'
import puppeteer from "puppeteer"
import socketio from "socket.io"
import { MessageType, MessageDataFields } from "./types/socket"
import { email } from "./utils/email"
import { constructInfoMessage } from "./utils/message"

const app: Application = express();
const server = http.createServer(app);
const io = socketio(server);

let browser: puppeteer.Browser;

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '../views'));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', async (req: Request, res: Response, next: NextFunction) => { //next is optional
    res.render('index')
});

app.get('/api/generate', async(req: Request, res: Response) => {
    console.log("showing browser...");
    
    const incog = await browser.createIncognitoBrowserContext();
    const page = await incog.newPage();

    await page.goto("http://temp-mail.org")
    await page.screenshot({path: 'example.png'});
    await browser.close();
    res.send("done")

});

io.on("connection", async (socket) => {
    //const incogBrowser = await browser.createIncognitoBrowserContext();
    const emailPage = new email(await browser.newPage());
    //const vpnPage = await browser.newPage()
    

    socket.on("message", async (response: MessageDataFields) => {
        if (response.type === MessageType.GENERATE_CREDIENTIALS) {
            console.log("[socket] MessageType.GENERATE_CREDIENTIALS")
            socket.emit("message", {type: MessageType.STARTING});
            
            await emailPage.open()
            socket.emit("message", constructInfoMessage(`Created new email address: ${emailPage.email}`));
            setInterval(async () => { 
                const emailCount = await emailPage.getEmailCount();
                console.log(`There is currently ${emailCount} email(s).`)
                if (emailCount > 0) {
                    const emailList = await emailPage.getEmailList();
                    console.log("Here are the list of emails: ", emailList);
                }

            }, 5000)
            //emailPage.close();
        }
        console.log(`[socket] new message | type: MessageType.${MessageType[response.type]}`)
    });

    socket.on('disconnecting', (reason) => {
        emailPage.close();
    });

    console.log("new connection.");
});

server.listen(5000, async () => {
    browser = await puppeteer.launch({headless:false});
    console.log("server and browser are running");
});

/*
["exit", `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType:any) => {
    process.on(eventType, gracefilExit.bind(null, eventType));
  })

async function gracefilExit() {
    console.info("SIGINT signal received.");
    await browser.close();
    console.log("browser has shutdown.")
    console.log("exiting...");
    process.exit(0);
}
    /*server.close(() => {
        console.log("http server closed.");
        browser.close().then(() => {
            console.log("browser has shutdown.")
            console.log("exiting...");
            process.exit(0);
        }); 
    });*/
// });