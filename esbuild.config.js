const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const terser = require("terser");

// Read package.json for metadata
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8")
);

const outputFile = `dist/userscript.${process.argv.includes("--dev") ? "dev." : ""}user.js`;

// UserScript header template
const userscriptHeader = `// ==UserScript==
// @name         Several QoL
// @namespace    http://tampermonkey.net/
// @version      ${packageJson.version}
// @description  ${packageJson.description}
// @author       ${packageJson.author}
// @license      ${packageJson.license}
// @match        https://nutaku.haremheroes.com/*
// @match        https://*.hentaiheroes.com/*
// @match        https://*.gayharem.com/*
// @match        https://*.comixharem.com/*
// @match        https://*.hornyheroes.com/*
// @match        https://*.pornstarharem.com/*
// @match        https://*.transpornstarharem.com/*
// @match        https://*.gaypornstarharem.com/*
// @match        https://*.mangarpg.com/*
// @updateURL    https://github.com/infarcactus-HH/HH-Several_QoL/raw/refs/heads/main/dist/userscript.user.js
// @downloadURL  https://github.com/infarcactus-HH/HH-Several_QoL/raw/refs/heads/main/dist/userscript.user.js
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_info
// @grant        GM_listValues
// @grant        GM_cookie
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==`;

// UserScript header plugin for esbuild, with Terser minification
const userscriptPlugin = {
  name: "userscript-header",
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;

      try {
        // Read the generated file
        let content = fs.readFileSync(outputFile, "utf8");
        const isWatch = process.argv.includes("--watch");

        // Minify with Terser if not in watch mode
        if (!isWatch) {
          const terserResult = await terser.minify(content, {
            format: { comments: false },
            compress: {
              passes: 3,
              drop_console: ["log", "info", "debug"],
            },
            mangle: true,
          });
          if (terserResult.code) {
            content = terserResult.code;

            const jqueryTemplateRegex = /\$\(`(.+)`\)/g;
            content = content.replace(jqueryTemplateRegex, (match, p1) => {
              const singleLine = p1.replace(/\\n\s+/g, "").trim();
              return `$(\`${singleLine}\`)`;
            });

            console.log("✅ Minified with Terser:", content.length, "bytes");
          } else {
            console.warn(
              "⚠️ Terser did not return code, skipping minification."
            );
          }
        }

        // Add header if not already present
        if (!content.startsWith("// ==UserScript==")) {
          const newContent = userscriptHeader + "\n\n" + content;
          fs.writeFileSync(outputFile, newContent, "utf8");
          console.log("✅ Userscript header added and format cleaned");
        }
      } catch (error) {
        console.error("❌ Error processing userscript:", error);
      }
    });
  },
};

// Plugin to load CSS files as text strings using esbuild's CSS parser
const createCssTextPlugin = ({ minify }) => ({
  name: "css-text",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      console.log("📦 Loading CSS file:", args.path);
      const css = await fs.promises.readFile(args.path, "utf8");

      const { code } = await esbuild.transform(css, {
        loader: "css",
        minify,
        target: "es2021",
        logLevel: "silent",
      });

      const output = code.trim();

      if (minify) {
        console.log(
          "📦 CSS minified:",
          css.length,
          "→",
          output.length,
          "bytes"
        );
      }

      return {
        contents: `export default ${JSON.stringify(output)}`,
        loader: "js",
        resolveDir: path.dirname(args.path),
      };
    });
  },
});

async function build() {
  const isWatch = process.argv.includes("--watch");
  

  try {
    const buildOptions = {
      entryPoints: ["src/main.ts"],
      bundle: true,
      outfile: outputFile,
      format: "iife", // Immediately Invoked Function Expression
      target: "es2021",
      minify: !isWatch, // Don't minify in watch mode for easier debugging
      sourcemap: false,
      external: ["jquery"], // jQuery is available globally as $
  plugins: [createCssTextPlugin({ minify: !isWatch }), userscriptPlugin],
      define: {
        // Replace any build-time constants
        "process.env.NODE_ENV": isWatch ? '"development"' : '"production"',
      },
      // Clean, readable output
      treeShaking: true,
      platform: "browser",
      // Don't split code
      splitting: false,
      // Keep names readable for debugging
      keepNames: isWatch,
      // Optimization settings
      drop: isWatch ? [] : ["debugger"], // Keep debugger in watch mode
      dropLabels: isWatch ? [] : ["DEV"], // Keep DEV labeled code in watch mode
    };

    if (isWatch) {
      console.log("👀 Starting watch mode...");
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log("👀 Watching for changes...");
    } else {
      await esbuild.build(buildOptions);
      console.log("✅ Build completed successfully!");
    }
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Run build if this file is executed directly
if (require.main === module) {
  build();
}

module.exports = { build };
