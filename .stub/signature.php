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

$stub = "Events";

$query = "SELECT COUNT(event.signature) AS c1, event.signature, signature_id, signature_gen, 
          MAX(CONVERT_TZ(timestamp,'+00:00','$offset')) as t,
          COUNT(DISTINCT(src_ip)), COUNT(DISTINCT(dst_ip)), ip_proto, 
          GROUP_CONCAT(DISTINCT(status)), GROUP_CONCAT(DISTINCT(event.sid)),
          GROUP_CONCAT(status)
          FROM event
          LEFT JOIN sensor AS s ON event.sid = s.sid
          WHERE $when
          AND agent_type = 'snort'
          GROUP BY signature_id
          ORDER BY t DESC";

$signatures = mysql_query($query);

echo "<div class=toggle id=table-Events>
      <h3 class=live id=h-Events> [-] $stub</h3>
      <table id=sort-events width=960 cellpadding=0 cellspacing=0 class=tablesorter style=\"border-collapse: collapse; border: 1pt solid #c9c9c9;\">\n
      <thead><tr>
      <th class=sort width=60>QUEUED</th>
      <th class=sort width=60>ALL</th>
      <th class=sort width=35>SC</th>
      <th class=sort width=35>DC</th>
      <th class=sort width=100>LAST EVENT</th>
      <th class=sort>SIGNATURE</th>
      <th class=sort width=80>ID</th>
      <th class=sort width=60>PROTO</th>
      <th class=sort width=60>% TOTAL</th></tr></thead>\n";

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

    // How many events are not categorized?
    $unClass = substr_count($row[10], '0');

    // Colour based on event presence
    if ( $unClass > 0 ) {
        $rtClass = "b_ec_hot";
        $isActive = "row_active";
    } else {
        $rtClass = "b_ec_cold";
        $isActive = "row";
    }

    $sidList = rtrim($sidList);

    echo "<tr class=d_row id=\"sid-$row[2]-$row[3]\" data-class=\"$sidList\" data-sid=\"$sensorList\" data-event_count=\"$row[0]\">
          <td class=$isActive><div class=$rtClass>$unClass</div></td>
          <td class=row_active><div class=b_ec_total>$row[0]</div></td>
          <td class=row>$row[5]</td>
          <td class=row>$row[6]</td>
          $stampLine
          <td class=row>$row[1]</td>
          <td class=row>$row[2]</td>
          <td class=row>$ipp</td>
          <td class=row>$per</td></tr>\n";
}

echo "</table></div><br><br>";
?>
