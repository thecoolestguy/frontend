import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { RSVP, Service, Object } = Ember;
const { resolve } = RSVP;

const mockSchools = [
  {id: 2, title: 'second', cohorts: resolve([])},
  {id: 1, title: 'first', cohorts: resolve([])},
  {id: 3, title: 'third', cohorts: resolve([])},
];
const mockUser = Object.create({
  schools: resolve(mockSchools),
  school: resolve(Object.create(mockSchools[0]))
});

const currentUserMock = Service.extend({
  model: resolve(mockUser)
});

let storeMock = Service.extend({
  query(){
    return resolve([]);
  },
  createRecord(){
    throw new Error('Create record called in untested context');
  }
});

moduleForComponent('bulk-new-users', 'Integration | Component | bulk new users', {
  integration: true,
  beforeEach(){
    this.register('service:current-user', currentUserMock);
    Ember.getOwner(this).lookup('service:flash-messages').registerTypes(['success']);
    this.register('service:store', storeMock);
  }
});

let createFile = function(users){
  let file;
  let lines = users.map(arr => {
    return arr.join("\t");
  });

  let contents = lines.join("\n");
  if (typeof window.WebKitBlobBuilder === "undefined") {
    file = new Blob([contents], { type: 'text/plain' });
  } else {
    const builder = new window.WebKitBlobBuilder();
    builder.append(contents);
    file = builder.getBlob();
  }

  file.mime = 'text/plain';
  file.name = 'test.txt';
  return file;
};

let triggerUpload = function(users){
  let file = createFile(users);
  let inputElement = this.$('input[type=file]');
  inputElement.triggerHandler({
    type: 'change',
    target: {
      files: {
        0: file,
        length: 1,
        item() { return file; }
      }
    }
  });
};

test('it renders', function(assert) {
  assert.expect(8);
  this.set('nothing', parseInt);

  storeMock.reopen({
    query(what, {filters}){
      assert.equal('cohort', what);
      assert.equal(filters.schools[0], 2);
      return resolve([]);
    }
  });

  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  return wait().then(() => {
    let content = this.$().text().trim();
    assert.notEqual(content.search(/CSV File with new user data/), -1);
    assert.notEqual(content.search(/Primary School/), -1);

    const schools = 'select:eq(0) option';
    let options = this.$(schools);
    assert.equal(options.length, mockSchools.length);
    assert.equal(options.eq(0).text().trim(), 'first');
    assert.equal(options.eq(1).text().trim(), 'second');
    assert.equal(options.eq(2).text().trim(), 'third');
  });


});

test('parses file into table', function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
  ];
  triggerUpload(users);

  return wait().then(() => {
    let userRows = this.$('table tbody tr');
    assert.equal(userRows.length, 2);
    assert.ok(this.$('tr:eq(1) td:eq(0) input').prop('checked'));
    assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'jasper');
    assert.equal(this.$('tr:eq(1) td:eq(2)').text().trim(), 'johnson');
    assert.equal(this.$('tr:eq(1) td:eq(3)').text().trim(), '');
    assert.equal(this.$('tr:eq(1) td:eq(4)').text().trim(), '1234567890');
    assert.equal(this.$('tr:eq(1) td:eq(5)').text().trim(), 'jasper.johnson@example.com');
    assert.equal(this.$('tr:eq(1) td:eq(6)').text().trim(), '123Campus');
    assert.equal(this.$('tr:eq(1) td:eq(7)').text().trim(), '123Other');
    assert.equal(this.$('tr:eq(1) td:eq(8)').text().trim(), 'jasper');
    assert.equal(this.$('tr:eq(1) td:eq(9)').text().trim(), '123Test');

    assert.ok(this.$('tr:eq(2) td:eq(0) input').prop('checked'));
    assert.equal(this.$('tr:eq(2) td:eq(1)').text().trim(), 'jackson');
    assert.equal(this.$('tr:eq(2) td:eq(2)').text().trim(), 'johnson');
    assert.equal(this.$('tr:eq(2) td:eq(3)').text().trim(), 'middle');
    assert.equal(this.$('tr:eq(2) td:eq(4)').text().trim(), '12345');
    assert.equal(this.$('tr:eq(2) td:eq(5)').text().trim(), 'jj@example.com');
    assert.equal(this.$('tr:eq(2) td:eq(6)').text().trim(), '1234Campus');
    assert.equal(this.$('tr:eq(2) td:eq(7)').text().trim(), '1234Other');
    assert.equal(this.$('tr:eq(2) td:eq(8)').text().trim(), 'jck');
    assert.equal(this.$('tr:eq(2) td:eq(9)').text().trim(), '1234Test');
  });
});

test('saves valid users', function(assert) {
  assert.expect(32);
  let called = 0;
  storeMock.reopen({
    createRecord(what, obj) {
      let rhett = Object.create(obj);
      switch (called) {
      case 0:
        assert.equal(what, 'user');
        assert.equal(window.Object.keys(obj).length, 9);
        rhett.reopen({
          save(){
            assert.equal(this.get('firstName'), 'jasper');
            assert.equal(this.get('lastName'), 'johnson');
            assert.equal(this.get('middleName'), null);
            assert.equal(this.get('phone'), '1234567890');
            assert.equal(this.get('email'), 'jasper.johnson@example.com');
            assert.equal(this.get('campusId'), '123Campus');
            assert.equal(this.get('otherId'), '123Other');
            assert.equal(this.get('addedViaIlios'), true);
            assert.equal(this.get('enabled'), true);
          }
        });
        break;
      case 1:
        assert.equal(what, 'authentication');
        assert.equal(window.Object.keys(obj).length, 2);
        rhett.reopen({
          save(){
            assert.equal(this.get('username'), 'jasper');
            assert.equal(this.get('password'), '123Test');
            assert.equal(this.get('user').get('firstName'), 'jasper');
          }
        });
        break;
      case 2:
        assert.equal(what, 'user');
        assert.equal(window.Object.keys(obj).length, 9);
        rhett.reopen({
          save(){
            assert.equal(this.get('firstName'), 'jackson');
            assert.equal(this.get('lastName'), 'johnson');
            assert.equal(this.get('middleName'), 'middle');
            assert.equal(this.get('phone'), '12345');
            assert.equal(this.get('email'), 'jj@example.com');
            assert.equal(this.get('campusId'), '1234Campus');
            assert.equal(this.get('otherId'), '1234Other');
            assert.equal(this.get('addedViaIlios'), true);
            assert.equal(this.get('enabled'), true);
          }
        });

        break;
      case 3:
        assert.equal(what, 'authentication');
        assert.equal(window.Object.keys(obj).length, 2);
        rhett.reopen({
          save(){
            assert.equal(this.get('username'), 'jck');
            assert.equal(this.get('password'), '1234Test');
            assert.equal(this.get('user').get('firstName'), 'jackson');
          }
        });
        break;
      default:
        assert.ok(false, 'Extra createRecord called when it shoul not have been');
      }

      called++;
      return rhett;
    }
  });

  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
    ['invaliduser'],
  ];
  triggerUpload(users);

  return wait().then(() => {
    this.$('.done').click();
  });
});


test('cancel fires close', function(assert) {
  assert.expect(1);
  this.set('close', ()=> {
    assert.ok(true);
  });
  this.render(hbs`{{bulk-new-users close=(action close)}}`);
  this.$('.cancel').click();
});

test('validate firstName', function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
  ];
  triggerUpload(users);

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(1)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(1)';
  return wait().then(() => {
    assert.notOk(this.$(goodCheck).prop('disabled'));
    assert.notOk(this.$(goodBox).hasClass('error'));
    assert.ok(this.$(badCheck).prop('disabled'));
    assert.ok(this.$(BadBox).hasClass('error'));
  });
});

test('validate lastName', function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', '', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
  ];
  triggerUpload(users);

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(2)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(2)';
  return wait().then(() => {
    assert.notOk(this.$(goodCheck).prop('disabled'));
    assert.notOk(this.$(goodBox).hasClass('error'));
    assert.ok(this.$(badCheck).prop('disabled'));
    assert.ok(this.$(BadBox).hasClass('error'));
  });
});

test('validate middleName', function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middlenamewhchiswaytoolongforilios', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
  ];
  triggerUpload(users);

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(3)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(3)';
  return wait().then(() => {
    assert.notOk(this.$(goodCheck).prop('disabled'));
    assert.notOk(this.$(goodBox).hasClass('error'));
    assert.ok(this.$(badCheck).prop('disabled'));
    assert.ok(this.$(BadBox).hasClass('error'));
  });
});

test('validate email address', function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj.com', '1234Campus', '1234Other', 'jck', '1234Test'],
  ];
  triggerUpload(users);

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(5)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(5)';
  return wait().then(() => {
    assert.notOk(this.$(goodCheck).prop('disabled'));
    assert.notOk(this.$(goodBox).hasClass('error'));
    assert.ok(this.$(badCheck).prop('disabled'));
    assert.ok(this.$(BadBox).hasClass('error'));
  });
});

test('validate campusId', function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus123456TOOLONGJACK', '1234Other', 'jck', '1234Test'],
  ];
  triggerUpload(users);

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(6)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(6)';
  return wait().then(() => {
    assert.notOk(this.$(goodCheck).prop('disabled'));
    assert.notOk(this.$(goodBox).hasClass('error'));
    assert.ok(this.$(badCheck).prop('disabled'));
    assert.ok(this.$(BadBox).hasClass('error'));
  });
});

test('validate otherId', function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234OtherWAYTOOLONGFORANID', 'jck', '1234Test'],
  ];
  triggerUpload(users);

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(7)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(7)';
  return wait().then(() => {
    assert.notOk(this.$(goodCheck).prop('disabled'));
    assert.notOk(this.$(goodBox).hasClass('error'));
    assert.ok(this.$(badCheck).prop('disabled'));
    assert.ok(this.$(BadBox).hasClass('error'));
  });
});
