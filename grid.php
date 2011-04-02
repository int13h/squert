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

function createGrid($hdwmyQuery,$dHour,$startDate) {
    global $offset, $startHex, $endHex;
    $count = $time = '';
    $threshold = 1;
    $hCol1 = "background: #000000; color: #f4f4f4;";
    $hCol2 = "background: #666666; color: #f4f4f4;";
    $hCol3 = "background: #e9e9e9; color: #000000;";
    $ghCol = "#cc0000";
    $msg1 = "hover over a cell to see its value, click to view events";
    $msg2 = "click the cell again to go back";
    while ($row = mysql_fetch_row($hdwmyQuery)) {
        $events[] = $row[0];
        $time[] = $row[1];
    }

    $aSum = array_sum($events);

    // Establish threshold
    $th = $events;
    $threshold = ret95($th);

    // x and y labels
    $html = "<table style=\"border: 1pt solid gray; border-bottom: none; background: #ffffff;\" cellpadding=0 cellspacing=0 width=950 align=center>
             \r<tr>
             \r<td align=center width=4% style=\"font-size: .6em; font-weight: bold; border-right: 1pt solid gray; $hCol1\">M-D/H</td>";

    for ($i = 0; $i <= 23; $i++) {
            $html .= "\r<td align=center width=3.6% style=\"font-size: .6em; $hCol1\">$i</td>";
    }

    // Row Sum
    $html .= "\r<td align=center width=5% style=\"font-size: .6em; font-weight: bold; $hCol1 border-left: 1pt solid gray;\">EVENTS</td>
              \r<td align=center width=5% style=\"font-size: .6em; font-weight: bold; $hCol1 border-left: 1pt solid gray;\">%</td>";
    $html .= "\r</tr></table>";

    // How many rows do we need?
    if ($dHour < 24) {
        $tableRows = 1;
    } else {
        if ($time[0] > 0) {
            $tableRows = ceil($dHour / 24);
        } else {
            $tableRows = floor($dHour / 24);
        }
    }

    // Change the timestamp to start at 0
    $_start = explode(" ", $startDate);
    $start = "${_start[0]} 00:00:00"; 
    $cbit = 0;
    $sc = 0;
    $ec = 23;

    // Start the rows
    for ($r = 1; $r <= $tableRows; $r++) {
        // What day is it?
        $rd = date("m-d", strtotime($start . "+$r days" . "-1 day"));
        $s_d = date("Y-m-d", strtotime($start . "+$r days" . "-1 day"));
        $yonClick = "onClick=chk_date('3','$s_d.00.00.00.$s_d.23.59.59')";

        $repDay = date("l", strtotime($start . "+$r days" . "-1 day"));
        $testChar = strpos("$repDay", 'S');

        if ($testChar !== false) {
            $extra = $hCol2;
        } else {
            $extra = $hCol1;
        }

        $html .= "\r<table style=\"border: 1pt solid gray; border-bottom: none; background: #ffffff;\" cellpadding=0 cellspacing=0 width=950 align=center>
                  \r<tr name=$rd id=$rd><td align=center width=4% style=\"font-size: .6em; border-right: 1pt solid gray; $extra cursor: pointer;\" $yonClick onMouseOver=\"style.textDecoration='underline'; style.fontWeight='bold';\" onMouseOut=\"style.textDecoration='none'; style.fontWeight='normal'\">$rd</td>";

        $eventSum = 0;

        // Start the cells
        for ($y = $sc; $y <= $ec; $y++) {

            // This is the prebuilt grid.
            @$lookFor = date("Y-m-d H", strtotime($start . "$y hours")); 

            // This is the result. If the array is empty, use a dummy to keep the loop going until the grid is full.
            if (isset($time[$cbit])) {
                @$timeSlot = date("Y-m-d H", strtotime("$time[$cbit]:00:00" . "$offset seconds"));
                $timeLong = $timeSlot;
            } else {
                $timeSlot = 'xxxx-xx-xx xx';
            }

            if ($dHour == 1) {
                $lookFor = substr($lookFor, 11,2);
                $timeSlot = substr($timeSlot, 11,2);
            }

            if ("$lookFor" == "$timeSlot") {
                
                list($slotsDate,$slotStart) = explode(" ", $timeLong);

                // For URL 
                if ($slotStart[0] == 0 && $slotStart[1] < 9) {$slotPrefix = 0;} else {$slotPrefix = '';}
                $slotEnd = $slotPrefix . ($slotStart + 1);
                if ($slotStart == "23") { 
                    $slotEnd = '23';
                    $sloteDate = date("Y-m-d H", strtotime("$slotsDate +1 day"));
                } else {
                    $sloteDate = $slotsDate;
                }

                $eventCount = $events[$cbit];
                $eventSum += $eventCount;
                $colour = getSeverity($eventCount,$threshold,$startHex,$endHex);
                $onClick = '';
   
                if ($dHour > 1) {
                    $wMsg = $msg1;
                    $onClick = "onClick=chk_date('3','$slotsDate.$slotStart.00.00.$slotsDate.$slotStart.59.59')";
                    $html .= "\r<td align=center width=3.6% style=\"font-size: .6em; background: $colour; cursor: pointer;\" $onClick onMouseOver=\"style.border='2pt solid $ghCol'; eeee.innerHTML='${timeSlot}:00 - $eventCount event(s)';\" onMouseOut=\"style.border='none'; eeee.innerHTML='$msg1';\"></td>";
                } else {
                    $wMsg = $msg2;
                    $html .= "\r<td align=center width=3.6% style=\"font-size: .6em; background: $colour; cursor: pointer;\" onClick=\"history.go(-1)\" onMouseOver=\"style.border='2pt solid $ghCol';\" onMouseOut=\"style.border='none';\"></td>";
                }

                $cbit ++;

            } else {

                $html .= "\r<td align=center width=3.6% style=\"font-size: .6em; background: #ffffff; color: #c9c9c9;\">-</td>";

            }
            
        }
        $ofTotal = round(($eventSum/$aSum) * 100, 2) . "%";
        $html .= "\r<td align=right width=5% style=\"font-size: .5em; font-weight: bold; $hCol3 padding-right: 2px; border-left: 1pt solid gray;\">$eventSum</td>
                  \r<td align=right width=5% style=\"font-size: .5em; font-weight: bold; $hCol3 padding-right: 2px; border-left: 1pt solid gray;\">$ofTotal</td>
                  \r</tr></table>";
        $sc = $ec + 1;
        $ec = $sc + 23;
    }
    $html .= "<table style=\"border-collapse: collapse; border: 1pt solid gray; border-bottom: none; background: #ffffff;\" cellpadding=0 cellspacing=0 width=950 align=center>
              \r<tr>
              \r<td id=eeee align=center style=\"font-size: .6em; font-weight: bold; background: #000000; color: #ffffff\">$wMsg</td>
              \r</tr></table>";
    return $html;
}
?>
