import { DOMImplementation, XMLSerializer } from 'xmldom';
import JsBarcode from 'jsbarcode';

const xmlSerializer = new XMLSerializer();

export function generateBarcode(id: number){
    const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    JsBarcode(svgNode, id.toString(), {
        xmlDocument: document,
    });
    
    return xmlSerializer.serializeToString(svgNode);
}