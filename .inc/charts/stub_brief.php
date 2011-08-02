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

$stub = "Brief";

// Distinct Sources

$sources	=  mysql_query("SELECT COUNT(DISTINCT(src_ip)) 
                   FROM event
                   WHERE $when[0]");

// Distinct Destinations

$destinations	=  mysql_query("SELECT COUNT(DISTINCT(dst_ip))
                   FROM event
                   WHERE $when[0]");

// Signatures

$signatures	= mysql_query("SELECT COUNT(signature) AS c1, signature, signature_id
                  FROM event
                  WHERE $when[0]
                  AND signature NOT LIKE 'URL%'
                  GROUP BY signature
                  ORDER BY c1 DESC");

while ($row = mysql_fetch_row($category)) {
    $presentCats [$row[1]] = "$row[0]";
    $sumEvents += $row[0];
}

$sigCount = mysql_num_rows($signatures);
$srcCount = mysql_fetch_row($sources);
$dstCount = mysql_fetch_row($destinations);

echo "<h2> $stub</h2>
      \r<table width=100% align=center>\n
      \r<tr>\n
      \r<td align=center><div class=big>Total Events</div><div class=box>$sumEvents</div></td>\n
      \r<td align=center><div class=big>Total Signatures</div><div class=box>$sigCount</div></td>\n
      \r<td align=center><div class=big>Total Sources</div><div class=box>$srcCount[0]</div></td>\n
      \r<td align=center><div class=big>Total Destinations</div><div class=box>$dstCount[0]</div></td>\n
      \r</tr>\n
      </table><br><br>\n";

?>
