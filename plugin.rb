# name: tagger
# about: simple tagging support for discourse
# version: 0.1
# authors: Benjamin Kampmann

# load the engine
load File.expand_path('../lib/tagger/engine.rb', __FILE__)

register_asset "javascripts/user_tag_patches.js"
register_asset "javascripts/discourse/templates/connectors/composer-open/add-tags.js.handlebars"
register_asset "javascripts/discourse/templates/connectors/topic-title/tags.js.handlebars"
register_asset "javascripts/discourse/templates/tag_topic_list_head.js.handlebars"
register_asset "javascripts/discourse/templates/sidebar_tag_cloud.js.handlebars"
register_asset "javascripts/discourse/templates/sidebar_tag_info.js.handlebars"
register_asset "javascripts/discourse/templates/tag_cloud.js.handlebars"
register_asset "javascripts/composer_tagging.js"
register_asset "javascripts/topic_tags.js"

# admin UI
register_asset "javascripts/discourse/templates/tags_admin.js.handlebars"
register_asset "javascripts/admin/tag_model.js", :admin
register_asset "javascripts/admin/tagging_admin.js", :admin

# UI
register_asset "stylesheets/tag_styles.scss"
register_asset "stylesheets/tag_styles_mobile.scss", :mobile

after_initialize do
  require_dependency File.expand_path('../integrate.rb', __FILE__)

  Discourse.module_eval do
    def self.filters
      @filters ||= [:latest, :unread, :new, :starred, :read, :posted, :tag]
    end

    def self.anonymous_filters
      @anonymous_filters ||= [:latest, :tag]
    end
  end

  TopicQuery.class_eval do
    def list_tag
      TopicList.new(:tag, @user, topics_query)
    end

    alias_method :core_default_results, :default_results
    def default_results(options={})
      result = core_default_results(options)

      result = result.includes(:tags)
      result
    end

    private
    def topics_query(options={})
      suggested_ordering(default_results(options), options)
    end
  end
end
