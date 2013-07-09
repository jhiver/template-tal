template-tal
============

TAL Implementation for nodejs. TAL is an XML templating language. template-tal
is suitable for node.js or client-side, and has no dependancies.


SYNOPSIS
--------

In your Javascript code:

  var tal  = require ('template-tal');
  var xml  = getXMLString();
  var data = { bar => 'BAZ' };
  console.log (tal.process (xml, data));

'xml' might look like this:

  <html xmlns:tal="http://purl.org/petal/1.0/">
    <body tal:content="bar">Dummy Content</body>
  </html>

and it produces something like this:

  <html>
    <body>BAZ</body>
  </html>


SUMMARY
-------

Template Attribute Language
https://en.wikipedia.org/wiki/Template_Attribute_Language is an amazingly
clever specification on how to template XML documents. It does so simply by
adding extra attributes to your XML Template file.

The specification has been implemented in many languages, including Javascript,
but the two existing Javascript implementation either depend on external
libraries (jstal/E4X) or work using the DOM (distal).

template-tal does neither. It is a completely self-contained library, suitable
for node.js, client side applications and / or embedded apps. It is a port of
the Perl Petal::Tiny package. http://search.cpan.org/~jhiver/Petal-Tiny-1.03/ 

This Readme hence steals a lot of its documentation and explains the
differences between the two modules.


NAMESPACE 
---------

template-tal has no namespace support, you must use the tal: prefix throughout.


KICKSTART 
---------

Typically, you may have a data structure looking like this:

    var data = {
        user: "Bob",
        basket: [ 'apple', 'banana', 'kiwi', 'mango' ],
    };

And you want your end result to look like this:

   <body>
      <h1>Bob</h1>
      <p>Basket List:</p>
      <ul>
        <li>apple</li>
        <li>banana</li>
        <li>kiwi</li>
        <li>mango</li>
      </ul>
    </body>

So let's work this out. First let's replace the username "Bob":

  <h1 tal:content="self.user">Bob</h1>

Now lets work out the list:

    <ul>
      <li tal:repeat="item self.basket"
          tal:content="self.item">some fruit goes here</li>
    </ul>

Our template now looks like:

   <body>
      <h1 tal:content="self.user">Bob</h1>
      <p>Basket List:</p>
      <ul>
        <li tal:repeat="item self.basket"
            tal:content="self.item">some fruit goes here</li>
      </ul>
   </body>

Ah! But what is happening if our basket is empty? Then we'd get the following
output:

   <body>
      <h1>Bob</h1>
      <p>Basket List:</p>
      <ul>
      </ul>
   </body>

Which is not very elegant. Thus we change the template as follows:

   <body>
      <h1 tal:content="self.user">Bob</h1>
      <div tal:condition="true:self.basket">
        <p>Basket List:</p>
        <ul>
          <li tal:repeat="item self.basket"
              tal:content="self.item">some fruit goes here</li>
        </ul>
      </div>
      <div tal:condition="false:self.basket">
        <p><span tal:replace="self.user">SomeUser</span>'s basket is empty :-(.</p>
      </div>
   </body>

Let's explain what we did here:

* We used tal:content to replace the content of a tag with a javascript
  expression. This implementation of the TAL spec evals Javascript directly, so
  you can do things like:

      <theAnswer tal:content="21*2" />

  Which would output

      <theAnswer>42</theAnswer> 

  When you call 

      tal.process (xmlData, someDataStructure)

  Then 'someDataStructure' is available as self. Thus
  someDataStructure.someObject.someMethod(23) becomes available as
  self.someObject.someMethod(23) in your template.

* We then used tal:condition in conjunction with the "true:" modifier to
  either display a list if the list is populated, or display a message
  describing an empty basket.


* Finally, we used tal:repeat to iterate through each item of the basket.

You can find a TAL reference at
http://www.owlfish.com/software/simpleTAL/tal-guide.html, and this library
tried to implement most of it.


RESTRICTIONS:
-------------

* No namespace support, just use 'tal:' everywhere.

* Doesn't implement TALES to evaluate expressions.
  
  Instead, the Javascript which you supply is evaled directly, which should allow some
  cool stuff if you use this library in conjunction with jquery for instance.

* Doesn't implement METAL spec (Macros).


SUPPORTED TAL STATEMENTS:
-------------------------

* tal:on-error - because it's nicer than a 500

  <p tal:on-error="string:some thing bad happened">
     ... do some potentially fatal stuff here ...
  </p>

* tal:define - because typing is tiring

  <p tal:define="newSymbol self.some.very.long.and.cumbersome.expression">
    <span petal:replace="self.newSymbol" />
  </p>

* tal:condition - because you're so special

  <p tal:condition="true:self.stuff">
    self.stuff is true, let's do something.
  </p>
  <p tal:condition="false:self.stuff">
    self.stuff is false, let's do something else.
  </p>
  
* tal:repeat - because we need fruit loops.

  <table>
    <th>
      <td>username</td>
      <td>email</td>
    </th>
    <tr tal:repeat="user self.users()">
      <td tal:content="self.user.login()">login</td>
      <td tal:content="self.user.email()">email</td>
    </tr>
  </table>
  
  Note that tal:repeat also auto creates the following variables, which you can
 access from within your repeat block.

  - self.repeat.index - 1, 2, 3, etc.
  - self.repeat.number - same as 'index'
  - self.repeat.even - true if index is even
  - self.repeat.odd - true is index is odd
  - self.repeat.start - true if index == 1
  - self.repeat.end - true if index is pointing to last item of your list
  - self.repeat.inner - true if niether start nor end are true

* tal:content - replaces inner tag content with something else.

  <p tal:content="self.someStuff">I will be replaced</p>

* tal:replace - replaces the whole tag and all its contents with something
  else.

  <p tal:="self.someStuff">I will be replaced, including the p tag.</p>

* tal:attributes - sets some attributes

  <a href="#" alt="desc"
     tal:attributes="href self.url.href; alt self.url.desc"
     tal:content="self.url.label">SomeLabel</a>

* tal:omit-tag - omits a tag (but not its contents) if the expression which is
  evaled is true.

  <em tal:omit-tag="false:self.important">I may be important.</em>

  Note that tal:omit-tag="" ALWAYS strips the tag.


EXPRESSIONS
-----------

true:EXPRESSION

  If EXPRESSION returns an array reference
    If this array reference has at least one element
      Returns TRUE
    Else
      Returns FALSE

  Else
    If EXPRESSION returns a TRUE value (according to Perl 'trueness')
      Returns TRUE
    Else
      Returns FALSE

the true: or false: modifiers should always be used when using the
tal:condition statement.


false:EXPRESSION

I'm pretty sure you can work this one out by yourself :-)


string:STRING

The string: modifier lets you interpolate petal expressions within a string and
returns the value.

  string:Welcome ${self.user.realName()}, it is ${myLocalTime()}!


Writing your own modifiers is easy:

  tal = require('template-tal');
  tal.MODIFIERS.uppercase = function (expr, self) {
    var arg = resolve (expr, self);
    if (typeof arg === 'string') { string = string.toUpperCase() }
    return string;
  };


Then in your template:

  <p tal:content="uppercase:string:foo">hello</p>

Will output

  <p>FOO</p>


EXPORTS 

tal.process(), tal.MODIFIERS


BUGS 

Since the library is a very fresh and alpha ports, there are surely quite a
few.

If you find any, please drop me an email. Patches are always welcome of course.


SEE ALSO 

This library is a port of the Perl package Petal::Tiny, which I also wrote.


Jean-Michel Hiver - jhiver (at) gmail (dot) com

This module free software and is distributed under the same license as node.jis
itself (MIT license)

Copyright (C) 2013 - Synapse Telecom SARL

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
