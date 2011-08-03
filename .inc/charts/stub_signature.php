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

$scc = "SELECT COUNT(signature) as count, signature
        FROM event
        WHERE $when[0]
        AND signature NOT REGEXP '^URL'
        GROUP BY signature
        ORDER BY count DESC";

$sccQuery = mysql_query($scc);

$i = 0;

$plot1 = $label1 = $key1 = '';

while ($row = mysql_fetch_row($sccQuery)) {
    $i++;
    $plot1 .= $row[0] . ",";
    $label1 .= "'" . $row[1] . "'" . ",";
    $key1 .= "'" . $row[1] . " (" . $row[0] . ")" . "'" . ",";
    if ($i == 15) { break; }
}

$colours = "'#4E4E9E', '#ECE64F', '#3E9AC0', '#4A4557', '#A817DF', '#14870D', '#925E72', '#B3B88C', '#5F4A4F', '#E3ECE8', '#1F5BCD', '#30858C', '#6DC787', '#8FF045', '#22FFBE'";

// Chart Logic

echo "
<canvas id=\"sigs\" width=\"980\" height=\"350\">[No canvas support]</canvas>

<script>
  function createSigs () {
  var sc = new RGraph.Pie('sigs', [$plot1]);
  sc.Set('chart.title', 'Top Signatures');
  sc.Set('chart.gutter.left', 20);
  sc.Set('chart.gutter.top', 10);
  sc.Set('chart.tooltips', [$label1]);
  sc.Set('chart.text.size', 8);
  sc.Set('chart.key', [$key1]);
  sc.Set('chart.key.background', 'rgba(245,245,245,0.3)');
  sc.Set('chart.colors', [$colours]);
  sc.Set('chart.highlight.style', '2d');
  sc.Set('chart.tooltips.effect', 'fade');
  sc.Set('chart.tooltips.event', 'onmousemove');
  sc.Set('chart.linewidth', 2);
  sc.Set('chart.strokestyle', '#ffffff');
  sc.Set('chart.align', 'left');
  sc.Set('chart.radius', 130);
  sc.Set('chart.shadow', false);
  sc.Draw();
}

createSigs();
</script>";


?>
