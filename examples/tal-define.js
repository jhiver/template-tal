var tal  = require ('../lib/template-tal.js');

function getXMLString() {
    return '\
<p tal:define="newSymbol self.some.very.long.and.cumbersome.expression">\n\
  <span tal:replace="self.newSymbol" />\n\
</p>\n\
';
}

var xml  = getXMLString();
console.log (tal.process (xml, {
  some: { very: { long: { and: { cumbersome: { expression: "here it is" } } } } } }));
