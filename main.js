const FileSystem = require("fs");
const Path = require("path");

const Compiler = require("vue-template-compiler");
const Module = require('module');
const Vue = require("vue");

module.exports = function () {
	this.compile = function (path) {
		// parse our custom .vue file that consists of two custom tags: <client> and <server>
		const template = Compiler.parseComponent(FileSystem.readFileSync(path).toString());

		let clientComponent;
		let serverComponent;
		// TODO: check if both custom tags exist... if not, react accordingly
		for (const block of template.customBlocks) {
			switch (block.type) {
				case "client":
					// the client component is used for the http response:
					// <template>: will be added as a vue template
					// <style>: will be injected into the defined <style> tag of the website
					// <script>: will be injected into the defined <script> tag of the website
					clientComponent = Compiler.parseComponent(block.content);
					break;
				case "server":
					// the server component contains the server logic and will be added to the vue instance
					// the vue template defined in the <client> tag can react based on the server logic

					// we are creating a virtual module so we can hot reload changes in the .vue file
					const virtualModule = new Module(path, module);
					virtualModule.id = path;
					virtualModule.filename = path;
					virtualModule.paths = Module._nodeModulePaths(Path.dirname(path));
					virtualModule._compile(Compiler.parseComponent(block.content).script.content, virtualModule.filename);

					serverComponent = virtualModule.exports;
					break;
			}
		}

		const options = serverComponent;
		options.template = clientComponent.template.content;

		// TODO: we should add the vue-server-renderer configuration to this file
		return {
			vue: new Vue(options),
			options: {
				styles: clientComponent.styles[0].content.replace(/[\r\n\t]/g, ""),
				scripts: clientComponent.script.content // TODO: use uglify-js to minify the content of <script>
			}
		};
	};
};