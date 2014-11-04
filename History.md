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

