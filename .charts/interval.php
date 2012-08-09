<?php

//
//
//      Copyright (C) 2012 Paul Halliday <paul.halliday@gmail.com>
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

$c1 = '#cc0000';

$query = "SELECT COUNT(signature) AS count, SUBSTRING(CONVERT_TZ(timestamp,'+00:00','$offset'),12,5) AS time
          FROM event
          WHERE $when
          GROUP BY time 
          ORDER BY timestamp";

$results = mysql_query($query);

$_data = '';

while ($row = mysql_fetch_row($results)) {
    $minute = math($row[1]);
    $_data = $_data . ",['" . $minute . "'," . $row[0] . ",'$c1']";
    $hour = explode(":", $row[1]);
    $comp[] = $hour[0] . "||" . $row[0];
}

$c00 = $c01 = $c02 = $c03 = $c04 = $c05 = $c06 = $c07 = $c08 = $c09 = $c10 = $c11 = 0;
$c12 = $c13 = $c14 = $c15 = $c16 = $c17 = $c18 = $c19 = $c20 = $c21 = $c22 = $c23 = 0;

for ($a = 0; $a < sizeof($comp); ++ $a) {

    list($h,$c) = explode("||", $comp[$a]);

    switch ($h) {
        case '00': $c00 += $c; break;
        case '01': $c01 += $c; break;
        case '02': $c02 += $c; break;
        case '03': $c03 += $c; break;
        case '04': $c04 += $c; break;
        case '05': $c05 += $c; break;
        case '06': $c06 += $c; break;
        case '07': $c07 += $c; break;
        case '08': $c08 += $c; break;
        case '09': $c09 += $c; break;
        case '10': $c10 += $c; break;
        case '11': $c11 += $c; break;
        case '12': $c12 += $c; break;
        case '13': $c13 += $c; break;
        case '14': $c14 += $c; break;
        case '15': $c15 += $c; break;
        case '16': $c16 += $c; break;
        case '17': $c17 += $c; break;
        case '18': $c18 += $c; break;
        case '19': $c19 += $c; break;
        case '20': $c20 += $c; break;
        case '21': $c21 += $c; break;
        case '22': $c22 += $c; break;
        case '23': $c23 += $c; break;
    }
}

$data = ltrim($_data,",");

// Chart Logic

echo "
<canvas id=\"scatter1\" width=\"940\" height=\"300\">[No canvas support]</canvas>
<script>

function clicked (e, bar) {
        var obj = bar[0];
        var x   = bar[1];
        var y   = bar[2];
        var w   = bar[3];
        var h   = bar[4];
        var idx = bar[5];
        
        alert(idx);
}

function ipScat() {
            var data = [$data];
            var scatter1 = new RGraph.Scatter('scatter1', data);
            scatter1.Set('chart.ticksize', 2);
            scatter1.Set('chart.tickmarks', 'circle');
            scatter1.Set('chart.background.grid', true);
            scatter1.Set('chart.background.barcolor1', 'white');
            scatter1.Set('chart.background.barcolor2', 'white');
            scatter1.Set('chart.background.grid.autofit', true);
            scatter1.Set('chart.background.grid.autofit.align', true);
            scatter1.Set('chart.background.grid.autofit.numhlines', 25);
            scatter1.Set('chart.background.grid.autofit.numvlines', 24);
            scatter1.Set('chart.background.grid.width', .5);
            
            scatter1.Set('chart.text.size', 9);
            scatter1.Set('chart.text.font', 'verdana');
            scatter1.Set('chart.labels', ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23']); 
            scatter1.Set('chart.height', 300); // Necessary
            scatter1.Set('chart.xmax', 1440); // Necessary
            scatter1.Set('chart.gutter.bottom', 50);
            scatter1.Set('chart.gutter.left', 50);
            scatter1.Set('chart.gutter.right', 50);
            scatter1.Set('chart.line.colors', ['$c1']);

            var data2 = [$c00,$c01,$c02,$c03,$c04,$c05,$c06,$c07,$c08,$c09,$c10,$c11,$c12,$c13,$c14,$c15,$c16,$c17,$c18,$c19,$c20,$c21,$c22,$c23];
            var bar = new RGraph.Bar('scatter1', data2);
            bar.Set('chart.gutter.bottom', 50);
            bar.Set('chart.gutter.left', 50);
            bar.Set('chart.gutter.right', 50);
            bar.Set('chart.strokestyle', 'transparent');
            bar.Set('chart.colors', ['rgba(255, 255, 255, 0.0)']);
            bar.Set('chart.labels.above', 'true');
            bar.Set('chart.text.font', 'verdana');
            bar.Set('chart.yaxispos', 'right')
            bar.Set('chart.background.grid', false);
            bar.Set('chart.background.grid.autofit', true);
            bar.Set('chart.background.grid.autofit.align', true);
            bar.Set('chart.events.mousemove', function (e, bar) {e.target.style.cursor = 'pointer';});
            bar.Set('chart.events.click', clicked);
            scatter1.Draw();
            bar.Draw();
}

ipScat();
</script>";
?>
