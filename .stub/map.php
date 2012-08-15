<?php

//
//
//      Copyright (C) 2010, 2012 Paul Halliday <paul.halliday@gmail.com>
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

$scc = "SELECT COUNT(src_ip) as count, map1.cc AS src_cc, map1.c_long
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

$dcc = "SELECT COUNT(dst_ip) as count, map2.cc AS dst_cc, map2.c_long 
        FROM event
        LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
        LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
        WHERE $when
        AND dst_ip NOT BETWEEN 167772160 AND 184549375
        AND dst_ip NOT BETWEEN 2886729728 AND 2886795263
        AND dst_ip NOT BETWEEN 3232235520 AND 3232301055
        AND map2.cc IS NOT NULL
        GROUP BY map2.cc
        ORDER BY count DESC";

$sccQuery = mysql_query($scc);
$dccQuery = mysql_query($dcc);

function getFlag($cc) {

    if (file_exists(".flags/$cc.png")) {

        $answer = "<span class=flag><img src=\".flags/$cc.png\"></span>";

    } else {
 
        $answer = "<span class=flag><span class=noflag></span></span>";

    }

    return $answer;

}


function doWorld($sccQuery,$dccQuery) {

    global $mapFGC, $mapBGC, $mapLNC , $mapSC, $mapEC;

    $aHit = $bHit = $cHit = 'no';

    // A => src, B=> dst,  C=> cumulative
    $a1 = $a2 = $a3 = $b1 = $b2 = $b3 = array();
    $aSum = $bSum = $cSum = $cItems = 0;
 
    while ($row = mysql_fetch_row($sccQuery)) {
        $a1[] =	$row[0];
        $a2[] =	$row[1];
        $a3[] =	$row[2];
        $c1[] =	$row[0];
        $c2[] =	$row[1];
        $c3[] =	$row[2];
        $aHit = 'yes';
        $cHit = 'yes';
    }

    while ($row = mysql_fetch_row($dccQuery)) {
        $b1[] = $row[0];
        $b2[] = $row[1];
        $b3[] = $row[2];
        if ($aHit == 'yes') {
            $key = array_search($row[1],$c2);
            if ($key === FALSE) {
                $c1[] = $row[0];
                $c2[] = $row[1];
                $c3[] = $row[2];
            } else {
                $base = $c1[$key] + $row[0];
                $c1[$key] = $base;
            }
        } else {
            $c1[] = $row[0];
            $c2[] = $row[1];
            $c3[] = $row[2];
        }

        $bHit = 'yes';
        $cHit = 'yes';
    }

    $aBan = $bBan = $cBan = '';

    // Count items and establish threshold
    if ($aHit == 'yes') {
        $aItems = count($a1);
        $aSum = array_sum($a1);
        array_multisort($a1, SORT_DESC, $a2, $a3);
    }

    $aBan = "<b>Source</b>: $aSum Events&nbsp;&nbsp;";

    if ($bHit == 'yes') {
        $bItems = count($b1);
        $bSum = array_sum($b1);
        array_multisort($b1, SORT_DESC, $b2, $b3);
    }

    $bBan = "<b>Destination</b>: $bSum Events&nbsp;&nbsp;";
 
    if ($cHit == 'yes') {
        $cItems = count($c1);
        $cSum = array_sum($c1);
        array_multisort($c1, SORT_DESC, $c2, $c3);
        $th = $c1;
        $wmThres = ret95($th);
    }

    $cBan = "<b>Total</b>: $cSum Events, $cItems Countries.";

    // Map Canvas
    echo "\r<center>
          \r<table width=950 border=0 cellpadding=1 cellspacing=0>
          \r<tr>
          \r<td align=center colspan=2><canvas id=wm1 width=950 height=500>[No canvas support]></canvas></td>
          \r</tr>
          \r</table>
          \r</center>";

    // Map Logic
    echo "\r<script type=\"text/javascript\">
          \rWorldMap({ id: \"wm1\",
          \rbgcolor: \"$mapBGC\",
          \rfgcolor: \"$mapFGC\",
          \rbordercolor: \"$mapLNC\",
          \rborderwidth: 1,
          \rpadding: 0,
          \rdetail: {";

    if (!isset($c1)) {
        $lc = 0;
    } else {
        $lc = count($c1);
    }

    for ($i=0; $i<$lc; $i++) {
        $cc = strtolower($c2[$i]);
        $col = getSeverity($c1[$i],$wmThres,$mapSC,$mapEC);
        echo "\"$cc\": \"$col\"";
        if ($i < $lc-1) {
            echo ",\n";
        }
    }

    echo "\r}
          \r});
          \r</script>";

    echo "<center>
          <table width=100% border=0 cellpadding=1 cellspacing=0><tr>
          <td align=center style=\"font-size: .9em; padding-top: 10px;\">$aBan $bBan $cBan</td>
          </tr></table>
          <table class=sortable width=960 border=0 cellpadding=0 cellspacing=0 style=\"border: 1pt solid gray;\">
          <thead><tr>
          <th class=sort>Country</th>
          <th class=sort width=1></th>
          <th class=sort width=100>Code</th>
          <th class=sort width=75>Src Events</th>
          <th class=sort width=75>Dst Events</th>
          <th class=sort width=75>Total</th>
          </tr></thead>";
 
    if ($cHit == 'yes') {

        for ($i=0; $i<$cItems; $i++) {

            $ccount	= $c1[$i];
            $cc		= $c2[$i];
            $flag	= getFlag($cc);
            $country	= $c3[$i];
            $akey	= array_search($cc, $a2);
            $bkey	= array_search($cc, $b2);

            if ($akey === FALSE) {
                $srcEventCount = 0;
            } else {
                $srcEventCount	= $a1[$akey];
            }
            if ($bkey === FALSE) {
                $dstEventCount = 0;
            } else {
                $dstEventCount	= $b1[$bkey];
            }            

            $cellCol = getSeverity($c1[$i],$wmThres,$mapSC,$mapEC);

            echo "<tr class=s_row id=\"ccc-$cc\">
                  <td class=row>$flag$country</td>
                  <td class=lt style=\"background: $cellCol;\">$cellCol</td>
                  <td class=row>$cc</td>
                  <td class=row><b>$srcEventCount</b></td>
                  <td class=row><b>$dstEventCount</b></td>
                  <td class=row><b>$ccount</b></td></tr>";
        }
    } else {
        echo "<tr><td class=row colspan=6>
              No Result. If you were expecting to see something here try expanding the ip2c section
              and click the 'create mappings' button. When the mappings are complete, click on the main submit button again.
              </td></tr>";
    }

    echo "\r</table>
          \r</center>
          \r<br><br><br>";

}

doWorld($sccQuery,$dccQuery);

?>
