import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("blog_src/assets");
  eleventyConfig.addPlugin(HtmlBasePlugin);

};

export const config = {
  pathPrefix: "/blog/",
  dir: {
    input: "blog_src",
    output: "blog",
    includes: "_includes"
  }
}



