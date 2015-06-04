/* global moment */
import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  program: null,
  programYears: [],
  classNames: ['detail-view', 'programyear-list'],
  sortBy: ['academicYear'],
  sortedContent: Ember.computed.sort('programYears', 'sortBy'),
  newProgramYears: [],
  existingStartYears: Ember.computed.mapBy('programYears', 'startYear'),
  availableProgramStartYears: function(){
    var firstYear = parseInt(moment().subtract(5, 'years').format('YYYY'));
    var years = [];
    for(var i = 0; i < 10; i++){
      years.pushObject(firstYear+i);
    }
    return years.filter(
      year => {
          return !this.get('existingStartYears').contains(year.toString());
      }
    );
  }.property('existingStartYears.@each'),
  actions: {
    addNewProgramYear: function(){
      var programYear = this.get('store').createRecord('program-year');
      this.get('newProgramYears').addObject(programYear);
    },
    saveNewProgramYear: function(newProgramYear){
      var self = this;
      let latestProgramYear = this.get('sortedContent').get('lastObject');
      this.get('newProgramYears').removeObject(newProgramYear);
      var program = this.get('program');
      newProgramYear.set('program', program);
      let promises = [];
      if(latestProgramYear){
        promises.pushObject(latestProgramYear.get('directors').then(directors => {
          newProgramYear.get('directors').pushObjects(directors.toArray());
          directors.forEach(user=>{
            promises.pushObject(user.get('directedProgramYears').then(programYears => {
              programYears.pushObject(newProgramYear);
              return user.save();
            }));
          });
        }));
        promises.pushObject(latestProgramYear.get('competencies').then(competencies => {
          newProgramYear.get('competencies').pushObjects(competencies.toArray());
          competencies.forEach(competency=>{
            promises.pushObject(competency.get('programYears').then(programYears => {
              programYears.pushObject(newProgramYear);
              return competency.save();
            }));
          });
        }));
        promises.pushObject(latestProgramYear.get('disciplines').then(disciplines => {
          newProgramYear.get('disciplines').pushObjects(disciplines.toArray());
          disciplines.forEach(discipline=>{
            promises.pushObject(discipline.get('programYears').then(programYears => {
              programYears.pushObject(newProgramYear);
              return discipline.save();
            }));
          });
        }));
        promises.pushObject(latestProgramYear.get('objectives').then(objectives => {
          newProgramYear.get('objectives').pushObjects(objectives.toArray());
          objectives.forEach(objective=>{
            promises.pushObject(objective.get('programYears').then(programYears => {
              programYears.pushObject(newProgramYear);
              return objective.save();
            }));
          });
        }));
        promises.pushObject(latestProgramYear.get('stewards').then(stewards => {
          newProgramYear.get('stewards').pushObjects(stewards.toArray());
          stewards.forEach(steward=>{
            promises.pushObject(steward.get('programYears').then(programYears => {
              programYears.pushObject(newProgramYear);
              return steward.save();
            }));
          });
        }));
      }
      Ember.RSVP.all(promises).then(()=>{
        newProgramYear.save().then(function(savedProgramYear){
          program.get('programYears').addObject(savedProgramYear);
          var cohort = self.get('store').createRecord('cohort', {
            programYear: savedProgramYear
          });
          cohort.save();
          program.save();
        });
      });

    },
    removeNewProgramYear: function(newProgramYear){
      this.get('newProgramYears').removeObject(newProgramYear);
    },
  }
});
