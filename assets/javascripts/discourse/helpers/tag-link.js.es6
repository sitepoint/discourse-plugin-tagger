export default Handlebars.registerHelper('tag-link', function(property, options) {
  return new Handlebars.SafeString("<a href='/tag/" + this + "' class='badge-category restricted' style='background: #f7f7f7; color: #6d6d6d'>" + this + "</a>");
});
