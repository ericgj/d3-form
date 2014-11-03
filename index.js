'use strict';

var dispatch = require('d3-dispatch')
  , rebind   = require('d3-rebind')

var itself = function(d){ return [d]; }
var preventDefault = function(){ d3.event && d3.event.preventDefault(); }

module.exports = function(){
  
  var fieldsets = []
    , legends = []
    , inputs = []
    , data = {}
    , dispatcher = dispatch('input','submit','reset')
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
    var submit = ('function' == typeof _ ? _ : inputSubmit(_));
    inputs.push(submit);
    return this;
  }

  render.field = function(_){
    inputs.push(_); return this;
  }

  render.data = function(_){
    data = _; return this;
  }

  /*
   * Shortcut for form.on('input', model.set.bind(model));
   *
   */
  render.bindInput = function(fn,name){
    if (('object' == typeof fn) && fn.set) fn = fn.set.bind(fn);
    dispatcher.on('input' + (name ? '.'+name : ''), fn);
    return this;
  }

  /*
   * Shortcut for form.on('reset', model.reset.bind(model));
   *
   */
  render.bindReset = function(fn,name){
    if (('object' == typeof fn) && fn.reset) fn = fn.reset.bind(fn);
    dispatcher.on('reset' + (name ? '.'+name : ''), fn);
    return this;
  }

  /*
   * Shortcut for form.on('submit', model.save.bind(model));
   *
   */
  render.bindSubmit = function(fn,name){
    if (('object' == typeof fn) && fn.save) fn = fn.save.bind(fn);
    dispatcher.on('submit' + (name ? '.'+name : ''), fn);
    return this;
  }


  function formData(){
    return {
      'fieldsets': fieldsets.map( function(fieldset,i){
        return {
          'fields': fieldsets[i].map( function(){
            return data;
          })
        };
      }),
      'fields': inputs.map( function(){
        return data;
      })
    };
  }

  /*
   * Main form render function
   * Note formsets are rendered first,
   * followed by input fields (e.g. buttons, links) not in formsets,
   * then submit field
   *
   */
  function render(selection){
    
    var form = selection.selectAll('form').data([formData()]);
    var enter = 
      form.enter()
          .append('form')
            .classed(formclass || "", !!formclass);   

    var fsets = renderFieldsets(form);

    enter.append('div').classed('fields',true)
    var flds = form.selectAll('div.fields').data( itself );
    renderFields( flds, inputs );

    form.on('submit', preventDefault);

    form.exit().remove();
  }

  function renderFieldsets(selection){

    var fsets = selection.selectAll('fieldset')
                  .data(function(d){ return d.fieldsets; });
    fsets.enter()
      .append('fieldset')
        .append('legend')
    
    fsets.select('legend')
      .text(function(d,i){ 
        var legend = legends[i];
        return 'function' == typeof legend ? legend(d.fields[0],i) : legend;
      });
      
    fsets.each( function(d,i){
      renderFields( d3.select(this), fieldsets[i] );
    })

    fsets.exit().remove();

    return fsets;
  }

  function renderFields(selection, fields){

    var sections = selection.selectAll('div.field')
                     .data(function(d){ return d.fields; });
    var enter = 
      sections.enter()
        .append('div').classed('field',true)
    
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
    enter.call( field.enter, dispatcher );
  }

  function updateField(update, field){
    if (field.dispatch) field.dispatch(dispatcher);
    update.call( field, dispatcher );
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
    , dispatcher

  render.label = function(_){
    labeltext = _; return this;
  }

  render.dispatch = function(_){
    dispatcher = _; return this;
  }

  render.enter = function(selection){
    selection.append('input').attr('type','submit');
  }

  function render(selection){
    var btn = selection.select('input[type="submit"]');
    btn.attr('name', name);
    btn.attr('value',labeltext);
    btn.on('click', dispatchSubmit);
  }

  function dispatchSubmit(d,i){
    if (dispatcher) dispatcher.submit(name, d, i);
  }

  return render;
}


