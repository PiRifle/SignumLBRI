import postcss from "postcss";
import tailwindcss from "tailwindcss";
import type {Config} from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import glob from "glob";
import {dirname, basename, join} from "path";
import fs from "fs";
import config from "./tailwind.config";
// import config from "./tailwind.config"

async function generateTailwindCss(html:string) {
    return (await postcss([tailwindcss({
        ...(config as Config),
        content: [{ raw: html }]
    }), autoprefixer, cssnano])
        .process(`
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
    `)).css;
}


async function main(){

    // const css = generateTailwindCss('<div class="m-4">HTML content</div>')
    // css.then(console.log)
 
    const paths = glob.sync("views/email/**/*.pug");
    
    const tasks = paths.map(async (path)=>{

        const file = fs.readFileSync(path).toString();
        const basepath = dirname(path);
        const name = basename(path);

        const css = await generateTailwindCss(file);

        fs.writeFileSync(
            join(basepath, `${name.split(".")[0]}.html`),
            `<style>${css}</style>`
            );


    });

    await Promise.all(tasks);
    
    // for (const idx in paths){
        
    //     console.log(paths[idx])
    // }

}

main();