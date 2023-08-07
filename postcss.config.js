module.exports = {
    syntax: "postcss-scss",
    parser: require("postcss-comment"),
    plugins: {
        // "postcss-url": {},
        // "postcss-nested":{},
        // // "postcss-easy-import": { prefix: "_", extensions: [".css", ".scss"] },
        // // "@csstools/postcss-sass": {},
        "tailwindcss": {},
        "autoprefixer": {},

    }
    
};