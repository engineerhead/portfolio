---
title: How to setup Wordpress + PHP-FPM + MariaDB + Nginx with Docker Compose
date: Created
excerpt: This guide walks you through setting up a WordPress site using Docker Compose with PHP-FPM, MariaDB, and Nginx. By the end, you'll have a local development environment running all services in isolated containers.
layout: post.njk
tags: ["posts"]
---
WordPress is a popular open-source content management system (CMS) that powers millions of websites worldwide. In this guide, we'll set up WordPress using a modern stack: PHP-FPM for efficient PHP processing, MariaDB as the database backend, and Nginx as the web server. By leveraging Docker Compose, we can orchestrate these services in isolated containers, making local development and deployment straightforward and reproducible.

This guide walks you through setting up a WordPress site using Docker Compose with PHP-FPM, MariaDB, and Nginx. By the end, you'll have a local development environment running all services in isolated containers.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system.

## Directory Structure

Create a project folder with the following structure:

```bash
wordpress-docker/
├── docker-compose.yml
├── nginx/
│   └── default.conf
└── wordpress/
```

## Step 1: Create `docker-compose.yml`

```yaml
services:
    db:
        image: mariadb:latest
        restart: always
        environment:
            MYSQL_DATABASE: wordpress
            MYSQL_USER: wordpress
            MYSQL_PASSWORD: wordpress
            MYSQL_ROOT_PASSWORD: rootpassword
        volumes:
            - db_data:/var/lib/mysql

    wordpress:
        image: wordpress:php8.3-fpm
        restart: always
        environment:
            WORDPRESS_DB_HOST: db:3306
            WORDPRESS_DB_USER: wordpress
            WORDPRESS_DB_PASSWORD: wordpress
            WORDPRESS_DB_NAME: wordpress
        volumes:
            - wordpress_data:/var/www/html

    nginx:
        image: nginx:latest
        restart: always
        ports:
            - "8080:80"
        volumes:
            - wordpress_data:/var/www/html
            - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
        depends_on:
            - wordpress

volumes:
    db_data:
    wordpress_data:
```

## Step 2: Configure Nginx

Create `nginx/default.conf`:

```nginx
server {
        listen 80;
        server_name localhost;

        root /var/www/html;
        index index.php index.html;

        location / {
                try_files $uri $uri/ /index.php?$args;
        }

        location ~ \.php$ {
                fastcgi_pass wordpress:9000;
                fastcgi_index index.php;
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                include fastcgi_params;
        }
}
```

## Step 3: Start the Services

From your project directory, run:

```sh
docker-compose up -d
```

Visit [http://localhost:8080](http://localhost:8080) to complete the WordPress setup.

## Notes

- Data is persisted in Docker volumes.
- Adjust environment variables and passwords as needed for production use.
- For more customization, refer to the [official WordPress Docker documentation](https://hub.docker.com/_/wordpress/).
