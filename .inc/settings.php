<?php

//
//
//      Copyright (C) 2011 Paul Halliday <paul.halliday@gmail.com>
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

// Session init
session_start();

function getUser() {
    function sKill() {
        session_destroy();
        session_unset();
        header ("Location: login.php");
    }

    if (!(isset($_SESSION['sLogin']) && $_SESSION['sLogin'] != '')) {
        header ("Location: login.php");
    }

    // Session variables
    if(!isset($_SESSION['sUser']))  { sKill(); }  else { $sUser  = $_SESSION['sUser'];}
    if(!isset($_SESSION['sEmail'])) { sKill(); }  else { $sEmail = $_SESSION['sEmail'];}
    if(!isset($_SESSION['sType']))  { sKill(); }  else { $sType  = $_SESSION['sType'];}
    if(!isset($_SESSION['sTime']))  { sKill(); }  else { $sTime  = $_SESSION['sTime'];}
    
    echo "<tr>
          \r<td class=content width=20%>$sUser</td>
          \r<td class=content width=20%>$sEmail</td>
          \r<td class=content width=20%>$sType</td>
          \r<td class=content width=20%>$sTime</td>
          \r</tr>";
}
?>

<form id=options method=post action=".inc/settings.php">
<table class=table width=100% cellpadding=1 cellspacing=0>
<tr><td class=title colspan=4>
Account Settings
</td></tr>
<tr>
<td class=heading width=20%>Username</td>
<td class=heading width=20%>Email</td>
<td class=heading width=20%>Account Type</td>
<td class=heading width=20%>Session Timeout</td>
</tr>
<?php getUser();?>
</table>
