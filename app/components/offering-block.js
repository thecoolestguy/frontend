import Ember from 'ember';
import layout from '../templates/components/offering-block';

export default Ember.Component.extend({
  layout: layout,
  block: null,
  actions: {
    removeOffering: function(offering){
      this.sendAction('removeOffering', offering);
    },
  }
});
