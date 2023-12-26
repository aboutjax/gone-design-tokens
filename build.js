import { registerTransforms } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";
import { ColorTranslator } from "colortranslator";

// sd-transforms, 2nd parameter for options can be added
// See docs: https://github.com/tokens-studio/sd-transforms
registerTransforms(StyleDictionary);

[
  "light",
  "dark",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "navy",
  "purple",
].map((theme) => {
  const sd = StyleDictionary.extend({
    source: [`transformed/${theme}-tokens.json`],
    platforms: {
      css: {
        // transformGroup: "tokens-studio",
        transforms: ["attribute/cti", "name/cti/kebab", "test/color/rgb"],
        buildPath: "build/css/",
        files: [
          {
            destination: `variables-${theme}.css`,
            format: "css/variables/gone",
            selector: `.theme-${theme}`,
          },
        ],
      },
    },
  });

  sd.registerTransform({
    name: "test/color/rgb",
    type: "value",
    matcher: function (token) {
      return token.attributes.category === "color";
    },
    transformer: function (token) {
      const rgbo = new ColorTranslator(token.value).RGBObject;
      const string = `${rgbo.R} ${rgbo.G} ${rgbo.B}`;
      return string;
    },
  });

  sd.registerFormat({
    name: "css/variables/gone",
    formatter: function (dictionary) {
      return `${this.selector} {
        ${dictionary.allProperties
          .map((prop) => `  --${prop.name}: ${prop.value};`)
          .join("\n")}
      }`;
    },
  });

  sd.cleanAllPlatforms();
  sd.buildAllPlatforms();
});
