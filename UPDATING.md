# Squert 0.9.2,3b > 0.9.3

The httpry_agent has been replaced by http_agent which works with both Suricata and httpry. This
change prompted the agent type to change from httpry to just http (a little more generic).

So, if you have been running the old httpry agent, just update to the new http_agent. This can be found
here: [https://github.com/int13h/http_agent](https://github.com/int13h/http_agent).

**You will also need to alter your sensor table to work correctly with squert:

*mysql> UPDATE sensor SET agent_type='http' WHERE agent_type='httpry';


**There is also some changes to the ip2c table that are required for filtering to work properly:

*mysql> INSERT IGNORE INTO ip2c (registry,cc,c_long,type,start_ip,end_ip,date,status)
VALUES ('RFC1918','LO','RFC1918','ipv4','167772160','184549375','1996-02-01','allocated');

*mysql> INSERT IGNORE INTO ip2c (registry,cc,c_long,type,start_ip,end_ip,date,status)
VALUES ('RFC1918','LO','RFC1918','ipv4','167772160','184549375','1996-02-01','allocated');

*mysql> INSERT IGNORE INTO ip2c (registry,cc,c_long,type,start_ip,end_ip,date,status)
VALUES ('RFC1918','LO','RFC1918','ipv4','167772160','184549375','1996-02-01','allocated');
