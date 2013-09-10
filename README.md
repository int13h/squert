# SQueRT - A Simple Query and Report Tool

Home: [http://www.squertproject.org](http://www.squertproject.org)

Demo: [https://demo.sguil.net](https://demo.sguil.net)
* Login: sguil
* Password: demo


## Description

SQueRT is a tool that is used to query event data.

## Requirements

* A working Sguil installation [http://sguil.net](http://sguil.net). If you use Security Onion [http://securityonion.blogspot.ca](http://securityonion.blogspot.ca) you can get everything setup rather quickly.
  

* PHP5 with CLI
	* pecl-stats
	* mysql
* TCL, TclX
	* mysqltcl
	* uri
	* ftp
	* ftp::geturl
	* md5
* MySQL client

## Install

1) Extract the squert tarball to a web directory and rename it to "squert"

2) Copy squert/.inc/config.php.sample to squert/.inc/config.php

3) Edit squert/.inc/config.php to match your sguildb and sguild server settings

4) IMPORTANT!! Edit your MySQL server settings to include the following directive:

`group_concat_max_len = 100000`

this should be placed in the "[mysqld]" section of my.cnf

Also,

The ip2c TCL scripts uses "LOAD DATA LOCAL INFILE" to dump the results into the database. 
While most stock MySQL installs are compiled with this, they don't always allow it.

Find the my.cnf that your client is using and add:

`local-infile=1`

to the client section. If you just have the client installed and you cant find this 
file just create it in /etc and add:

`[client]`
`local-infile=1`

Lastly,

You will need to add indexes to the sid and cid columns in Sguils history table:

`mysql -N -B --user=root -p -e "CREATE INDEX sid ON history (sid);"`
`mysql -N -B --user=root -p -e "CREATE INDEX cid ON history (cid);"`

Performance WILL suffer if you do not do this.

5) Create additional tables:

`cat squert/.scripts/squert.sql | mysql -uroot -p -U sguildb`

6) Create a mysql user account with readonly access to sguildb (what you set in step 3):

`mysql -N -B --user=root -p -e "GRANT SELECT ON sguildb.* TO 'readonly'@'localhost' IDENTIFIED BY 'apassword';"`

7) Give this user privileges to the ip2c table:

`mysql -N -B --user=root -p -e "GRANT ALL PRIVILEGES ON sguildb.ip2c TO 'readonly'@'localhost';"`

8) Give this user privileges to the mappings table:

`mysql -N -B --user=root -p -e "GRANT ALL PRIVILEGES ON sguildb.mappings TO 'readonly'@'localhost';"`

9) Give this user privileges to the filters table:

`mysql -N -B --user=root -p -e "GRANT INSERT,UPDATE,DELETE ON sguildb.filters TO 'readonly'@'localhost';"` 

10) Now populate the ip2c table:

`squert/.scripts/ip2c.tcl`

11) Add an index to comment column in Sguils history table:

`mysql -N -B --user=root -p -e "CREATE INDEX comment ON sguildb.history (comment(50));"`

12) The readonly user needs DELETE access to sguils history table (to delete comments):

`mysql -N -B --user=root -p -e "GRANT DELETE on sguildb.history to 'readonly'@'localhost';"`

13) Create a scheduled task to keep the mappings tables up to date:

`*/5     *       *       *       *       /usr/local/bin/php -e /usr/local/www/squert/.inc/ip2c.php 1 > /dev/null 2>&1`

This entry updates the database every 5 minutes. Make sure you use the correct paths to php and ip2c.php.


That's it. Point your browser to https://yourhost/squert
