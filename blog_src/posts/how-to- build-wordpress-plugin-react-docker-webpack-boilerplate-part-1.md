---
title: Part 1, How to build Wordpress Plugin using Composer + React + Docker (Boilerplate)
date: Created
excerpt: Previously, we discuessd that by leveraging Docker Compose, we can orchestrate all required services for Wordpresss in isolated containers, making local development and deployment straightforward and reproducible. In today's guide we go further ahead by discussing how to take advantage of latest PHP and Javascript standards to build a wordpress plugin in Docker environment.
layout: post.njk
tags: ["posts"]
---
In previous [post](https://umairbussi.com/blog/posts/how-to-setup-wordpress-php-fpm-mariadb-nginx-docker-compose/) we discuessd that by leveraging Docker Compose, we can orchestrate all required services for Wordpresss in isolated containers, making local development and deployment straightforward and reproducible. In today's guide we go further ahead by discussing how to take advantage of latest PHP and Javascript standards to build a wordpress plugin in Docker environment.

Building a WordPress plugin using Composer offers significant advantages, especially in managing dependencies and maintaining code quality. Composer streamlines the process of including third-party libraries, ensuring that your plugin remains modular and up-to-date with the latest packages. This approach also simplifies updates and reduces compatibility issues, making development more efficient and reliable. By leveraging Composer, developers can focus on building features rather than handling manual integrations, resulting in a more robust and maintainable plugin.

Integrating React into your WordPress plugin's admin UI enables the creation of dynamic, responsive, and modern interfaces. React's component-based architecture allows developers to build reusable UI elements, manage complex state efficiently, and deliver a seamless user experience. By leveraging React, you can enhance the interactivity of your plugin's settings pages, dashboards, or custom tools, making them more intuitive and user-friendly. This approach also aligns with WordPress's move towards JavaScript-driven interfaces, ensuring your plugin remains compatible with evolving best practices.

The docker compose file to set up it all looks like this.

```yaml
services:
    wordpress:
        image: wordpress:php8.3-fpm
        environment:
            WORDPRESS_DB_HOST: db
            WORDPRESS_DB_USER: wordpress
            WORDPRESS_DB_PASSWORD: wordpress
            WORDPRESS_DB_NAME: wordpress

        volumes:
            - wordpress_data:/var/www/html
            - ./plugins/wpnbiolerplate:/var/www/html/wp-content/plugins/wpnboilerplate
            - exclude:/var/www/html/wp-content/plugins/wpnboilerplate/node_modules
        depends_on:
            - db

    db:
        image: mariadb:latest
        environment:
            MYSQL_DATABASE: wordpress
            MYSQL_USER: wordpress
            MYSQL_PASSWORD: wordpress
            MYSQL_ROOT_PASSWORD: rootpassword
        volumes:
            - db_data:/var/lib/mysql
    nginx:
        image: nginx
        ports:
            - "80:80"
        volumes:
            - ./config/nginx.conf:/etc/nginx/conf.d/default.conf:ro
            - wordpress_data:/var/www/html
            - ./plugins/wpnboilerplate:/var/www/html/wp-content/plugins/wpnboilerplate

        depends_on:
            - wordpress

    webpack:
        image: node:lts-slim
        working_dir: /var/www/html/wp-content/plugins/wpnboilerplate
        volumes:
            - wordpress_data:/var/www/html
            - ./plugins/wpnboilerplate:/var/www/html/wp-content/plugins/wpnboilerplate
            - exclude:/var/www/html/wp-content/plugins/wpnboilerplate/node_modules
        environment:
            - WATCHPACK_POLLING=true
        command: [ "yarn", "run", "start" ]
        ports:
            - "3000:3000"
            - "3001:3001"
        depends_on:
            - wordpress

volumes:
    db_data:
    wordpress_data:
    exclude:

```
This docker compose file is a bit different from previous one. As we are have added third named volume named `exclude`. This volume 
saves the headache of syncing `node_modules` between host and docker container. It is necessary becuase it not only avoids sync overhead but also saves us from overwriting `node_modules` acccidentaly by installing the packages on host machine.

Another container has been added in compsoe file named `webpack`. It saves us from polluting another container with nodejs and packger managers like npm or yarn. We are using official node image  and mount the required volumes in it. Main file in this scene is `pacakge.json` which looks like this
```json
{
  "name": "wpncommerce",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "build": "wp-scripts build ",
    "start": "wp-scripts start",
    "test": "wp-scripts test",
    "rename": "node scripts/rename.js"
  },
  "devDependencies": {
    "@wordpress/scripts": "^30.17.0"
  },
  "dependencies": {
    "@wordpress/api-fetch": "^7.24.0",
    "@wordpress/components": "^29.10.0",
    "@wordpress/element": "^6.24.0",
    "@wordpress/i18n": "^5.24.0",
    "browser-sync": "^3.0.4",
    "browser-sync-webpack-plugin": "^2.3.0"
  }
}
```
This file contains all the dependencies to make it all work. Wordpress has official pacakge `@wordpress/scripts` which relies on `webpack` to compile the react code for plugin UI in the admin. Making `webpack` and `react` work in Docker with hot or live reloading was a long journey. It doesn't work by default as `webpack` relies on `Chokidar` to watch changes and then build the code.
We have to set an environment variable `WATCHPACK_POLLING=true` in docker compose. Instead of using file system events, the webpack falls back to polling technique in order to detect changes.

The next step in the process was to reload changes in browser automatndically because `webpack` wasn't hot reloading the react components due to some issue in Docker environment. As a consequence, we are going to use `Browser Sync` and its plugin for `webpack`. The `browser sync` plugin for webpack and some other configuration for `webpack` look like this in`webpack.config.js`
```js
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');
const { merge } = require('webpack-merge');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

const newConfig = {
    entry: {
        main: path.resolve(process.cwd(), 'admin/src', 'index.tsx'),
    },
    output: {
        filename: '[name].js',
        path: path.resolve(process.cwd(), 'admin/build'),
    },
    plugins: [
        ...defaultConfig.plugins,
        new BrowserSyncPlugin({
            open: false,
            port: 3000,
            proxy: "http://nginx",
        }),
    ]

};

module.exports = merge(defaultConfig, newConfig);
```
We are done with the Javascript/Typescript setup to use React and live reloading the plugin page in wordpress admin. In the next part, we will be discussing how to wire PHP's composer and output of React for Wordpress plugin.