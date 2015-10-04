var tal  = require ('../lib/template-tal.js');

function getXMLString() {
  return '<!doctype html> <html> <head> <meta charset="utf-8"> <title tal:content="self.title">a title</title> </head> <body> <p>stuff</p> </body> </html>';
}


var xml  = getXMLString();
var data = {
    user: "Bob",
    basket: [ 'apple', 'banana', 'kiwi', 'mango' ],
};
console.log (tal.process (xml, data));
