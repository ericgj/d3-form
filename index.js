'use strict';

var dispatch = require('d3-dispatch')
  , rebind   = require('d3-rebind')

module.exports = function(){
  
  var fieldsets = []
    , legends = []
    , inputs = []
    , data = {}
    , dispatcher = dispatch('input','submit','cancel','reset')
    , submit
    , cancel
    , formclass

  render.classed = function(_){
    formclass = _; return this;
  }

  render.fieldset = function(){
    fieldsets.push([].slice.call(arguments,0));
    return this;
  }

  render.legend = function(_){
    if (fieldsets.length == 0) return this;
    legends[fieldsets.length-1] = _;
    return this;
  }

  render.submit = function(_){
    submit = _; return this;
  }

  render.cancel = function(_){
    cancel = _; return this;
  }

  render.input = function(_){
    inputs.push(_); return this;
  }

  render.data = function(_){
    data = _; return this;
  }

  render.bindInput = function(fn,name){
    if (('object' == typeof fn) && fn.set) fn = fn.set.bind(fn);
    dispatcher.on('input' + (name ? '.'+name : ''), fn);
    return this;
  }

  render.bindReset = function(fn,name){
    if (('object' == typeof fn) && fn.reset) fn = fn.reset.bind(fn);
    dispatcher.on('reset' + (name ? '.'+name : ''), fn);
    return this;
  }

  render.bindSubmit = function(fn,name){
    if (('object' == typeof fn) && fn.save) fn = fn.save.bind(fn);
    dispatcher.on('submit' + (name ? '.'+name : ''), fn);
    return this;
  }


  function render(selection){
    
    var form = renderForm(selection);

    renderFields( renderFieldsets(form), fieldsets );
    
    renderFields( renderInputs(form), [inputs] );

    renderCancel( form );

    renderSubmit( form );

    form.on('submit', dispatchSubmit);
  }

  function renderForm(selection){
    
    // form
    var form = selection.selectAll('form').data([data]);
    form.enter()
          .append('form')
            .classed(formclass || "", !!formclass);
    
    form.exit().remove();
    return form;

  }

  function renderInputs(selection){

    // form input fields
    var fielddata = inputs.map( function(field,j){
      return { fieldset: 0, field: j, data: data };
    })

    var section = form.selectAll('section.fields').data([fielddata]);
    section.enter()
          .append('section').classed('fields',true);
    
    section.exit().remove();
    return section;
  }

  function renderFieldsets(selection){

    // fieldsets
    var fielddata = fieldsets.map( function(fields,i){ 
      return fields.map( function(field,j){ 
        return { fieldset: i, field: j, data: data }; 
      }); 
    });

    var fsets = selection.selectAll('fieldset').data(fielddata);
    fsets.enter()
      .append('fieldset')
        .append('legend')
          .text(function(d,i){ return legends[i];} );
    
    fsets.exit().remove();

    return fsets;
  }

  function renderFields(selection, fields){

    // field sections -- assumes data has been bound to selection
    var sections = selection.selectAll('section.field').data(function(d){ return d; });
    var enter = 
      sections.enter()
        .append('section').classed('field',true)

    sections.each( function(d){ 
      var section = d3.select(this);
      var field = fields[d.fieldset][d.field];
      section.datum(d.data);
      buildField(field, enter, section); 
    });

    sections.exit().remove();

    return sections;
  }
  
  function renderCancel(selection){
    if ('string' == typeof cancel) cancel = inputCancel(cancel);
    return renderSection(selection, 'cancel', cancel);
  }

  function renderSubmit(selection){
    if ('string' == typeof submit) submit = inputSubmit(submit);
    return renderSection(selection, 'submit', submit);
  }

  function renderSection(selection, classed, field){
    var sectiondata = (undefined === field ? [] : [data]);
    var section = select.selectAll('section.'+classed).data(sectiondata);
    var enter = 
      section.enter()
        .append('section').classed(classed,true)

    if (field) buildField(field, enter, section); 

    section.exit().remove();
    return section;
  }

  function enterField(field, enter){
    if (field.dispatch) field.dispatch(dispatcher);
    enter.call( field.enter );
  }

  function updateField(field,update){
    update.call( field );
  }

  function buildField(field, enter, update){
    if (field.dispatch) field.dispatch(dispatcher);
    enter.call( field.enter );
    update.call( field );
  }

  function dispatchSubmit(d,i){
    d3.event.preventDefault();  // disable browser submit
    dispatcher.submit(d,i);
  }

  rebind(render, dispatcher, 'on');
  return render;
}


function inputSubmit(name){

  var labeltext = name

  render.label = function(_){
    labeltext = _; return this;
  }

  render.enter = function(enter){
    enter.append('input').attr('type','submit').attr('name',name);
  }

  function render(selection){
    var btn = selection.select('input[name='+name+']');
    btn.attr('value',labeltext);
  }

  return render;
}

function inputCancel(name){

  var labeltext = name
    , dispatcher

  render.dispatcher = function(_){
    dispatcher = _; return this;
  }

  render.label = function(_){
    labeltext = _; return this;
  }

  render.enter = function(enter){
    enter.append('input').attr('type','button').attr('name',name);
  }

  function render(form){
    var btn = form.select('input[name='+name+']');
    btn.attr('value',labeltext);
    if (dispatcher){
      btn.on('click', dispatchCancel);
    }
  }

  function dispatchCancel(){
    dispatcher.cancel();
  }

  return render;
}

