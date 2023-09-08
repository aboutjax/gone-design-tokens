const StyleDictionary = require("style-dictionary");
const { registerTransforms } = require("@tokens-studio/sd-transforms");

// sd-transforms, 2nd parameter for options can be added
// See docs: https://github.com/tokens-studio/sd-transforms
registerTransforms(StyleDictionary, {
  expand: { composite: true, typography: true, shadow: true },
  excludeParentKeys: false,
});
const { promises } = require("fs");

// // example value transform, which just returns the token as is
StyleDictionary.registerFilter({
  name: "my-filter",
  matcher: (token) => {
    console.log(token);
    return token.filePath !== "tokens/core.json";
  },
});

async function run() {
  const $themes = JSON.parse(
    await promises.readFile("tokens/$themes.json", "utf-8")
  );
  const configs = $themes.map((theme) => ({
    source: Object.entries(theme.selectedTokenSets)
      .filter(([, val]) => val !== "disabled")
      .map(([tokenset]) => `tokens/${tokenset}.json`),
    platforms: {
      css: {
        transformGroup: "tokens-studio",
        files: [
          {
            destination: `build/css/vars-${theme.name}.css`,
            format: "css/variables",
            filter: "my-filter",
          },
        ],
      },
    },
  }));

  configs.forEach((cfg) => {
    const sd = StyleDictionary.extend(cfg);
    sd.cleanAllPlatforms(); // optionally, cleanup files first..
    sd.buildAllPlatforms();
  });
}

run();
