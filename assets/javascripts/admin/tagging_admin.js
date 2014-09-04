/* global confirm */
if (!Discourse.AdminTemplatesAdminView) Discourse.AdminTemplatesAdminView = Discourse.View.extend({});

Discourse.AdminTemplatesAdminView.reopen({
  insertTagsitemView: function() {
    $(".nav").append('<li><a href="/tagger/admin">Tags</a></li>');
  }.on("didInsertElement")
});

Discourse.TaggerRoute = Discourse.AdminRoute.extend({
 // this is just an empty admin route so that we are shown under the menu, too
});

//Discourse.TaggerAdminView = Discourse.View.extend(Discourse.ScrollTop);

Discourse.TaggerAdminController = Ember.ArrayController.extend({

  sortProperties: ["title", "id"],
  sortAscending: true,

  actions: {
    expandTag: function(model){
      model.set("new_title", model.get("title"));
      model.set("new_info", model.get("info"));
      this.set("editing", model);
    },
    cancelExpand: function(cur_model){
      this.set("editing", false);
    },
    deleteTag: function(cur_model){
      if (!confirm("Are you sure you want to delete '" + cur_model.get("title") + "'?")) return;
      this.set("editing", false);
      cur_model.destroy().then(function(){
        this.removeObject(cur_model);
      }.bind(this));
    },
    startMergeTag: function(cur_model){
      this.set("editing", false);
      this.set("toMerge", cur_model);
    },
    cancelMergeTag: function(){
      this.set("toMerge", false);
    },
    confirmMergeTag: function(target){
      var source = this.get("toMerge");
      target.merge(source).then(function(){
        this.removeObject(source);
        this.set("toMerge", false);
      }.bind(this));
    },
    saveTag: function(tag){
      var title = tag.get("new_title").toLowerCase();
      if (!this.checkTagValid(title)) return;

      tag.set("title", title);
      tag.set("info", tag.get("new_info"));
      tag.set("loading", true);
      this.set("editing", false);
      tag.save().then(function(){
        tag.setProperties({
          "loading": false,
          "expanded": false
        });
      });
    },
    newTag: function(){
      var new_tag = this.get("newTagName").toLowerCase(),
        me = this;
      if (!this.checkTagValid(new_tag)) return;

      this.set("newTagName", "");

      new_tag = Discourse.Tag.create({title: new_tag});
      new_tag.save().then(function(resp) {
        new_tag.setProperties(resp);
        me.get("model").pushObject(new_tag);
      });
    }
  },

  filteredContent: function(){
    var filter = this.get("tagname");
    if (!filter) return this.get("arrangedContent");
    var regexp = new RegExp(".*" + filter + ".*");
    return this.get("arrangedContent").filter(function(itm){
      return itm.get("title").match(regexp) !== null;
    });
  }.property("arrangedContent", "tagname"),

  checkTagValid: function(new_tag){
    return new_tag.length >= 3 && this.isUnique(new_tag);
  },

  isUnique: function(title) {
    return this.get("model").find(function(itm){ return itm === title; }) === undefined;
  }
});

Discourse.TaggerAdminRoute = Discourse.Route.extend({
  model: function() {
    return Discourse.Tag.findAll();
  },

  renderTemplate: function() {
    this.render("tags_admin");
  }
});

Discourse.Route.buildRoutes(function() {
  this.resource('tagger', function (){
    this.route("admin");
  });
});
