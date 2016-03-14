var commonmarkParser = new require('commonmark').Parser();
var commonmarkRenderer = new require('commonmark').HtmlRenderer();

module.exports = function commonmark(content) {
	var parsed = commonmarkParser.parse(content);
	return commonmarkRenderer.render(parsed);
};