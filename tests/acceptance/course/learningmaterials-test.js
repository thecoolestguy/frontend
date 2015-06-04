import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/courses/1?details=true';
module('Acceptance: Course - Learning Materials', {
  beforeEach: function() {
    application = startApp();
    fixtures.user = server.create('user', {id: 4136});
    server.create('school');
    server.create('educationalYear');
    fixtures.statuses = [];
    fixtures.statuses.pushObject(server.create('learningMaterialStatus', {
      learningMaterials: [1]
    }));
    fixtures.statuses.pushObjects(server.createList('learningMaterialStatus', 5));
    fixtures.roles = server.createList('learningMaterialUserRole', 3);
    fixtures.meshDescriptors = [];
    fixtures.meshDescriptors.pushObject(server.create('meshDescriptor', {
      courseLearningMaterials: [1],
    }));
    fixtures.meshDescriptors.pushObjects(server.createList('meshDescriptor', 5));
    fixtures.learningMaterials = [];
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Jennifer Johnson',
      type: 'file',
      owningUser: 4136,
      status: 1,
      userRole: 1,
      copyrightPermission: true,
      courseLearningMaterials: [1],
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Jennifer Johnson',
      type: 'file',
      owningUser: 4136,
      status: 1,
      userRole: 1,
      copyrightPermission: false,
      copyrightRationale: 'reason is thus',
      courseLearningMaterials: [2],
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Hunter Pence',
      type: 'link',
      link: 'www.example.com',
      status: 1,
      courseLearningMaterials: [3],
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Willie Mays',
      type: 'citation',
      citation: 'a citation',
      status: 1,
      courseLearningMaterials: [4],
    }));
    fixtures.courseLearningMaterials = [];
    fixtures.courseLearningMaterials.pushObject(server.create('courseLearningMaterial',{
      learningMaterial: 1,
      course: 1,
      required: false,
      meshDescriptors: [1]
    }));
    fixtures.courseLearningMaterials.pushObject(server.create('courseLearningMaterial',{
      learningMaterial: 2,
      course: 1,
      required: false,
    }));
    fixtures.courseLearningMaterials.pushObject(server.create('courseLearningMaterial',{
      learningMaterial: 3,
      course: 1,
      publicNotes: false,
    }));
    fixtures.courseLearningMaterials.pushObject(server.create('courseLearningMaterial',{
      learningMaterial: 4,
      course: 1,
    }));

    fixtures.course = server.create('course', {
      year: 2013,
      owningSchool: 1,
      learningMaterials: [1, 2, 3, 4],
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list learning materials', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
    for (let i = 0; i < fixtures.course.learningMaterials.length; i++){
      let row = rows.eq(i);
      let courseLm = fixtures.courseLearningMaterials[fixtures.course.learningMaterials[i] - 1];
      let lm = fixtures.learningMaterials[courseLm.learningMaterial - 1];
      assert.equal(getElementText(find('td:eq(0)', row)), getText(lm.title));
      assert.equal(getElementText(find('td:eq(1)', row)), getText(lm.type));
      assert.equal(getElementText(find('td:eq(2)', row)), getText(lm.originalAuthor));
      let required = courseLm.required?'Yes':'No';
      assert.equal(getElementText(find('td:eq(3)', row)), getText(required));
      let publicNotes = courseLm.publicNotes?'Yes':'No';
      assert.equal(getElementText(find('td:eq(4)', row)), getText(publicNotes));
      let meshTerms = find('td:eq(5) li', row);
      if('meshDescriptors' in courseLm){
        assert.equal(meshTerms.length, courseLm.meshDescriptors.length);
        for(let i = 0; i < courseLm.meshDescriptors.length; i++){
          assert.equal(getElementText(meshTerms.eq(i)), getText(fixtures.meshDescriptors[courseLm.meshDescriptors[i] - 1].name));
        }
      }
    }
  });
});

test('create new file learning material', function(assert) {
  visit(url);
  var testTitle = 'testsome title';
  var testAuthor = 'testsome author';
  var testDescription = 'testsome description';
  andThen(function() {
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
    click('.detail-actions .button', container).then(function(){
      //pick the file type
      click('.detail-actions ul li:eq(0)');
    });
  });
  andThen(function(){
    //check that we got the right form
    let labels = find('.detail-learning-materials .newlearningmaterial label');
    assert.equal(labels.length, 8);
    let userName = fixtures.user.firstName + fixtures.user.lastName;
    assert.equal(getElementText(find('.detail-learning-materials .newlearningmaterial .owninguser')), getText(userName));
    let newLmContainer = find('.detail-learning-materials .newlearningmaterial');
    let inputs = find('input', newLmContainer);
    let textAreas = find('textarea', newLmContainer);
    let selectBoxes = find('select', newLmContainer);
    fillIn(inputs.eq(0), testTitle);
    fillIn(inputs.eq(1), testAuthor);
    fillIn(textAreas.eq(0), testDescription);
    pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
    pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
    click('.detail-learning-materials .newlearningmaterial .done');
  });
  andThen(function(){
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length + 1);
    let row = rows.eq(fixtures.course.learningMaterials.length);
    assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
    assert.equal(getElementText(find('td:eq(1)', row)), getText('file'));
    assert.equal(getElementText(find('td:eq(2)', row)), getText(testAuthor));

  });

});

test('create new link learning material', function(assert) {
  visit(url);
  var testTitle = 'testsome title';
  var testAuthor = 'testsome author';
  var testDescription = 'testsome description';
  andThen(function() {
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
    click('.detail-actions .button', container).then(function(){
      //pick the file type
      click('.detail-actions ul li:eq(1)');
    });
  });
  andThen(function(){
    //check that we got the right form
    let labels = find('.detail-learning-materials .newlearningmaterial label');
    assert.equal(labels.length, 7);
    let userName = fixtures.user.firstName + fixtures.user.lastName;
    assert.equal(getElementText(find('.detail-learning-materials .newlearningmaterial .owninguser')), getText(userName));
    let newLmContainer = find('.detail-learning-materials .newlearningmaterial');
    let inputs = find('input', newLmContainer);
    let textAreas = find('textarea', newLmContainer);
    let selectBoxes = find('select', newLmContainer);
    fillIn(inputs.eq(0), testTitle);
    fillIn(inputs.eq(1), testAuthor);
    fillIn(textAreas.eq(0), testDescription);
    pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
    pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
    click('.detail-learning-materials .newlearningmaterial .done');
  });
  andThen(function(){
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length + 1);
    let row = rows.eq(fixtures.course.learningMaterials.length);
    assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
    assert.equal(getElementText(find('td:eq(1)', row)), getText('link'));
    assert.equal(getElementText(find('td:eq(2)', row)), getText(testAuthor));

  });

});

test('create new citation learning material', function(assert) {
  visit(url);
  var testTitle = 'testsome title';
  var testAuthor = 'testsome author';
  var testDescription = 'testsome description';
  andThen(function() {
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
    click('.detail-actions .button', container).then(function(){
      //pick the file type
      click('.detail-actions ul li:eq(2)');
    });
  });
  andThen(function(){
    //check that we got the right form
    let labels = find('.detail-learning-materials .newlearningmaterial label');
    assert.equal(labels.length, 7);
    let userName = fixtures.user.firstName + fixtures.user.lastName;
    assert.equal(getElementText(find('.detail-learning-materials .newlearningmaterial .owninguser')), getText(userName));
    let newLmContainer = find('.detail-learning-materials .newlearningmaterial');
    let inputs = find('input', newLmContainer);
    let textAreas = find('textarea', newLmContainer);
    let selectBoxes = find('select', newLmContainer);
    fillIn(inputs.eq(0), testTitle);
    fillIn(inputs.eq(1), testAuthor);
    fillIn(textAreas.eq(0), testDescription);
    pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
    pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
    click('.detail-learning-materials .newlearningmaterial .done');
  });
  andThen(function(){
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length + 1);
    let row = rows.eq(fixtures.course.learningMaterials.length);
    assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
    assert.equal(getElementText(find('td:eq(1)', row)), getText('citation'));
    assert.equal(getElementText(find('td:eq(2)', row)), getText(testAuthor));

  });

});

test('issue #345 second new learning material defaults', function(assert) {
  visit(url);
  var container;
  andThen(function() {
    container = find('.detail-learning-materials');
    click(find('.detail-actions .button', container)).then(function(){
      click(find('.detail-actions ul li:eq(0)', container));
    });
  });
  andThen(function(){
    assert.equal(getElementText(find('select:eq(0) option:selected', container)), getText(fixtures.statuses[0].title));
    assert.equal(getElementText(find('select:eq(1) option:selected', container)), getText(fixtures.roles[0].title));
    click('.detail-learning-materials .newlearningmaterial .cancel');
  });
  andThen(function(){
    click(find('.detail-actions .button', container)).then(function(){
      click(find('.detail-actions ul li:eq(0)', container));
    });
  });
  andThen(function(){
    click(find('.detail-actions .button', container)).then(function(){
      click(find('.detail-actions ul li:eq(0)', container));
    });
    assert.equal(getElementText(find('select:eq(0) option:selected', container)), getText(fixtures.statuses[0].title));
    assert.equal(getElementText(find('select:eq(1) option:selected', container)), getText(fixtures.roles[0].title));
  });

});

test('cancel new learning material', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
    click('.detail-actions .button', container);
    click('.detail-actions ul li:eq(0)');
  });
  andThen(function(){
    click('.detail-learning-materials .newlearningmaterial .cancel');
  });
  andThen(function(){
    let rows = find('.detail-learning-materials .detail-content tbody tr');
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
  });

});

test('view copyright file learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[0].title));
      assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[0].originalAuthor));
      assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[0].description));
      assert.equal(getElementText(find('.copyrightpermission', container)), getText('Yes'));
      assert.equal(find('.copyrightrationale', container).length, 0);
    });
  });
});

test('view rationale file learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learning-materials .detail-content tbody tr:eq(1) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[1].title));
      assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[1].originalAuthor));
      assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[1].description));
      assert.equal(getElementText(find('.copyrightrationale', container)), getText(fixtures.learningMaterials[1].copyrightRationale));
      assert.equal(find('.citation', container).length, 0);
      assert.equal(find('.link', container).length, 0);
    });
  });
});

test('view link learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learning-materials .detail-content tbody tr:eq(2) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[2].title));
      assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[2].originalAuthor));
      assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[2].description));
      assert.equal(getElementText(find('.link', container)), getText(fixtures.learningMaterials[2].link));
      assert.equal(find('.copyrightpermission', container).length, 0);
      assert.equal(find('.copyrightrationale', container).length, 0);
      assert.equal(find('.citation', container).length, 0);
      assert.equal(find('.copyrightpermission', container).length, 0);
    });
  });
});

test('view citation learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learning-materials .detail-content tbody tr:eq(3) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[3].title));
      assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[3].originalAuthor));
      assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[3].description));
      assert.equal(getElementText(find('.citation', container)), getText(fixtures.learningMaterials[3].citation));
      assert.equal(find('.copyrightpermission', container).length, 0);
      assert.equal(find('.copyrightrationale', container).length, 0);
      assert.equal(find('.file', container).length, 0);
      assert.equal(find('.copyrightpermission', container).length, 0);
    });
  });
});

test('edit learning material', function(assert) {
  visit(url);
  andThen(function() {
    var material = fixtures.courseLearningMaterials[0];
    click('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      click(find('.required input', container));
      click(find('.publicnotes input', container));
      click(find('.status .editable', container)).then(function(){
        pickOption(find('.status select', container), fixtures.statuses[2].title, assert);
        click(find('.status .save', container));
      });
      andThen(function(){
        let removableItems = find('.removable-list li', container);
        assert.equal(removableItems.length, material.meshDescriptors.length);
        for (let i = 0; i < material.meshDescriptors.length; i++){
          assert.equal(getElementText(removableItems.eq(i)),getText(fixtures.meshDescriptors[material.meshDescriptors[i] - 1].name));
        }

        let searchBox = find('.search-box', container);
        assert.equal(searchBox.length, 1);
        searchBox = searchBox.eq(0);
        let searchBoxInput = find('input', searchBox);
        assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
        fillIn(searchBoxInput, 'descriptor');
        click('span.search-icon', searchBox);
        andThen(function(){
          let searchResults = find('.mesh-search-results li', container);
          assert.equal(searchResults.length, fixtures.meshDescriptors.length);
          click('.removable-list li:eq(0)', container);
          click(searchResults[1]);
          click('.detail-learning-materials .bigadd');
        });
        andThen(function(){
          assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(3)')), getText('Yes'));
          assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(4)')), getText('No'));
          assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(5)')), getText(fixtures.meshDescriptors[1].name));
          assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(6)')), getText(fixtures.statuses[2].title));
        });
      });
    });
  });
});

test('cancel editing learning material', function(assert) {
  visit(url);
  andThen(function() {
    var material = fixtures.courseLearningMaterials[0];
    click('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      click(find('.required input', container));
      click(find('.publicnotes input', container));
      click(find('.status .editable', container)).then(function(){
        pickOption(find('.status select', container), fixtures.statuses[2].title, assert);
        click(find('.status .save', container));
      });
      let removableItems = find('.removable-list li', container);
      let searchBox = find('.search-box', container).eq(0);
      let searchBoxInput = find('input', searchBox);
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', searchBox);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', container);
        click('.removable-list li:eq(0)', container);
        click(searchResults[1]);
        click('.detail-learning-materials .bigcancel');
      });
      andThen(function(){
        assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(3)')), getText('No'));
        assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(4)')), getText('Yes'));
        assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(5)')), getText(fixtures.meshDescriptors[0].name));
        assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(6)')), getText(fixtures.statuses[0].title));
      });
    });
  });
});
