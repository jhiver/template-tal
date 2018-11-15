    let tal  = require ('./lib/template-tal')
    let xml = `
      <html>
        <body>
          <p tal:content="foo">Dummy Content</p>
          <p tal:content="bar()">Dummy Content</p>
          <p tal:content="baz()">Dummy Content</p>
        </body>
      </html>
    `

    let data = {

      // value
      foo: "FOO",

      // function
      bar: function() { return "BAR" },

      // async function
      baz: function() {
        return new Promise(function(resolve) {
          setTimeout(function() { resolve('BAZ')}, 100)
        })
      }
    }

    tal
      .process(xml, data)
      .then(function(result){
        console.log(result)
      })

