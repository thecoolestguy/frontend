import Component from '@ember/component';

export default Component.extend({
  classNames: ['instructorgroup-details'],

  canUpdate: false,
  instructorGroup: null,

  actions: {
    addUser(user) {
      let instructorGroup = this.instructorGroup;
      instructorGroup.get('users').addObject(user);
      user.get('instructorGroups').addObject(instructorGroup);
      instructorGroup.save();
    },

    removeUser(user) {
      let instructorGroup = this.instructorGroup;
      instructorGroup.get('users').removeObject(user);
      user.get('instructorGroups').removeObject(instructorGroup);
      instructorGroup.save();
    }
  }
});
