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


$stub = "Event Distribution by Sensor";

$sensor		= mysql_query("SELECT st.net_name, st.hostname, st.agent_type, st.sid, COUNT(signature) AS c1 
                  FROM event LEFT JOIN sensor AS st ON event.sid = st.sid
                  WHERE $when[0]
                  GROUP BY event.sid 
                  ORDER BY c1 DESC");

$sensors        = mysql_query("SELECT net_name, hostname, agent_type, sid
                  FROM sensor
                  WHERE agent_type != 'pcap'");

// We want to enumerate sensors that don't have event counts so
// we create an array with all sid's. We can then
// walk through this array and query the data array with each index.

while ($row = mysql_fetch_row($sensors)) {
    $sensorList [$row[3]] = "$row[0]||$row[1]||$row[2]";
}

// The event counts
while ($row = mysql_fetch_row($sensor)) {
    $presentSens [$row[3]] = "$row[0]||$row[1]||$row[2]||$row[4]";

}

echo "<h2> $stub</h2>";
echo "<table width=100% cellpadding=0 cellspacing=0 class=sortable style=\"border-collapse: collapse; border: 2pt solid #c9c9c9;\">\n
      \r<th class=sort>Network</th>
      \r<th class=sort width=300>Hostname</th>
      \r<th class=sort width=100>Agent Type</th>
      \r<th class=sort width=100>Count</th>
      \r<th class=sort width=100>% of Total</th>\n";

foreach ($sensorList as $key => $sid) {

    list($netName,$hostName,$agent) = explode('||', $sid);

    if (isset($presentSens[$key])) {
        list($netName,$hostName,$agent,$numEvents) = explode('||', $presentSens[$key]);
        if ($numEvents > 0) {
            $per = round($numEvents / $sumEvents * 100,2) . "%";
        } else {
            $per = 0;
        }
     } else {
        $numEvents = 0;
        $per = 0;
     }


    echo "<tr><td class=sortbig>$netName</td><td class=sortbig>$hostName</td>
          <td class=sortbig>$agent</td><td class=sortbigbold>$numEvents</td>
          <td class=sortbigbold>$per</td></tr>\n";

}

echo "</table><br><br>";

?>
