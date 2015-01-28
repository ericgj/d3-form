'use strict';

var dispatch = require('d3-dispatch')
  , rebind   = require('d3-rebind')

var identity = function(d){ return d; }
var itself = function(d){ return [d]; }
var preventDefault = function(fn){ 
  var self = this;
  return function(){
    if (fn) fn.apply(self, [].slice.call(arguments,0));
    d3.event && d3.event.preventDefault();
  }
}
var accessor = function(name){ return function(d){ return d[name]; } }

module.exports = form;
module.exports.field = field;
module.exports.div = div;
module.exports.subdiv = subdiv;
module.exports.button = button;
module.exports.submit = submit;
module.exports.reset = reset;
module.exports.del = del;
module.exports.refresh = refresh;
module.exports.fieldset = fieldset;

function form(){

  var data = {}
    , items = []  // [ render, subdata ]
    , formclass = ''
    , dispatcher = dispatch('input','reset','submit','del','refresh');

  render.classed = function(_){
    formclass = _; return this;
  }

  render.data = function(_){
    data = _; return this;
  }

  render.item = function(_, subdata){
    items.push([_, subdata]); return this;
  }

  render.field = function(name, fn){
    return this.item(field(name,fn), itself); 
  }

  render.button = function(name, label, type, dispatches){
    if (arguments.length == 3) { dispatches = type; }
    if (arguments.length == 2) { dispatches = null; type = null; }
    if (arguments.length == 1) { dispatches = null; type = null; label = null; }
    return this.item(
             field(name, button(name).type(type).label(label).dispatches(dispatches)), 
             itself
           );
  }

  render.submit = function(name, label){
    return this.button(name, label, 'submit');
  }

  render.reset = function(name, label){
    return this.button(name, label, 'reset');
  }

  render.del = function(name, label){
    return this.button(name, label, 'button', 'del');
  }

  render.refresh = function(name, label){
    return this.button(name, label, 'button', 'refresh');
  }

  render.fieldset = function(name){
    var flds = [].slice.call(arguments,1);
    flds = flds.map( function(fld){ return field.apply(null,fld); } );
    return this.item(fieldset(name, flds), itself); 
  }

  render.generate = function(name, fn, subdata){
    return this.item(subdiv(fn).classed(name), subdata);
  }

  render.onInput = function(obj, meth){
    dispatchToMethod('input', obj, meth); return this;
  }

  render.onReset = function(obj, meth){
    dispatchToMethod('reset', obj, meth); return this;
  }

  render.onSubmit = function(obj, meth){
    dispatchToMethod('submit', obj, meth); return this;
  }

  render.onDel = function(obj, meth){
    dispatchToMethod('del', obj, meth); return this;
  }

  render.onRefresh = function(obj, meth){
    dispatchToMethod('refresh', obj, meth); return this;
  }

  function render(selection){
    var form = selection.selectAll('form').data([data]);
    var enter = form.enter().append('form')
                              .classed(formclass, !!formclass);

    for (var i=0;i<items.length;++i){
      var item = items[i]
      var itemrender = item[0]
        , itemdata = item[1] || itself;
      
      enter.call( renderEnter( itemrender, dispatcher), itemdata );
      form.call(  renderUpdate(itemrender, dispatcher), itemdata );
    }

    // disable default form submit and reset handling
    var nodefault = preventDefault();
    form.on('submit.preventDefault', nodefault);
    form.on('reset.preventDefault',  nodefault);

    form.exit().remove();
  }

  function dispatchToMethod(event, obj, meth){
    var fn = ( !!meth ?  obj[meth].bind(obj) : obj );
    var evt = event + ( !!meth ? '.' + meth : '' );
    dispatcher.on(evt, fn);
  }

  rebind(render, dispatcher, 'on');
  return render;
}



/******************************** field, div, subdiv  */

function field(name, fn){ 
  return div(name, fn).classed('field');
}

function div(name, fn){

  var dispatcher
    , divclass = ''

  render.classed = function(_){
    divclass = _; return this;
  }

  render.dispatch = function(_){
    dispatcher = _; return this;
  }

  /* note div generation is dynamic, so everything is done in update cycle */
  function render(selection, data){
    var root = selection.selectAll(selector()).data(data)
                           .attr('name', name);
    var enter = root.enter().append('div')
                       .classed(divclass, !!divclass)
                       .attr('name', name);
    enter.call( renderEnter(fn, dispatcher), data );
    root.call( renderUpdate(fn, dispatcher), data );
    root.exit().remove();
  }

  function selector(){
    return 'div' + 
           (!!divclass ? '.' + divclass : '') +
           ((!!name && ('string' == typeof name)) ? '[name="' + name + '"]' : '');
  }
           

  if (arguments.length == 1) { fn = name; name = null; }
  return render;
}

function subdiv(name, fn){

  var dispatcher
    , divclass = ''

  render.classed = function(_){
    divclass = _; return this;
  }

  render.dispatch = function(_){
    dispatcher = _; return this;
  }

  render.enter = function(selection, data){
    var root = selection.append('div')
                          .classed(divclass, !!divclass)
                          .attr('name', name);
    root.call( renderEnter(fn, dispatcher), data );
  }

  function render(selection, data){
    var root = selection.select(selector());
    root.call( renderUpdate(fn, dispatcher), data );
  }

  function selector(){
    return 'div' + 
           (!!divclass ? '.' + divclass : '') +
           (!!name ? '[name="' + name + '"]' : '');
  }

  if (arguments.length == 1) { fn = name; name = null; }
  return render;
}


/******************************** fieldset  */

function fieldset(name, fields){

  var legendtext = null
    , dispatcher

  render.dispatch = function(_){
    dispatcher = _; return this;
  }

  render.legend = function(_){
    legendtext = _; return this;
  }

  render.enter = function(selection, data){
    var selector = !!name ? 'fieldset.' + name : 'fieldset';
    var root = selection.selectAll(selector).data(data);
    var enter = root.enter().append('fieldset').classed(name, !!name);
    if (legendtext) enter.append('legend');
    
    for (var i=0;i<fields.length;++i){
      enter.call( renderEnter(fields[i], dispatcher), data );
    }

    root.exit().remove();
  }

  function render(selection, data){
    var selector = !!name ? 'fieldset.' + name : 'fieldset';
    var root = selection.select(selector);
    root.select('legend').text(legendtext);

    for (var i=0;i<fields.length;++i){
      root.call( renderUpdate(fields[i], dispatcher), data );
    }
  }

  if (arguments.length == 1) { fields = name; name = null; }
  return render;
}



/******************************** buttons  */

function submit(name){
  return button(name || 'submit').type('submit').dispatches('submit');
}

function reset(name){
  return button(name || 'reset').type('reset').dispatches('reset');
}

function del(name){
  return button(name || 'del').dispatches('del');
}

function refresh(name){
  return button(name || 'refresh').dispatches('refresh');
}

function button(name){

  var dispatcher
    , dispatches
    , labeltext = null
    , btntype = null
    , disabled = false
    , visible = true
    , isdefault = false
    , handlers = {}

  render.dispatch = function(_){
    dispatcher = _; return this;
  }

  render.label = function(_){
    labeltext = _; return this;
  }

  render.type = function(_){
    btntype = _; return this;
  }

  render.dispatches = function(_){
    dispatches = _; return this;
  }

  render.disabled = function(_){
    disabled = _; return this;
  }

  render.visible = function(_){
    visible = _; return this;
  }

  render.isdefault = function(_){
    isdefault = _; return this;
  }

  render.on = function(evt, handler){
    handlers[evt] = handler; return this;
  }

  render.enter = function(selection, data){
    var selector = !!name ?  'button[name="' + name + '"]' : 'button';
    var btn  = selection.selectAll(selector).data(data);
    var enter = btn.enter().append('button')
                      .attr('name',name)
                      .html('&nbsp;');
    btn.exit().remove();
  }

  function render(selection, data){
    var selector = !!name ?  'button[name="' + name + '"]' : 'button';
    var btn = selection.selectAll(selector).data(data);
    
    btn.attr('type',btntype);
    if (!(labeltext === null)) btn.text(labeltext);
    btn.style('display', iif(visible,null,'none') );
    btn.attr('disabled', iif(disabled,'',null) );
    btn.attr('default',  iif(isdefault,'',null) );

    // note convention for 'input' button: dispatches key = name, value = 1
    if (dispatcher && dispatches) {
      var handler;
      if (dispatches == 'input') { 
        handler = dispatchEventFn(dispatcher,dispatches,name,1);
      } else { 
        handler = dispatchEventFn(dispatcher,dispatches,name);
      }
      btn.on('click', handler);
    }

    // note manual event handlers will override dispatch handler
    for (var k in handlers) btn.on(k, handlers[k]);

  }

  return render;

}



// utils

function renderEnter(fn, dispatcher){
  return function(enter, data){
    if (dispatcher && fn.dispatch) fn.dispatch(dispatcher);
    if (fn.enter) enter.call( fn.enter, data );
  }
}

function renderUpdate(fn, dispatcher){
  return function(update, data){
    if (dispatcher && fn.dispatch) fn.dispatch(dispatcher);
    update.call( fn, data );
  }
}

// return handler function that dispatches event with context params + standard d3 [d,i,j] params
// the convention is that input event signature is ===>  key,value,d,i,j
// all other event signatures are  ===>  name,d,i,j
function dispatchEventFn(dispatcher, evt){
  var self = this;
  var ctxargs = [].slice.call(arguments,2);
  return function(){
    var args = [].slice.call(arguments,0);  
    dispatcher[evt].apply(self, ctxargs.concat(args));
  }
}


function iif(pred,t,f){
  return function(){
    if (!('function' == typeof pred)) return (pred ? t : f);
    var args = [].slice.call(arguments,0);
    return (pred.apply(null,args) ? t : f) ;
  }
}

