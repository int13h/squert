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

$signatures	= mysql_query("SELECT COUNT(signature) AS c1, signature, signature_id
                  FROM event
                  WHERE $when[0]
                  GROUP BY signature
                  ORDER BY c1 DESC");

echo "<h2> $stub</h2>";
echo "<table width=100% cellpadding=0 cellspacing=0 class=sortable style=\"border-collapse: collapse; border: 2pt solid #c9c9c9;\">\n
      \r<th class=sort>Signature</th>
      \r<th class=sort width=100>ID</th>
      \r<th class=sort width=100>Count</th>
      \r<th class=sort width=100>% of Total</th>\n";

$i = 0;

while ($row = mysql_fetch_row($signatures)) {
    $i++;
    if ($row[0] > 0) {
            $per = round($row[0] / $sumEvents * 100,2) . "%";
        } else {
            $per = 0;
    }

    echo "<tr><td class=sortbig>$row[1]</td><td class=sortbig>$row[2]</td>
          <td class=sortbigbold>$row[0]</td><td class=sortbigbold>$per</td></tr>\n";

    // It is cheaper to perform the limit here than on the query
    if ($i == 10) {break;};
}

echo "</table><br><br>";

?>
