import {serializeError} from "serialize-error"

export function sendError(event:string, source:string, lineno:number, colno:number, error:Error){
    console.log(`sending error ${error.message}`)
    
    fetch("/error/send", {method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({...serializeError(error), agent: navigator.userAgent})})
}
