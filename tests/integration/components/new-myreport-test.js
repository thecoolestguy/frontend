import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

moduleForComponent('new-report', 'Integration | Component | new report', {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{new-report}}`);

  assert.ok(this.$().text().search(/New Report/) === 0);
});
