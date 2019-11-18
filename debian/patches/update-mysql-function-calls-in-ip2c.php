Description: <short summary of the patch>
 TODO: Put a short summary on the line above and replace this paragraph
 with a longer explanation of this change. Complete the meta-information
 with other relevant fields (see below for details). To make it easier, the
 information below has been extracted from the changelog. Adjust it or drop
 it.
 .
 securityonion-squert (20161212-1ubuntu1securityonion38) xenial; urgency=medium
 .
   * update mysql function calls in ip2c.php
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

--- securityonion-squert-20161212.orig/.inc/ip2c.php
+++ securityonion-squert-20161212/.inc/ip2c.php
@@ -19,10 +19,13 @@
 //
 //
 
-function IP2C($string,$isCLI) {
+include_once "config.php";
+include_once "functions.php";
+
+$db = mysqli_connect($dbHost,$dbUser,$dbPass) or die(mysqli_error($db));
+mysqli_select_db($db,$dbName) or die(mysqli_error($db));
 
-    include_once "config.php";
-    include_once "functions.php";
+function IP2C($string,$isCLI) {
 
     if ($isCLI == 'NO') {
         // Running from a browser
@@ -47,13 +50,14 @@ function IP2C($string,$isCLI) {
 
     function lookup($list) {
 
-        while ($row = mysql_fetch_row($list)) {
+	global $db;
+        while ($row = mysqli_fetch_row($list)) {
             $ip  = $row[0];
             $dot = long2ip((float)$ip);
-            $ipLookup = mysql_query("SELECT registry, cc, c_long, type, date, status FROM ip2c WHERE
+            $ipLookup = mysqli_query($db,"SELECT registry, cc, c_long, type, date, status FROM ip2c WHERE
                                      $ip >=start_ip AND $ip <= end_ip LIMIT 1");
 
-            $result = mysql_fetch_array($ipLookup);
+            $result = mysqli_fetch_array($ipLookup);
 
             if ($result) {
                 $registry       = $result[0];
@@ -63,7 +67,7 @@ function IP2C($string,$isCLI) {
                 $date           = $result[4];
                 $status         = $result[5];
 
-                mysql_query("REPLACE INTO mappings (registry,cc,c_long,type,ip,date,status)
+                mysqli_query($db,"REPLACE INTO mappings (registry,cc,c_long,type,ip,date,status)
                              VALUES (\"$registry\",\"$cc\",\"$c_long\",\"$type\",\"$ip\",\"$date\",\"$status\")");
                 echo "-- Mapped $dot ($ip) to $cc ($c_long)\n";
             }
@@ -72,32 +76,33 @@ function IP2C($string,$isCLI) {
     }
 
     // DB Connect
-    $db = mysql_connect($dbHost,$dbUser,$dbPass) or die(mysql_error());
-    mysql_select_db($dbName,$db) or die(mysql_error());
+    global $dbHost, $dbUser, $dbPass, $dbName;
+    $db = mysqli_connect($dbHost,$dbUser,$dbPass) or die(mysqli_error($db));
+    mysqli_select_db($db,$dbName) or die(mysqli_error($db));
 
     // Start timing
     $st = microtime(true);
-    $sipList = mysql_query("SELECT DISTINCT(e.src_ip) FROM event AS e LEFT JOIN mappings AS m ON e.src_ip=m.ip
+    $sipList = mysqli_query($db,"SELECT DISTINCT(e.src_ip) FROM event AS e LEFT JOIN mappings AS m ON e.src_ip=m.ip
                             WHERE (m.ip IS NULL OR m.cc = '01')");
-    $dipList = mysql_query("SELECT DISTINCT(e.dst_ip) FROM event AS e LEFT JOIN mappings AS m ON e.dst_ip=m.ip
+    $dipList = mysqli_query($db,"SELECT DISTINCT(e.dst_ip) FROM event AS e LEFT JOIN mappings AS m ON e.dst_ip=m.ip
                             WHERE (m.ip IS NULL OR m.cc = '01')");
     $sipCount = $dipCount = 0;
     if ($sipList) {
-        $sipCount = mysql_num_rows($sipList);
+        $sipCount = mysqli_num_rows($sipList);
         if ($sipCount > 0) {
             lookup($sipList);
         }
     }
 
     if ($dipList) {
-        $dipCount = mysql_num_rows($dipList);
+        $dipCount = mysqli_num_rows($dipList);
         if ($dipCount > 0) {
             lookup($dipList);
         }
     }
 
-    $allRecs = mysql_query("SELECT COUNT(*) FROM mappings");
-    $allCount = mysql_fetch_row($allRecs);
+    $allRecs = mysqli_query($db,"SELECT COUNT(*) FROM mappings");
+    $allCount = mysqli_fetch_row($allRecs);
 
     // Stop Timing
     $et = microtime(true);
