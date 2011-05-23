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

function cSel($when, $hCl) {

    include '.inc/config.php';
    include '.inc/countries.php';

    $ecn = $scc = $dcc = ''; 

    if ($hCl == 1) {
        // DB Connect
        $db = mysql_connect($dbHost,$dbUser,$dbPass) or die(mysql_error());
        mysql_select_db($dbName,$db) or die(mysql_error());

        $query = "SELECT COUNT(signature) AS count, map1.cc as src_cc, map2.cc as dst_cc
                  FROM event 
                  LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                  LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
                  WHERE $when 
                  GROUP BY src_cc, dst_cc";

        $results = mysql_query($query);
        
        while ($row = mysql_fetch_row($results)) {
            $ecn[]  = $row[0];
            $scc[]  = $row[1];
            $dcc[]  = $row[2];
        }
        
        $eSum = array_sum($ecn);
        $eThres = ret95($ecn);
    }

    // HTML
    echo "<table align=center width=100% cellspacing=0 style=\"border-collapse: collapse;\">\n";
    echo "<tr><td colspan=2 align=center style=\"padding-bottom: 10px;\"><input class=rb id=cloud name=base type=submit value=\"update\">";
    echo "</td></tr>";
    $count = $h = $i = 0;
    $cSize = count($countries);
    $letter = 'A';
    for ($x=0; $x <= 25;) {
        if ($h%2 == 0) {
            $es = 'background: #f4f4f4;';
        } else {
            $es = 'background: #e9e9e9;';
        }
        
        $string = '';
        list ($name,$cc) = explode("|", $countries[$i]);
        if ($name[0] == $letter) {
            if ($count == 0) {
                $h++;
                $string .= "<tr><td align=center style=\"padding: 0px 5px 0px 5px; font-size: .7em; background: #e9e9e9; color: gray;\"><b>$letter</b></td><td style=\"padding-left: 5px; font-size: .5em; border-bottom: 1pt dotted #c4c4c4; $es\">";
            } else {
                $string .= "&nbsp;&nbsp;";
            }

            // Get indexes for CC's if they exist and then grab the event count.
            $ec = 0;
            if ($hCl == 1) {
                $src = array_search("$cc", $scc);
                $dst = array_search("$cc", $dcc);
                if (is_numeric($src)) { $ec =  $ecn[$src]; }
                if (is_numeric($dst)) { $ec += $ecn[$dst]; }
            }

            // Add a style hint to the country if it has events.
            if ($ec == 0 && $hCl == 1) {
                // If we are looking at generated results, wash these guys out a bit
                $fs = 'font-size: .8em; vertical-align: middle; color: #c9c9c9';
            } else {
                $fs = 'font-size: 1em; vertical-align: middle; color: #808080';
            }
            if ($ec >= 1) {
                $size = round(1 + (8 / $eSum * $ec),2);
                $colour = getSeverity($ec,$eThres,'#808080','#B80028');
                $fs = "font-size: ${size}em; font-weight: bold; color: $colour; vertical-align: middle;";
            }

            $string .= "<a class=cloud style=\"$fs\" name=c-$cc id=c-$cc href=# onclick=\"mClick('c')\">$name</a>";
        } else {
            echo "</td></tr>\n";
            $letter++;
            $x++;
            $count = 0;
            continue;
        }

        echo $string;
        $count++;
        $i++;
        // We are at the end of the array. Kill it.
        if ($i == $cSize) { break; }
    }
    echo "</table>";
}
?>
