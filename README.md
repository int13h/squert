# SQueRT - A Simple Query and Report Tool

Home: [http://www.squertproject.org](http://www.squertproject.org)


## Description

SQueRT is a tool that is used to query event data.


## Demo

URL: [https://94.23.230.171:9123/squert](https://94.23.230.171:9123/squert)

User: demo

Pass: squert


## Requirements

* PHP5 with CLI
	* pecl-stats
	* mysql
	* GD
* TCL, TclX
	* mysqltcl
	* uri
	* ftp
	* ftp::geturl
	* md5
* MySQL client
* Graphviz (with PNG)
* Perl Text::CSV

## Install

1) Extract the squert tarball to a web directory and rename it to "squert"

2) Edit config.php, it is well documented. At the very least set these:

    - DB settings ($dbHost,$dbName,$dbUser,$dbPass)
    - Rule Path ($rulePath)
    - DNS server ($dns)
    - Graphviz location ($dotPath)

3) Create additional tables:

`cat squert/.scripts/db/squert.sql | mysql -uroot -p -U sguildb`

4) Create a mysql user account with readonly access to sguildb (what you set in step 2):

`mysql -N -B --user=root --password=toor -e "GRANT SELECT ON sguildb.* TO 'readonly'@'localhost' IDENTIFIED BY 'apassword';"`

5) Give this user privileges to the ip2c table:

`mysql -N -B --user=root --password=toor -e "GRANT ALL PRIVILEGES ON sguildb.ip2c TO 'readonly'@'localhost';"`

6) Give this user privileges to the mappings table:

`mysql -N -B --user=root --password=toor -e "GRANT ALL PRIVILEGES ON sguildb.mappings TO 'readonly'@'localhost';"`

7) Now populate the ip2c table:

`squert/.scripts/Ip2c/ip2c.tcl`

8) Create a scheduled task to keep the mappings tables up to date:

`*/5     *       *       *       *       /usr/local/bin/php -e /usr/local/www/squert/ip2c.php 1 > /dev/null 2>&1`

This entry updates the database every 5 minutes. Make sure you use the correct paths to php and ip2c.php.

If you want to map everything in your DB you can do this:

`php -e ip2c.php 0`

It maps about 10 addresses/second. This is not a requirement. If you are doing queries in the past and want country
info you can just perform the mappings through the web interface as needed.

9) We need to modify sguils user_info table. If you are running sguil version 0.7, do this:

`cat squert/.scripts/db/v0.7.sql | mysql -uroot -p -U sguildb`

This will create a user 'squert' with the password 'squert'. If you want to use an existing user, take a look in
sguild.users and swap the user information with what you see in there. 

If you are running 0.8, do this:

`cat squert/.scripts/db/v0.8.sql | mysql -uroot -p -U sguildb`

This will just add the extra columns. Your existing users can now login.

10) The images directory needs to be writable by the owner of the web process:

`sudo chmod 777 images`

That's it. Point your browser to http(s)://yourhost/squert/squert.php
