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

function doCharts($theQuery,$pos,$statusQuery,$hdwmyQuery,$timeDiff) {
   
    // Protocol Chart
    $protoICMP = $protoTCP = $protoUDP = $protoOther = $totalCount = 0;

    while ($row = mysql_fetch_row($theQuery)) {

        if (($pos == 10) || ($pos == 12)) {
            $theCount = 1;
        } else {
            $theCount = $row[0];
        }

        $theProto = $row[$pos];

        if ($theProto == 1) {
            $protoICMP += $theCount;
        } elseif ($theProto == 6) {
            $protoTCP += $theCount;
        } elseif ($theProto == 17) {
            $protoUDP += $theCount;
        } else {
            $protoOther += $theCount;
        }

    }

    $protoSum = $protoICMP + $protoTCP + $protoUDP + $protoOther; 
    if ($protoICMP > 0) {$perICMP = round($protoICMP / $protoSum * 100, 5);} else {$perICMP = 0;}
    if ($protoTCP > 0) {$perTCP = round($protoTCP / $protoSum * 100, 5);} else {$perTCP = 0;}
    if ($protoUDP > 0) {$perUDP = round($protoUDP / $protoSum * 100, 5);} else {$perUDP = 0;}
    if ($protoOther > 0) {$perOther = round($protoOther / $protoSum * 100, 5);} else {$perOther = 0;}

    // Reset Pointer
    mysql_data_seek($theQuery, 0);

    // ---- Event Status Chart

    $cat0=0;
    $cat1=0;
    $cat11=0;
    $cat12=0;
    $cat13=0;
    $cat14=0;
    $cat15=0;
    $cat16=0;
    $cat17=0;
    $cat19=0;

    while ($row = mysql_fetch_row($statusQuery)) {
        switch ($row[0]) { 
            case 0: $cat0 = $row[1]; break;
            case 1: $cat1 = $row[1]; break;
            case 11: $cat11 = $row[1]; break;
            case 12: $cat12 = $row[1]; break;
            case 13: $cat13 = $row[1]; break;
            case 14: $cat14 = $row[1]; break;
            case 15: $cat15 = $row[1]; break;
            case 16: $cat16 = $row[1]; break;
            case 17: $cat17 = $row[1]; break;
            case 2: $cat19 = $row[1]; break;
        }
    }
    
    // Hourly Event Chart
    $_hData = '';
    $_hLabel = '';
    while ($row = mysql_fetch_row($hdwmyQuery)) {
        $_hData = $_hData . ",$row[0]";
        $tmpTime = formatStamp($row[1] . ":00:00",1);
        $_hLabel = $_hLabel . ",'$tmpTime'";
    }

    $hData = ltrim($_hData,",");
    $hLabel = ltrim($_hLabel,",");
    
    // RGraph Chart Logic


    echo "
          <script>
            function doCharts() {

              // Protocol Dist.
              var data0 = [$perTCP,$perUDP,$perICMP,$perOther];
              var bar0 = new RGraph.Bar('protocol', data0);
              bar0.Set('chart.labels', ['TCP','UDP','ICMP','Other']);
              bar0.Set('chart.colors', ['#ffff7a']);
              bar0.Set('chart.text.angle', 90);
              bar0.Set('chart.gutter.bottom', 50);
              bar0.Set('chart.gutter.left', 50);
              bar0.Set('chart.title', 'Protocol Distribution');
              bar0.Set('chart.strokecolor', 'black');
              bar0.Set('chart.background.grid', true);
              bar0.Set('chart.shadow', 'true');
              bar0.Set('chart.text.size', 8);
              bar0.Set('chart.labels.above', 'true');
              bar0.Set('chart.labels.above.decimals', 1);
              bar0.Set('chart.text.font', 'verdana');
              bar0.Set('chart.background.grid.vlines', false);
              bar0.Set('chart.background.grid.border', false);
              bar0.Draw();
 
              // Event Status
              var data1 = [$cat0,$cat11,$cat12,$cat13,$cat14,$cat15,$cat16,$cat17,$cat19,$cat1];
              var bar1 = new RGraph.Bar('status', data1);
              bar1.Set('chart.colors', ['#D1E3B3']);
              bar1.Set('chart.tooltips', ['Unclassified','Unauthorized Admin Access',
                                           'Unauthorized User Access','Attempted Unauthorized Access',
                                           'Denial of Service Attack','Policy Violation',
                                           'Reconnaissance','Malware','Escalated Event','Expired Event']);
              bar1.Set('chart.labels', ['UN','C1','C2','C3','C4',
                                         'C5','C6','C7','ES','NA']);
              bar1.Set('chart.text.angle', 90);
              bar1.Set('chart.title', 'Event Category');
              bar1.Set('chart.gutter.bottom', 50);
              bar1.Set('chart.gutter.left', 50);
              bar1.Set('chart.strokecolor', 'black');
              bar1.Set('chart.background.grid', true);
              bar1.Set('chart.shadow', 'true');
              bar1.Set('chart.text.size', 8);
              bar1.Set('chart.labels.above', 'true');
              bar1.Set('chart.text.font', 'verdana');
              bar1.Set('chart.background.grid.vlines', false);
              bar1.Set('chart.background.grid.border', false);
              bar1.Draw();

              // Hourly
              var data2 = [$hData];
              var bar = new RGraph.Bar('hourly', data2);
              bar.Set('chart.labels', [$hLabel]);
              bar.Set('chart.colors', ['#B3C8E3']);
              bar.Set('chart.title', 'Events grouped by hour');
              bar.Set('chart.text.angle', 90);
              bar.Set('chart.gutter.bottom', 70);
              bar.Set('chart.gutter.left', 50);
              bar.Set('chart.strokecolor', 'black');
              bar.Set('chart.background.grid', true);
              bar.Set('chart.shadow', 'true');
              bar.Set('chart.text.size', 8);
              bar.Set('chart.labels.above', 'true');
              bar.Set('chart.text.font', 'verdana');
              bar.Set('chart.background.grid.vlines', false);
              bar.Set('chart.background.grid.border', false);
              bar.Draw();
            }
          </script>

        <center>
        <table width=910 border=0 cellpadding=1 cellspacing=0><tr>
        <td align=left><canvas id=\"protocol\" width=\"450\" height=\"250\">[No canvas support]</canvas></td>
        <td align=right><canvas id=\"status\" width=\"450\" height=\"250\">[No canvas support]></canvas></td>
        </tr><tr>
        <td align=center colspan=2><canvas id=\"hourly\" width=\"900\" height=\"300\">[No canvas support]</canvas></td>
        </tr>
        <tr><td colspan=2 align=center><span style=\"font-size: .7em;\">(timespan may be non-contiguous)</span></td></tr>
        <tr><td colspan=2 align=right><a style=\"text-decoration: none; font-size: .7em; color: #c4c4c4; padding-right: 20px;\" href=\"http://www.rgraph.net\" target=\"_blank\">RGraph: HTML5 canvas graph library</a></td>
        </tr> 
        </table>
        </center>";
}

?>
