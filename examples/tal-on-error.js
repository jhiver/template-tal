var tal  = require ('../lib/template-tal.js');

function getXMLString() {
    return '\
<p tal:on-error="string:something bad happened">\n\
  <p tal:replace="this.stuff.does.not.exist" />\n\
</p>\n\
';
}

var xml  = getXMLString();
console.log (tal.process (xml, {}));
