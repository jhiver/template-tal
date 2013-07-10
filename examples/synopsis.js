var tal  = require ('template-tal');
var xml  = getXMLString();
var data = { bar: 'BAZ' };
console.log (tal.process (xml, data));

function XMXString() {
    return 
        '<html>' + "\n" +
        '    <body tal:content="self.bar">Dummy Content</body>' + "\n" +
        '</html>';
}
