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

function math($stamp) {
    list($a,$b) = explode(":",$stamp);
    $c = $a * 60 + $b;
    return $c;
}

$c1 = '#545454';

$query = "SELECT COUNT(*) AS count, SUBSTRING(timestamp,12,5) AS time FROM event 
          WHERE $when[0]
          GROUP BY time 
          ORDER BY timestamp";

$results = mysql_query($query);

$_data = '';

while ($row = mysql_fetch_row($results)) {
    $minute = math($row[1]);
    $_data = $_data . ",['" . $minute . "'," . $row[0] . ",'$c1']";
}

$data = ltrim($_data,",");

// Chart Logic

echo "
<canvas id=\"scatter1\" width=\"940\" height=\"300\">[No canvas support]</canvas>
<script>
function ipScat() {
            var data = [$data];
            var scatter1 = new RGraph.Scatter('scatter1', data);
            scatter1.Set('chart.ticksize', 3);
            scatter1.Set('chart.tickmarks', 'cross');
            scatter1.Set('chart.background.hbars', [[0,null,'rgba(0,0,0,0.02)']]);
            scatter1.Set('chart.background.barcolor1', 'white');
            scatter1.Set('chart.background.barcolor2', 'white');
            scatter1.Set('chart.background.grid.autofit', true);
            scatter1.Set('chart.background.grid.autofit.numhlines', 25);
            scatter1.Set('chart.background.grid.autofit.numvlines', 23);
            scatter1.Set('chart.text.size', 9);
            scatter1.Set('chart.text.font', 'verdana');
            scatter1.Set('chart.labels', ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23']); 
            scatter1.Set('chart.height', 300); // Necessary
            scatter1.Set('chart.xmax', 1440); // Necessary
            scatter1.Set('chart.title', 'Events grouped by minute');
            scatter1.Set('chart.gutter.bottom', 50);
            scatter1.Set('chart.gutter.left', 50);
            scatter1.Set('chart.background.grid.border', false);

            scatter1.Set('chart.line.colors', ['$c1']);

            scatter1.Set('chart.zoom.factor', 3);
            scatter1.Set('chart.zoom.mode', 'area');
            scatter1.Set('chart.zoom.frames', '20');

            scatter1.Draw();
}

ipScat();
</script>";
?>
