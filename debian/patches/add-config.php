Description: <short summary of the patch>
 TODO: Put a short summary on the line above and replace this paragraph
 with a longer explanation of this change. Complete the meta-information
 with other relevant fields (see below for details). To make it easier, the
 information below has been extracted from the changelog. Adjust it or drop
 it.
 .
 securityonion-squert (20161212-1ubuntu1securityonion2) trusty; urgency=medium
 .
   * add config.php
Author: Doug Burks <doug.burks@gmail.com>

---
The information above should follow the Patch Tagging Guidelines, please
checkout http://dep.debian.net/deps/dep3/ to learn about the format. Here
are templates for supplementary fields that you might want to add:

Origin: <vendor|upstream|other>, <url of original patch>
Bug: <url in upstream bugtracker>
Bug-Debian: http://bugs.debian.org/<bugnumber>
Bug-Ubuntu: https://launchpad.net/bugs/<bugnumber>
Forwarded: <no|not-needed|url proving that it has been forwarded>
Reviewed-By: <name and email of someone who approved the patch>
Last-Update: <YYYY-MM-DD>

--- /dev/null
+++ securityonion-squert-20161212/.inc/config.php
@@ -0,0 +1,42 @@
+<?php
+//
+// SQueRT Settings
+//
+
+// DB Info
+
+$dbHost = "127.0.0.1";
+$dbName = "securityonion_db";
+$dbUser = "readonly";
+$dbPass = "securityonion";
+
+// Sguild Info
+
+$sgVer  = "SGUIL-0.9.0 OPENSSL ENABLED";
+$sgHost = "127.0.0.1";
+$sgPort = "7734";
+
+// Elasticsearch
+$clientparams = array();
+$clientparams['hosts'] = array(
+    'https://10.0.0.1:443'
+);
+
+//$clientparams['guzzleOptions'] = array(
+//    \Guzzle\Http\Client::SSL_CERT_AUTHORITY => 'system',
+//    \Guzzle\Http\Client::CURL_OPTIONS => [
+//        CURLOPT_SSL_VERIFYPEER => true,
+//        CURLOPT_CAINFO => '/etc/ssl/elasticsearch/es.pem', 
+//        CURLOPT_SSLCERTTYPE => 'PEM',
+//    ]   
+//);
+
+//$clientparams['connectionParams']['auth'] = array(
+//    'username',  // Username
+//    'password',  // Password
+//    'Basic'      // Auth: Basic, Digest, NTLM, Any
+//);
+
+// Where are the rules? If you have multiple dirs, separate each with: ||
+$rulePath = "/etc/nsm/rules";
+?>
