# aocoffee.com

Static GitHub Pages site for aocoffee.com, hosting the Sortmark Safari extension's privacy policy and support pages.
The pages under `sortmark/` are generated from `docs/app-store/privacy-policy.md` and `support.md` in the sortmark project.
To regenerate after editing those docs, run `node build.mjs` from this directory (or `node build.mjs <path to sortmark/docs/app-store>`), then commit the HTML.
