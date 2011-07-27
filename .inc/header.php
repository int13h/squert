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
    $page = ltrim($_SERVER['PHP_SELF'],"/squert");

    $html = "<table width=100% cellpadding=0 cellspacing=0><tr>";

    // Create month and year links
    for ($n = 1; $n <= 12; $n++) {
        $link = date('Y-m', strtotime("$currentYear-$n"));
        $month = date('F', strtotime("$currentYear-$n"));
        if ($month == $currentMonth) {
            $mClass = "datesel_cm";
        } else {
            $mClass = "datesel_am";
        }

        if ($n == 1) {
            $previousYear = date('Y-m-d', strtotime("$startDate -1 year"));
            $pyL = substr($previousYear,0,4);
            $html .= "<td class=$mClass align=center><a class=datesel_m href=\"$page?id=$id&s=${previousYear}&e=${previousYear}\"><b>&lt; $pyL</b></a></td>\n";
        }


        if ($link > $today) {
            $html .= "<td class=$mClass width=71 align=center>$month</td>\n";
        } else {
            $html .= "<td class=$mClass width=71 align=center><a class=datesel_m href=\"$page?id=$id&s=${link}-01&e=${link}-01\">$month</a></td>\n";
        }

        if ($n == 12) {
            $nextYear = date('Y-m-d', strtotime("$startDate +1 year"));
            $nyL = substr($nextYear, 0,4);
            if ($link > $today) {
                $html .= "<td class=$mClass align=center><b>$nyL &gt;</b></td>\n";
            } else {
                $html .= "<td class=$mClass align=center><a class=datesel_m href=\"$page?id=$id&s=${nextYear}&e=${nextYear}\"><b>$nyL &gt;</b></a></td>\n";
            }
        }   
    }

    $html .= "</tr></table><table style=\"border-collapse: collapse;\" cellpadding=0 cellspacing=0><tr>";

    // Create Day links
    for ($n = 0; $n <= $daysInMonth -1; $n++) {
        $baseDay = date('Y-m-', strtotime("$startDate")) . "01";
        $link = date('Y-m-d', strtotime("$baseDay +$n day"));
        $lbl = date('Dd', strtotime($link));
        if ($link == $today) {
            $dClass = "datesel_cd";
        } else {
            $dClass = "datesel_ad";
        }

        $extra = '';

        if ($link == $startDate) {
            $extra = "style=\"background: yellow; font-weight: bold;\"";
        }

        if ($link <= $today) {
            $html .= "<td class=$dClass ${extra}width=32 align=center><a class=datesel_d href=\"$page?id=$id&s=$link&e=$link\">${lbl}</a></td>\n";
        } else {
            $html .= "<td class=$dClass width=32 align=center>${lbl}</td>\n";
        }
    }

    $html .= "</tr></table><br>";

    return $html;
}

$timeLinks = mkLinks();

echo "<form id=head method=post>
<div style=\"width: 1000px; margin: 0 auto; padding: none; text-align: right;\">
Welcome <b>$sUser</b> <b>|</b>
<a class=submit id=whiteboard_yes style=\"display:;\" href=\".inc/whiteboard.php\" target=\"whiteboard\" onclick=\"javascript:poof('whiteboard','yes');\">Whiteboard</a>
<a class=submit id=whiteboard_no style=\"display: none;\" href=\"javascript:poof('whiteboard','no');\">Whiteboard</a>
<b>|</b> <input class=submit type=submit id=lout name=base value=\"Log out\">
</div>
</form>";

echo "<div align=center><IFRAME id=whiteboard name=whiteboard frameborder=0 scrolling=no width=1000px height=800px style=\"display: none; border: 2pt solid black; margin-bottom: 20px;\"></IFRAME></div>\n";
?>
