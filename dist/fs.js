/// <reference path="fs.d.ts" />
import LightningFS from '@isomorphic-git/lightning-fs';
// 建立虛擬檔案系統
const fs = new LightningFS('fs');
let currentDir = "/"; // 記錄現在在哪個資料夾
let gitBashEle = document.getElementById("gitBash");
// 顯示提示符號的函式（像是 C:/ $ 這樣）
const gitBashShow = (value) => {
    if (gitBashEle instanceof HTMLTextAreaElement) {
        gitBashEle.value += `\n${value} $ `;
        gitBashEle.scrollTop = gitBashEle.scrollHeight; // 自動捲到最下面
    }
};
// 執行指令的函式
const executeCommand = async (command) => {
    // 把指令用空格分開，變成陣列
    // 例如: "mkdir test" 會變成 ["mkdir", "test"]
    const commandArgv = command.trim().split(/\s+/);
    const cmd = commandArgv[0]; // 第一個是指令名稱
    try {
        switch (cmd) {
            case "mkdir": // 建立資料夾
                if (commandArgv.length < 2) {
                    return "mkdir: 你沒有說要建立什麼資料夾";
                }
                // 如果路徑開頭是 / 就是完整路徑，不是的話要加上現在的路徑
                const dirPath = commandArgv[1].startsWith('/')
                    ? commandArgv[1]
                    : `${currentDir}/${commandArgv[1]}`.replace(/\/+/g, '/');
                await fs.promises.mkdir(dirPath);
                return "";
            case "echo": // 輸出文字或寫入檔案
                // 如果有 > 符號，就是要寫入檔案
                // 例如: echo "哈囉" > test.txt
                if (commandArgv.length < 4 || commandArgv[2] !== ">") {
                    // 沒有 > 就只是把文字印出來
                    return commandArgv.slice(1).join(" ").replace(/"/g, "");
                }
                const content = commandArgv[1].replace(/"/g, "");
                const filename = commandArgv[3];
                const filePath = filename.startsWith('/')
                    ? filename
                    : `${currentDir}/${filename}`.replace(/\/+/g, '/');
                await fs.promises.writeFile(filePath, content);
                return "";
            case "cat": // 讀取檔案內容
                if (commandArgv.length < 2) {
                    return "cat: 你沒有說要讀取哪個檔案";
                }
                const readPath = commandArgv[1].startsWith('/')
                    ? commandArgv[1]
                    : `${currentDir}/${commandArgv[1]}`.replace(/\/+/g, '/');
                const fileContent = await fs.promises.readFile(readPath, { encoding: 'utf8' });
                return fileContent;
            case "ls": // 列出資料夾裡的檔案
                const lsPath = commandArgv.length > 1 ? commandArgv[1] : currentDir;
                const files = await fs.promises.readdir(lsPath);
                return files.join("  ");
            case "cd": // 切換資料夾
                if (commandArgv.length < 2) {
                    currentDir = "/"; // 沒有指定就回到根目錄
                }
                else {
                    const newDir = commandArgv[1].startsWith('/')
                        ? commandArgv[1]
                        : `${currentDir}/${commandArgv[1]}`.replace(/\/+/g, '/');
                    // 先確認這個資料夾存在
                    await fs.promises.readdir(newDir);
                    currentDir = newDir;
                }
                return "";
            case "pwd": // 顯示現在在哪個資料夾
                return currentDir;
            case "clear": // 清空畫面
                if (gitBashEle) {
                    gitBashEle.value = "";
                }
                return "";
            case "": // 如果沒有輸入任何東西
                return "";
            default: // 如果輸入的指令不認識
                return `${cmd}: 找不到這個指令`;
        }
    }
    catch (error) {
        // 如果執行時發生錯誤，就顯示錯誤訊息
        return `錯誤: ${error instanceof Error ? error.message : String(error)}`;
    }
};
// 當按下按鍵時（還沒放開）
window.addEventListener("keydown", async (event) => {
    // 如果按的是 Enter 鍵
    if (event.key === "Enter" && gitBashEle instanceof HTMLTextAreaElement) {
        event.preventDefault(); // 阻止預設的換行
        // 取得最後一行的內容
        const lines = gitBashEle.value.split("\n");
        const lastLine = lines[lines.length - 1];
        // 找出 $ 符號後面的指令
        // 例如: "/ $ mkdir test" 會取出 "mkdir test"
        const promptPattern = /\$ (.*)$/;
        const match = lastLine.match(promptPattern);
        const command = match ? match[1].trim() : "";
        // 執行指令
        const output = await executeCommand(command);
        // 如果有結果要顯示，就加到畫面上
        if (output) {
            gitBashEle.value += `\n${output}`;
        }
    }
});
// 當放開按鍵時
window.addEventListener("keyup", async (event) => {
    // 如果放開的是 Enter 鍵
    if (event.key === "Enter" && gitBashEle instanceof HTMLTextAreaElement) {
        gitBashShow(currentDir); // 顯示新的提示符號和路徑
    }
});
//# sourceMappingURL=fs.js.map