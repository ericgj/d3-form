# 0.3.1 ::  6-Nov-2014

- standardize event callback signatures:
  - for input events:   key,value,d,i,j  (where d,i,j is the d3 standard signature)
  - for other events:   name,d,i,j
    Note that `name` is a "subevent", application-specific name, typically 
    corresponding to the submit button clicked. For example, you may have a submit
    button "save", and another "save-draft", which you want to distinguish.

- Note this breaks compatibility particularly for onSubmit and onReset event 
  handlers.

- Add "del" and "refresh" events, and corresponding button builders, for typical
  cases of form actions not addressed by HTML form standards.


# 0.2.1 ::  3-Nov-2014

- Internal reimplementation
- bindInput/bindSubmit/bindReset are deprecated; use onInput/onSubmit/onReset
- form.field() and form.fieldset(), etc. now expect field/formset name as first
  parameter.
- add form.generate() for dynamic field generation
- add form.item() for low-level rendering to form


# 0.1.1 ::  2-Nov-2014

- allow multiple submit inputs
- submit event now includes name of submit input as the first parameter,
  to allow clients to distinguish which submit was chosen.

