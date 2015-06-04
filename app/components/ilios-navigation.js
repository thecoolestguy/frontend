import Ember from 'ember';

export default Ember.Component.extend({
  isMenuVisible: false,
  menuItems: [
    {
      'icon': 'home',
      'route': 'dashboard',
      'name': Ember.I18n.t('navigation.dashboard')
    },
    {
      'icon': 'book',
      'route': 'courses',
      'name': Ember.I18n.t('navigation.courses')
    },
    {
      'icon': 'mortar-board',
      'route': 'learnerGroups',
      'name': Ember.I18n.t('navigation.learnerGroups')
    },
    {
      'icon': 'user-md',
      'route': 'instructorGroups',
      'name': Ember.I18n.t('navigation.instructorGroups')
    },
    {
      'icon': 'list-alt',
      'route': 'programs',
      'name': Ember.I18n.t('navigation.programs')
    },
  ],
  actions: {
    toggleMenuVisibility: function(){
      this.toggleProperty('isMenuVisible');
    }
  }
});
