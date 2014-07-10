'use strict';

var dispatch = require('d3-dispatch')
  , rebind   = require('d3-rebind')

var identityfn = function(d){ return d; };

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

  /*
   * Main form render function
   * Note formsets are rendered first,
   * followed by input fields (e.g. buttons, links) not in formsets,
   * then cancel and submit fields
   *
   */
  function render(selection){
    
    var form = renderForm(selection);

    var fsets = renderFieldsets(form);
    fsets.each( function(d,i){
      renderFields( d3.select(this), fieldsets[i] );
    })

    renderFields( renderInputs(form), inputs );

    if (!(undefined === cancel)) renderCancel( form );

    if (!(undefined === submit)) renderSubmit( form );

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
    var fielddata = inputs.map( function(){
      return data;
    })

    var section = selection.selectAll('div.fields').data([fielddata]);
    section.enter()
          .append('div').classed('fields',true);
    
    section.exit().remove();
    return section;
  }

  function renderFieldsets(selection){

    // fieldsets
    var fielddata = fieldsets.map( function(fields,i){ 
      return fields.map( function(field,j){ 
        return data; 
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
    var sections = selection.selectAll('div.field').data(identityfn);
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

  function renderField(selection, field){
    if (field.dispatch) field.dispatch(dispatcher);
    selection.call( field );
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
    var section = selection.selectAll('div.'+classed).data(sectiondata);
    var enter = 
      section.enter()
        .append('div').classed(classed,true)

    enterField(enter, field);
    updateField(section, field);

    section.exit().remove();
    return section;
  }

  function enterField(enter, field){
    if (field.dispatch) field.dispatch(dispatcher);
    enter.call( field.enter );
  }

  function updateField(update, field){
    update.call( field );
  }

  function dispatchSubmit(d,i){
    d3.event.preventDefault();  // disable browser submit
    dispatcher.submit(d,i);
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
    var btn = selection.select('input[type=submit]');
    btn.attr('value',labeltext);
  }

  return render;
}

/*
 * Default cancel button 
 * input[type=button]
 *
 */
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

  function render(selection){
    var btn = selection.select('input[name='+name+']').data(identityfn);
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

