const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Read package.json for metadata
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
);

// UserScript header template
const userscriptHeader = `// ==UserScript==
// @name         Several QoL
// @namespace    http://tampermonkey.net/
// @version      ${packageJson.version}
// @description  ${packageJson.description}
// @author       ${packageJson.author}
// @license      ${packageJson.license}
// @match        https://*.haremheroes.com/*
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
// @grant        GM.addStyle
// @grant        GM_addStyle
// @grant        GM.openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==`;

// UserScript header plugin for esbuild
const userscriptPlugin = {
  name: 'userscript-header',
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;
      
      const outputFile = path.join(__dirname, 'dist', 'userscript.user.js');
      
      try {
        // Read the generated file
        let content = fs.readFileSync(outputFile, 'utf8');
        
        // Add header if not already present
        if (!content.startsWith('// ==UserScript==')) {
          const newContent = userscriptHeader + '\n\n' + content;
          fs.writeFileSync(outputFile, newContent, 'utf8');
          console.log('✅ Userscript header added and format cleaned');
        }
      } catch (error) {
        console.error('❌ Error processing userscript:', error);
      }
    });
  }
};

// Plugin to load CSS files as text strings (minified)
const cssTextPlugin = {
  name: 'css-text',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      console.log('📦 Loading CSS file:', args.path);
      const css = fs.readFileSync(args.path, 'utf8');
      
      // Minify CSS: remove comments, extra whitespace, and line breaks
      const minified = css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with single space
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around CSS syntax characters
        .trim();
      
      console.log('📦 CSS minified:', css.length, '→', minified.length, 'bytes');
      
      return {
        contents: `export default ${JSON.stringify(minified)}`,
        loader: 'js',
      };
    });
  },
};

// Plugin to minify HTML in template strings and collapse multi-line string concatenations
const minifyHTMLPlugin = {
  name: 'minify-html',
  setup(build) {
    build.onLoad({ filter: /\.ts$/ }, async (args) => {
      const fs = require('fs');
      let contents = fs.readFileSync(args.path, 'utf8');
      
      // Minify HTML in template strings (both backticks and regular strings starting with <)
      // This matches $(`...HTML...`) and $('...HTML...') and $("...HTML...")
      contents = contents.replace(/\$\(`([^`]*<[^`]*)`\)/g, (match, html) => {
        const minified = html
          .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with single space
          .replace(/>\s+</g, '><') // Remove spaces between tags
          .trim();
        return `$(\`${minified}\`)`;
      });
      
      contents = contents.replace(/\$\('([^']*<[^']*)'\)/g, (match, html) => {
        const minified = html
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .trim();
        return `$('${minified}')`;
      });
      
      contents = contents.replace(/\$\("([^"]*<[^"]*)"\)/g, (match, html) => {
        const minified = html
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .trim();
        return `$("${minified}")`;
      });
      
      // Collapse multi-line string concatenations with \n
      // Match patterns like: `text\n\n` + `more text\n` + ...
      // Also handle: "text\n\n" + "more text\n" + ...
      contents = contents.replace(/(`[^`]*`\s*\+\s*)+`[^`]*`/g, (match) => {
        // Extract all the individual string parts
        const parts = match.match(/`([^`]*)`/g);
        if (!parts) return match;
        
        // Combine all parts into one string, preserving \n but removing extra whitespace
        const combined = parts.map(p => p.slice(1, -1)).join('');
        return `\`${combined}\``;
      });
      
      return {
        contents,
        loader: 'ts',
      };
    });
  },
};

async function build() {
  const isWatch = process.argv.includes('--watch');
  
  try {
    const buildOptions = {
      entryPoints: ['src/main.ts'],
      bundle: true,
      outfile: 'dist/userscript.user.js',
      format: 'iife', // Immediately Invoked Function Expression
      target: 'es2021',
      minify: !isWatch, // Don't minify in watch mode for easier debugging
      sourcemap: false,
      external: ['jquery'], // jQuery is available globally as $
      plugins: [minifyHTMLPlugin, cssTextPlugin, userscriptPlugin],
      define: {
        // Replace any build-time constants
        'process.env.NODE_ENV': isWatch ? '"development"' : '"production"'
      },
      // Clean, readable output
      treeShaking: true,
      platform: 'browser',
      // Don't split code
      splitting: false,
      // Keep names readable for debugging
      keepNames: isWatch,
      // Optimization settings
      drop: isWatch ? [] : ['debugger'], // Keep debugger in watch mode
      dropLabels: isWatch ? [] : ['DEV'], // Keep DEV labeled code in watch mode
      
    };

    if (isWatch) {
      console.log('👀 Starting watch mode...');
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('👀 Watching for changes...');
    } else {
      await esbuild.build(buildOptions);
      console.log('✅ Build completed successfully!');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build if this file is executed directly
if (require.main === module) {
  build();
}

module.exports = { build };