Description: <short summary of the patch>
 TODO: Put a short summary on the line above and replace this paragraph
 with a longer explanation of this change. Complete the meta-information
 with other relevant fields (see below for details). To make it easier, the
 information below has been extracted from the changelog. Adjust it or drop
 it.
 .
 securityonion-squert (20161212-1ubuntu1securityonion5) trusty; urgency=medium
 .
   * fix ip2c.php
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
@@ -126,6 +126,10 @@ function IP2C($string,$isCLI) {
 }
 
 /*
+
+Commenting out the following function per
+https://github.com/int13h/squert/issues/76
+
 function TheHTML($string) {
 
     echo "\r<html>
@@ -143,6 +147,7 @@ function TheHTML($string) {
           \r</body>
           \r</html>";
 }
+*/
 
 if (isset($argc)) {
 
@@ -171,5 +176,4 @@ if (isset($argc)) {
     TheHTML($string);
     echo $html;
 }
-*/
 ?>
