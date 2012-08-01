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
 
$q1 = "SELECT COUNT(src_ip) AS c1, COUNT(DISTINCT(dst_ip)) AS c2, COUNT(DISTINCT(signature)) AS c3, INET_NTOA(src_ip) 
       FROM event
       WHERE $when
       GROUP BY src_ip
       ORDER BY c1 DESC";

$r1 = mysql_query($q1);

$q2 = "SELECT COUNT(dst_ip) AS c1, COUNT(DISTINCT(src_ip)) AS c2, COUNT(DISTINCT(signature)) AS c3, INET_NTOA(dst_ip)
       FROM event
       WHERE $when
       GROUP BY dst_ip
       ORDER BY c1 DESC";

$r2 = mysql_query($q2);

$sRows = $dRows = 10;

$i = $siE = $diE = 0;

$src_bar1 = $src_s1 = $src_lbl = '';

while ($row = mysql_fetch_row($r1)) {
    $i++;
    $x = $i - .6;
    $y = $i - .4;
    $src_bar1 .= $row[0] . ",";
    $src_s1 .= "[" . $x . "," . $row[1] . ",'#000000'],";
    $src_s1 .= "[" . $y . "," . $row[2] . ",'#cc0000'],";
    $src_lbl .= "'" . $row[3] . "',";
    if ($i == $sRows) { break; }
}

$sRows = $i;

// No result
if ($i == 0) { $siE = '1'; }

$i = 0;

$dst_bar1 = $dst_s1 = $dst_lbl = '';

while ($row = mysql_fetch_row($r2)) {
    $i++;
    $x = $i - .6;
    $y = $i - .4;
    $dst_bar1 .= $row[0] . ",";
    $dst_s1 .= "[" . $x . "," . $row[1] . ",'#000000'],";
    $dst_s1 .= "[" . $y . "," . $row[2] . ",'#cc0000'],";
    $dst_lbl .= "'" . $row[3] . "',";
    if ($i == $dRows) { break; }
}

$dRows = $i;
    
// No result
if ($i == 0) { $diE = '1'; }

// Chart Logic

echo "
<canvas id=\"daily_sip\" width=\"475\" height=\"300\">[No canvas support]</canvas>
<canvas id=\"daily_dip\" width=\"475\" height=\"300\">[No canvas support]</canvas>";

echo "\r<script>";

if ($siE != 1) {

    echo "
          function createSIP () {
            var bar1 = new RGraph.Bar('daily_sip', [$src_bar1]);
            //bar1.Set('chart.title', 'Top Source IPs');
            bar1.Set('chart.yaxispos', 'left');
            bar1.Set('chart.background.grid', true);
            bar1.Set('chart.background.grid.autofit', true);
            bar1.Set('chart.background.grid.vlines', true);
            bar1.Set('chart.background.grid.width', .5);
            bar1.Set('chart.labels', [$src_lbl]);
            bar1.Set('chart.text.angle', 45);
            bar1.Set('chart.colors', ['#e9e9e9','#000000','#cc0000']);
            bar1.Set('chart.gutter.bottom', 100);
            bar1.Set('chart.gutter.left', 75);
            bar1.Set('chart.gutter.right', 50);
            bar1.Set('chart.strokecolor', 'black');
            bar1.Set('chart.text.size', 8);
            bar1.Set('chart.text.font', 'verdana');
            bar1.Set('chart.ylabels.count', 10);
            bar1.Set('chart.key', ['< Events', '> Destinations', '> Signatures']);
            bar1.Set('chart.key.text.size', 8);
            bar1.Set('chart.key.background', 'rgba(255,255,255,0.3)');
            bar1.Set('chart.key.position', 'gutter');
            bar1.Set('chart.key.position.y', bar1.canvas.height -15);
            bar1.Set('chart.background.grid.autofit.align', true);
 
            var src_s1 = new RGraph.Scatter('daily_sip', [$src_s1]);
            src_s1.Set('chart.gutter.left', 75);
            src_s1.Set('chart.gutter.bottom', 100);
            src_s1.Set('chart.gutter.right', 50);
            src_s1.Set('chart.tickmarks', 'plus');
            src_s1.Set('chart.ticksize', 10);
            src_s1.Set('chart.text.size', 8);
            src_s1.Set('chart.yaxispos', 'right')
            src_s1.Set('chart.background.grid', false);
            src_s1.Set('chart.background.grid.autofit.align', true);
            //src_s1.Set('chart.ylabels.count', );
            src_s1.Set('chart.xmax', $sRows);
            bar1.Draw();
            src_s1.Draw();
          }

          createSIP();";
} else {

    echo "
          var dsip_canvas = document.getElementById(\"daily_sip\");
          var dsip_context = dsip_canvas.getContext(\"2d\");
          dsip_context.font = \"14px calibri, trebuchet ms, helvetica\";
          dsip_context.fillStyle = \"#000000\";
          dsip_context.fillText(\"No result for this time period\", 160,175);";
}

if ($diE != 1) {

    echo "
          function createDIP () {
            var bar2 = new RGraph.Bar('daily_dip', [$dst_bar1]);
            //bar2.Set('chart.title', 'Top Destination IPs');
            bar2.Set('chart.yaxispos', 'left');
            bar2.Set('chart.background.grid', true);
            bar2.Set('chart.background.grid.autofit', true);
            bar2.Set('chart.background.grid.vlines', true);
            bar2.Set('chart.background.grid.width', .5);
            bar2.Set('chart.labels', [$dst_lbl]);
            bar2.Set('chart.text.angle', 45);
            bar2.Set('chart.colors', ['#e9e9e9','#000000','#cc0000']);
            bar2.Set('chart.gutter.bottom', 100);
            bar2.Set('chart.gutter.left', 75);
            bar2.Set('chart.gutter.right', 50);
            bar2.Set('chart.strokecolor', 'black');
            bar2.Set('chart.text.size', 8);
            bar2.Set('chart.text.font', 'verdana');
            bar2.Set('chart.ylabels.count', 10);
            bar2.Set('chart.key', ['< Events', '> Sources', '> Signatures']);
            bar2.Set('chart.key.text.size', 8);
            bar2.Set('chart.key.background', 'rgba(255,255,255,0.3)');
            bar2.Set('chart.key.position', 'gutter'); 
            bar2.Set('chart.key.position.y', bar2.canvas.height -15);
            bar2.Set('chart.background.grid.autofit.align', true);
 
            var dst_s1 = new RGraph.Scatter('daily_dip', [$dst_s1]);
            dst_s1.Set('chart.gutter.left', 75);
            dst_s1.Set('chart.gutter.bottom', 100);
            dst_s1.Set('chart.text.size', 8);
            dst_s1.Set('chart.gutter.right', 50);
            dst_s1.Set('chart.tickmarks', 'plus');
            dst_s1.Set('chart.ticksize', 10);
            dst_s1.Set('chart.yaxispos', 'right')
            dst_s1.Set('chart.background.grid', false);
            dst_s1.Set('chart.background.grid.autofit.align', true);
            //dst_s1.Set('chart.ylabels.count', 10);
            dst_s1.Set('chart.xmax', $dRows);
            bar2.Draw();
            dst_s1.Draw();
          }

          createDIP();";

} else {

    echo "
          var ddip_canvas = document.getElementById(\"daily_dip\");
          var ddip_context = ddip_canvas.getContext(\"2d\");
          ddip_context.font = \"14px calibri, trebuchet ms, helvetica\";
          ddip_context.fillStyle = \"#000000\";
          ddip_context.fillText(\"No result for this time period\", 160,175);";
}

echo "</script>";

?>
