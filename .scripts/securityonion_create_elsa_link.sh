#!/bin/bash

MYSQL="mysql --defaults-file=/etc/mysql/debian.cnf -Dsecurityonion_db -e"

if [ -d /var/lib/mysql/securityonion_db/ ]; then

	# ELSA lookup
	if grep "ELSA=YES" /etc/nsm/securityonion.conf >/dev/null 2>&1; then
		if grep "pcap_url" /etc/elsa_web.conf >/dev/null 2>&1; then
			#IP=`grep "pcap_url" /etc/elsa_web.conf | head -1 | cut -d\/ -f3`
			URL="/elsa-query/?query_string=\"\${var}\"%20groupby:program"
			HEXVAL=$(xxd -pu -c 256 <<< "$URL")
			$MYSQL "REPLACE INTO filters (type,username,global,name,notes,alias,filter) VALUES ('url','','1','454C5341','','ELSA','$HEXVAL');"
		fi
	fi

fi
