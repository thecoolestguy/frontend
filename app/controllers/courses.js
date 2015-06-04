import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  currentUser: Ember.inject.service(),
  queryParams: {
    schoolId: 'school',
    yearTitle: 'year',
    titleFilter: 'filter',
    userCoursesOnly: 'mycourses'
  },
  placeholderValueTranslation: 'courses.titleFilterPlaceholder',
  schoolId: null,
  yearTitle: null,
  titleFilter: null,
  userCoursesOnly: false,
  years: [],
  schools: [],
  newCourses: [],

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('titleFilter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('titleFilter'));
  },
  hasMoreThanOneSchool: Ember.computed.gt('schools.length', 1),
  filteredCourses: function(){
    var title = this.get('debouncedFilter');
    var filterMyCourses = this.get('userCoursesOnly');
    var exp = new RegExp(title, 'gi');
    var currentUser = this.get('currentUser.model');
    return this.get('content').filter(function(course) {
      let match = true;
      if(title != null && !course.get('title').match(exp)){
        match = false;
      }
      if(filterMyCourses && !currentUser.get('allRelatedCourses').contains(course)){
        match = false;
      }

      return match;
    }).sortBy('title');
  }.property('debouncedFilter', 'content.@each', 'userCoursesOnly', 'currentUser.model.allRelatedCourses.@each'),
  actions: {
    editCourse: function(course){
      this.transitionToRoute('course', course);
    },
    removeCourse: function(course){
      this.get('content').removeObject(course);
      course.deleteRecord();
      course.save();
    },
    addCourse: function(){
      var courseProxy = Ember.ObjectProxy.create({
        isSaved: false,
        content: this.store.createRecord('course', {
          title: null,
          owningSchool: this.get('selectedSchool'),
          year: this.get('selectedYear.title'),
          level: 1,
        })
      });
      this.get('newCourses').addObject(courseProxy);
    },
    saveNewCourse: function(newCourse){
      let courseProxy = this.get('newCourses').find(proxy => {
        return proxy.get('content') === newCourse;
      });
      newCourse.setDatesBasedOnYear();
      newCourse.save().then(savedCourse => {
        courseProxy.set('content', savedCourse);
        courseProxy.set('isSaved', true);
        if(savedCourse.get('year') === this.get('selectedYear.title')){
          this.get('model').pushObject(savedCourse);
        }
      });
    },
    removeNewCourse: function(newCourse){
      let courseProxy = this.get('newCourses').find(proxy => {
        return proxy.get('content') === newCourse;
      });
      this.get('newCourses').removeObject(courseProxy);
    },
    changeSelectedYear: function(year){
      this.set('yearTitle', year.get('title'));
      this.set('selectedYear', year);
    },
    changeSelectedSchool: function(school){
      this.set('schoolId', school.get('id'));
      this.set('selectedSchool', school);
    },
    //called by the 'toggle-mycourses' component
    toggleMyCourses: function(){
      //get the current userCoursesOnly status and flip it
      var newStatus = (! this.get('userCoursesOnly'));
      //then set it to the new status
      this.set('userCoursesOnly', newStatus);
    }
  },
});
