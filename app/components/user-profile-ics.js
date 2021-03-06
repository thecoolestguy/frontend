import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import sha256 from 'crypto-js/sha256';

export default Component.extend({
  iliosConfig: service(),

  classNameBindings: [':user-profile-ics', ':small-component', 'hasSavedRecently:has-saved:has-not-saved'],

  finishedSetup: false,
  hasSavedRecently: false,
  icsFeedKey: null,
  isManageable: false,
  isManaging: false,
  showCopySuccessMessage: false,
  user: null,

  host: reads('iliosConfig.apiHost'),

  icsFeedUrl: computed('icsFeedKey', 'host', function() {
    const icsFeedKey = this.icsFeedKey;
    let host = this.host;
    if (isPresent(icsFeedKey)) {
      if (isEmpty(host)) {
        host = window.location.protocol + '//' + window.location.hostname;
        const port = window.location.port;

        if (![80, 443].includes(port)) {
          host += ':' + port;
        }
      }
      return host  + '/ics/' + icsFeedKey;
    }

    return null;
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    const user = this.user;
    if (isPresent(user)) {
      this.set('icsFeedKey', user.get('icsFeedKey'));
    } else {
      this.set('icsFeedKey', null);
    }
  },

  /**
   * Generate a random token from a combination of
   * the userid, a random string and the curent time
   * @param String userId
   * @return String
   */
  randomToken(userId) {
    const now = Date.now();
    const randomValue = Math.random().toString(36).substr(2);
    const hash = sha256(userId + randomValue + now).toString();
    return hash;
  },

  refreshKey: task(function* () {
    const user = this.user;
    const token = this.randomToken(user.get('id'));
    user.set('icsFeedKey', token);
    yield user.save();
    this.setIsManaging(false);
    this.set('hasSavedRecently', true);
    yield timeout(500);
    this.set('hasSavedRecently', false);
  }).drop(),

  textCopied: task(function* () {
    this.set('showCopySuccessMessage', true);
    yield timeout(3000);
    this.set('showCopySuccessMessage', false);
  }).restartable()
});
