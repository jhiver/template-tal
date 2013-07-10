var tal  = require ('../lib/template-tal.js');

function getXMLString() {
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

var xml  = getXMLString();
var data = {
    user: "Bob",
    basket: [ 'apple', 'banana', 'kiwi', 'mango' ],
};
console.log (tal.process (xml, data));
