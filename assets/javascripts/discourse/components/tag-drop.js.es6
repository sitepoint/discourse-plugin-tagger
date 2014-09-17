/**
  Renders a drop down for selecting a tag

  @class TagDropComponent
  @extends Ember.Component
  @namespace Discourse
  @module Discourse
**/
export default Ember.Component.extend({
  classNameBindings: ['tag::no-tag', 'tags:has-drop'],
  tagName: 'li',

  iconClass: function() {
    return "fa fa-caret-down";
  }.property('expanded'),

  badgeStyle: function() {
    return "background-color: #f7f7f7; color: #6d6d6d";
  }.property('tag'),

  actions: {
    expand: function() {
      if (this.get('expanded')) {
        this.close();
        return;
      }

      this.set('expanded', true);

      var self = this,
          $dropdown = this.$()[0];

      this.$('a[data-drop-close]').on('click.category-drop', function() {
        self.close();
      });

      $('html').on('click.category-drop', function(e) {
        var $target = $(e.target),
            closest = $target.closest($dropdown);

        return ($(e.currentTarget).hasClass('badge-category') || (closest.length && closest[0] === $dropdown)) ? true : self.close();
      });
    }
  },

  close: function() {
    $('html').off('click.category-drop');
    this.$('a[data-drop-close]').off('click.category-drop');
    this.set('expanded', false);
  },

  willDestroyElement: function() {
    $('html').off('click.category-drop');
    this.$('a[data-drop-close]').off('click.category-drop');
  }
});
