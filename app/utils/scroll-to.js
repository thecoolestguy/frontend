import Ember from 'ember';

export default function scrollTo(elementQuery, time) {
  time = typeof time !== 'undefined' ? time : 500;

  var promise = new Ember.RSVP.Promise(function(resolve) {
    Ember.run.next(()=>{
      $('html, body').animate({
        scrollTop: $(elementQuery).offset().top
      }, time, function(){
        resolve();
      });
    });
  });

  return promise;
}
