// <reference types="../../../node_modules/axios"/>

//import axios from "axios"
import io from "socket.io-client"
import {MessageType, MessageDataFields} from "../../types/socket"

let started = false;
let done = false;

window.onload = () => {
    let tooltipElements = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(tooltipElements, {exitDelay:800});
    M.AutoInit();

    tooltipElements.forEach((element) => {
        if (!element!.parentElement!.classList.contains("copyable-field"))
            return;

        (<HTMLAnchorElement>element).addEventListener("click", function () {
            const inputElement = this.parentElement!.querySelector("input");
            inputElement!.focus();
            inputElement!.select();
            document.execCommand("copy");

            const element = this;
            const tooltipInstance = M.Tooltip.getInstance(this);

            tooltipInstance.options.exitDelay = 2000;
            changeTooltipText(element, "Copied!", true);
            (<any>window).test = tooltipInstance;
            setTimeout(() => {
                tooltipInstance.options.exitDelay = 800;
                changeTooltipText(element, "Tap to copy", false)
            }, 2300); 
        });
    });

    const socket = io();
    
    const username = <HTMLInputElement>document.querySelector("#username");
    const password = <HTMLInputElement>document.querySelector("#password");
    const generateBtn = document.querySelector("#generateBtn");
    const progressBar = document.querySelector("#progressBar");

    if (generateBtn != undefined && progressBar != undefined) {
        generateBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("Button clicked.")
            if (username && password)
            {
                socket.on("message", (response: MessageDataFields) => {
                    if (response.type === MessageType.STARTING) {
                        started = true;
                        generateBtn.classList.add("hide");
                        progressBar.classList.remove("hide");
                        M.toast({html: "<div class=\"deep-purple-text text-accent-1\"><b>Starting. Generating account...</b></div>", classes:"black"})
                        
                    }
                    else if (response.type === MessageType.MESSAGE) {
                        M.toast({html: `<div class=\"deep-purple-text text-accent-1\"><b>${response!.data!.message}</b></div>`, classes:"black", displayLength:10000})
                    }
                    else if (response.type === MessageType.FINISHED_SUCCESS) {
                        M.toast({html: `<div class=\"black-text text-accent-1\"><b>Credientials are ready to use!</b></div>`, classes:"green lighten-2", displayLength:300000, activationPercent:1});
                        username.value = <string>response.data!.username;
                        password.value = <string>response.data!.password;

                        progressBar.classList.add("hide");
                        generateBtn.classList.remove("hide");
                        generateBtn.classList.add("disabled");
                        generateBtn.innerHTML = "Finished!"
                        socket.close();
                        done = true;
                    }
                    else if (response.type === MessageType.FINISHED_FAILURE) {
                        M.toast({html: `<div class=\"black-text text-accent-1\"><b>${response!.data!.message}</b></div>`, classes:"red lighten-2", displayLength:300000, activationPercent:1})
                        progressBar.classList.add("hide");
                        generateBtn.classList.remove("hide");
                        generateBtn.classList.add("disabled");
                        generateBtn.innerHTML = "ERROR!!"
                        done = true;
                    }
                    console.log("new message with type: ", MessageType[response.type])
                });

                if (!done) {
                    generateBtn.classList.add("disabled")
                    setTimeout(() => {if (!started && !done) generateBtn.classList.remove("disabled");}, 5000)
                    socket.emit("message", {type: MessageType.GENERATE_CREDIENTIALS});
                    //M.updateTextFields();
                }
            }
        });
    }
};

function changeTooltipText(tooltippedElement: HTMLElement, text: string, showChangesLive: boolean) {
    const tooltipInstance = M.Tooltip.getInstance(tooltippedElement);
    const oldEnterDelay = tooltipInstance.options.enterDelay;
    const oldExitDelay = tooltipInstance.options.exitDelay;

    tooltippedElement.dataset.tooltip = text;
    tooltipInstance.options.exitDelay = 0;
    tooltipInstance.options.enterDelay = 0;
    tooltipInstance.close();
    tooltipInstance.options.exitDelay = oldExitDelay;
    showChangesLive && tooltipInstance.open();
    tooltipInstance.options.enterDelay = oldEnterDelay;
}