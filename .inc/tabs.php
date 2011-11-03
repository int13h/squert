<?php
// This creates the tabs
function tabber($tab,$id,$s,$e) {

    // Tab title, then page name.
    $theTabs = array(
        "SUMMARY"	=> "p-sum.php?id=$id&s=$s&e=$e",
        "SIGNATURES"	=> "p-sig.php?id=$id&s=$s&e=$e",
        "IP"		=> "p-ip.php?id=$id&s=$s&e=$e",
        "MAP"           => "p-map.php?id=$id&s=$s&e=$e",
        "QUERY"		=> "p-query.php?id=$id&s=$s&e=$e"   
    );

   //ksort($theTabs);

    echo "
      <div class=noprint id=\"header\">\n
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
?>
