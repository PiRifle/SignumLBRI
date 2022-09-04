import { DOMImplementation, XMLSerializer } from 'xmldom';
import JsBarcode from 'jsbarcode';

const xmlSerializer = new XMLSerializer();
export function generateEAN13(n: number):string {
        var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   
        
        if ( n > max ) {
                return generateEAN13(max) + generateEAN13(n - max);
        }
        
        max        = Math.pow(10, n+add);
        var min    = max/10; // Math.pow(10, n) basically
        var number = Math.floor( Math.random() * (max - min + 1) ) + min;
        
        return ("" + number).substring(add).replaceAll("0", "1"); 
    }
export function generateBarcode(id: number){
    const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    console.log("generating barcode");
    try{
        JsBarcode(svgNode, id.toString(), {
            format: "ean13",
            xmlDocument: document,
            displayValue: false,
        });

    }catch(e){
        console.log(e)
    }
    
    return xmlSerializer.serializeToString(svgNode);
}