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
$ltCols = array("#cc0000","#FAB005","#F2E766","#d4d4d4");


function lastTime($stamp) {
    global $today, $startDate, $endDate, $ltCols;
    $sSecs = strtotime($startDate);
    $eSecs = strtotime($endDate);
    $tSces = strtotime($today);
    $tDiff = $eSecs-$sSecs;

    if ($stamp == "-") {
        $tVar = "1801";
    } else {
        $now = date('U');
        $last = strtotime($stamp);
        $tVar = $now - $last;
    }

    if ($tDiff >= 86400)  {
        $timeResult = $stamp;
        $timeStyle = "sortmed";
    } else {
        if ($stamp != "-") {
            list($date,$time) = explode(" ", $stamp);
            $timeResult = $time;
        } else {
            $timeResult = '-';
        }
        $timeStyle = "sortmed";
    }        

    if ($tDiff == 0 && $endDate == $today || $tDiff >= 86400 && $endDate == $today) {
        switch ($tVar) {
            case ($tVar < 60):		$bgcol = $ltCols[0]; break;
            case ($tVar < 500):		$bgcol = $ltCols[1]; break;
            case ($tVar < 1800):	$bgcol = $ltCols[2]; break;
            case ($tVar > 1800):	$bgcol = $ltCols[3]; break;
            default:			$bgcol = $ltCols[3]; break;
        }
    } else {
        $bgcol = "#e9e9e9";
    }

    $stampLine = "<td class=$timeStyle>$timeResult</td><td style=\"background: $bgcol; border: 1pt solid #000000;\"></td>";
    return $stampLine;
}

// Event Categories

$category	=  mysql_query("SELECT COUNT(signature) as c1, status, MAX(timestamp), 
                                COUNT(DISTINCT(signature)), COUNT(DISTINCT(src_ip)), COUNT(DISTINCT(dst_ip))
                                FROM event
                                WHERE $when[0]
                                AND signature NOT REGEXP '^URL'
                                GROUP BY status");

// Distinct Sources

$sources	=  mysql_query("SELECT COUNT(DISTINCT(src_ip)) 
                                FROM event
                                WHERE $when[0]
                                AND signature NOT REGEXP '^URL'");

// Distinct Destinations

$destinations	=  mysql_query("SELECT COUNT(DISTINCT(dst_ip))
                                FROM event
                                WHERE $when[0]
                                AND signature NOT REGEXP '^URL'");

// Event Distribution (sensor)

$sensor		= mysql_query("SELECT st.net_name, st.hostname, st.agent_type, st.sid, COUNT(signature) AS c1, MAX(timestamp),
                               COUNT(DISTINCT(signature)), COUNT(DISTINCT(src_ip)), COUNT(DISTINCT(dst_ip)) 
                               FROM event LEFT JOIN sensor AS st ON event.sid = st.sid
                               WHERE $when[0]
                               AND signature NOT REGEXP '^URL'
                               GROUP BY event.sid");

$sensors        = mysql_query("SELECT net_name, hostname, agent_type, sid
                               FROM sensor
                               WHERE (agent_type != 'pcap' 
                               AND agent_type != 'httpry')");


// Signatures

$signatures	= mysql_query("SELECT COUNT(signature) AS c1, signature, signature_id
                               FROM event
                               WHERE $when[0]
                               AND signature NOT REGEXP '^URL'
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

echo "<h2>Brief</h2>";

echo "<table width=960 align=center>\n
      \r<tr>\n
      \r<td align=center><div class=big>Total Events</div><div class=box>$sumEvents</div></td>\n
      \r<td align=center><div class=big>Total Signatures</div><div class=box>$sigCount</div></td>\n
      \r<td align=center><div class=big>Total Sources</div><div class=box>$srcCount[0]</div></td>\n
      \r<td align=center><div class=big>Total Destinations</div><div class=box>$dstCount[0]</div></td>\n
      \r</tr>\n
      </table><br>\n";

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

echo "<h2> Event Distribution by Sensor</h2>";
echo "<table width=960 cellpadding=0 cellspacing=0 class=sortable style=\"border-collapse: collapse; border: 2pt solid #c9c9c9;\">\n
      \r<th class=sort width=250>Network</th>
      \r<th class=sort width=200>Hostname</th>
      \r<th class=sort width=100>Agent Type</th>
      \r<th class=sort width=129>Last Event</th>
      \r<th class=sorttable_nosort width=1></th>
      \r<th class=sort width=40>Sig</th>
      \r<th class=sort width=40>Src</th>
      \r<th class=sort width=40>Dst</th>
      \r<th class=sort width=80>Count</th>
      \r<th class=sort width=80>% of Total</th>\n";

foreach ($sensorList as $key => $sid) {

    list($netName,$hostName,$agent) = explode('||', $sid);

    if (isset($presentSens[$key])) {
        list($netName,$hostName,$agent,$numEvents,$stamp,$sig,$src,$dst) = explode('||', $presentSens[$key]);
        $stamp = formatStamp($stamp,0);
        if ($numEvents > 0) {
            $per = round($numEvents / $sumEvents * 100,2) . "%";
        } else {
            $per = 0;
        }
    } else {
        $sig = $src = $dst = $numEvents = $per = 0;
        $stamp = "-";
    }

    $stampLine = lastTime($stamp);
    echo "<tr><td class=sortbig>$netName</td>
          \r<td class=sortbig>$hostName</td>
          \r<td class=sortbig>$agent</td>
          \r$stampLine
          \r<td class=sortmed>$sig</td>
          \r<td class=sortmed>$src</td>
          \r<td class=sortmed>$dst</td>
          \r<td class=sortbigbold>$numEvents</td>
          \r<td class=sortbigbold>$per</td></tr>\n";
}

echo "</table>";

// The legend is only visible on the current date
if (strtotime($today) == strtotime($endDate)) {

    // Legend
    echo "<div style=\"padding-right: 10px;\"><table align=right cellpadding=0 cellspacing=0 style=\"border: 2pt solid #c9c9c9; margin-top: 10px;\">\n
          \r<td width=10 align=right style=\"font-size: 10px; background: $ltCols[0]; border: 2pt solid #f4f4f4;\"></td>
          \r<td width=60 align=left style=\"font-size: 10px; background: #f4f4f4;\">&lt; 1 min</td>
          \r<td width=10 align=right style=\"font-size: 10px; background: $ltCols[1]; border: 2pt solid #f4f4f4;\"></td>
          \r<td width=60 align=left style=\"font-size: 10px; background: #f4f4f4;\">&lt; 5 min</td>
          \r<td width=10 align=right style=\"font-size: 10px; background: $ltCols[2]; border: 2pt solid #f4f4f4;\"></td>
          \r<td width=60 align=left style=\"font-size: 10px; background: #f4f4f4;\">&lt; 30 min</td>
          \r<td width=10 align=right style=\"font-size: 10px; background: $ltCols[3]; border: 2pt solid #f4f4f4;\"></td>
          \r<td width=60 align=left style=\"font-size: 10px; background: #f4f4f4;\">&gt; 30 min</td>
          \r</tr></table></div><br><br>\n";
} else {

    echo "<br><br>";

}

// Events by Category

echo "<h2> Event Distribution by Category</h2>";
echo "<table width=960 cellpadding=0 cellspacing=0 class=sortable style=\"border-collapse: collapse; border: 2pt solid #c9c9c9;\">\n
      \r<th class=sort width=20>#</th>
      \r<th class=sort width=530>Category</th>
      \r<th class=sort width=129>Last Event</th>
      \r<th class=sorttable_nosort width=1></th>
      \r<th class=sort width=40>Sig</th>
      \r<th class=sort width=40>Src</th>
      \r<th class=sort width=40>Dst</th>
      \r<th class=sort width=80>Count</th>
      \r<th class=sort width=80>% of Total</th>\n";

foreach ($statusList as $key => $status) {

    if ($key == 42) {continue;}

    list($longDesc,$class_colour,$shortDesc) = explode('||', $status);

    if (isset($presentCats[$key])) {
        list($numEvents,$stamp,$sig,$src,$dst) = explode('||', $presentCats[$key]);
        $stamp = formatStamp($stamp,0);
        if ($numEvents > 0) {
            $per = round($numEvents / $sumEvents * 100,2) . "%";
        } else {
           $per = 0;
        }
    } else {
        $sig = $src = $dst = $numEvents = $per = 0;
        $stamp = "-";
    }

    $stampLine = lastTime($stamp);
    echo "<tr><td class=sortbig style=\"background: $class_colour;\">$shortDesc</td>
          \r<td class=sortbig>$longDesc</td>
          \r$stampLine
          \r<td class=sortmed>$sig</td>
          \r<td class=sortmed>$src</td>
          \r<td class=sortmed>$dst</td>
          \r<td class=sortbigbold>$numEvents</td>
          \r<td class=sortbigbold>$per</td></tr>\n";
 
}

echo "</table><br><br>";

?>
