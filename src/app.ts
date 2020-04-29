import exphbs from 'express-handlebars'
import express, {Application, Request, Response, NextFunction} from 'express';
import http from "http"
import path from 'path'
import puppeteer from "puppeteer"
import socketio from "socket.io"
import { MessageType, MessageDataFields } from "./types/socket"
import { email } from "./utils/email"
import { constructInfoMessage, constructFailureMessage, constructSuccessMessage } from "./utils/message"
import { protonvpn } from './utils/protonvpn';

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
    const incogBrowser = await browser.createIncognitoBrowserContext();
    const emailPage = new email(await incogBrowser.newPage());
    const vpnPage = new protonvpn(await incogBrowser.newPage())
    
    socket.on("message", async (response: MessageDataFields) => {
        if (response.type === MessageType.GENERATE_CREDIENTIALS) {
            console.log("[socket] MessageType.GENERATE_CREDIENTIALS")
            socket.emit("message", {type: MessageType.STARTING});
            
            await emailPage.open()
            socket.emit("message", constructInfoMessage(`Created new email address: ${emailPage.email}`));

            const success = await vpnPage.signup(emailPage.email);
            if(success) {
                socket.emit("message", constructInfoMessage(`Account creation process started. Verifying email.`));
            
                const verificationEmail = await (new Promise<ReturnType<typeof emailPage.getEmailContent>>((resolve) => {
                    const interval = setInterval(async () => {
                        const emailCount = await emailPage.getEmailCount();
                        console.log(`There is currently ${emailCount} email(s).`)
                        if (emailCount > 0) {
                            const emailList = await emailPage.getEmailList();
                            if(emailList) {
                                const protonEmail = emailList.reduce((prevEmail, email) => {
                                   return (email.subject == "Proton Verification Code" ? email : prevEmail);
                                });

                                if (protonEmail !== undefined) {
                                    clearInterval(interval);
                                    resolve(emailPage.getEmailContent(protonEmail.mailId));
                                }
                            }
                        }
                    }, 5000);
                }));

                socket.emit("message", constructInfoMessage(`Received verification code.`));
                const verfifcationCode = verificationEmail.content.match(/<code.*>(\d+)<\/code>/i)![1];
                const accountCreated = await vpnPage.verfiyEmailAddress(verfifcationCode);
                if (accountCreated) {
                    socket.emit("message", constructInfoMessage("Account created successfully. Login details are now available."));
                    socket.emit("message", constructSuccessMessage(vpnPage.username, vpnPage.password));
                    socket.disconnect(true);
                }
            }
            else {
                socket.emit("message", constructFailureMessage("Failed to create account. Shutting down. Try again later."));
                if (vpnPage.smsOnly)
                    socket.emit("message", constructFailureMessage("SMS verification ONLY. Try again later."));
                socket.disconnect(true);
            }
        }
        console.log(`[socket] new message | type: MessageType.${MessageType[response.type]}`)
    });

    socket.on('disconnecting', (reason) => {
        emailPage.close();
        vpnPage.close();
        incogBrowser.close();
    });

    console.log("new connection.");
});

server.listen(5000, async () => {
    browser = await puppeteer.launch();//TEST MODE: puppeteer.launch({headless:false});
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