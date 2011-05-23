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


include '.inc/functions.php';
dbC();

function math($stamp) {
    list($a,$b) = explode(":",$stamp);
    $c = $a * 60 + $b;
    return $c;
}

$c1 = '#E6DB49';
$c2 = '#86cc7e';
$c3 = '#22335a';
$c4 = 'orange';
$c5 = 'red';
$c6 = 'lightblue';
$c7 = 'brown';

$query = "SELECT COUNT(*) AS count, SUBSTRING(timestamp,12,5) AS time FROM event 
          WHERE timestamp BETWEEN '2011-05-17 00:00:00' AND '2011-05-18 00:00:00'
          GROUP BY time ORDER BY time";

$query1 = "SELECT COUNT(*) AS count, SUBSTRING(timestamp,12,5) AS time FROM event
          WHERE timestamp BETWEEN '2011-05-18 00:00:00' AND '2011-05-19 00:00:00'
          GROUP BY time ORDER BY time";

$query2 = "SELECT COUNT(*) AS count, SUBSTRING(timestamp,12,5) AS time FROM event
          WHERE timestamp BETWEEN '2011-05-19 00:00:00' AND '2011-05-20 00:00:00'
          GROUP BY time ORDER BY time";

$query3 = "SELECT COUNT(*) AS count, SUBSTRING(timestamp,12,5) AS time FROM event
          WHERE timestamp BETWEEN '2011-05-20 00:00:00' AND '2011-05-21 00:00:00'
          GROUP BY time ORDER BY time";

$query4 = "SELECT COUNT(*) AS count, SUBSTRING(timestamp,12,5) AS time FROM event
          WHERE timestamp BETWEEN '2011-05-21 00:00:00' AND '2011-05-22 00:00:00'
          GROUP BY time ORDER BY time";

$query5 = "SELECT COUNT(*) AS count, SUBSTRING(timestamp,12,5) AS time FROM event
          WHERE timestamp BETWEEN '2011-05-22 00:00:00' AND '2011-05-23 00:00:00'
          GROUP BY time ORDER BY time";

$query6 = "SELECT COUNT(*) AS count, SUBSTRING(timestamp,12,5) AS time FROM event
          WHERE timestamp BETWEEN '2011-05-23 00:00:00' AND '2011-05-24 00:00:00'
          GROUP BY time ORDER BY time";

$results = mysql_query($query);
$results1 = mysql_query($query1);
$results2 = mysql_query($query2);
$results3 = mysql_query($query3);
$results4 = mysql_query($query4);
$results5 = mysql_query($query5);
$results6 = mysql_query($query6);

$_data = '';

while ($row = mysql_fetch_row($results)) {
    $minute = math($row[1]);
    $_data = $_data . ",['" . $minute . "'," . $row[0] . ",'$c1']";
}

while ($row = mysql_fetch_row($results1)) {
    $minute = math($row[1]);
    $_data = $_data . ",['" . $minute . "'," . $row[0] . ",'$c2']";
}

while ($row = mysql_fetch_row($results2)) {
    $minute = math($row[1]);
    $_data = $_data . ",['" . $minute . "'," . $row[0] . ",'$c3']";
}

while ($row = mysql_fetch_row($results3)) {
    $minute = math($row[1]);
    $_data = $_data . ",['" . $minute . "'," . $row[0] . ",'$c4']";
}

while ($row = mysql_fetch_row($results4)) {
    $minute = math($row[1]);
    $_data = $_data . ",['" . $minute . "'," . $row[0] . ",'$c5']";
}

while ($row = mysql_fetch_row($results5)) {
    $minute = math($row[1]);
    $_data = $_data . ",['" . $minute . "'," . $row[0] . ",'$c6']";
}

while ($row = mysql_fetch_row($results6)) {
    $minute = math($row[1]);
    $_data = $_data . ",['" . $minute . "'," . $row[0] . ",'$c7']";
}

$data = ltrim($_data,",");
    
// Chart Logic

echo "
<script>
window.onload = function () {
            var data = [$data];
            var scatter1 = new RGraph.Scatter('scatter1', data);
            scatter1.Set('chart.ticksize', 3);
            scatter1.Set('chart.tickmarks', 'plus');
            scatter1.Set('chart.background.hbars', [[0,null,'rgba(0,0,0,0.02)']]);
            scatter1.Set('chart.background.barcolor1', 'white');
            scatter1.Set('chart.background.barcolor2', 'white');
            scatter1.Set('chart.background.grid.autofit', true);
            scatter1.Set('chart.background.grid.autofit.numhlines', 20);
            scatter1.Set('chart.background.grid.autofit.numvlines', 22);
            scatter1.Set('chart.text.size', 9);
            scatter1.Set('chart.text.font', 'verdana');
            scatter1.Set('chart.labels', ['2','4','6','8','10','12','14','16','18','20','22']); 
            scatter1.Set('chart.height', 300); // Necessary
            scatter1.Set('chart.xmax', 1440); // Necessary
            scatter1.Set('chart.title', 'Events: 7 days, grouped by minute');
            scatter1.Set('chart.gutter', 50);
            //scatter1.Set('chart.title.yaxis', 'Event Count');
            //scatter1.Set('chart.background.grid.vlines', false);
            scatter1.Set('chart.background.grid.border', false);

            scatter1.Set('chart.key', ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun']);
            scatter1.Set('chart.key.background', 'rgba(255,255,255,0.5)');
            scatter1.Set('chart.line.colors', ['$c1','$c2','$c3','$c4','$c5','$c6','$c7']);
            scatter1.Set('chart.resizable', true);

            scatter1.Set('chart.zoom.factor', 3);
            scatter1.Set('chart.zoom.mode', 'area');
            scatter1.Set('chart.zoom.frames', '20');

            //scatter1.Set('chart.crosshairs', true);
            //scatter1.Set('chart.crosshairs.coords', true);
            //scatter1.Set('chart.crosshairs.coords.labels.x', 'Minute');
            //scatter1.Set('chart.crosshairs.coords.labels.y', 'Events');

            scatter1.Draw();
}
</script>
<canvas id=\"scatter1\" width=\"940\" height=\"400\">[No canvas support]</canvas>";
?>
