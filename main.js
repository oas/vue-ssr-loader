const FileSystem = require("fs");
const Path = require("path");
const Module = require("module");

const Vue = require("vue");
const VueRenderer = require('vue-server-renderer');
const VueCompiler = require("vue-template-compiler");

module.exports = function (options) {
	this.path = options.path;

	// Automatic Asset Injection must be disabled to allow our manual injection.
	this.renderer = VueRenderer.createRenderer({
		inject: false,
		template: options.template
	});

	this.compile = function (serverFile, clientFile, context) {
		// Resolve the relative server and client path.
		const serverPath = Path.resolve(this.path, serverFile);
		const clientPath = Path.resolve(this.path, clientFile);

		// The server file is used to render the page on the server.
		// <template>: vue template
		// <script>: vue instance
		const serverDescriptor = VueCompiler.parseComponent(FileSystem.readFileSync(serverPath).toString());

		// The client file is used to add css or javascript to the page. Will be bundled in the future.
		// <style>: css
		// <script>: javascript
		const clientDescriptor = VueCompiler.parseComponent(FileSystem.readFileSync(clientPath).toString());

		// Enrich the vue instance.
		const instance = this.compileScript(serverDescriptor.script.content, serverPath);
		instance.template = serverDescriptor.template.content;

		// Enrich the context.
		context.styles = "<style data-server-rendered=\"true\">" + clientDescriptor.styles[0].content + "</style>";
		context.scripts = "<script data-server-rendered=\"true\">" + clientDescriptor.script.content + "</script>";

		return this.renderer.renderToString(new Vue(instance), context);
	};

	this.compileScript = function (content, path) {
		// We are creating a virtual module so we can hot reload changes in the .vue file.
		// TODO: Are we using id and filename correctly?
		const virtualModule = new Module(path, module);
		virtualModule.id = path;
		virtualModule.filename = path;
		virtualModule.paths = Module._nodeModulePaths(Path.dirname(path));
		virtualModule._compile(content, virtualModule.filename);

		return virtualModule.exports;
	};
};
