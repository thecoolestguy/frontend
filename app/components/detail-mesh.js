import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  store: Ember.inject.service(),
  classNames: ['detail-mesh'],
  placeholderTranslation: 'courses.meshSearchPlaceholder',
  subject: null,
  terms: Ember.computed.oneWay('subject.meshDescriptors'),
  isCourse: false,
  sortTerms: ['title'],
  sortedTerms: Ember.computed.sort('terms', 'sortTerms'),
  isSession: false,
  isManaging: false,
  bufferTerms: [],
  actions: {
    manage: function(){
      var self = this;
      this.get('terms').then(function(terms){
        self.set('bufferTerms', terms.toArray());
        self.set('isManaging', true);
      });
    },
    save: function(){
      let subject = this.get('subject');
      let terms = subject.get('meshDescriptors');
      let promises = [];
      terms.clear();
      terms.addObjects(this.get('bufferTerms'));
      this.get('bufferTerms').forEach((term)=>{
        if(this.get('isCourse')){
          term.get('courses').addObject(subject);
          promises.pushObject(term.save());
        }
        if(this.get('isSession')){
          term.get('sessions').addObject(subject);
          promises.pushObject(term.save());
        }
      });
      promises.pushObject(subject.save());
      Ember.RSVP.all(promises).then(()=> {
        this.set('isManaging', false);
      });
    },
    cancel: function(){
      this.set('bufferTerms', []);
      this.set('isManaging', false);
    },
    addTermToBuffer: function(term){
      this.get('bufferTerms').addObject(term);
    },
    removeTermFromBuffer: function(term){
      this.get('bufferTerms').removeObject(term);
    }
  }
  //
  // actions: {
  //   add: function(descriptor){
  //     var subject = this.get('subject');
  //     subject.get('meshDescriptors').addObject(descriptor);
  //     if(this.get('isCourse')){
  //       descriptor.get('courses').addObject(this.get('subject'));
  //     }
  //     if(this.get('isSession')){
  //       descriptor.get('sessions').addObject(this.get('subject'));
  //     }
  //     subject.save();
  //     descriptor.save();
  //   },
  //   remove: function(descriptor){
  //     var subject = this.get('subject');
  //     subject.get('meshDescriptors').removeObject(descriptor);
  //     if(this.get('isCourse')){
  //       descriptor.get('courses').removeObject(this.get('subject'));
  //     }
  //     if(this.get('isSession')){
  //       descriptor.get('sessions').removeObject(this.get('subject'));
  //     }
  //     subject.save();
  //     descriptor.save();
  //   }
  // }
});
