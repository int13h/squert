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

$stub = "Event Signatures";

$query = "SELECT COUNT(signature) AS c1, signature, signature_id, signature_gen, MAX(CONVERT_TZ(timestamp,'+00:00','$offset')) as t, 
          COUNT(DISTINCT(src_ip)), COUNT(DISTINCT(dst_ip)), ip_proto, 
          GROUP_CONCAT(DISTINCT(status)), GROUP_CONCAT(DISTINCT(sid))
          FROM event
          WHERE $when
          $loFilter
          GROUP BY signature
          ORDER BY t DESC";

$signatures = mysql_query($query);

echo "<div class=toggle id=table-Signature>
      \r<h3 class=live id=h-Signature> [-] $stub</h3>
      \r<table id=sort-signature width=960 cellpadding=0 cellspacing=0 class=tablesorter style=\"border-collapse: collapse; border: 1pt solid #c9c9c9;\">\n
      \r<thead><tr>
      \r<th class=sort>Signature</th>
      \r<th class=sort width=80>ID</th>
      \r<th class=sort width=60>Proto</th>
      \r<th class=sort>Last</th>
      \r<th class=sorttable_nosort width=1></th>
      \r<th class=sort width=20>Src</th>
      \r<th class=sort width=20>Dst</th>
      \r<th class=sort width=80>Count</th>
      \r<th class=sort width=80>% of Total</th></tr></thead>\n";

$i = 0;

while ($row = mysql_fetch_row($signatures)) {
    $i++;
    if ($sumEvents > 0) {
            $per = round($row[0] / $sumEvents * 100,2) . "%";
        } else {
            $per = 0;
    }

    $stamp = formatStamp($row[4],0);
    $stampLine = lastTime($stamp);
    $ipp = getProto($row[7]);

    // Pad sids for filtering
    $psids = explode(",", $row[8]);
    $sidList = '';
 
    foreach ($psids as $psid) {
        if (strlen($psid) < 2) {
            $psid = 0 . $psid;
        }
        $sidList .= $psid . " ";
    }

    // Pad sensor ID's for filtering
    $psensors = explode(",", $row[9]);
    $sensorList = '';

    foreach ($psensors as $psensor) {
        if (strlen($psensor) < 2) {
            $psensor = 0 . $psensor;
        }
        $sensorList .= $psensor . " ";
    }


    $sidList = rtrim($sidList);

    echo "<tr class=d_row id=\"sid-$row[2]-$row[3]\" data-class=\"$sidList\" data-sid=\"$sensorList\">
          \r<td class=row>$row[1]</td>
          \r<td class=row>$row[2]</td>
          \r<td class=row>$ipp</td>
          \r$stampLine
          \r<td class=row>$row[5]</td>
          \r<td class=row>$row[6]</td>
          \r<td class=row><b>$row[0]</b></td>
          \r<td class=row><b>$per</b></td></tr>\n";
}

echo "</table></div><br><br>";
?>
