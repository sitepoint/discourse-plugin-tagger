Discourse.Composer.reopen({

  // only creation of new topic and editing of first post are valid for us
  can_be_tagged: function(){
    return this.get("creatingTopic") || (this.get("editingPost") && this.get("editingFirstPost"));
  }.property("creatingTopic", "editingPost", "editingFirstPost"),

  createPost: function(opts) {
    var tags = (this.get("tags") || []).join(",");
      var dfr = this._super(opts);
    dfr.then(function(post_result){
      var tagger = Discourse.ajax('/tagger/set_tags', {
        data: {
          tags: tags,
          topic_id: post_result.post.topic_id
        }
      });
      tagger.then(function(){
        return post_result;
      });
      return tagger;
    });
    return dfr;
  },

  updateTags: function(){
    if (!this.get("tags")) this.set("tags", []);
    this.get("tags").setObjects((this.get("topic.tags") || []));
  }.observes("post", "topic", "draftKey"),

  editPost: function(opts) {
    var tags = (this.get("tags") || []).join(","),
      dfr = this._super(opts),

    post = this.get("post");
    // this promise never terminates as of now. not that we care
    if (post.get('post_number') === 1){
      // we are topic post: update tags, too
      var after_tags = Discourse.ajax('/tagger/set_tags', {
        data: {
          tags: tags,
          topic_id: post.get("topic_id")
        }
      });
      after_tags.then(function(tag_res) {
        post.get("topic.tags").setObjects(tag_res.tags);
      }.bind(this));
    }
    return dfr;
  }
});

require("discourse/controllers/composer")["default"].reopen({
  actions: {
    removeTag: function(toRm){
      this.get("content.tags").removeObject(toRm.toString());
    }
  }
});
