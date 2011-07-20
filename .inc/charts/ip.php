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
 

$plot1 = $line1 = $label1 = $plot2 = $line2 = $label2 = '';

$q1 = "SELECT COUNT(src_ip) AS c1, COUNT(DISTINCT(dst_ip)) AS c2, COUNT(DISTINCT(signature)) AS c3, INET_NTOA(src_ip) 
          FROM event
          WHERE $when[0] AND signature NOT LIKE 'URL%'
          GROUP BY src_ip
          ORDER BY c1 DESC";

$r1 = mysql_query($q1);

$q2 = "SELECT COUNT(dst_ip) AS c1, COUNT(DISTINCT(src_ip)) AS c2, COUNT(DISTINCT(signature)) AS c3, INET_NTOA(dst_ip)
          FROM event
          WHERE $when[0] AND signature NOT LIKE 'URL%'
          GROUP BY dst_ip
          ORDER BY c1 DESC";

$r2 = mysql_query($q2);

$i = 0;

while ($row = mysql_fetch_row($r1)) {
    $i++;
    $plot1 .= "[" . $row[1] . "," . $row[0] . ",0],";
    $line1 .= "'" . $row[2] . "',";
    $label1 .= "'" . $row[3] . "',";
    if ($i == 10) { break; }        
}

$i = 0;

while ($row = mysql_fetch_row($r2)) {
    $i++;
    $plot2 .= "[" . $row[1] . "," . $row[0] . ",0],";
    $line2 .= "'" . $row[2] . "',";
    $label2 .= "'" . $row[3] . "',";
    if ($i == 10) { break; }
}

$plot1 = rtrim($plot1,",");
$label1 = rtrim($label1,",");
$line1 = rtrim($line1,",");
$plot2 = rtrim($plot2,",");
$line2 = rtrim($line2,",");
$label2 = rtrim($label2,",");
    
// Chart Logic

echo "
<canvas id=\"daily_sip\" width=\"475\" height=\"300\">[No canvas support]</canvas>
<canvas id=\"daily_dip\" width=\"475\" height=\"300\">[No canvas support]</canvas>

<script>
  function createIP () {
  var bar1 = new RGraph.Bar('daily_sip', [$plot1]);
  bar1.Set('chart.title', 'Top Sources');
  bar1.Set('chart.yaxispos', 'left');
  bar1.Set('chart.colors', ['#f5a3a3']);
  bar1.Set('chart.background.grid', true);
  bar1.Set('chart.background.grid.autofit', true);
  bar1.Set('chart.background.grid.vlines', true);
  bar1.Set('chart.background.grid.border', false);
  bar1.Set('chart.labels', [$label1]);
  bar1.Set('chart.text.angle', 45);
  bar1.Set('chart.colors', ['lightblue','#9baac4','#9ce089']);
  bar1.Set('chart.gutter.bottom', 75);
  bar1.Set('chart.gutter.left', 75);
  bar1.Set('chart.strokecolor', 'black');
  bar1.Set('chart.text.size', 8);
  bar1.Set('chart.text.font', 'verdana');
  bar1.Set('chart.key', ['Distinct Destinations', 'Total Events', 'Distinct Signatures']);
  bar1.Set('chart.key.background', 'rgba(255,255,255,0.5)');
  bar1.Set('chart.grouping', 'stacked');
  bar1.Set('chart.background.grid.autofit.align', true);
 
  var line1 = new RGraph.Line('daily_sip', [$line1]);
  line1.Set('chart.yaxispos', 'right')
  line1.Set('chart.linewidth', 1);
  line1.Set('chart.colors', ['#9ce089']);
  line1.Set('chart.tickmarks', 'square');
  line1.Set('chart.background.grid', false);
  line1.Set('chart.gutter.bottom', 75);
  line1.Set('chart.gutter.left', 75);
  line1.Set('chart.labels.above', true);
  line1.Set('chart.labels.above.size', 6);
  bar1.Set('chart.line', line1); 
  bar1.Draw();

  var bar2 = new RGraph.Bar('daily_dip', [$plot2]);
  bar2.Set('chart.title', 'Top Destinations');
  bar2.Set('chart.yaxispos', 'left');
  bar2.Set('chart.gutter.bottom', 75);
  bar2.Set('chart.gutter.left', 75);
  bar2.Set('chart.background.grid', true);
  bar2.Set('chart.background.grid.autofit', true);
  bar2.Set('chart.background.grid.vlines', true);
  bar2.Set('chart.background.grid.border', false);
  bar2.Set('chart.labels', [$label2]);
  bar2.Set('chart.text.angle', 45);
  bar2.Set('chart.colors', ['lightblue','#9baac4','#9ce089']);
  bar2.Set('chart.strokecolor', 'black');
  bar2.Set('chart.text.size', 8);
  bar2.Set('chart.text.font', 'verdana');
  bar2.Set('chart.key', ['Distinct Sources', 'Total Events', 'Distinct Signatures']);
  bar2.Set('chart.key.background', 'rgba(255,255,255,0.5)');
  bar2.Set('chart.grouping', 'stacked');
  bar2.Set('chart.background.grid.autofit.align', true);

  var line2 = new RGraph.Line('daily_dip', [$line2]);
  line2.Set('chart.yaxispos', 'right')
  line2.Set('chart.linewidth', 1);
  line2.Set('chart.colors', ['#9ce089']);
  line2.Set('chart.tickmarks', 'square');
  line2.Set('chart.background.grid', false);
  line2.Set('chart.gutter.bottom', 75);
  line2.Set('chart.gutter.left', 75);
  line2.Set('chart.labels.above', true);
  line2.Set('chart.labels.above.size', 6);
  bar2.Set('chart.line', line2); 
  bar2.Draw();
}

createIP();
</script>";
?>
