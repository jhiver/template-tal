var fs  = require ('fs');
var tal = require ('../lib/template-tal.js');
var xml = fs.readFileSync(__dirname + '/complete.xml', 'utf8');
var data = {
   exists: "yes i do exist",
   urls: [ { url: "http://google.com", desc: "good search engine" },
           { url: "http://bing.com", desc: "awesome search" },
           { url: "http://altavista.com", desc: "incredibly amazing search engine", important: true } ],
};

console.log (tal.process (xml, data));
