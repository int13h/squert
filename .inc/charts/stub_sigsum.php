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

$stub = "Top Signatures";

$signatures = mysql_query("SELECT COUNT(signature) AS c1, signature, signature_id, MAX(timestamp), COUNT(DISTINCT(src_ip)), COUNT(DISTINCT(dst_ip))
                           FROM event
                           WHERE $when[0]
                           AND signature NOT REGEXP '^URL'
                           GROUP BY signature
                           ORDER BY c1 DESC");

echo "<h2> $stub</h2>";
echo "<table width=960 cellpadding=0 cellspacing=0 class=sortable style=\"border-collapse: collapse; border: 2pt solid #c9c9c9;\">\n
      \r<th class=sort width=410>Signature</th>
      \r<th class=sort width=100>ID</th>
      \r<th class=sort width=129>Last Event</th>
      \r<th class=sorttable_nosort width=1></th>
      \r<th class=sort width=30>Src</th>
      \r<th class=sort width=30>Dst</th>
      \r<th class=sort width=80>Count</th>
      \r<th class=sort width=80>% of Total</th>\n";

$i = 0;

while ($row = mysql_fetch_row($signatures)) {
    $i++;
    if ($row[0] > 0) {
            $per = round($row[0] / $sumEvents * 100,2) . "%";
        } else {
            $per = 0;
    }

    $stamp = formatStamp($row[3],0);
    $stampLine = lastTime($stamp);

    echo "<tr><td class=sortbig>$row[1]</td>
          \r<td class=sortbig>$row[2]</td>
          \r$stampLine
          \r<td class=sortmed>$row[4]</td>
          \r<td class=sortmed>$row[5]</td>
          \r<td class=sortbigbold>$row[0]</td>
          \r<td class=sortbigbold>$per</td></tr>\n";

    if ($sLimit != 0) { if ($i == $sLimit) {break;};}
}

echo "</table>";
 
echo "<table align=right cellpadding=0 cellspacing=0 style=\"padding-right: 10px; font-size: 10px; font-weight:bold;\">
      <tr><td>Viewing: $i of $sigCount signatures</td></tr></table><br><br>";

?>
