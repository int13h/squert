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

$stub = "Top Source IPs";

$sources = mysql_query("SELECT COUNT(src_ip) AS c1, COUNT(DISTINCT(dst_ip)) AS c2, COUNT(DISTINCT(signature)) AS c3, 
                        INET_NTOA(src_ip), map1.c_long as src_c_long, MAX(timestamp)
                        FROM event
                        LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                        LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
                        WHERE $when[0]
                        AND signature NOT REGEXP '^URL'
                        GROUP BY src_ip
                        ORDER BY c1 DESC");

echo "<h2> $stub</h2>";
echo "<table width=960 cellpadding=0 cellspacing=0 class=sortable style=\"border-collapse: collapse; border: 2pt solid #c9c9c9;\">\n
      \r<th class=sort width=130>IP</th>
      \r<th class=sort width=450>Country</th>
      \r<th class=sort width=129>Last Event</th>
      \r<th class=sorttable_nosort width=1></th>
      \r<th class=sort width=40>Sig</th>
      \r<th class=sort width=40>Dst</th>
      \r<th class=sort width=80>Count</th>
      \r<th class=sort width=80>% of Total</th>\n";

$i = 0;

while ($row = mysql_fetch_row($sources)) {
    $i++;
    if ($row[0] > 0) {
            $per = round($row[0] / $sumEvents * 100,2) . "%";
        } else {
            $per = 0;
    }

    $ip = $row[3];
    $ipInt = sprintf("%u", ip2long($ip));
    $cc = $row[4];
    $stamp = formatStamp($row[5],0);
    $stampLine = lastTime($stamp);
    $style = " style=\"font-weight: bold; color: #545454;\"";

    if (rfc1918($ip) == '0') {
        $cc = 'Local';
        $style = " style=\"font-weight: normal; color: gray;\"";
    } 

    if ($cc == FALSE) {
        $cc = "--";
    }

    echo "<tr><td class=sortbig sorttable_customkey=\"$ipInt\">$ip</td>
            \r<td class=sortbig$style>$cc</td>
            \r$stampLine
            \r<td class=sortmed>$row[2]</td>
            \r<td class=sortmed>$row[1]</td>
            \r<td class=sortbigbold>$row[0]</td>
            \r<td class=sortbigbold>$per</td></tr>\n";

    if ($sLimit != 0) { if ($i == $sLimit) {break;};}
}

echo "</table><br><br>";

?>
