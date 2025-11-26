/// <reference path="fs.d.ts" />
import LightningFS from '@isomorphic-git/lightning-fs'
var commad:string;
const fs = new LightningFS('fs');  // 建立虛擬檔案系統
window.addEventListener("keydown", async (Event)=>{
    let gitBashEle = document.getElementById("gitBash");
    if(gitBashEle instanceof HTMLTextAreaElement){
        const dir = "/";
        commad = gitBashEle.value.split("\n")[gitBashEle.value.split("\n").length-1];
        let commadArgv = commad.split(/\s+/);
        switch(commadArgv[0]){
            case "mkdir":
                await fs.promises.mkdir(dir);
                break;
            case "echo":
                await fs.promises.writeFile(`${dir}/${commadArgv[3]}`, commadArgv[1].replace("\"", ""));
                break;
            case "cat":
                await fs.promises.readFile(commadArgv[1]);

                
        }
        gitBashEle.value += `${dir} $`
    }
})