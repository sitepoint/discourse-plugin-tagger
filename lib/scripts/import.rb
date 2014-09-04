#!/usr/bin/env ruby

require_relative "../../../../config/environment"

require 'pry'
binding.pry


PostCustomField.where(name: :tag).each do |custom_field|
  @topic = Topic.find(custom_field.post.topic_id)

  next if @topic.tags.map(&:title).include?(custom_field.value)

  @topic.tags << ::Tagger::Tag.where(title: custom_field.value)
end
