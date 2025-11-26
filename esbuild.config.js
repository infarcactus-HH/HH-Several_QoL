const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const terser = require("terser");
const csso = require("csso");
const htmlMinifier = require("html-minifier-terser");
const babelParser = require("@babel/parser");
const babelTraverse = require("@babel/traverse").default;

// Read package.json for metadata
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8")
);

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

      const outputFile = path.join(__dirname, "dist", "userscript.user.js");

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

// Plugin to load CSS files as text strings using csso for minification
const createCssTextPlugin = ({ minify }) => ({
  name: "css-text",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await fs.promises.readFile(args.path, "utf8");

      let output = css;

      if (minify) {
          try {
          const result = csso.minify(css);
          output = result.css;
          console.log(
            `📦 ${path.basename(args.path)} minified`
          );
        } catch (error) {
          console.warn("⚠️ CSS minification failed, using unminified CSS:", error.message);
          output = css;
        }
      }

      return {
        contents: `export default ${JSON.stringify(output)}`,
        loader: "js",
        resolveDir: path.dirname(args.path),
      };
    });
  },
});

// Plugin to minify HTML in tagged template literals using html`...`
// Uses proper AST parsing via Babel for reliability
const createHtmlMinifyPlugin = ({ minify, debug = false }) => ({
  name: "html-minify",
  setup(build) {
    build.onLoad({ filter: /\.ts$/ }, async (args) => {
      const source = await fs.promises.readFile(args.path, "utf8");
      if (!minify) {
        return null; // In dev mode, don't transform
      }

      // Skip if no html tagged templates - check for both import and usage
      if (!source.includes("html`")) {
        return null;
      }

      // Verify the html function is imported (from utils/html or ./html)
      const hasHtmlImport = /import\s+(?:\{[^}]*\bhtml\b[^}]*\}|html)\s+from\s+['"][^'"]*html['"]/.test(source);
      if (!hasHtmlImport && debug) {
        console.log(`⚠️ ${path.basename(args.path)} has html\` but no html import detected, will still process`);
      }

      try {
        // Parse the source code into an AST
        const ast = babelParser.parse(source, {
          sourceType: "module",
          plugins: ["typescript"],
        });

        // Collect all html tagged template literals with their positions
        const replacements = [];

        babelTraverse(ast, {
          TaggedTemplateExpression(nodePath) {
            const { node } = nodePath;

            // Check if this is an html`` tagged template
            if (node.tag.type !== "Identifier" || node.tag.name !== "html") {
              return;
            }

            const { quasis, expressions } = node.quasi;

            // Build the template content with placeholders for expressions
            let templateContent = "";
            const expressionTexts = [];

            quasis.forEach((quasi, i) => {
              templateContent += quasi.value.raw;
              if (i < expressions.length) {
                // Store the original expression source code
                const expr = expressions[i];
                const exprSource = source.slice(expr.start, expr.end);
                expressionTexts.push(exprSource);
                templateContent += `__HTML_EXPR_${i}__`;
              }
            });

            replacements.push({
              start: node.start,
              end: node.end,
              templateContent,
              expressionTexts,
              // Store original for debug
              originalSource: source.slice(node.start, node.end),
            });
          },
        });

        if (replacements.length === 0) {
          if (debug) {
            console.log(`⏭️ ${path.basename(args.path)} no html\`\` tagged templates found by AST parser`);
          }
          return null;
        }

        // Process replacements in reverse order to preserve positions
        let output = source;
        const debugInfo = [];

        for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
          try {
            // Minify the HTML content
            const minified = await htmlMinifier.minify(replacement.templateContent, {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeEmptyAttributes: false,
              collapseBooleanAttributes: true,
              minifyCSS: true,
              minifyJS: false, // Don't minify JS in attributes - could break interpolations
              conservativeCollapse: true,
            });

            // Restore expressions (case-insensitive because html-minifier can lowercase attributes)
            let finalContent = minified;
            replacement.expressionTexts.forEach((exprText, i) => {
              finalContent = finalContent.replace(
                new RegExp(`__HTML_EXPR_${i}__`, 'gi'),
                `\${${exprText}}`
              );
            });

            // Build the new code (just a template literal, html tag is removed)
            const newCode = `\`${finalContent}\``;

            // Store debug info
            if (debug) {
              debugInfo.push({
                original: replacement.originalSource,
                minified: newCode,
                beforeLen: replacement.originalSource.length,
                afterLen: newCode.length,
              });
            }

            // Replace the tagged template with just a regular template literal
            output =
              output.slice(0, replacement.start) +
              newCode +
              output.slice(replacement.end);
          } catch (error) {
            console.warn(
              `⚠️ HTML minification failed for template in ${args.path}:`,
              error.message
            );
          }
        }

        // Log results
        const fileName = path.basename(args.path);
        console.log(
          `🗜️ ${fileName}: ${replacements.length} HTML template(s) minified`
        );

        // Debug output - show before/after for each template
        if (debug && debugInfo.length > 0) {
          console.log(`\n${"=".repeat(60)}`);
          console.log(`📄 FILE: ${fileName}`);
          console.log(`${"=".repeat(60)}`);
          
          debugInfo.forEach((info, idx) => {
            const savedBytes = info.beforeLen - 4 - info.afterLen; // Subtract 4 for the removed html tag
            const savedPercent = ((savedBytes / info.beforeLen) * 100).toFixed(1);
            
            console.log(`\n--- Template #${idx + 1} (saved ${savedBytes} bytes, ${savedPercent}%) ---`);
            console.log(`📥 BEFORE (${info.beforeLen} chars):`);
            console.log(info.original);
            console.log(`\n📤 AFTER (${info.afterLen} chars):`);
            console.log(info.minified);
          });
          
          console.log(`\n${"=".repeat(60)}\n`);
        }

        return {
          contents: output,
          loader: "ts",
        };
      } catch (parseError) {
        // If parsing fails, return null to let esbuild handle it normally
        console.warn(
          `⚠️ AST parsing failed for ${args.path}, skipping HTML minification:`,
          parseError.message
        );
        return null;
      }
    });
  },
});

async function build() {
  const isWatch = process.argv.includes("--watch");
  const isDebug = process.argv.includes("--debug");

  try {
    const buildOptions = {
      entryPoints: ["src/main.ts"],
      bundle: true,
      outfile: "dist/userscript.user.js",
      format: "iife", // Immediately Invoked Function Expression
      target: "es2021",
      minify: !isWatch, // Don't minify in watch mode for easier debugging
      sourcemap: false,
      external: ["jquery"], // jQuery is available globally as $
      plugins: [
        createHtmlMinifyPlugin({ minify: !isWatch, debug: isDebug }),
        createCssTextPlugin({ minify: !isWatch }),
        userscriptPlugin,
      ],
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
