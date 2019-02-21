const FileSystem = require("fs");
const Path = require("path");
const Module = require("module");

const Vue = require("vue");
const Renderer = require('vue-server-renderer');
const Compiler = require("vue-template-compiler");

module.exports = function (options) {
	// Automatic Asset Injection must be disabled to allow our manual injection.
	options.inject = false;

	this.renderer = Renderer.createRenderer(options);

	this.compile = function (path, context) {
		// the template value is used for the http response:
		// <template>: will be added as a vue template
		// <style>: will be injected into the defined <style> tag of the website
		// <script>: will be injected into the defined <script> tag of the website
		const component = this.compileComponent(FileSystem.readFileSync(path).toString(), path);
		const descriptor = Compiler.parseComponent(component.template);

		component.template = descriptor.template.content;
		context.styles = "<style data-server-rendered=\"true\">" + descriptor.styles[0].content.replace(/[\r\n\t]/g, "") + "</style>";
		context.scripts = "<script data-server-rendered=\"true\">" + descriptor.script.content + "</script>"; // TODO: use uglify-js to minify the content of <script>

		return this.renderer.renderToString(new Vue(component), context);
	};

	this.compileComponent = function (content, path) {
		// the server component contains the server logic and will be added to the vue instance
		// the vue template defined in the <client> tag can react based on the server logic

		// we are creating a virtual module so we can hot reload changes in the .vue file
		const virtualModule = new Module(path, module);
		virtualModule.id = path;
		virtualModule.filename = path;
		virtualModule.paths = Module._nodeModulePaths(Path.dirname(path));
		virtualModule._compile(content, virtualModule.filename);

		return virtualModule.exports;
	};
};