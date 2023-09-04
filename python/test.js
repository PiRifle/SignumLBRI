// const util = require("util");

// function dbgRun(stack=[]){
//     return new Proxy((function(...args){return dbgRun(stack);}).bind({
//     // return new Proxy(({
//         [Symbol.toPrimitive](hint){
//             return stack.join(".").toString();
//         },
//         [util.inspect.custom]() {
//             return stack.join(".");
//         },
//         toJSON(){
//             return stack.join(".");
//         },
//         }), {
//         apply(t, a, args){
//             // console.log(stack)
//             return "";
//         },
//         get(t, p, r){
//             // console.log(p, typeof(p))
//             if (p == "toJSON"){
//                 return t.toJSON;
//             }
//             if (typeof(p) == "symbol"){
//                 // console.log("hit toPrimitive")
//                 return Reflect.get(t,p,r);
//                 // return dbgRun([...stack])
//             }

//             return dbgRun([...stack, p]);
//         },
        
//     });
// }

// const logger = dbgRun();

// const c = logger.a.v.c.d.e.f;

// console.log("logging", c);


