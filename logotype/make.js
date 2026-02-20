// Copyright (c) Maksim Pinigin <at@pinig.in>. Licensed under the MIT Licence.
// See the LICENCE file in the repository root for full licence text.

import nodeHtmlToImage from 'node-html-to-image';
import { readFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';

if(process.argv.length > 2) {
    if(process.argv[2] === "clean") {
        rmSync("./output", {
            recursive: true
        });

        console.log("Cleaned up.");
    } else {
        console.log("Unknown argument");
    }
    process.exit(0);
}

if(!existsSync("./output")) {
    mkdirSync("./output");
}

(async () => {
    nodeHtmlToImage({
        output: './output/logotype-round-1024x1024.png',
        html: readFileSync('./logotype.html', 'utf8')
            .replace("_BODY_PADDING_", "1rem")
            .replace("_MAIN_BORDER_RADIUS_", "100px"),
        puppeteerArgs: {
            defaultViewport: {
                width: 1024,
                height: 1024
            }
        }
    }).then(() => {
        console.log(`Created "logotype-round-1024x1024.png"`);
    });

    nodeHtmlToImage({
        output: './output/logotype-strong_square-1024x1024.png',
        html: readFileSync('./logotype.html', 'utf8')
            .replace("_BODY_PADDING_", "0")
            .replace("_MAIN_BORDER_RADIUS_", "0"),
        puppeteerArgs: {
            defaultViewport: {
                width: 1024,
                height: 1024
            }
        }
    }).then(() => {
        console.log(`Created "logotype-strong_square-1024x1024.png"`);
    });
})();

