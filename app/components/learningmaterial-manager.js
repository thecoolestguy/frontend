import Ember from 'ember';
import layout from '../templates/components/learningmaterial-manager';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['learningmaterial-manager'],
  learningMaterial: null,
  isCourse: false,
  isSession: Ember.computed.not('isCourse'),
  learningMaterialStatuses: [],
  statusOptions: function(){
    return this.get('learningMaterialStatuses').map(function(status){
      return Ember.Object.create({
        id: status.get('id'),
        title: status.get('title')
      });
    }).sortBy('title');
  }.property('learningMaterialStatuses.@each'),
  isFile: function(){
    return this.get('learningMaterial.learningMaterial.type') === 'file';
  }.property('learningMaterial.learningMaterial.type'),
  isLink: function(){
    return this.get('learningMaterial.learningMaterial.type') === 'link';
  }.property('learningMaterial.learningMaterial.type'),
  isCitation: function(){
    return this.get('learningMaterial.learningMaterial.type') === 'citation';
  }.property('learningMaterial.learningMaterial.type'),
  actions: {
    changeStatus: function(statusId){
      var newStatus = this.get('learningMaterialStatuses').findBy('id', statusId);
      this.get('learningMaterial.learningMaterial').then(function(lm){
        lm.set('status', newStatus);
      });
    },
    addMeshTerm: function(descriptor){
      var subject = this.get('learningMaterial');
      subject.get('meshDescriptors').addObject(descriptor);
      if(this.get('isCourse')){
        descriptor.get('courseLearningMaterials').addObject(subject);
      }
      if(this.get('isSession')){
        descriptor.get('sessionLearningMaterials').addObject(subject);
      }
    },
    removeMeshTerm: function(descriptor){
      var self = this;
      var subject = this.get('learningMaterial');

      subject.get('meshDescriptors').then(function(descriptors){
        var promise;
        descriptors.removeObject(descriptor);
        if(self.get('isCourse')){
          promise = descriptor.get('courseLearningMaterials');
        }
        if(self.get('isSession')){
          promise = descriptor.get('sessionLearningMaterials');
        }
        promise.then(function(materials){
          materials.removeObject(subject);
        });
      });
    },
    changeRequired: function(value){
      this.get('learningMaterial').set('required', value);
      this.get('learningMaterial').save();
    },
    changePublicNotes: function(value){
      this.get('learningMaterial').set('publicNotes', value);
      this.get('learningMaterial').save();
    },
    changeNotes: function(value){
      this.get('learningMaterial').set('notes', value);
      this.get('learningMaterial').save();
    },
    //change the learning material description value
    changeDescription: function(value) {
      this.get('learningMaterial').set('description', value);
      this.get('learningMaterial').save();
    }
  }
});
