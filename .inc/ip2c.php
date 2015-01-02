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

function IP2C($string,$isCLI) {

    include_once "config.php";
    include_once "functions.php";

    if ($isCLI == 'NO') {
        // Running from a browser
        $when = 'WHERE ' . hextostr($string) . ' AND ';
    } else {
        // Running from the command line
        if ($string == 0) {
            $when = "WHERE ";
        }

        if ($string == 1) {
            $startDate = gmdate("Y-m-d");
            $startTime = "00:00:00";
            $endDate = gmdate("Y-m-d",strtotime($startDate . "+1 day"));
            $endTime = "00:00:00";
            $when = "WHERE e.timestamp BETWEEN '$startDate $startTime' AND '$endDate $endTime' AND";
        }

        echo "Performing base queries (this can take a while)..\n\n";

    }

    function lookup($list) {

        while ($row = mysql_fetch_row($list)) {
            $ip = $row[0];
            $ipLookup = mysql_query("SELECT registry, cc, c_long, type, date, status FROM ip2c WHERE
                                     $ip >=start_ip AND $ip <= end_ip LIMIT 1");

            $result = mysql_fetch_array($ipLookup);

            if ($result) {
                $registry       = $result[0];
                $cc             = $result[1];
                $c_long         = $result[2];
                $type           = $result[3];
                $date           = $result[4];
                $status         = $result[5];

                mysql_query("INSERT IGNORE INTO mappings (registry,cc,c_long,type,ip,date,status)
                             VALUES (\"$registry\",\"$cc\",\"$c_long\",\"$type\",\"$ip\",\"$date\",\"$status\")");
                echo "-- Mapped $ip to $cc ($c_long)\n";
            }
            
        }
    }

    // DB Connect
    $db = mysql_connect($dbHost,$dbUser,$dbPass) or die(mysql_error());
    mysql_select_db($dbName,$db) or die(mysql_error());

    // Start timing
    $st = microtime(true);
    $sipList = mysql_query("SELECT DISTINCT(e.src_ip) FROM event AS e LEFT JOIN mappings AS m ON e.src_ip=m.ip
                            $when m.ip IS NULL");
    $dipList = mysql_query("SELECT DISTINCT(e.dst_ip) FROM event AS e LEFT JOIN mappings AS m ON e.dst_ip=m.ip
                            $when m.ip IS NULL");
    $sipCount = $dipCount = 0;
    if ($sipList) {
        $sipCount = mysql_num_rows($sipList);
        if ($sipCount > 0) {
            lookup($sipList);
        }
    }

    if ($dipList) {
        $dipCount = mysql_num_rows($dipList);
        if ($dipCount > 0) {
            lookup($dipList);
        }
    }

    $allRecs = mysql_query("SELECT COUNT(*) FROM mappings");
    $allCount = mysql_fetch_row($allRecs);

    // Stop Timing
    $et = microtime(true);
    $time = $et - $st;
    $rt = sprintf("%01.3f",$time);

    if ($isCLI == 'NO') {

        $html = "\r<table align=left>
                 \r<tr><td align=left style=\"font-size: 10px;\"><b>&nbsp;-> Query Time: $rt seconds</b></td></tr>
                 \r<tr><td align=left style=\"font-size: 10px;\"><b>&nbsp;-> Source Count: $sipCount</b></td></tr>
                 \r<tr><td align=left style=\"font-size: 10px;\"><b>&nbsp;-> Destination Count: $dipCount</b></td>
                 \r<tr><td align=left style=\"font-size: 10px;\"><b>&nbsp;-> Total Mapped: $allCount[0]</b></td></tr>
                 \r</table>";
            
        return $html;
    }

    if ($isCLI == 'YES' && $string == 0) {
        echo "\n-> Query Time: $rt seconds
              \r-> Source Count: $sipCount
              \r-> Destination Count: $dipCount
              \r-> Total Mapped: $allCount[0]\n\n";
    }

}

function TheHTML($string) {

    echo "\r<html>
          \r<head>
          \r<script type=\"text/javascript\" src=\"../.js/squert.js\"></script>
          \r<style type=\"text/css\" media=\"screen\">@import \"../.css/squert.css\";</style>
          \r</head>
          \r<body style=\"background: #ffffff;\">
          \r<form id=ip2c method=post action=ip2c.php>
          \r<center>          
          \r<input class=rb onclick=\"poof('wrkn','yes');\" id=csync name=csync type=\"submit\" value=\"update\">
          \r<br><br><span id=\"wrkn\" name=\"wrkn\" style=\"display: none;\"><img src=work.gif></span>
          \r<input type=hidden id=qText name=qText value=\"$string\">
          \r</center>
          \r</body>
          \r</html>";
}

if (isset($argc)) {

    if ($argc == 1 || $argc > 2 || $argv[1] > 1 || !is_numeric($argv[1])) {
    echo "\nUsage: update.php <option>\n
          \rOptions
          \r-------
          \r0 - First run. Map everything in the DB (this can take a while)
          \r1 - Update. This is intended to be called via Cron\n\n";
    exit;
    } else {
        IP2C($argv[1],'YES');
    }

} else { 

    $html = '';

    if(!isset($_REQUEST['qText'])) { $string = $_REQUEST['qp']; } else { $string = $_REQUEST['qText']; }

    if (@$_REQUEST['csync']) {
        $string = $_REQUEST['qText'];
        $html = IP2C($string,'NO');
    }

    TheHTML($string);
    echo $html;
}
?>
