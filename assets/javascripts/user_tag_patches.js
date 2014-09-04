Discourse.User.reopen({
  canAddNewTags: function(){
    // only admins, staff, leaders and elders are allowed to add new tags via the frontend
    if (this.staff) return true;
    return ["leader", "elder"].indexOf(this.get("trustLevel").name) > 0;
  }.property("admin", "moderator", "trust_level")
});
