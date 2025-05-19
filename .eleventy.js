import { HtmlBasePlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("blog_src/assets");
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(syntaxHighlight);

};

export const config = {
  pathPrefix: "/blog/",
  dir: {
    input: "blog_src",
    output: "blog",
    includes: "_includes"
  }
}



