// <reference types="../../../node_modules/axios"/>

//import axios from "axios"
import axios from "axios";
import io from "socket.io-client"
import {MessageType, MessageDataFields} from "../../types/socket"

let started = false;

window.onload = () => {
    M.AutoInit();

    const socket = io();

    const username = <HTMLInputElement>document.querySelector("#username");
    const password = <HTMLInputElement>document.querySelector("#password");
    const generateBtn = document.querySelector("#generateBtn");
    
    if (generateBtn !== null) {
        generateBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("Button clicked.")
            if (username && password)
            {
                //username.value = "[Generating...]";
                //password.value = "[Generating...]";
                //axios.get("https://example.com");
                //axios.get("/api/generate");
                console.log("button pressed2");
                

                socket.on("message", (response: MessageDataFields) => {
                    if (response.type === MessageType.STARTING) {
                        started = true;
                        document.querySelector("#generateBtn")!.classList.add("hide");
                        document.querySelector("#progressBar")!.classList.remove("hide");
                        M.toast({html: "<div class=\"deep-purple-text text-accent-1\"><b>Starting. Generating account...</b></div>", classes:"black"})
                        
                    }
                    else if (response.type === MessageType.MESSAGE) {
                        M.toast({html: `<div class=\"deep-purple-text text-accent-1\"><b>${response!.data!.message}</b></div>`, classes:"black", displayLength:10000})
                    }
                    console.log("new message with type: ", MessageType[response.type])
                });

                document.querySelector("#generateBtn")!.classList.add("disabled")
                setTimeout(() => {if (!started) document.querySelector("#generateBtn")!.classList.remove("disabled");}, 5000)
                socket.emit("message", {type: MessageType.GENERATE_CREDIENTIALS});
                //M.updateTextFields();
            }
        });
    }
};