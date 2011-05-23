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

function getUser() {
    global $sUser, $sEmail, $sType, $sTime;

    echo "<tr>
          \r<td class=tros width=20%>$sUser</td>
          \r<td class=tros width=20%>$sEmail</td>
          \r<td class=tros width=20%>$sType</td>
          \r<td class=tros width=20%>$sTime</td>
          \r</tr>";
}
?>

<form id=options method=post action=".inc/settings.php">
<table class=table width=100% cellpadding=1 cellspacing=0>
<tr><td colspan=4 style="background: #000000; color: #ffffff; padding: 5px; font-weight: bold;">
User Account(s)
</td></tr>
<tr>
<th class=sort width=20%>Username</td>
<th class=sort width=20%>Email</td>
<th class=sort width=20%>Account Type</td>
<th class=sort width=20%>Session Timeout</td>
</tr>
<?php getUser();?>
</table>
