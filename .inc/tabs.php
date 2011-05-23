<?php
// This creates the tabs
function tabber($tab,$id) {

    // Tab title, then page name.
    $theTabs = array(
        "INTELLIGENCE"	=> "p-intel.php?id=$id",
        "SIGNATURES"	=> "p-sig.php?id=$id",
        "IP"		=> "p-ip.php?id=$id",
        "QUERY"		=> "p-query.php?id=$id",
        "SETTINGS"	=> "p-settings.php?id=$id"
    );

   //ksort($theTabs);

    echo "
      <div id=\"header\">\n
        <ul id=\"primary\">\n";

    foreach ($theTabs as $name => $page) {

        if ("$name" === "$tab") {
            echo "
           <li><span class=tabs>$name</span></li>\n";
        } else {
            echo "
            <li><a class=tabs href=\"${page}\">$name</a></li>\n";
        }

    }

    echo "
        </ul>
        </div>\n";
}

// We dont want anything cached
header ("Expires: Sun, 11 Nov 1973 05:00:00 GMT");
header ("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header ("Cache-Control: no-cache, must-revalidate");
header ("Pragma: no-cache");

?>


