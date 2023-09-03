/* eslint-disable */
// @ts-nocheck
// import { pl } from ".";
import { Language } from ".";
import util from "util";

function dbgRun(stack=[]){
    return new Proxy({
        [Symbol.toPrimitive](hint){
            // console.log("hit toPrimitive", hint)
            // console.log("export", stack.join("."))
            return stack.join('.').toString()
        },
        [util.inspect.custom]() {
            // console.log("hit util inspect")
            return stack.join('.')
        },
        toJSON(){
            // console.log("hit toJson")
            return stack.join('.')
        }
        }, {
        get(t, p, r){
            // console.log(p, typeof(p))
            if (p == "toJSON"){
                return t.toJSON
            }
            if (typeof(p) == "symbol"){
                // console.log("hit toPrimitive")
                return Reflect.get(t,p,r);
                // return dbgRun([...stack])
            }

            return dbgRun([...stack, p])
        },
        
    })
}

export const dbg = dbgRun() as unknown as Language;
