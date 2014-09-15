Discourse.TagsView = Discourse.View.extend({
  templateName: "topic_tags",
  attributeBindings: ["model", 'new_tags', "editingTopic"],
  editingTopic: Em.computed.alias('controller.editingTopic'),

  editingChanged: function(){
    this.rerender();
  }.observes("editingTopic")
});


Discourse.TopicView.reopen({
  removeTags: function(){
    if (this.get("tagsview")){
        this.get("tagsview").destroy();
        this.set("tagsview", null);
    }
  }.on("willClearRender"),

  killTags: function(){
    if (this.get("tagsview")){
        this.get("tagsview").destroy();
        this.set("tagsview", null);
    }
  }.on("willDestroyElement")
});


Discourse.TopicController.reopen({
  actions: {
    removeTag: function(toRm){
      this.get("new_tags").removeObject(toRm.toString());
    },
    addTag: function(toAdd) {
      this.get("new_tags").addObject(toAdd.toString());
    }
  },

  editTags: function(){
    var newTags;
    if (!this.get("editingTopic")) {
      newTags = null;
    } else {
      newTags = this.get("tags").copy();
    }
    this.set("new_tags", newTags);
  }.observes("editingTopic"),

  saveTags: function(){
    if (!this.get("topicSaving")) return;
    // implicit is good enough for us here
    var topic = this.get("model"),
        tags = this.get("new_tags"); // we do total inline edit here
    Discourse.ajax('/tagger/set_tags', {
                        data: {
                          tags: tags.join(","),
                          topic_id: topic.get("id")
                        }
                      })
        .then(function(tag_res) {
          topic.get("tags").setObjects(tag_res.tags);
        });
  }.observes('topicSaving')
});

Discourse.BreadCrumbsComponent.reopen({
  init: function() {
    this._super();

    var self = this;
    Discourse.ajax('/tagger/tags').then(function(tags) {
      self.set('tags', tags);
    });
  }
});

Discourse.DiscoveryCategoriesRoute.reopen({
  beforeModel: function() {
    this.controllerFor('navigation/categories').setProperties({
      'filterMode': 'categories',
      'tag': null,
    });
  }
});

// topics of tags views

Discourse.TaggedTagRoute = Discourse.Route.extend({
  model: function(params){
    this.set("tag", params.tag);
    return Discourse.TopicList.find("tagger/tag/" + params.tag, {});
  },
  setupController: function(controller, model) {
    this.controllerFor('discovery/topics').setProperties({
       "model": model,
       "tagname": this.get("tag")
     });
  },
  renderTemplate: function() {
    var controller = this.controllerFor('discovery/topics');
    this.render('navigation/categories', { controller: this.controllerFor('navigation/categories').setProperties({
      'filterMode': 'tag',
      'tag': this.get('tag')
    }), outlet: 'navigation-bar' });
    this.render('discovery/topics', { controller: controller, outlet: 'list-container'});
  }
});

Discourse.TaggedCloudRoute = Discourse.Route.extend({
  model: function(){
    return Discourse.ajax("/tagger/tags/cloud");
  },
  renderTemplate: function() {
    var controller = this.controllerFor('navigation/categories').set('filterMode', 'tag');
    this.render('navigation/categories', { controller: controller, outlet: 'navigation-bar' });
    this.render('tag_cloud', { outlet: 'list-container'});
  }
});

Discourse.TaggedView = Discourse.View.extend({
  templateName: "discovery"
});

Discourse.Route.buildRoutes(function() {
  this.resource('tagged', {path: "tag"}, function() {
    this.route('tag', { path: '/:tag' });
    this.route('cloud', { path: '/' });
  });
});
