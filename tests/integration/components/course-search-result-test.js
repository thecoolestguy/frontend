import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/course-search-results';
import EmberObject from '@ember/object';

module('Integration | Component | course-search-result', function(hooks) {
  setupRenderingTest(hooks);

  test('it display course and session info properly', async function(assert) {
    assert.expect(8);

    const course = EmberObject.create({
      id: 1,
      title: 'Course 1',
      sessions: [{
        id: 1, title: 'Session 1'
      }, {
        id: 2, title: 'Session 2'
      }, {
        id: 3, title: 'Session 3'
      }, {
        id: 4, title: 'Session 4'
      }]
    });
    this.set('course', course);
    await render(hbs`{{course-search-result course=course}}`);
    assert.equal(component.courseTitle, 'Course 1');
    assert.equal(component.sessions.objectAt(0).text, 'Session 1');
    assert.equal(component.sessions.objectAt(1).text, 'Session 2');
    assert.equal(component.sessions.objectAt(2).text, 'Session 3');
    assert.equal(component.sessions.length, 3);
    assert.ok(component.showMoreIsVisible);
    await component.showMore();
    assert.equal(component.sessions.objectAt(3).text, 'Session 4');
    assert.equal(component.sessions.length, 4);
  });
});
