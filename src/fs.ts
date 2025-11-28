import LightningFS from '@isomorphic-git/lightning-fs'

// 建立虛擬檔案系統
const fs = new LightningFS('fs');
let currentDir = "~";  // 記錄現在在哪個資料夾（~ 代表家目錄）
let gitBashEle = document.getElementById("gitBash");

// 網頁載入完成時，顯示第一個提示符號
window.addEventListener("DOMContentLoaded", () => {
    gitBashEle = document.getElementById("gitBash");
    if (gitBashEle instanceof HTMLTextAreaElement) {
        gitBashEle.value = `${currentDir} $ `;
    }
});

// 顯示提示符號的函式（像是 C:/ $ 這樣）
const gitBashShow = (value: string): void => {
    if (gitBashEle instanceof HTMLTextAreaElement) {
        gitBashEle.value += `\n${value} $ `;
        gitBashEle.scrollTop = gitBashEle.scrollHeight;  // 自動捲到最下面
    }
}

// 執行指令的函式
const executeCommand = async (command: string): Promise<string> => {
    // 把指令用空格分開，變成陣列
    // 例如: "mkdir test" 會變成 ["mkdir", "test"]
    const commandArgv = command.trim().split(/\s+/);
    const cmd = commandArgv[0];  // 第一個是指令名稱
    
    try {
        switch(cmd) {
            case "mkdir":  // 建立資料夾
                if (commandArgv.length < 2) {
                    return "mkdir: 你沒有說要建立什麼資料夾";
                }
                // 如果路徑開頭是 / 就是完整路徑，不是的話要加上現在的路徑
                const dirPath = commandArgv[1].startsWith('/') 
                    ? commandArgv[1] 
                    : `${currentDir === "~" ? "" : currentDir}/${commandArgv[1]}`.replace(/\/+/g, '/');
                
                try {
                    await fs.promises.mkdir(dirPath);
                } catch (error) {
                    // 如果資料夾已經存在，不顯示錯誤
                    if (error instanceof Error && 'code' in error && error.code !== 'EEXIST') {
                        return `mkdir: 無法建立資料夾 '${commandArgv[1]}'`;
                    }
                }
                return "";
                
            case "echo":  // 輸出文字或寫入檔案
                // 如果有 > 符號，就是要寫入檔案
                // 例如: echo "哈囉" > test.txt
                const gtIndex = commandArgv.indexOf(">");
                if (gtIndex > 0 && commandArgv.length > gtIndex + 1) {
                    // 有 > 符號，把 echo 和 > 之間的所有文字合併
                    const content = commandArgv.slice(1, gtIndex).join(" ").replace(/"/g, "");
                    const filename = commandArgv[gtIndex + 1];
                    const filePath = filename.startsWith('/') 
                        ? filename 
                        : `${currentDir === "~" ? "" : currentDir}/${filename}`.replace(/\/+/g, '/');
                    await fs.promises.writeFile(filePath, content);
                    return "";
                } else {
                    // 沒有 > 就只是把文字印出來
                    return commandArgv.slice(1).join(" ").replace(/"/g, "");
                }
                
            case "cat":  // 讀取檔案內容
                if (commandArgv.length < 2) {
                    return "cat: 你沒有說要讀取哪個檔案";
                }
                const readPath = commandArgv[1].startsWith('/') 
                    ? commandArgv[1] 
                    : `${currentDir === "~" ? "" : currentDir}/${commandArgv[1]}`.replace(/\/+/g, '/');
                const fileContent = await fs.promises.readFile(readPath, { encoding: 'utf8' });
                return fileContent;
                
            case "ls":  // 列出資料夾裡的檔案
                const lsPath = commandArgv.length > 1 ? commandArgv[1] : currentDir;
                const files = await fs.promises.readdir(lsPath);
                return files.join("  ");
                
            case "cd":  // 切換資料夾
                if (commandArgv.length < 2) {
                    currentDir = "~";  // 沒有指定就回到家目錄
                } else if (commandArgv[1] === "~") {
                    currentDir = "~";  // cd ~ 回到家目錄
                } else {
                    const newDir = commandArgv[1].startsWith('/') 
                        ? commandArgv[1] 
                        : `${currentDir === "~" ? "" : currentDir}/${commandArgv[1]}`.replace(/\/+/g, '/');
                    // 先確認這個資料夾存在
                    try {
                        await fs.promises.readdir(newDir);
                        currentDir = newDir;
                    } catch (error) {
                        return `cd: ${commandArgv[1]}: 找不到資料夾`;
                    }
                }
                return "";
                
            case "pwd":  // 顯示現在在哪個資料夾
                return currentDir === "~" ? "~" : currentDir;
                
            case "clear":  // 清空畫面
                if (gitBashEle instanceof HTMLTextAreaElement) {
                    gitBashEle.value = "";
                }
                return "";
                
            case "":  // 如果沒有輸入任何東西
                return "";
                
            default:  // 如果輸入的指令不認識
                return `${cmd}: 找不到這個指令`;
        }
    } catch (error) {
        // 如果執行時發生錯誤，就顯示錯誤訊息
        return `錯誤: ${error instanceof Error ? error.message : String(error)}`;
    }
}
async function execALotLine(commands: string[]): Promise<void> {
    for (let command of commands) {
        let output = await executeCommand(command);
        if (output && gitBashEle instanceof HTMLTextAreaElement) {
            gitBashEle.value += `\n${output}`;
        }
    }
}

window.addEventListener("keydown", async (event: KeyboardEvent) => {
    if (event.key === "Enter" && gitBashEle instanceof HTMLTextAreaElement) {
        event.preventDefault();
        
        const lastPromptIndex = gitBashEle.value.lastIndexOf('$ ');
        
        if (lastPromptIndex === -1) {
            return;
        }
        
        // 取得 $ 後面的文字（+2 是跳過 "$ "）
        const allCommands = gitBashEle.value.slice(lastPromptIndex + 2);
        
        // 分割成多行，去除空白，過濾空字串
        const commands = allCommands.split("\n").map(c => c.trim()).filter(c => c !== "");
        
        // 執行所有指令
        await execALotLine(commands);
    }
});

// 當放開按鍵時
window.addEventListener("keyup", async (event: KeyboardEvent) => {
    // 如果放開的是 Enter 鍵
    if (event.key === "Enter" && gitBashEle instanceof HTMLTextAreaElement) {
        gitBashShow(currentDir);  // 顯示新的提示符號和路徑
    }
});