import Component from '@ember/component';
import { computed } from '@ember/object';
import { lte } from '@ember/object/computed';

export default Component.extend({
  classNames: ['pagedlist-controls'],
  tagName: 'div',

  limit: null,
  limitless: false,
  offset: null,
  total: null,

  firstPage: lte('offset', 0),

  start: computed('offset', function() {
    return parseInt(this.offset, 10) + 1;
  }),

  end: computed('offset', 'limit', function() {
    const total = this.total;
    let end = parseInt(this.offset, 10) + parseInt(this.limit, 10);
    if(end > total) {
      end = total;
    }

    return end;
  }),

  offsetOptions: computed('total', function() {
    const total = this.limitless?1000:this.total;
    const available = [10, 25, 50, 100, 200, 400, 1000];
    let options = available.filter(option => {
      return option < total;
    });
    options.pushObject(available[options.length]);

    return options;
  }),

  lastPage: computed('total', 'limit', 'offset', 'limitless', function() {
    if(this.limitless) {
      return false;
    }

    const total = parseInt(this.total, 10);
    const limit = parseInt(this.limit, 10);
    const offset = parseInt(this.offset, 10);

    return (offset + limit) >= total;
  }),

  actions: {
    goForward() {
      const offset = this.offset;
      const limit = this.limit;
      this.setOffset(offset+limit);
    },

    goBack() {
      const offset = this.offset;
      const limit = this.limit;
      this.setOffset(offset-limit);
    },

    setOffset(offset) {
      const limit = this.limit;
      const total = this.total;
      const largestOffset = total - limit;
      if (offset < 0) {
        offset = 0;
      }
      if (offset > largestOffset) {
        offset = largestOffset;
      }

      this.setOffset(offset);
    },

    setLimit(limit) {
      this.setLimit(parseInt(limit, 10));
      this.setOffset(0);
    }
  }
});
