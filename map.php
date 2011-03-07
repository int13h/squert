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

function doWorld($sccQuery,$dccQuery) {

    global $mapFGC, $mapBGC, $mapLNC , $mapSC, $mapEC, $omOver, $omOut;

    $aHit = $bHit = $cHit = 'no';

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

    $aBan = '';
    $bBan = '';
    $cBan = '';

    // Count items and establish threshold
    if ($aHit == 'yes') {
        $aItems = count($a1);
        $aSum = array_sum($a1);
        array_multisort($a1, SORT_DESC, $a2, $a3);
        $aBan = "<b>Source</b>: $aSum Events&nbsp;&nbsp;";
    }
    if ($bHit == 'yes') {
        $bItems = count($b1);
        $bSum = array_sum($b1);
        array_multisort($b1, SORT_DESC, $b2, $b3);
        $bBan = "<b>Destination</b>: $bSum Events&nbsp;&nbsp;";
    }
 
    if ($cHit == 'yes') {
        $cItems = count($c1);
        $cSum = array_sum($c1);
        array_multisort($c1, SORT_DESC, $c2, $c3);
        $th = $c1;
        $wmThres = ret95($th);
        $cBan = "<b>Total</b>: $cSum Events, $cItems Countries.";
    }

   // Map Canvas
    echo "\r<center>
          \r<table width=910 border=0 cellpadding=1 cellspacing=0>
          \r<tr>
          \r<td align=center colspan=2><b>Event Distribution by Country</b></td>
          \r</tr><tr>
          \r<td align=center colspan=2><canvas class=round style=\"border: 1pt solid gray;\" id=\"wm1\" width=\"910\" height=\"500\">[No canvas support]></canvas></td>
          \r</tr>
          \r</table>
          \r</center>";

    // Scale <-- this needs to be normalized!!
    echo "\r<table width=150 cellpadding=0 cellspacing=0 style=\"padding-left: 40px;\">
          \r<tr><td colspan=27 align=left style=\"font-size: .6em; padding: none;\">EVENTS</td></tr>
          \r<tr><td align=center colspan=27 style=\"font-size: .2em; padding: none;\">
          \r<hr style=\"border: none; border-top: 1pt solid gray;\"></td></tr>
          \r<tr><td align=center style=\"font-size: .5em;\">1&nbsp;</td>";

    $iter = 25;
    $sth = 25;
    if ($c1[0] <= $iter) {
        $iter = $c1[0] + 1;
        $sth = $wmThres;
    }

    for ($i = 1; $i < $iter; $i++) {
        $colour = getSeverity($i,$iter,$mapSC,$mapEC);
        echo "\r<td width=10 style=\"background: $colour; padding: 0px 0px 0px 5px;\"></td>";
    }

    echo "<td align=center style=\"font-size: .6em;\">&nbsp;$c1[0]</td></tr></table><br>";

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

    echo "\r<center>
          \r<table width=910 border=0 cellpadding=1 cellspacing=0><tr>
          \r<td align=center style=\"padding-top: 10px;\">$aBan $bBan $cBan</td>
          \r</tr></table>
          \r<table class=sortable width=910 border=0 cellpadding=0 cellspacing=0 style=\"border: 1pt solid gray;\">
          \r<thead><tr>
          \r<th width=490 align=left class=sort>Country</th>
          \r<th width=10  align=left class=sorttable_nosort></th>
          \r<th width=100 align=left class=sort>Country Code</th>
          \r<th width=100 aligh=left class=sort>Source</th>
          \r<th width=100 aligh=left class=sort>Destination</th>
          \r<th width=100 aligh=left class=sort>Total</th>
          \r</tr></thead>";
 
    if ($cHit == 'yes') {

        for ($i=0; $i<$cItems; $i++) {
            $ccount = $c1[$i];
            $cc = $c2[$i];
            $country = $c3[$i];
            $akey = array_search($cc, $a2);
            $bkey = array_search($cc, $b2);
            if ($akey === FALSE) {
                $acount = 0;
            } else {
                $acount = $a1[$akey];
            }
            if ($bkey === FALSE) {
                $bcount = 0;
            } else {
                $bcount = $b1[$bkey];
            }

            $cellCol = getSeverity($c1[$i],$wmThres,$mapSC,$mapEC);

            echo "\r<tr><td class=sort name=cm-ccc-$i id=cm-ccc-$i style=\"cursor: pointer; border-left: none;\" $omOver $omOut>$country</td>
                  \r<td width=20 class=sort style=\"background: $cellCol; border: none;border-left: 1pt solid #c4c4c4;\"></td>
                  \r<td class=sort>$cc</td>
                  \r<td class=sort><b>$acount</b></td>
                  \r<td class=sort><b>$bcount</b></td>
                  \r<td class=sort style=\"background: #d4d4d4;\"><b>$ccount</b></td></tr>";
        }
    } else {
        echo "<tr><td class=sortc colspan=6>
              No Result. If you were expecting to see something here try expanding the ip2c section
              and click the 'create mappings' button. When the mappings are complete, click on the main submit button again.
              </td></tr>";
    }

    echo "\r</table>
          \r</center>
          \r<br>";

}
?>
