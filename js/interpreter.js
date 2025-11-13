import { Block, obs } from "./index.js";
import { Commands } from "./commands.js";

export const Blocks = {};

function trimString(str) {
    if(str.length < 3) return "";
    return str.slice(1, str.length-1);
}

function splitArgs(line) {
    let inQuotes = false;
    let temp = "";
    let quotesCount = 0;
    let chars = line.split('');
    let args = [];  
    for(let i = 0; i < chars.length; i++) {
        if (i-1 > 0 && chars[i-1] === "\\") {
            temp += chars[i];
        } else if (chars[i] === '"') {
            inQuotes = !inQuotes;
            quotesCount++;
            if(i == chars.length-1) {
                args.push(temp);
            }
        } else if (chars[i] === " " && !inQuotes) {
            args.push(temp);
            temp = ""
        } else if (i == chars.length-1 && !inQuotes) {
            temp += chars[i]
            args.push(temp)
            temp = ""
        } else {
            temp += chars[i];
        }
    }
    
    if(quotesCount%2 !== 0) {
        console.error("Unclosed quote found");
        return null;
    }

    console.log(args);

    return args;
}

export async function ParseScript(content) {
    const lines = content.replaceAll("\r", "").split("\n");
    for(let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if(line === "") continue;

        const args = splitArgs(line);
        if(args === null) {
            return i+1;
        }

        if(args.length === 4 && args[0] === "block" && line.slice(line.length-1) === "{" && lines.length > i+1) {
            const block = new Block(args[1], args[2]);

            for(let j = i+1; j < lines.length; j++) {
                const blockLine = lines[j].trim();
                if(blockLine === "}") break;

                block.code.push(splitArgs(blockLine));
            }

            Blocks[block.id] = block;
        }
    };

    console.log(`Result:\nBlocks: ${Object.keys(Blocks).length}`);
    Object.keys(Blocks).forEach(blockId => {
        console.log(Blocks[blockId]);
    });

    return true;
}

export async function ExecuteBlock(blockId) {
    if(!Blocks[blockId]) return;
    Blocks[blockId].code.forEach(line => {
        if(line.length !== 0 && Commands[line[0]]) {
            Commands[line[0]](line);
        }
    });
}
