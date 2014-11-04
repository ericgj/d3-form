
# d3-form

  Simple modular HTML forms using d3

  * Declarative form builder syntax
  * Input binding abstracted from DOM events
  * Composable
  * Simple interface for custom input components
  * Dynamic (data-driven) component generation
  
## Installation

  Install with [component(1)](http://component.io):

    $ component install ericgj/d3-form

  Note this library has an implicit dependency on d3. That is, it assumes a
  `d3` global.

## Example

```js
  var form = require('d3-form');
  var data = { name: "Aaron", age: 51, color: "red" };

  d3.select('div.form').call( 
    form().data( data )
      .onInput( model, 'set' )
      .onSubmit( submitHandler )
      .fieldset( 'stats', [
        inputText('name').label('Name'),
        inputText('age').label('Age'),
        inputText('color').label('Favorite Color')
      ])
      .submit('Save')
  )

```
For a more feature-filled example, see `examples/index.html`.


### Data binding

For so-called "double-binding" you can simply call the form again passing
in the changed data.

```js

  // form input bound to model

  myForm.onInput( someModel, 'set' );

  // external model changes bound to form

  someModel.on('update', function(){ 
    d3.select('div.form').call( myForm.data(someModel.currentData()) );
  });

```

Note it's up to you how your models are connected to the data you send into
the form, and how they expect events to be handled.

## API

  
## TODO

  - Document API
  - Document how to write input components
  - Document dynamic field generation

  
## License

  The MIT License (MIT)

  Copyright (c) 2014 Eric Gjertsen `<ericgj72@gmail.com>`

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
