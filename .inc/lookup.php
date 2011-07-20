<?php

//
//
//      Copyright (C) 2010 Paul Halliday <paul.halliday@gmail.com>
//
//      This program is free software: you can redistribute it and/or modify
//      it under the terms of the GNU General Public License as published by
//      the Free Software Foundation, either version 3 of the License, or
//      (at your option) any later version.
//
//      This program is distributed in the hope that it will be useful,
//      but WITHOUT ANY WARRANTY; without even the implied warranty of
//      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//      GNU General Public License for more details.
//
//      You should have received a copy of the GNU General Public License
//      along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//

session_start();
if (!(isset($_SESSION['sLogin']) && $_SESSION['sLogin'] != '')) {
    header ("Location: login.php");
}

include_once 'config.php';
include_once 'functions.php';

function localInfo($ip) {
    global $dns;
    $long = exec("dig @$dns -x $ip +short");
    
    $html = "\r<table style=\"border-collapse: collapse; border: none;\" cellpadding=3 cellspacing=0>";
    if (($long == '') || ($long[0] == ";")) {
        $html .= "\r<tr><td>Reverse lookup failed for <b>$ip</b></td></tr>";
    } else {
        $html .= "\r<tr><td align=right>Address:</td><td><b>$ip</b></td></tr>
                  \r<tr><td align=right>Hostname:</td><td><b>$long</b></td></tr>";
    }
 
    if (rfc1918($ip) == "1") {
        $html .= "\r<tr><td align=center colspan=2><a href=\"http://www.robtex.com/ip/$ip.html\" target=_new>robtex</a></td></tr>";
    }
         
    $html .= "\r</table>";
    echo $html;
}
?>

<?php

$ip = $_REQUEST['ip'];

?>

<html>
<head>
<TITLE>Lookup - <?php echo $ip;?></TITLE>
<link href="../.css/squert.css" rel="stylesheet" type="text/css">
</head>
<body style="color: #000000; background: #f4f4f4; font-size: 1em;" onblur="self.close();">
<?php localInfo($ip)?>
</body>
</html>
