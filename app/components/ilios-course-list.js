/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import Component from '@ember/component';

import config from 'ilios/config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

const CourseProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  permissionChecker: null,
  showRemoveConfirmation: false,
  i18n: null,
  isSaving: false,
  status: computed('content.isPublished', 'content.isScheduled', function(){
    const i18n = this.get('i18n');
    let course = this.get('content');
    let translation = 'general.';
    if (course.get('isScheduled')) {
      translation += 'scheduled';
    } else if (course.get('isPublished')) {
      translation += 'published';
    } else {
      translation += 'notPublished';

    }

    return i18n.t(translation).string;
  }),
  userCanDelete: computed('content', 'currentUser', 'content.locked', 'content.archived', 'currentUser.model.directedCourses.[]', async function(){
    const currentUser = this.get('currentUser');
    const permissionChecker = this.get('permissionChecker');
    const course = this.get('content');
    if (course.get('isPublishedOrScheduled')) {
      return false;
    } else if (course.hasMany('descendants').ids().length > 0) {
      return false;
    }
    if (!enforceRelationshipCapabilityPermissions) {
      const userIsDeveloper = await currentUser.get('userIsDeveloper');
      if (userIsDeveloper) {
        return true;
      }
      return await currentUser.isDirectingCourse(course);
    }

    return permissionChecker.canDeleteCourse(course);
  }),
  userCanLock: computed('content', 'currentUser', 'content.locked', 'content.archived', 'currentUser.model.directedCourses.[]', async function(){
    const currentUser = this.get('currentUser');
    const permissionChecker = this.get('permissionChecker');
    const course = this.get('content');
    if (!enforceRelationshipCapabilityPermissions) {
      const userIsDeveloper = await currentUser.get('userIsDeveloper');
      if (userIsDeveloper) {
        return true;
      }
      return await currentUser.isDirectingCourse(course);
    }

    return permissionChecker.canUpdateCourse(course);
  }),
  userCanUnLock: computed('content', 'currentUser', 'content.locked', 'content.archived', async function(){
    const currentUser = this.get('currentUser');
    const permissionChecker = this.get('permissionChecker');
    const course = this.get('content');
    if (!enforceRelationshipCapabilityPermissions) {
      return await currentUser.get('userIsDeveloper');
    }

    return permissionChecker.canUnlockCourse(course);
  }),
});
export default Component.extend({
  currentUser: service(),
  i18n: service(),
  permissionChecker: service(),
  courses: null,
  proxiedCourses: computed('courses.[]', function(){
    const i18n = this.get('i18n');
    const courses = this.get('courses');
    if (!courses) {
      return [];
    }
    return courses.map(course => {
      return CourseProxy.create({
        content: course,
        i18n,
        currentUser: this.get('currentUser'),
        permissionChecker: this.get('permissionChecker')
      });
    });
  }),
  sortBy: 'title',
  sortedCourses: computed('proxiedCourses.[]', 'sortBy', 'sortedAscending', function(){
    let sortBy = this.get('sortBy');
    if (-1 !== sortBy.indexOf(':')) {
      sortBy = sortBy.split(':', 1)[0];
    }
    let sortedAscending = this.get('sortedAscending');
    const courses = this.get('proxiedCourses');
    let sortedCourses = courses.sortBy(sortBy);
    if (!sortedAscending) {
      sortedCourses = sortedCourses.slice().reverse();
    }

    return sortedCourses;
  }),

  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  actions: {
    remove(courseProxy) {
      this.sendAction('remove', courseProxy.get('content'));
    },
    cancelRemove(courseProxy) {
      courseProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove(courseProxy) {
      courseProxy.set('showRemoveConfirmation', true);
    },
    unlockCourse(courseProxy){
      courseProxy.get('userCanUnLock').then(permission => {
        if (permission) {
          courseProxy.set('isSaving', true);
          this.get('unlock')(courseProxy.get('content')).then(()=>{
            courseProxy.set('isSaving', false);
          });
        }
      });
    },
    lockCourse(courseProxy){
      courseProxy.get('userCanLock').then(permission => {
        if (permission) {
          courseProxy.set('isSaving', true);
          this.get('lock')(courseProxy.get('content')).then(()=>{
            courseProxy.set('isSaving', false);
          });
        }
      });
    },
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
  }
});
