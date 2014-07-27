'use strict';

var dispatch = require('d3-dispatch')
  , rebind   = require('d3-rebind')
  , isArray  = require('isArray')

var identityfn = function(d){ return d; };

module.exports = function(){
  
  var fieldsets = []
    , legends = []
    , inputs = []
    , data = {}
    , dispatcher = dispatch('input','submit','reset')
    , submit
    , formclass

  render.classed = function(_){
    formclass = _; return this;
  }

  render.fieldset = function(){
    fieldsets.push([].slice.call(arguments,0));
    legends.push(null);  // default no content in <legend>
    return this;
  }

  render.legend = function(_){
    if (fieldsets.length == 0) return this;
    legends[fieldsets.length-1] = _;
    return this;
  }

  render.submit = function(_){
    submit = ('string' == typeof _ ? inputSubmit(submit) : _);
    return this;
  }

  render.field = function(_){
    inputs.push(_); return this;
  }

  render.data = function(_){
    data = isArray(_) ? _ : [_]; return this;
  }

  /*
   * Bind 'input' to:
   * 1. single handler function with signature ( formindex, key, value )
   * 2. array of functions with signatures  ( key, value )
   * 3. array of objects with 'set' methods with signatures   ( key, value )
   *
   */
  render.bindInput = function(fns,name){
    if ('function' == typeof fns){
      bindSingle('input', name, fns);
    } else {
      bindMultiple('input', name, fns, 'set');
    }
    return this;
  }

  /*
   * Bind 'reset' to:
   * 1. single handler function with signature ( formindex, obj )
   * 2. array of functions with signatures  ( obj )
   * 3. array of objects with 'reset' methods with signatures  ( obj )
   *
   */
  render.bindReset = function(fns,name){
    if ('function' == typeof fns){
      bindSingle('reset', name, fns);
    } else {
      bindMultiple('reset', name, fns, 'reset');
    }
    return this;
  }

  /*
   * Bind 'submit' to:
   * 1. single handler function with signature ( formindex, obj )
   * 2. array of functions with signatures  ( obj )
   * 3. array of objects with 'save' methods with signatures   ( obj )
   *
   */
  render.bindSubmit = function(fns,name){
    if ('function' == typeof fns){
      bindSingle('submit', name, fns);
    } else {
      bindMultiple('submit', name, fns, 'save');
    }
    return this;
  }

  function bindSingle(evt, name, fn){
    dispatcher.on(evt + (name ? '.'+name : ''), fn); 
  }

  function bindMultiple(evt, name, fns, meth){
    fns = (isArray(fns) ? fns : [fns]);
    fns = fns.map( function(fn){
      if (('object' == typeof fn) && fn[meth]) return fn[meth].bind(fn);
      return fn;
    });
    dispatcher.on(evt + (name ? '.'+name : ''), function(i){
      var fn = fns[i];
      if (!fn) return;
      var args = [].slice.call(arguments,1);
      fn.apply(null,args);
    });
    return this;
  }

  function formData(){
    return data.map( function(rec,formindex){
      return {
        'form': formindex,
        'data': rec,
        'fieldsets': fieldsets.map( function(fieldset,i){
          return {
            'legend': legends[i],
            'fields': fieldsets[i].map( function(){ 
                        return { 'data': rec, 'form': formindex };  
                      })
          };
        }),
        'fields': inputs.map( function(){
          return { 'data': rec, 'form': formindex };
        }),
        'submit': [
          { 'fields': [ { 'data': rec, 'form': formindex } ] }
        ]
      };
    });
  }

  function render(selection){
  
    var forms = selection.selectAll('form').data(formData());
    var enter = 
      forms.enter()
           .append('form')
             .classed(formclass || "", !!formclass);
    
    forms.exit().remove();

    renderFieldsets( forms );

    enter.append('div').classed('fields',true);

    renderFields( forms.selectAll('div.fields'), inputs );

    if (!(undefined === submit)){
      renderFields( forms, [submit], 'submit', 'submit' );
    }

    forms.on('submit', dispatchSubmit);

  }

  function renderFieldsets( forms ){

    var fsets = forms.selectAll('fieldset')
                       .data( function(d){ return d.fieldsets; });
    fsets.enter()
      .append('fieldset')
        .append('legend')
          .text(function(d){ return d.legend;} );
    
    fsets.exit().remove();

    fsets.each( function(d,i){
      renderFields( d3.select(this), fieldsets[i] );
    })
    return fsets;

  }

  function renderFields(selection, fields, classed, key){
    key = key || 'fields';
    classed = classed || 'field';
    var sections = selection.selectAll('div.'+classed)
                     .data( function(d){ return d[key]; });
    var enter = 
      sections.enter()
        .append('div').classed(classed,true)
    
    enter.each( function(d,i){
      var section = d3.select(this);
      var field = fields[i];
      enterField(section, field);
    })

    sections.each( function(d,i){ 
      var section = d3.select(this);
      var field = fields[i];
      updateField(section, field); 
    });

    sections.exit().remove();

    return sections;

  }

  function enterField(enter, field){
    if (field.dispatch) field.dispatch(dispatcher);
    enter.call( field.enter );
  }

  function updateField(update, field){
    update.call( field );
  }

  // note i here is the form index
  // and d.data is the current record
  function dispatchSubmit(d,i){
    d3.event.preventDefault();  // disable browser submit
    dispatcher.submit(i, d.data);
  }


  rebind(render, dispatcher, 'on');
  return render;
}



/*
 * Default submit button 
 * input[type=submit]
 *
 */
function inputSubmit(name){

  var labeltext = name

  render.label = function(_){
    labeltext = _; return this;
  }

  render.enter = function(enter){
    enter.append('input').attr('type','submit').attr('name',name);
  }

  function render(selection){
    var btn = selection.select('input[name=' + name + ']');
    btn.attr('value',labeltext);
  }

  return render;
}


