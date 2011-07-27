<?php

//
//
//      Copyright (C) 2011 Paul Halliday <paul.halliday@gmail.com>
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
 
$q1 = "SELECT COUNT(src_port) AS c1, COUNT(DISTINCT(src_ip)) AS c2, COUNT(DISTINCT(dst_ip)) AS c3, src_port 
          FROM event
          WHERE $when[0] AND signature NOT LIKE 'URL%'
          GROUP BY src_port
          ORDER BY c1 DESC";

$r1 = mysql_query($q1);

$q2 = "SELECT COUNT(dst_port) AS c1, COUNT(DISTINCT(dst_ip)) AS c2, COUNT(DISTINCT(src_ip)) AS c3, dst_port
          FROM event
          WHERE $when[0] AND signature NOT LIKE 'URL%'
          GROUP BY dst_port
          ORDER BY c1 DESC";

$r2 = mysql_query($q2);

// Result count
$rC = 15;

$i = 0;

$src_bar1 = $src_s1 = $src_lbl = '';

while ($row = mysql_fetch_row($r1)) {
    $i++;
    $x = $i - .6;
    $y = $i - .4;
    $src_bar1 .= $row[0] . ",";
    $src_s1 .= "[" . $x . "," . $row[1] . ",'#b80028'],";
    $src_s1 .= "[" . $y . "," . $row[2] . ",'#22335a'],";
    $src_lbl .= "'" . $row[3] . "',";
    if ($i == $rC) { break; }        
}

$i = 0;

$dst_bar1 = $dst_s1 = $dst_lbl = '';

while ($row = mysql_fetch_row($r2)) {
    $i++;
    $x = $i - .6;
    $y = $i - .4;
    $dst_bar1 .= $row[0] . ",";
    $dst_s1 .= "[" . $x . "," . $row[1] . ",'#22335a'],";
    $dst_s1 .= "[" . $y . "," . $row[2] . ",'#b80028'],";
    $dst_lbl .= "'" . $row[3] . "',";
    if ($i == $rC) { break; }
}
    
// Chart Logic

echo "
<canvas id=\"daily_sport\" width=\"475\" height=\"350\">[No canvas support]</canvas>
<canvas id=\"daily_dport\" width=\"475\" height=\"350\">[No canvas support]</canvas>

<script>
  function createPort () {
  var bar1 = new RGraph.Bar('daily_sport', [$src_bar1]);
  bar1.Set('chart.title', 'Top Source Ports');
  bar1.Set('chart.yaxispos', 'left');
  bar1.Set('chart.background.grid', true);
  bar1.Set('chart.background.grid.autofit', true);
  bar1.Set('chart.background.grid.vlines', true);
  bar1.Set('chart.background.grid.width', .5);
  bar1.Set('chart.labels', [$src_lbl]);
  bar1.Set('chart.text.angle', 45);
  bar1.Set('chart.colors', ['#c4c4c4','#b80028','#22335a']);
  bar1.Set('chart.gutter.bottom', 75);
  bar1.Set('chart.gutter.left', 75);
  bar1.Set('chart.gutter.right', 50);
  bar1.Set('chart.strokecolor', 'black');
  bar1.Set('chart.text.size', 8);
  bar1.Set('chart.text.font', 'verdana');
  bar1.Set('chart.ylabels.count', 10);
  bar1.Set('chart.key', ['< Events', '> Sources', '> Destinations']);
  bar1.Set('chart.key.background', 'rgba(255,255,255,0.3)');
  bar1.Set('chart.background.grid.autofit.align', true);
 
  var src_s1 = new RGraph.Scatter('daily_sport', [$src_s1]);
  src_s1.Set('chart.background.grid.autofit.align', true);
  src_s1.Set('chart.gutter.left', 75);
  src_s1.Set('chart.gutter.bottom', 75);
  src_s1.Set('chart.gutter.right', 50);
  src_s1.Set('chart.tickmarks', 'circle');
  src_s1.Set('chart.ticksize', 6);
  src_s1.Set('chart.text.size', 8);
  src_s1.Set('chart.yaxispos', 'right')
  src_s1.Set('chart.background.grid', false);
  src_s1.Set('chart.ylabels.count', 10);
  src_s1.Set('chart.numyticks', 5);
  src_s1.Set('chart.xmax', $rC);
  bar1.Draw();
  src_s1.Draw();

  var bar2 = new RGraph.Bar('daily_dport', [$dst_bar1]);
  bar2.Set('chart.title', 'Top Destination Ports');
  bar2.Set('chart.yaxispos', 'left');
  bar2.Set('chart.background.grid', true);
  bar2.Set('chart.background.grid.autofit', true);
  bar2.Set('chart.background.grid.vlines', true);
  bar2.Set('chart.background.grid.width', .5);
  bar2.Set('chart.labels', [$dst_lbl]);
  bar2.Set('chart.text.angle', 45);
  bar2.Set('chart.colors', ['#c4c4c4','#22335a','#b80028']);
  bar2.Set('chart.gutter.bottom', 75);
  bar2.Set('chart.gutter.left', 75);
  bar2.Set('chart.gutter.right', 50);
  bar2.Set('chart.strokecolor', 'black');
  bar2.Set('chart.text.size', 8);
  bar2.Set('chart.text.font', 'verdana');
  bar2.Set('chart.ylabels.count', 10);
  bar2.Set('chart.key', ['< Events', '> Destinations', '> Sources']);
  bar2.Set('chart.key.background', 'rgba(255,255,255,0.3)');
  bar2.Set('chart.background.grid.autofit.align', true);
 
  var dst_s1 = new RGraph.Scatter('daily_dport', [$dst_s1]);
  dst_s1.Set('chart.background.grid.autofit.align', true);
  dst_s1.Set('chart.gutter.left', 75);
  dst_s1.Set('chart.gutter.bottom', 75);
  dst_s1.Set('chart.text.size', 8);
  dst_s1.Set('chart.gutter.right', 50);
  dst_s1.Set('chart.tickmarks', 'circle');
  dst_s1.Set('chart.ticksize', 6);
  dst_s1.Set('chart.yaxispos', 'right')
  dst_s1.Set('chart.background.grid', false);
  dst_s1.Set('chart.ylabels.count', 10);
  dst_s1.Set('chart.xmax', $rC);
  bar2.Draw();
  dst_s1.Draw();
}

createPort();
</script>";
?>
