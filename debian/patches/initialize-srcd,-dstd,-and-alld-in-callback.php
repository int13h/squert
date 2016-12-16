Description: <short summary of the patch>
 TODO: Put a short summary on the line above and replace this paragraph
 with a longer explanation of this change. Complete the meta-information
 with other relevant fields (see below for details). To make it easier, the
 information below has been extracted from the changelog. Adjust it or drop
 it.
 .
 securityonion-squert (20161212-1ubuntu1securityonion9) trusty; urgency=medium
 .
   * initialize srcd, dstd, and alld in callback.php
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

--- securityonion-squert-20161212.orig/.inc/callback.php
+++ securityonion-squert-20161212/.inc/callback.php
@@ -821,6 +821,7 @@ function map() {
   }        
 
   $aSum = $bSum = $cSum = $aItems = $bItems = $cItems = 0;
+  $srcd = $dstd = $alld = "";
 
   function makeDetail($x1,$x2) {
     $detail = ""; 
--- securityonion-squert-20161212.orig/login.php
+++ securityonion-squert-20161212/login.php
@@ -130,7 +130,7 @@ Password<br>
 <input id=logmein name=logmein class=rb type=submit name=login value=submit><br><br></td>
 <td class=err><?php echo $err;?></td></tr>
 </table>
-<div class=cp>Version 1.6.2<span>&copy;2016 Paul Halliday</span></div>
+<div class=cp>Version 1.6.3<span>&copy;2016 Paul Halliday</span></div>
 </div>
 </form>
 <script type="text/javascript">document.credcheck.<?php echo $focus;?>.focus();</script>
