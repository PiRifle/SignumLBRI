import { DOMImplementation, XMLSerializer } from 'xmldom';
import JsBarcode from 'jsbarcode';
// @ts-ignore: next-line
import EAN13 from 'jsbarcode/bin/barcodes/EAN_UPC/ean13'

const xmlSerializer = new XMLSerializer();
const checksum = (number: string) => {
  const res = number
    .substr(0, 12)
    .split("")
    .map((n) => +n)
    .reduce((sum, a, idx) => (idx % 2 ? sum + a * 3 : sum + a), 0);

  return (10 - (res % 10)) % 10;
};
function validate() {
		return (
			this.data.search(/^[0-9]{13}$/) !== -1 &&
			+this.data[12] === checksum(this.data)
		);
	}
export function generateRand(n: number):string {
        var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   
        
        if ( n > max ) {
                return generateRand(max) + generateRand(n - max);
        }
        
        max        = Math.pow(10, n+add);
        var min    = max/10; // Math.pow(10, n) basically
        var number = Math.floor( Math.random() * (max - min + 1) ) + min; 
        return ("" + number).substring(add).replaceAll("0", "1");
    }

export function generateEAN13(){
    var randNum = generateRand(12);
    return (randNum + checksum(randNum));
}

export function generateBarcode(id: number){
    const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    console.log("generating barcode");
    try{
        JsBarcode(svgNode, id.toString(), {
            format: "ean13",
            xmlDocument: document,
            // displayValue: false,
        });

    }catch(e){
        console.log(e)
    }
    
    return xmlSerializer.serializeToString(svgNode);
}