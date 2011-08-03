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

$stub = "Top Destination IPs";

$destinations =  mysql_query("SELECT COUNT(dst_ip) AS c1, COUNT(DISTINCT(src_ip)) AS c2, COUNT(DISTINCT(signature)) AS c3, 
                 INET_NTOA(dst_ip), map2.c_long as dst_c_long
                 FROM event
                 LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                 LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
                 WHERE $when[0]
                 GROUP BY dst_ip
                 ORDER BY c1 DESC");

echo "<h2> $stub</h2>";
echo "<table width=100% cellpadding=0 cellspacing=0 class=sortable style=\"border-collapse: collapse; border: 2pt solid #c9c9c9;\">\n
      \r<th class=sort width=200>IP</th>
      \r<th class=sort>Country</th>
      \r<th class=sort width=100>Signatures</th>
      \r<th class=sort width=100>Destinations</th>
      \r<th class=sort width=100>Count</th>
      \r<th class=sort width=100>% of Total</th>\n";

$i = 0;

while ($row = mysql_fetch_row($destinations)) {
    $i++;
    if ($row[0] > 0) {
            $per = round($row[0] / $sumEvents * 100,2) . "%";
        } else {
            $per = 0;
    }

    $ip = $row[3];
    $cc = $row[4];
    $style = " style=\"font-weight: bold; color: #545454;\"";

    if (rfc1918($ip) == '0') {
        $cc = 'Local';
        $style = " style=\"font-weight: normal; color: gray;\"";
    }

    if ($cc == FALSE) {
        $cc = "--";
    }

    echo "<tr><td class=sortbig>$row[3]</td>
            \r<td class=sortbig$style>$cc</td>
            \r<td class=sortbigbold>$row[2]</td>
            \r<td class=sortbigbold>$row[1]</td>
            \r<td class=sortbigbold>$row[0]</td>
            \r<td class=sortbigbold>$per</td></tr>\n";

    // It is cheaper to perform the limit here than on the query
    if ($i == 10) {break;};
}

echo "</table><br><br>";

?>
