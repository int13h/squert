#/usr/local/bin/bash

## Queries

# Event Priority

ep_query="INSERT INTO stats (timestamp,type,object,count) 
          SELECT UTC_TIMESTAMP(), '1', event.priority, COUNT(event.priority) 
          FROM event WHERE event.timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 5 minute) AND NOW() 
          GROUP BY event.priority;"

sid_query="INSERT INTO stats (timestamp,type,object,count)
           SELECT UTC_TIMESTAMP(), '2', event.sid, COUNT(event.sid) 
           FROM event 
           WHERE event.timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 5 minute) AND NOW() 
           GROUP BY event.sid;" 

sip_query="INSERT INTO stats (timestamp,type,object,count)
           SELECT UTC_TIMESTAMP(), '3', event.src_ip, COUNT(event.src_ip)
           FROM event
           WHERE event.timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 5 minute) AND NOW()
           GROUP BY event.src_ip;"

dip_query="INSERT INTO stats (timestamp,type,object,count)
           SELECT UTC_TIMESTAMP(), '4', event.dst_ip, COUNT(event.dst_ip)
           FROM event
           WHERE event.timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 5 minute) AND NOW()
           GROUP BY event.dst_ip;"

sig_query="INSERT INTO stats (timestamp,type,object,count)
           SELECT UTC_TIMESTAMP(), '5', event.signature_id, COUNT(event.signature_id) 
           FROM event 
           WHERE event.timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 5 minute) AND NOW() 
           GROUP BY event.signature_id;" 


