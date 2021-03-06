'use strict';

const path = require('path');
const fs = require('fs-extra');
const php = require('./common/php');

const thinkphp = {
  'id': 'thinkphp',
  'runtime': 'php',
  'website': 'http://www.thinkphp.cn/',
  'detectors': {
    'or': [
      {
        'type': 'regex',
        'path': 'composer.json',
        'content': '"topthink/framework":\\s*".+?"'
      },
      {
        'type': 'dir',
        'paths': ['thinkphp', 'ThinkPHP']
      }
    ]
  },
  'actions': [
    {
      'condition': true,
      'description': 'download nginx and php dependences',
      'processors': [
        {
          'type': 'function',
          'function': async (codeDir) => {
            const dotFunPath = path.join(codeDir, '.fun');
            await fs.ensureDir(dotFunPath);
            await php.downloadNginxAndPhp(codeDir);
          }
        },
        php.PHP_FPM_CONF,
        php.WWW_CONF,
        php.NGINX_CONF,
        php.LOGROTATE_D_NGINX,
        php.LOGROTATE_D_PHP_7_2_FPM,
        php.PHP_INI_PRODUCTION,
        {
          'type': 'generateFile',
          'path': ['.fun', 'root', 'etc', 'nginx', 'sites-enabled', 'thinkphp.conf'],
          'mode': '0755',
          'backup': false,
          'content': `server {
  listen 9000;
  root /code/public;
  index  index.php index.html index.htm;
  server_name  localhost;

  client_max_body_size 100M;

  location / {
      # same as .htaccess used for apache in thinkphp public folder 
      # http://www.thinkphp.cn/topic/40391.html
      if ( -f $request_filename) {
          break;
      }
      if ( !-e $request_filename) {
          rewrite ^(.*)$ /index.php/$1 last;
          break;
      }  
  }

  location ~ .+\\.php($|/) {
      include snippets/fastcgi-php.conf;
      fastcgi_pass             127.0.0.1:9527;
      fastcgi_param   SCRIPT_FILENAME $document_root$fastcgi_script_name;
  }
}     
`
        },
        {
          'type': 'generateFile',
          'path': 'bootstrap',
          'mode': '0755',
          'content': `#!/usr/bin/env bash
set +e

mkdir -p /tmp/log/nginx/
mkdir -p /tmp/var/nginx/
mkdir -p /tmp/var/sessions/

echo "start php-fpm"
php-fpm7.2 -c /code/.fun/root/usr/lib/php/7.2/php.ini-production -y /code/.fun/root/etc/php/7.2/fpm/php-fpm.conf

echo "start nginx"
nginx -c /code/.fun/root/etc/nginx/nginx.conf

sleep 5

while true
do
    echo "check ...."
    nginx_server=\`ps aux | grep nginx | grep -v grep\`
    if [ ! "$nginx_server" ]; then
        echo "restart nginx ..."
        nginx -c /code/.fun/root/etc/nginx/nginx.conf
    fi
    php_fpm_server=\`ps aux | grep php-fpm | grep -v grep\`
    if [ ! "$php_fpm_server" ]; then
        echo "restart php-fpm ..."
        php-fpm7.2 -c /code/.fun/root/usr/lib/php/7.2/php.ini-production -y /code/.fun/root/etc/php/7.2/fpm/php-fpm.conf
    fi
    sleep 10
done
`
        }
      ]
    }
  ]
};

module.exports = thinkphp;