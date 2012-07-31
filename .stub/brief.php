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

// This needs to be the first stub. It creates variables that
// the rest will use for calculations.

// A simple indicator of how close the last event generated time is to "now"
$ltCols = array("#cc0000","#FAB005","#F2E766","#D5E4F5","#c9c9c9");

function lastTime($stamp) {
    global $today, $startDate, $endDate, $ltCols, $offset;
    $sSecs = strtotime($startDate);
    $eSecs = strtotime($endDate);
    $tSces = strtotime($today);
    $tDiff = $eSecs-$sSecs;

    if ($stamp == "-") {
        $tVar = "3601";
    } else {
        $now = date('U');
        $last = strtotime($stamp);
        $tVar = $now - $last;
    }

    if ($tDiff >= 86400)  {
        $timeResult = $stamp;
        $timeStyle = "rowr";
    } else {
        if ($stamp != "-") {
            list($date,$time) = explode(" ", $stamp);
            $timeResult = $time;
        } else {
            $timeResult = '-';
        }
        $timeStyle = "rowr";
    }        

    if ($tDiff == 0 && $endDate == $today || $tDiff >= 86400 && $endDate == $today) {
        switch ($tVar) {
            case ($tVar < 60):		$bgcol = $ltCols[0]; break;
            case ($tVar < 500):		$bgcol = $ltCols[1]; break;
            case ($tVar < 1800):	$bgcol = $ltCols[2]; break;
            case ($tVar < 3600):	$bgcol = $ltCols[3]; break;
            case ($tVar > 3600):        $bgcol = $ltCols[4]; break;
            default:			$bgcol = $ltCols[4]; break;
        }
    } else {
        $bgcol = "#e9e9e9";
    }

    $stampLine = "<td class=$timeStyle>$timeResult</td><td class=rowr style=\"background: $bgcol;\"></td>";
    return $stampLine;
}

// Event Categories
$category	=  mysql_query("SELECT COUNT(signature) as c1, status, MAX(CONVERT_TZ(timestamp,'+00:00','$offset')), 
                                COUNT(DISTINCT(signature)), COUNT(DISTINCT(src_ip)), COUNT(DISTINCT(dst_ip))
                                FROM event
                                WHERE $when
                                $loFilter
                                GROUP BY status");

// Distinct Sources

$sources	=  mysql_query("SELECT COUNT(DISTINCT(src_ip)) 
                                FROM event
                                WHERE $when
                                $loFilter");

// Distinct Destinations

$destinations	=  mysql_query("SELECT COUNT(DISTINCT(dst_ip))
                                FROM event
                                WHERE $when
                                $loFilter");

// Event Distribution (sensor)

$sensor         = mysql_query("SELECT st.net_name, st.hostname, st.agent_type, st.sid, COUNT(signature) AS c1, MAX(CONVERT_TZ(timestamp,'+00:00','$offset')),
                               COUNT(DISTINCT(signature)), COUNT(DISTINCT(src_ip)), COUNT(DISTINCT(dst_ip))
                               FROM event LEFT JOIN sensor AS st ON event.sid = st.sid
                               WHERE $when
                               AND signature NOT REGEXP '^URL'
                               GROUP BY event.sid");

$sensors        = mysql_query("SELECT net_name, hostname, agent_type, sid
                               FROM sensor
                               WHERE (agent_type != 'pcap'
                               AND agent_type != 'http'
                               AND agent_type != 'sancp')");

// Signatures

$signatures	= mysql_query("SELECT COUNT(signature) AS c1, signature, signature_id
                               FROM event
                               WHERE $when
                               $loFilter
                               GROUP BY signature
                               ORDER BY c1 DESC");

// Brief

$presentCats = array();
$sumEvents = 0;

while ($row = mysql_fetch_row($category)) {
    $presentCats [$row[1]] = "$row[0]||$row[2]||$row[3]||$row[4]||$row[5]";
    $sumEvents += $row[0];
}

$sigCount = mysql_num_rows($signatures);
$srcCount = mysql_fetch_row($sources);
$dstCount = mysql_fetch_row($destinations);

echo "<div class=toggle id=table-Brief>
      \r\r<h3 class=live id=h-Brief> Brief</h3>
      \r<table class=null width=960 align=center>\n
      \r<tr>\n
      \r<td align=center><div class=big>Total Events</div><div id=etotal class=box>$sumEvents</div></td>\n
      \r<td align=center><div class=big>Total Signatures</div><div class=box>$sigCount</div></td>\n
      \r<td align=center><div class=big>Total Sources</div><div class=box>$srcCount[0]</div></td>\n
      \r<td align=center><div class=big>Total Destinations</div><div class=box>$dstCount[0]</div></td>\n
      \r</tr>\n
      </table></div>\n";

// Events by sensor

// We want to enumerate sensors that don't have event counts so
// we create an array with all sid's. We can then
// walk through this array and query the data array with each index.

while ($row = mysql_fetch_row($sensors)) {
    $sensorList [$row[3]] = "$row[0]||$row[1]||$row[2]";
}

// The event counts
while ($row = mysql_fetch_row($sensor)) {
    $presentSens [$row[3]] = "$row[0]||$row[1]||$row[2]||$row[4]||$row[5]||$row[6]||$row[7]||$row[8]";
}

echo "<div class=toggle id=table-Sensor>
      \r<h3 class=live id=h-Sensor> Event Distribution by Sensor</h3>
      \r<table width=960 cellpadding=0 cellspacing=0 class=sortable style=\"border-collapse: collapse; border: 1pt solid #c9c9c9;\">\n
      \r<thead><tr>
      \r<th class=sort width=250>Network</th>
      \r<th class=sort width=200>Hostname</th>
      \r<th class=sort width=100>Agent Type</th>
      \r<th class=sort width=129>Last Event</th>
      \r<th class=sorttable_nosort width=1></th>
      \r<th class=sort width=40>Sig</th>
      \r<th class=sort width=40>Src</th>
      \r<th class=sort width=40>Dst</th>
      \r<th class=sort width=80>Count</th>
      \r<th class=sort width=80>% of Total</th></tr></thead>\n";

$rC = $sumPer = 0;

foreach ($sensorList as $key => $sid) {

    $rC++;

    list($netName,$hostName,$agent) = explode('||', $sid);

    if (isset($presentSens[$key])) {
        list($netName,$hostName,$agent,$numEvents,$stamp,$sig,$src,$dst) = explode('||', $presentSens[$key]);
        $stamp = formatStamp($stamp,0);
        if ($numEvents > 0) {
            $per = round($numEvents / $sumEvents * 100,2) . "%";
            $sumPer += $numEvents / $sumEvents * 100;
        } else {
            $per = 0;
        }
    } else {
        $sig = $src = $dst = $numEvents = $per = 0;
        $stamp = "-";
    }

    if (strlen($key) < 2) {
        $key = 0 . $key;
    }

    $stampLine = lastTime($stamp);
    echo "<tr class=a_row id=\"sen-$key\" data-c_ec=\"$numEvents\"><td class=row>$netName</td>
          \r<td class=row>$hostName</td>
          \r<td class=row>$agent</td>
          \r$stampLine
          \r<td class=rowr>$sig</td>
          \r<td class=rowr>$src</td>
          \r<td class=rowr>$dst</td>
          \r<td class=rowr><b>$numEvents</b></td>
          \r<td class=rowr><b>$per</b></td></tr>\n";
}

$sumPer = round($sumPer,0);

echo "<tfoot><tr class=a_row>
          \r<td class=totals colspan=5>Totals:</td>
          \r<td class=totals>$sigCount</td>
          \r<td class=totals>$srcCount[0]</td>
          \r<td class=totals>$dstCount[0]</td>
          \r<td class=totals>$sumEvents</td>
          \r<td class=totals>$sumPer%</td></tr></tfoot>\n";
echo "</table></div>";

// Events by Category
echo "<div class=toggle id=table-Category>
      \r<h3 class=live id=h-Category> Event Distribution by Category</h3>
      \r<table align=center width=960 border=0 cellpadding=0 cellspacing=0 class=sortable style=\"border: 1pt solid #c4c4c4; border-bottom: none;\">\n
      \r<thead><tr>
      \r<th class=sort width=20>#</th>
      \r<th class=sort width=530>Category</th>
      \r<th class=sort width=129>Last Event</th>
      \r<th class=sorttable_nosort width=1></th>
      \r<th class=sort width=40>Sig</th>
      \r<th class=sort width=40>Src</th>
      \r<th class=sort width=40>Dst</th>
      \r<th class=sort width=80>Count</th>
      \r<th class=sort width=80>% of Total</th></tr></thead>\n";

$rC = $sumPer = 0;
$maxStamp = array();

foreach ($statusList as $key => $status) {

    $rC++;

    list($longDesc,$class_colour,$shortDesc) = explode('||', $status);

    if (isset($presentCats[$key])) {
        list($numEvents,$stamp,$sig,$src,$dst) = explode('||', $presentCats[$key]);
        $stamp = formatStamp($stamp,0);
        $maxStamp[] = $stamp;
        if ($numEvents > 0) {
            $per = round($numEvents / $sumEvents * 100,2) . "%";
            $sumPer += $numEvents / $sumEvents * 100; 
        } else {
           $per = 0;
        }

    } else {
        $sig = $src = $dst = $numEvents = $per = 0;
        $stamp = "-";
    }

    $stampLine = lastTime($stamp);

    if (strlen($key) < 2) {
        $key = 0 . $key;
    }

    echo "<tr class=a_row id=\"cat-$key\" data-c_ec=\"$numEvents\">
          \r<td class=row style=\"background: $class_colour; text-align: center\">$shortDesc</td>
          \r<td class=row>$longDesc</td>
          \r$stampLine
          \r<td class=rowr>$sig</td>
          \r<td class=rowr>$src</td>
          \r<td class=rowr>$dst</td>
          \r<td class=rowr><b>$numEvents</b></td>
          \r<td class=rowr><b>$per</b></td></tr>\n";
}

$sumPer = round($sumPer,0);

echo "<tfoot><tr class=a_row>
          \r<td class=totals colspan=4>Totals:</td>
          \r<td class=totals>$sigCount</td>
          \r<td class=totals>$srcCount[0]</td>
          \r<td class=totals>$dstCount[0]</td>
          \r<td class=totals>$sumEvents</td>
          \r<td class=totals>$sumPer%</td></tr></tfoot>\n";

echo "</table></div>";

// The legend is only visible on the current date
//if (strtotime($today) == strtotime($endDate)) {
if (0==1) {

    // Legend
    echo "<table align=right cellpadding=0 cellspacing=0 style=\"border: 1pt solid #c9c9c9; margin-top: 10px;\"><tr>\n
          \r<td width=10 align=right style=\"font-size: 10px; background: $ltCols[0]; border: 2pt solid #f4f4f4;\"></td>
          \r<td width=60 align=left style=\"font-size: 10px; background: #f4f4f4;\">&lt; 1 min</td>
          \r<td width=10 align=right style=\"font-size: 10px; background: $ltCols[1]; border: 2pt solid #f4f4f4;\"></td>
          \r<td width=60 align=left style=\"font-size: 10px; background: #f4f4f4;\">&lt; 5 min</td>
          \r<td width=10 align=right style=\"font-size: 10px; background: $ltCols[2]; border: 2pt solid #f4f4f4;\"></td>
          \r<td width=60 align=left style=\"font-size: 10px; background: #f4f4f4;\">&lt; 30 min</td>
          \r<td width=10 align=right style=\"font-size: 10px; background: $ltCols[3]; border: 2pt solid #f4f4f4;\"></td>
          \r<td width=60 align=left style=\"font-size: 10px; background: #f4f4f4;\">&lt; 60 min</td>
          \r<td width=10 align=right style=\"font-size: 10px; background: $ltCols[4]; border: 2pt solid #f4f4f4;\"></td>
          \r<td width=60 align=left style=\"font-size: 10px; background: #f4f4f4;\">&gt; 60 min</td>
          \r</tr></table><br><br>\n";
}

?>
