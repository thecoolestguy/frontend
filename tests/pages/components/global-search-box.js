import {
  clickable,
  create,
  collection,
  fillable,
  hasClass,
  is,
  triggerable,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-global-search-box]',
  input: fillable('input'),
  inputValue: value('input'),
  inputHasFocus: is(':focus', 'input'),
  triggerInput: triggerable('keyup', 'input'),
  clickIcon: clickable('[data-test-search-icon]'),
  autocompleteResults: collection('[data-test-autocomplete] .autocomplete-row'),
  resultsRow1HasActiveClass: hasClass('active', '.autocomplete-row:nth-child(1)'),
  resultsRow2HasActiveClass: hasClass('active', '.autocomplete-row:nth-child(2)'),
  resultsRow3HasActiveClass: hasClass('active', '.autocomplete-row:nth-child(3)'),
  keyUp: {
    scope: '[data-test-input]',
    enter: triggerable('keyup', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keyup', '', { eventProperties: { key: 'ArrowDown' } }),
    up: triggerable('keyup', '', { eventProperties: { key: 'ArrowUp' } }),
    escape: triggerable('keyup', '', { eventProperties: { key: 'Escape' } }),
  }
};

export default definition;
export const component = create(definition);
