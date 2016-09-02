## squert - A Simple Query and Report Tool


#######

NOTE: This project is no longer in active develpment. See [here](http://www.pintumbler.org/words/youcantgobackonlyforward) for more detail.
Thanks to everyone that has supported me through the years while I worked on this.

#######



Home: [http://www.squertproject.org](http://www.squertproject.org)

Talk: [Version 1.3 @CANHEIT 2014](http://www.pintumbler.org/squert-canheit2014.pdf)

Intro: [http://www.youtube.com/watch?v=ZOsVw96XM8E](http://www.youtube.com/watch?v=ZOsVw96XM8E)

Changes v1.1.6: [http://www.youtube.com/watch?v=_eheJv0MJDY](http://www.youtube.com/watch?v=_eheJv0MJDY)

Changes v1.1.9: [http://www.youtube.com/watch?v=QkgrigopfQA](http://www.youtube.com/watch?v=QkgrigopfQA)

Changes v1.2.0: Cleanup. Removed fixed credentials in sguil helpers.

Changes v1.3.0: 

* ElasticSearch queries (Bro) 
* Autocat editor 
* Significant interface changes

See: [Changes v1.3.0](http://www.squertproject.org/summaryofchangesforsquertversion130)

Changes v1.4.0:

* URLs
* Moved to menu on click
* Bugfixes

See: [Changes v1.4.0](http://www.squertproject.org/summaryofchangesforsquertversion140)

Changes v1.5.0

* Control layout changes
* Object colouring from context menu
* Bugfixes

See: [Changes v1.5.0](http://www.squertproject.org/summaryofchangesforsquertversion150)


## Description

SQueRT is a tool that is used to query event data

## Requirements

* Sguil 0.9.0 [http://sguil.net](http://sguil.net). If you use Security Onion [http://securityonion.blogspot.ca](http://securityonion.blogspot.ca) you can get everything setup rather quickly.
  

* PHP55 with CLI
	* mysql
* TCL, TclX
	* mysqltcl
	* uri
	* ftp
	* ftp::geturl
	* md5
* MySQL client

## Upgrade

You will need to run these commands:

`mysql> ALTER TABLE filters ADD type VARCHAR(16) FIRST;`

`mysql> ALTER TABLE filters ADD INDEX type (type);`

`mysql> UPDATE filters SET type = 'filter' WHERE type IS NULL;`

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

6) Create a mysql user account for squert to access sguildb (what you set in step 3):

`mysql -N -B --user=root -p -e "GRANT SELECT ON sguildb.* TO 'squert_user'@'localhost' IDENTIFIED BY 'apassword';"`

7) Give this user privileges to the ip2c table:

`mysql -N -B --user=root -p -e "GRANT ALL PRIVILEGES ON sguildb.ip2c TO 'squert_user'@'localhost';"`

8) Give this user privileges to the mappings table:

`mysql -N -B --user=root -p -e "GRANT ALL PRIVILEGES ON sguildb.mappings TO 'squert_user'@'localhost';"`

9) Give this user privileges to the filters table:

`mysql -N -B --user=root -p -e "GRANT INSERT,UPDATE,DELETE ON sguildb.filters TO 'squert_user'@'localhost';"` 

10) Give this user privileges to sguils user_info table:

`mysql -N -B --user=root -p -e "GRANT UPDATE ON sguildb.user_info TO 'squert_user'@'localhost';"`;

11) Now populate the ip2c table:

`squert/.scripts/ip2c.tcl`

12) Add an index to comment column in Sguils history table:

`mysql -N -B --user=root -p -e "CREATE INDEX comment ON sguildb.history (comment(50));"`

13) The readonly user needs DELETE access to sguils history table (to delete comments):

`mysql -N -B --user=root -p -e "GRANT DELETE on sguildb.history to 'readonly'@'localhost';"`

14) Create a scheduled task to keep the mappings tables up to date:

`*/5     *       *       *       *       /usr/local/bin/php -e /usr/local/www/squert/.inc/ip2c.php 1 > /dev/null 2>&1`

This entry updates the database every 5 minutes. Make sure you use the correct paths to php and ip2c.php.

15) Create a scheduled task to keep the ip2c table up to date:

`0	0	1	*	*       <path_to_squert>/.scripts/ip2c.tcl > /dev/null 2>&1`

This entry updates the ip2c database on the first day of every month.

That's it. Point your browser to https://yourhost/squert
