#!/bin/bash

MYSQL="mysql --defaults-file=/etc/mysql/debian.cnf -Dsecurityonion_db -e"

if [ -d /var/lib/mysql/securityonion_db/ ]; then

	# Non-idempotent operations

	# history table - comment index
	$MYSQL "SHOW INDEX FROM history WHERE KEY_NAME = 'comment'" | grep comment >/dev/null 2>&1 || 
		$MYSQL "CREATE INDEX comment ON history (comment(50));"

	# history table - sid index
	$MYSQL "SHOW INDEX FROM history WHERE KEY_NAME = 'sid'" | grep sid >/dev/null 2>&1 || 
		$MYSQL "CREATE INDEX sid ON history (sid);"

	# history table - cid index
	$MYSQL "SHOW INDEX FROM history WHERE KEY_NAME = 'cid'" | grep cid >/dev/null 2>&1 || 
		$MYSQL "CREATE INDEX cid ON history (cid);"

	# user_info table - email
        $MYSQL "DESCRIBE user_info" | grep email >/dev/null 2>&1 ||
                $MYSQL "ALTER TABLE user_info ADD email VARCHAR(320) NOT NULL DEFAULT 'none';"

	# user_info table - type
        $MYSQL "DESCRIBE user_info" | grep type >/dev/null 2>&1 ||
                $MYSQL "ALTER TABLE user_info ADD type ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER';"

	# user_info table - timeout
        $MYSQL "DESCRIBE user_info" | grep timeout >/dev/null 2>&1 ||
                $MYSQL "ALTER TABLE user_info ADD timeout SMALLINT UNSIGNED NOT NULL DEFAULT '5000';"

	# user_info table - tzoffset
        $MYSQL "DESCRIBE user_info" | grep tzoffset >/dev/null 2>&1 ||
                $MYSQL "ALTER TABLE user_info ADD tzoffset varchar(6) NOT NULL DEFAULT '+00:00';"

	# filters table - type
        if $MYSQL "DESCRIBE filters" | grep type >/dev/null 2>&1 ; then
		echo "filters table already has type field."
	else
		echo "Adding type field to filters table."
                $MYSQL "ALTER TABLE filters ADD type VARCHAR(16) FIRST;"
                $MYSQL "ALTER TABLE filters ADD INDEX type (type);"
                $MYSQL "UPDATE filters SET type = 'filter' WHERE type IS NULL;;"
	fi

	# object_mappings table - hash
        if $MYSQL "DESCRIBE object_mappings" | grep hash >/dev/null 2>&1 ; then
		echo "object_mappings table already has hash field."
	else
		echo "Adding hash field to object_mappings table."
                $MYSQL "ALTER TABLE object_mappings ADD hash CHAR(32);"
		$MYSQL "UPDATE object_mappings SET hash=md5(concat(type,object,value)) WHERE hash IS NULL;"
                $MYSQL "ALTER TABLE object_mappings DROP PRIMARY KEY , ADD PRIMARY KEY (hash);"
	fi

	# Idempotent operations
	cat /var/www/so/squert/.scripts/securityonion_update.sql | mysql --defaults-file=/etc/mysql/debian.cnf -U securityonion_db > /var/log/nsm/squert_update.log

	# ELSA lookup
	bash /var/www/so/squert/.scripts/securityonion_create_elsa_link.sh

fi
