var tal  = require ('../lib/template-tal.js');

exports.testSynopsis = function(test){
    var xml, data, res;

    // synopsis
    xml  = getSynopsisXMLString();
    data = { bar: 'BAZ' };
    res  = tal.process(xml,data); 
    test.ok(res.match(/\<body\>BAZ\<\/body\>/, "synopsis sample looks good"));
    
    // kickstart - with non enpty list
    xml = getKickStartXMLString();
    data = {
        user: "Bob",
        basket: [ 'apple', 'banana', 'kiwi', 'mango' ],
    };
    res  = tal.process(xml,data);
    test.ok(res.match(/\<h1\>Bob\<\/h1\>/, "kick start sample - bob's in there..."));
    test.ok(res.match(/\<li\>apple<\/li\>/), "bob sure likes apples...");
    test.ok(res.match(/\<li\>banana<\/li\>/), "bob sure likes bananas...");
    test.ok(res.match(/\<li\>kiwi<\/li\>/), "bob sure likes kiwis...");
    test.ok(res.match(/\<li\>mango<\/li\>/), "bob sure likes mangoes...");
    
    // kickstart - with empty list
    data = { user: "Bob", basket: [] };
    res  = tal.process(xml,data);
    test.ok(res.match(/\<h1\>Bob\<\/h1\>/, "kick start sample - bob's in there..."));
    test.ok(res.match(/basket is empty/), "poor bob!");

    // kickstart - with undefined list
    data = { user: "Bob" }
    res  = tal.process(xml,data);
    test.ok(res.match(/\<h1\>Bob\<\/h1\>/, "kick start sample - bob's in there..."));
    test.ok(res.match(/basket is empty/), "poor bob!");

    // tal on error test
    xml  = getTalOnErrorXMLString();
    data = {};
    res  = tal.process(xml, data);
    test.ok(res.match(/something bad happened/, "on-error statement"));

    // tal define test
    xml = getTalDefineXMLString();
    data = { some: { very: { long: { and: { cumbersome: { expression: "here it is" } } } } } };
    res  = tal.process(xml, data);
    test.ok (res.match(/here it is/), "define statement");

    // tal condition test
    xml  = getTalConditionXMLString();
    data = { stuff: true };
    res  = tal.process(xml, data);
    test.ok (res.match(/is true/, "condition scalar true"));

    data = { stuff: ['foo'] };
    res  = tal.process(xml, data);
    test.ok (res.match(/is true/, "condition list non empty"));

    data = { stuff: false };
    res  = tal.process(xml, data);
    test.ok (res.match(/is false/, "condition scalar false"));

    data = { stuff: [] };
    res  = tal.process(xml, data);
    test.ok (res.match(/is false/, "condition list empty"));

    test.done();
};

function getSynopsisXMLString() {
    return '<html>' + "\n" + '    <body tal:content="self.bar">Dummy Content</body>' + "\n" + '</html>';
}

function getKickStartXMLString() {
return '<body> \n\
  <h1 tal:content="self.user">Bob</h1> \n\
  <div tal:condition="true:self.basket"> \n\
    <p>Basket List:</p> \n\
    <ul> \n\
      <li tal:repeat="item self.basket" \n\
          tal:content="self.item">some fruit goes here</li> \n\
    </ul> \n\
  </div> \n\
  <div tal:condition="false:self.basket"> \n\
    <p><span tal:replace="self.user">SomeUser</span>&apos;s basket is empty :-(.</p> \n\
  </div> \n\
</body>';
}

function getTalOnErrorXMLString() {
    return '\
<p tal:on-error="string:something bad happened">\n\
  <p tal:replace="this.stuff.does.not.exist" />\n\
</p>\n\
';
}

function getTalDefineXMLString() {
    return '\
<p tal:define="newSymbol self.some.very.long.and.cumbersome.expression">\n\
  <span tal:replace="self.newSymbol" />\n\
</p>\n\
';
}

function getTalConditionXMLString() {
    return '\
<p tal:condition="true:self.stuff">\n\
  self.stuff is true, let\'s do something.\n\
</p>\n\
<p tal:condition="false:self.stuff">\n\
  self.stuff is false, let\'s do something else.\n\
</p>\n\
';
}
