---
title: Creating a blog with Eleventy in subdirectory and Hosting on Netlify
date: Created
excerpt: My goal was to host a static portfolio page as main face of my website and then share my findings under blog/ sub directory. Instead of going the full CMS route, I decided to opt for a static site generator(11ty) and host the content at Netlify.
layout: post.njk
tags: ["posts"]
---

My goal was to host a static portfolio page as main face of [UmairBussi](https://umairbussi.com) and then share my findings under blog/ sub directory. Instead of going the full CMS route, I decided to opt for a static site generator and host the content at Netlify.

Static site generators (SSGs) are tools that compile content, templates, and assets into static HTML files. This approach offers fast load times, improved security, and easy deployment compared to traditional dynamic websites.

I choose [Eleventy](https://www.11ty.dev/) because it is a simple and flexible static site generator that transforms plain text files into static websites. It supports multiple template languages and is highly configurable, making it a popular choice for those who want control over site's structure.

Once Eleventy site is ready, it can be hosted it on [Netlify](https://www.netlify.com/), a platform that automates deployment and provides features like continuous integration, custom domains, and HTTPS. Netlify makes it easy to publish static site directly from your Git repository with minimal configuration.

Let's get started. Make sure Node.js and NPM is installed on your system.
```bash
$ node -v
$ npm -v
```

Create a directory name portfolio.
```bash
$ mkdir portfolio
$ cd portfolio
```

My portfolio related files were already prepared and I copied them over to portfolio. The directory
listing now looks like this
```bash
$ ls -l
-rw-r--r--@   1 umair  staff   14141 19 May 01:42 index.html
-rw-r--r--@   1 umair  staff   11801 18 May 19:49 styles.css
-rw-r--r--@   1 umair  staff  107474 18 May 19:49 umair.png
```

Let's initiate the NPM project and turn the pacakge into module
```bash
$ npm init -y
$ npm pkg set type="module"
```

Now install the 11ty pacakge
```bash
$ npm install @11ty/eleventy 
```

Create a directory `blog_src` which will contain the source files for blogs
```bash
$ mkdir blog_src
```

We further need to create following directories
- `posts` (contains your blog posts)
- `assets` (contains static assets like css, js, images, and fonts)
- `_includes` (contains layout)
```bash
$ mkdir posts assets _includes
```

Enough with the setup, let's create out first post. Choose your favorite editor and paste the following into `hello-world.md` in `posts` dir.
```markdown
---
title: Hello World
date: Created
layout: post.njk
tags: ["posts"]
---
First post.
```
If you have earlier used other SSG, the above content will look  familiar. We have specified title, date (`Created` is specific to 11ty, will pick the creation date of file), layout and tags. 

Next step is to create `layout` file `post.njk` under `_includes` directory and paste the following into it
```html
<html>
  <head>
    {% raw %}
    <title>{{ title }}</title>
  </head>
  <body>
    <p>{{ content | safe }}</p>
  </body>
  {% endraw%}
</html>
```

The layout can be modifiied according to your requirements like adding css, js, fonts or modifying the `html` structure. Now, let's create the main page for our blog. Create a `index.njk` in `blog_src` directory and fill it with following content
```html
<html>
  <head>
    <title>My Blog</title>
  </head>
  <body>
    {% raw %}
    {%- for post in collections.posts -%}
        <div>
            <h3>
                <a href="{{ post.url }}">{{ post.data.title }}</a>
            </h3>

             <small>Published on {{ post.date }}</small>
        </div>
        <hr/>
    {%- endfor -%}
    {% endraw %}
  </body>
</html>
```
The content is done. Let's configure 11ty. Create a `.eleventy.js` in root directory i.e `portfolio` in our case. Its content should look like this.
```js
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
```
11ty configuration is self explanotary. We specify the `assets` directory should be just copied over to output. `HtmlBasePlugin` handles URLs and  will automatically apply the Path Prefix to URLs in any html file in your output directory. `dir` object specifies the `input` directory to be processed and also `output` where the static files are placed.

To check that all this works out, enter the following  in your terminal
```bash
$ npx @11ty/eleventy --serve 
```
The above command will process the `blog_src` directory and output will be in `blog` directory which will be served at [Localhost](localhost:8080/blog). Once you are content with the ouput, create a .gitignore file and fill it with
```
# Node modules
node_modules/

# Build output
_dist/
dist/
output/
public/
blog/

# Eleventy cache
.cache/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# Netlify deploy folder (if generated locally)
.netlify/

# Environment variables
.env
.env.*

# VSCode settings
.vscode/
```
As a last step if you are deploying to Netlify, create a `netlify.toml` in root directory with following content.
```toml
[build]
    command = "npx eleventy"
```

Finally you can commit the changes and push the git repo to Github. Connect it in Netlify account and you blog will be served under `/blog` subdirectory.