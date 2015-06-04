import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Mesh Terms', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('sessionType');
    server.createList('meshDescriptor', 3, {
      courses: [1]
    });
    server.createList('meshDescriptor', 3, {
    });

    server.create('course', {
      owningSchool: 1
    });

    server.create('session', {
      course: 1,
      meshDescriptors: [1,2,3]
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list mesh', function(assert) {
  assert.expect(4);
  visit(url);
  andThen(function() {
    var container = find('.detail-mesh');
    var items = find('ul.inline-list li', container);
    assert.equal(items.length, 3);
    assert.equal(getElementText(items.eq(0)), getText('descriptor 0'));
    assert.equal(getElementText(items.eq(1)), getText('descriptor 1'));
    assert.equal(getElementText(items.eq(2)), getText('descriptor 2'));
  });
});

test('manage mesh', function(assert) {
  assert.expect(24);
  visit(url);
  andThen(function() {
    var container = find('.detail-mesh');
    click(find('.detail-actions .add', container));
    andThen(function() {
      let meshManager = find('.mesh-manager', container);
      let removableItems = find('.removable-list li', meshManager);
      assert.equal(removableItems.length, 3);
      assert.equal(getElementText(removableItems.eq(0)), getText('descriptor 0'));
      assert.equal(getElementText(removableItems.eq(1)), getText('descriptor 1'));
      assert.equal(getElementText(removableItems.eq(2)), getText('descriptor 2'));

      let searchBox = find('.search-box', meshManager);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', searchBox);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        assert.equal(searchResults.length, 6);
        assert.equal(getElementText(searchResults.eq(0)), getText('descriptor 0'));
        assert.equal(getElementText(searchResults.eq(1)), getText('descriptor 1'));
        assert.equal(getElementText(searchResults.eq(2)), getText('descriptor 2'));
        assert.equal(getElementText(searchResults.eq(3)), getText('descriptor 3'));
        assert.equal(getElementText(searchResults.eq(4)), getText('descriptor 4'));
        assert.equal(getElementText(searchResults.eq(5)), getText('descriptor 5'));
        assert.ok($(searchResults[0]).hasClass('disabled'));
        assert.ok($(searchResults[1]).hasClass('disabled'));
        assert.ok($(searchResults[2]).hasClass('disabled'));
        assert.ok(!$(searchResults[3]).hasClass('disabled'));
        assert.ok(!$(searchResults[4]).hasClass('disabled'));
        assert.ok(!$(searchResults[5]).hasClass('disabled'));

        click('.removable-list li:eq(1)', meshManager).then(function(){
          assert.ok(!$(find('.mesh-search-results li:eq(1)', meshManager)).hasClass('disabled'));
        });
        click(searchResults[3]);
        andThen(function(){
          assert.ok($(find('.mesh-search-results li:eq(3)', meshManager)).hasClass('disabled'));
          let removableItems = find('.removable-list li', meshManager);
          assert.equal(getElementText(removableItems.eq(0)), getText('descriptor 0'));
          assert.equal(getElementText(removableItems.eq(1)), getText('descriptor 2'));
          assert.equal(getElementText(removableItems.eq(2)), getText('descriptor 3'));
        });
      });
    });
  });
});

test('save mesh changes', function(assert) {
  assert.expect(4);
  visit(url);
  andThen(function() {
    var container = find('.detail-mesh');
    click(find('.detail-actions .add', container));
    andThen(function() {
      let meshManager = find('.mesh-manager', container);
      fillIn(find('.search-box input', meshManager).eq(0), 'descriptor');
      click('.search-box span.search-icon', meshManager);
      andThen(function(){
        click('.removable-list li:eq(1)', meshManager).then(()=> {
          click('.mesh-search-results li:eq(3)', meshManager).then(()=>{
            click('button.bigadd', container);
          });
        });
        andThen(function(){
          var items = find('ul.inline-list li', container);
          assert.equal(items.length, 3);
          assert.equal(getElementText(items.eq(0)), getText('descriptor 0'));
          assert.equal(getElementText(items.eq(1)), getText('descriptor 2'));
          assert.equal(getElementText(items.eq(2)), getText('descriptor 3'));
        });
      });
    });
  });
});



test('cancel mesh changes', function(assert) {
  assert.expect(4);
  visit(url);
  andThen(function() {
    var container = find('.detail-mesh');
    click(find('.detail-actions .add', container));
    andThen(function() {
      let meshManager = find('.mesh-manager', container);
      fillIn(find('.search-box input', meshManager).eq(0), 'descriptor');
      click('.search-box span.search-icon', meshManager);
      andThen(function(){
        click('.removable-list li:eq(1)', meshManager).then(()=> {
          click('.mesh-search-results li:eq(3)', meshManager).then(()=>{
            click('button.bigcancel', container);
          });
        });

        andThen(function(){
          var items = find('ul.inline-list li', container);
          assert.equal(items.length, 3);
          assert.equal(getElementText(items.eq(0)), getText('descriptor 0'));
          assert.equal(getElementText(items.eq(1)), getText('descriptor 1'));
          assert.equal(getElementText(items.eq(2)), getText('descriptor 2'));
        });
      });
    });
  });
});
