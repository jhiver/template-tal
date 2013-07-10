var tal  = require ('../lib/template-tal.js');

function getXMLString() {
    return '\
<p tal:condition="true:self.stuff">\n\
  self.stuff is true, let\'s do something.\n\
</p>\n\
<p tal:condition="false:self.stuff">\n\
  self.stuff is false, let\'s do something else.\n\
</p>\n\
';
}

var xml  = getXMLString();
console.log ("stuff is true");
console.log (tal.process (xml, { stuff: true }));
console.log ("stuff is a non empty list (thus, true)");
console.log (tal.process (xml, { stuff: [ 'foo', 'bar', 'baz' ] }));
console.log ("stuff is false");
console.log (tal.process (xml, { stuff: 0 }));
console.log ("stuff is an empty list (thus, false)");
console.log (tal.process (xml, { stuff: [] }));
