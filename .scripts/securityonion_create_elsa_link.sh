#!/bin/bash

MYSQL="mysql --defaults-file=/etc/mysql/debian.cnf -Dsecurityonion_db -e"

if [ -d /var/lib/mysql/securityonion_db/ ]; then

	# Configure Squert to pivot to ELSA or Elastic for lookups.

	# ELSA lookup
	if grep "ELSA=YES" /etc/nsm/securityonion.conf >/dev/null 2>&1; then
		if grep "pcap_url" /etc/elsa_web.conf >/dev/null 2>&1; then
			#IP=`grep "pcap_url" /etc/elsa_web.conf | head -1 | cut -d\/ -f3`
			URL="/elsa-query/?query_string=\"\${var}\"%20groupby:program"
			HEXVAL=$(xxd -pu -c 256 <<< "$URL")
			$MYSQL "REPLACE INTO filters (type,username,global,name,notes,alias,filter) VALUES ('url','','1','454C5341','','ELSA','$HEXVAL');"
		fi
	fi

	# Elastic lookup
	if grep 'KIBANA_ENABLED="yes"' /etc/nsm/securityonion.conf >/dev/null 2>&1; then
		# Remove ELSA link from Squert
		mysql --defaults-file=/etc/mysql/debian.cnf -Dsecurityonion_db -e 'delete from filters where alias="ELSA";'
		# Add Elastic link to Squert
		ALIAS="Kibana"
		HEXALIAS=$(xxd -pu -c 256 <<< "$ALIAS")
		URL="/app/kibana#/dashboard/68563ed0-34bf-11e7-9b32-bb903919ead9?_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-24h,mode:quick,to:now))&_a=(columns:!(_source),index:'*:logstash-*',interval:auto,query:(query_string:(analyze_wildcard:!t,query:'\"\${var}\"')),sort:!('@timestamp',desc))"
		HEXURL=$(xxd -pu -c 356 <<< "$URL")
		$MYSQL "REPLACE INTO filters (type,username,global,name,notes,alias,filter) VALUES ('url','','1','$HEXALIAS','','$ALIAS','$HEXURL');"
	fi

fi
