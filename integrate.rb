
# Integrate our plugin with Discourse


# add our tags to the topics
module TopicExtender
  def self.included(klass)
    klass.has_and_belongs_to_many :tags, autosave: true, class_name: "::Tagger::Tag"
  end
end

Topic.send(:include, TopicExtender)


# add the tags to the serializer
module ExtendTopicViewSerializer
  def self.included(klass)
    klass.attributes :tags
    klass.attributes :tag_list
  end

  def tags
    object.topic.tags.map {|t| t.title} || []
  end

  def tag_list
    Tagger::Tag.pluck(:title).sort || []
  end
end

module ExtendListableTopicSerializer
  def self.included(klass)
    klass.attributes :tags
  end

  def tags
    object.tags.map { |t| t.title } || []
  end
end

module ExtendSiteSerializer
  def self.included(klass)
    klass.attributes :tag_list
  end

  def tag_list
    Tagger::Tag.pluck(:title).sort || []
  end
end

module TopicQueryExtender
  def self.extended(klass)
    klass.send(:alias_method, :core_default_results, :default_results)

    klass.send(:define_method, :default_results) do |options|
      result = core_default_results(options)
      result = result.includes(:tags)

      result
    end
  end
end

TopicQuery.send(:extend, TopicQueryExtender)
SiteSerializer.send(:include, ExtendSiteSerializer)
TopicViewSerializer.send(:include, ExtendTopicViewSerializer)
ListableTopicSerializer.send(:include, ExtendListableTopicSerializer)

# And mount the engine
Discourse::Application.routes.append do
  mount Tagger::Engine, at: '/tagger'
end
