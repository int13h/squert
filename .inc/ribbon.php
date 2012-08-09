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

$today = date("Y-m-d");
if(!isset($_REQUEST['s'])) { $s = $today; } else { $s = $_REQUEST['s']; }
if(!isset($_REQUEST['e'])) { $e = $today; } else { $e = $_REQUEST['e']; }
$startDate = htmlspecialchars($s);
$endDate = htmlspecialchars($e);

function valiDate($startDate, $endDate, $today) {
 
    $fail = 0;

    function testDate($date,$fail) {

        // Test validity
        if (preg_match("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/", $date)) {
        
            list($y,$m,$d) = explode('-', $date);

            if (checkdate($m,$d,$y) === FALSE) {
                $fail = 1;
            }
        } else {
            $fail = 1;
        }

        return $fail;
    }

    $fail += testDate($startDate,$fail);
    $fail += testDate($endDate,$fail);

    // Test logic
    if ($fail == 0) {
        $s = strtotime($startDate);
        $e = strtotime($endDate);
        $t = strtotime($today);
    
        if ($s > $e || $s > $t || $e > $t) {
            $fail += 1;
        }        
    }


    return $fail;
}

$fail = valiDate($startDate,$endDate,$today);

if ($fail > 0) {
    $startDate = $today;
    $endDate = $today;
}

$when = fixTime($startDate,"00:00:00",$endDate,"23:59:59");

function mkLinks() {
    global $id, $today, $startDate, $endDate;
    $currentYear = date('Y', strtotime($startDate));
    $currentMonth = date('F', strtotime($startDate));
    $currentDay = date('F', strtotime($startDate));
    $daysInMonth = date('t', strtotime($startDate));
    $page = ltrim($_SERVER['PHP_SELF'],"");

    $html = "<table class=noprint align=center width=100% cellpadding=0 cellspacing=0><tr class=month>";

    // Create month and year links
    for ($n = 1; $n <= 12; $n++) {
        $link = date('Y-m', strtotime("$currentYear-$n"));
        $month = date('F', strtotime("$currentYear-$n"));
        if ($month == $currentMonth) {
            $mClass = "cmonth";
        } else {
            $mClass = "month";
        }

        if ($n == 1) {
            $previousYear = date('Y-m-d', strtotime("$startDate -1 year"));
            $pyL = substr($previousYear,0,4);
            $href = "$page?id=$id&s=$previousYear&e=$previousYear";
            $html .= "<td class=month><a class=month href=\"$href\">&lt; $pyL</a></td>\n";
        }

        if ($link > $today || $month == $currentMonth) {
            $html .= "<td class=$mClass>$month</td>\n";
        } else {
            $href = "$page?id=$id&s=${link}-01&e=${link}-01";
            $html .= "<td class=$mClass><a class=month href=\"$href\">$month</a></td>\n";
        }

        if ($n == 12) {
            $nextYear = date('Y-m-d', strtotime("$startDate +1 year"));
            $nyL = substr($nextYear, 0,4);
            if ($link > $today) {
                $html .= "<td class=$mClass><b>$nyL &gt;</b></td>\n";
            } else {
                $href = "$page?id=$id&s=$nextYear&e=$nextYear";
                $html .= "<td class=month><a class=month href=\"$href\">$nyL &gt;</a></td>\n";
            }
        }   
    }

    $html .= "</tr></table><table class=noprint align=center width=100% cellpadding=0 cellspacing=0><tr class=day>";

    // Create Day links
    for ($n = 0; $n <= $daysInMonth -1; $n++) {
        $baseDay = date('Y-m-', strtotime("$startDate")) . "01";
        $link = date('Y-m-d', strtotime("$baseDay +$n day"));
        $lbl = date('Dd', strtotime($link));
        if ($link == $today) {
            $dClass = "tday";
            $aClass = "day";
        } else {
            $dClass = "day";
            $aClass = "day";
        }

        if ($link == $startDate) {
            $dClass = "cday";
            $aClass = "cday";
        }

        if ($link <= $today) {
            $href="$page?id=$id&s=$link&e=$link";
            $html .= "<td class=$dClass><a class=$aClass href=\"$href\">${lbl}</a></td>\n";
        } else {
            $html .= "<td class=$dClass>${lbl}</td>\n";
        }
    }

    $html .= "</tr></table>";

    return $html;
}

// Report Date
$rStart = date("l M j, Y", strtotime("$startDate"));
$rEnd = date("l M j, Y", strtotime("$endDate"));
if ($rStart == $rEnd) {
    $dispDate = "$rEnd";
} else {
    $dispDate = "Between $rStart and $rEnd";
}

// The ribbon
$timeLinks = mkLinks();

// Today link
if (strtotime($today) != strtotime($endDate)) {
    $page = ltrim($_SERVER['PHP_SELF'],"");
    $todayLink = "<div class=today>You are viewing a day in the past, <a href=\"$page?id=$id&s=$today&e=$today\">click here to view today</a></div>";
} else {
    $todayLink = "";
}
?>
