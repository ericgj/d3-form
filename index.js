'use strict';

var dispatch = require('d3-dispatch')
  , rebind   = require('d3-rebind')

module.exports = function(){
  
  var fieldsets = []
    , data = {}
    , dispatcher = dispatch('input')
    , formclass

  render.classed = function(_){
    formclass = _; return this;
  }

  render.fieldset = function(){
    fieldsets.push([ null, [].slice.call(arguments,0) ]);
    return this;
  }

  render.legend = function(_){
    if (fieldsets.length == 0) return this;
    fieldsets[fieldsets.length-1][0] = _;
    return this;
  }

  render.data = function(_){
    data = _; return this;
  }

  render.bindInput = function(fn,name){
    if (('object' == typeof fn) && fn.set) fn = fn.set.bind(fn);
    dispatcher.on('input' + (name ? '.'+name : ''), fn);
    return this;
  }

  function render(selection){
    var form = selection.selectAll('form').data([data])
    var enter = 
      form.enter()
        .append('form')
          .classed(formclass || "", !!formclass)

    fieldsets.forEach( function(fs){
      var legend = fs[0]
        , fields = fs[1]
      var fieldset = enter.append('fieldset');
      if (legend) fieldset.append('legend').text(legend);
      fields.forEach( function(field){
        field.dispatch(dispatcher);         // set dispatcher
        fieldset.call( field.enter );       // enter
        d3.select(fieldset.node()).call( field );  // update
      })
    })
    
  }
  
  rebind(render, dispatcher, 'on');
  return render;
}
