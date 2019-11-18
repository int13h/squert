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

include_once "config.php";
include_once "functions.php";

$db = mysqli_connect($dbHost,$dbUser,$dbPass) or die(mysqli_error($db));
mysqli_select_db($db,$dbName) or die(mysqli_error($db));

function IP2C($string) {

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

    function lookup($list) {

	global $db;
        while ($row = mysqli_fetch_row($list)) {
            $ip  = $row[0];
            $dot = long2ip((float)$ip);
            $ipLookup = mysqli_query($db,"SELECT registry, cc, c_long, type, date, status FROM ip2c WHERE
                                     $ip >=start_ip AND $ip <= end_ip LIMIT 1");

            $result = mysqli_fetch_array($ipLookup);

            if ($result) {
                $registry       = $result[0];
                $cc             = $result[1];
                $c_long         = $result[2];
                $type           = $result[3];
                $date           = $result[4];
                $status         = $result[5];

                mysqli_query($db,"REPLACE INTO mappings (registry,cc,c_long,type,ip,date,status)
                             VALUES (\"$registry\",\"$cc\",\"$c_long\",\"$type\",\"$ip\",\"$date\",\"$status\")");
                echo "-- Mapped $dot ($ip) to $cc ($c_long)\n";
            }
            
        }
    }

    // Start timing
    $st = microtime(true);

    // DB Connect
    global $db;
    $sipList = mysqli_query($db,"SELECT DISTINCT(e.src_ip) FROM event AS e LEFT JOIN mappings AS m ON e.src_ip=m.ip
                            WHERE (m.ip IS NULL OR m.cc = '01')");
    $dipList = mysqli_query($db,"SELECT DISTINCT(e.dst_ip) FROM event AS e LEFT JOIN mappings AS m ON e.dst_ip=m.ip
                            WHERE (m.ip IS NULL OR m.cc = '01')");
    $sipCount = $dipCount = 0;
    if ($sipList) {
        $sipCount = mysqli_num_rows($sipList);
        if ($sipCount > 0) {
            lookup($sipList);
        }
    }

    if ($dipList) {
        $dipCount = mysqli_num_rows($dipList);
        if ($dipCount > 0) {
            lookup($dipList);
        }
    }

    $allRecs = mysqli_query($db,"SELECT COUNT(*) FROM mappings");
    $allCount = mysqli_fetch_row($allRecs);

    // Stop Timing
    $et = microtime(true);
    $time = $et - $st;
    $rt = sprintf("%01.3f",$time);

    if ($string == 0) {
        echo "\n-> Query Time: $rt seconds
              \r-> Source Count: $sipCount
              \r-> Destination Count: $dipCount
              \r-> Total Mapped: $allCount[0]\n\n";
    }

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
        IP2C($argv[1]);
    }

}
?>
