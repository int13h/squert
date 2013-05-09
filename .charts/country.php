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

// Perform a "string is like" array search
function array_find($needle, $haystack) {
    foreach ($haystack as $item) {
        if (strpos($item, $needle) !== FALSE) {
            $tmp = explode('|', $item);
            return $tmp[2];
            break;
        }
    }
}

$scc = "SELECT COUNT(src_ip) as count, map1.cc as src_cc, map1.c_long
          FROM event
          LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip   
          LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip   
          WHERE $when
          AND src_ip NOT BETWEEN 167772160 AND 184549375  
          AND src_ip NOT BETWEEN 2886729728 AND 2886795263
          AND src_ip NOT BETWEEN 3232235520 AND 3232301055
          AND map1.cc IS NOT NULL
          GROUP BY map1.cc
          ORDER BY count DESC";
$dcc = "SELECT COUNT(dst_ip) as count, map2.cc as dst_cc, map2.c_long
          FROM event
          LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
          LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
          WHERE $when
          AND dst_ip NOT BETWEEN 167772160 AND 184549375
          AND dst_ip NOT BETWEEN 2886729728 AND 2886795263
          AND dst_ip NOT BETWEEN 3232235520 AND 3232301055
          AND map2.cc IS NOT Null
          GROUP BY map2.cc
          ORDER BY count DESC";


$sccQuery = mysql_query($scc);
$dccQuery = mysql_query($dcc);

$plot1 = $plot2 = $label1 = $label2 = $key1 = $key2 = $sCols = $dCols = '';

$i = $scE = $dcE = 0;

while ($row = mysql_fetch_row($sccQuery)) {
    $i++;
    $plot1 .= $row[0] . ",";
    $label1 .= "'" . $row[2] . "'" . ",";

    if (strlen($row[2]) > 20) {
        $name = substr($row[2], 0,20) . "..";
    } else {
        $name = $row[2];
    }
    
    $key1 .= "'" . $name . " (" . $row[0] . ")" . "'" . ",";
    $sCol = array_find("$row[2]|", $countries);
    $sCols .= "'" . $sCol . "'" . ",";     
    if ($i == 10) { break; }
}

// No result
if ($i == 0) { $scE = '1'; }

$i = 0;

while ($row = mysql_fetch_row($dccQuery)) {
    $i++;
    $plot2 .= $row[0] . ",";
    $label2 .= "'" . $row[2] . "'" . ",";

    if (strlen($row[2]) > 20) {
        $name = substr($row[2], 0,20) . "..";
    } else {
        $name = $row[2];
    }

    $key2 .= "'" . $name . " (" . $row[0] . ")" . "'" . ",";
    $dCol = array_find("$row[2]|", $countries);
    $dCols .= "'" . $dCol . "'" . ",";
    if ($i == 10) { break; }
}

// No result
if ($i == 0) { $dcE = '1'; }

$plot1 = rtrim($plot1,",");
$label1 = rtrim($label1,",");
$plot2 = rtrim($plot2,",");
$label2 = rtrim($label2,",");

// Chart Logic

echo "
<canvas id=\"scountry\" width=\"470\" height=\"350\">[No canvas support]</canvas>
<canvas id=\"dcountry\" width=\"470\" height=\"350\">[No canvas support]</canvas>";

echo "\r<script>";

if ($scE != 1) {

    echo "
          function srcCountry () {
            var sc = new RGraph.Pie('scountry', [$plot1]);
            //sc.Set('chart.title', 'Top Source Countries');
            sc.Set('chart.centerx', 130);
            sc.Set('chart.tooltips', [$label1]);
            sc.Set('chart.tooltips.effect', 'fade');
            sc.Set('chart.tooltips.event', 'onmousemove');
            sc.Set('chart.text.size', 8);
            sc.Set('chart.key', [$key1]);
            sc.Set('chart.key.background', 'rgba(255,255,255,0.3)');
            sc.Set('chart.key.position.y', 70);
            sc.Set('chart.key.position.x', 260);
            sc.Set('chart.colors', [$sCols]);
            sc.Set('chart.strokestyle', '#ffffff');
            sc.Set('chart.align', 'left');
            sc.Set('chart.radius', 110);
            sc.Set('chart.shadow', false);
            sc.Set('chart.variant', 'donut');
            sc.Set('chart.linewidth', 2);
            sc.Draw();
          }
         
          srcCountry();";
} else {

    echo "
          var scan_canvas = document.getElementById(\"scountry\");
          var scan_context = scan_canvas.getContext(\"2d\");
          scan_context.font = \"14px calibri, trebuchet ms, helvetica\";
          scan_context.fillStyle = \"#000000\";
          scan_context.fillText(\"No result for this time period\", 160,175);";
}

if ($dcE != 1) { 

    echo "
          function dstCountry () {  
            var dc = new RGraph.Pie('dcountry', [$plot2]);
            //dc.Set('chart.title', 'Top Destination Countries');
            dc.Set('chart.centerx', 130);
            dc.Set('chart.tooltips', [$label2]);
            dc.Set('chart.tooltips.effect', 'fade');
            dc.Set('chart.tooltips.event', 'onmousemove');
            dc.Set('chart.text.size', 8);
            dc.Set('chart.key', [$key2]);
            dc.Set('chart.key.background', 'rgba(255,255,255,0.3)');
            dc.Set('chart.key.position.y', 70);
            dc.Set('chart.key.position.x', 260);
            dc.Set('chart.colors', [$dCols]);
            dc.Set('chart.strokestyle', '#ffffff');
            dc.Set('chart.align', 'left');
            dc.Set('chart.radius', 110);
            dc.Set('chart.shadow', false);
            dc.Set('chart.variant', 'donut');
            dc.Set('chart.linewidth', 2);
            dc.Draw();
          }
          dstCountry();";
} else {

    echo "
          var dcan_canvas = document.getElementById(\"dcountry\");
          var dcan_context = dcan_canvas.getContext(\"2d\");
          dcan_context.font = \"14px calibri, trebuchet ms, helvetica\";
          dcan_context.fillStyle = \"#000000\";
          dcan_context.fillText(\"No result for this time period\", 160,175);";
}

echo "</script>";

?>
