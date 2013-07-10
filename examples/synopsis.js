var tal  = require ('../lib/template-tal.js');

function getXMLString() {
    return '<html>' + "\n" + '    <body tal:content="self.bar">Dummy Content</body>' + "\n" + '</html>';
}

var xml  = getXMLString();
var data = { bar: 'BAZ' };
console.log (tal.process (xml, data));
