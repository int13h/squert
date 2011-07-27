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

include_once 'session.php';
include "config.php";
include "grid.php";
include "charts.php";
include "map.php";
include "csel.php";

asort($statusList);

$gList = array(
                 0 => "Yes||Null",
                 1 => "No||Null");

$mapList = array(
                 0 => "Yes||Null",
                 1 => "No||Null");

$qList = array(
                 0 => "signature||Null",
                 1 => "signature, src ip, dst ip||Null",
                 2 => "event detail||Null");
                  
// Default values for date controls
$today = date("Y-m-d");
$initSdate = $today;
$initStime = "0.0.0";
$initEdate = $today;
$initEtime = "23.59.59";
if(!isset($_REQUEST['sDate'])) { $sDate = $s; } else { $sDate = $_REQUEST['sDate']; }
if(!isset($_REQUEST['eDate'])) { $eDate = $e; } else { $eDate = $_REQUEST['eDate']; }
if(!isset($_REQUEST['sHour'])) { $sHour = 0; } else { $sHour = $_REQUEST['sHour']; }
if(!isset($_REQUEST['sMin'])) { $sMin = 0; } else { $sMin = $_REQUEST['sMin']; }
if(!isset($_REQUEST['sSec'])) { $sSec = 0; } else { $sSec = $_REQUEST['sSec']; }
if(!isset($_REQUEST['eHour'])) { $eHour = 23; } else { $eHour = $_REQUEST['eHour']; }
if(!isset($_REQUEST['eMin'])) { $eMin = 59; } else { $eMin = $_REQUEST['eMin']; }
if(!isset($_REQUEST['eSec'])) { $eSec = 59; } else { $eSec = $_REQUEST['eSec']; }
$timeParts = fixTime($sDate,"$sHour:$sMin:$sSec",$eDate,"$eHour:$eMin:$eSec");


// Main Function
function DoQueries($timeParts) {

    global $id;
    include 'config.php';

    $wString =	$_REQUEST["wString"];
    $aString =	$_REQUEST["aString"];
    $cString =  $_REQUEST["cString"];
    $xString =  $_REQUEST["xString"];
    $wType =	$_REQUEST["wType"];
    $aType =	$_REQUEST["aType"];
    $qLogic =	$_REQUEST["qLogic"];
    $qSID =	$_REQUEST["qSID"];
    $eStatus =	$_REQUEST["eStatus"];
    $hViz =     $_REQUEST["hViz"];
    $hMap =     $_REQUEST["hMap"];

    // DB Connect
    $db = mysql_connect($dbHost,$dbUser,$dbPass) or die();
    mysql_select_db($dbName,$db) or die();
    if (!$db) {
        exit();
    }

    // Timestamp stuff
    $when = $timeParts[0];
    $dispDate = $timeParts[1];
    $dDay = $timeParts[2];
    $dHour = $timeParts[3];
    if ($dDay == 1) {$ess = '';} else {$ess = 's';}
    $startDate = $timeParts[4];

    // Report filters message
    $tmpRf = $rfText = '';

    // Where 
    if (!"$wString") {
        $wType = 'x';
        $wString = '';
    } else {
        $tmpRf = htmlspecialchars($wString);
        $rfText .= "$tmpRf<br>";
    }

    // And
    if (!"$aString") {
        $aType = 'w';
        $aString = '';
    } else {
        $tmpRf = htmlspecialchars($aString);
        $rfText .= "$tmpRf<br>";
    }
  
    // Country
    if ($cString) {
        $theCountries = explode(";", $cString);
        $c = count($theCountries);
       
        for ($i = 0; $i < $c; ++$i) {

            $aCountry = $theCountries[$i];

            if ($i == 0) {
                $cFilter = "AND (";
            } else {
                $cFilter .= " OR ";
            }

            $cFilter .= "map1.c_long = '$aCountry' OR map1.cc = '$aCountry' OR map2.c_long = '$aCountry' OR map2.cc = '$aCountry' ";
        }

        $cFilter .= ")";
        $tmpRf = htmlspecialchars($cString);
        $rfText .= "$tmpRf<br>";

    } else {

        $cFilter = '';

    }

    // Status
    if ((isset($eStatus)) && ($eStatus != 42)) {
        $theStatus = "AND event.status = '$eStatus'";
        list($sLong,$sColour,$sCode) = explode('||', $statusList[$eStatus]);
        $rfText .= "$sLong ($sCode)<br>";
    } else {
        $theStatus = '';
    }

    // Sensor ID
    if ((isset($qSID)) && ($qSID != 1024)) {
        $senParts = explode(",", $qSID);
        $c = count($senParts);
        $sids = '';
        for ($i = 0; $i < $c; ++$i) {
            $sid = explode("-", $senParts[$i]);
            if ($i == 0) {
                $theSID = "AND (event.sid = '$sid[1]'";
            } else {
                $theSID .= " OR event.sid = '$sid[1]'";
            }
            $sids .= "$sid[1],";
        }
        $theSID .= ")";

        $rfText .= "SensorID: " . rtrim($sids, ",");
    } else {
        $theSID = '';
    }

    // Exclude
    if ($xString) {
        $subjects = array(
                           'sig'       => 'event.signature',
                           'sig_id'    => 'event.signature_id',
                           'sen_id'    => 'event.sid',
                           'src_ip'    => 'INET_NTOA(event.src_ip)',
                           'dst_ip'    => 'INET_NTOA(event.dst_ip)',
                           'src_port'  => 'event.src_port',
                           'dst_port'  => 'event.dst_port',
                           'c'         => '(map1.cc != \'**\' AND map1.c_long != \'**\' OR map2.cc != \'**\' AND map2.c_long != \'**\')'
                         );

        $toExclude = explode(";", $xString);
        $c = count($toExclude);
        $xFilter = '';
        $problem = 0;

        for ($i = 0; $i < $c; ++$i) {
            
            @list($subj,$pred) = explode("=", $toExclude[$i]);

            $toStrip = array("\"","'","`","^");
            $roundOne = str_replace($toStrip, "", $pred);
            $pred = str_replace('\\', '\\\\\\\\', $roundOne);
           
            // tight or loose query
            $prefix = "!=";
            if ($subj[0] == "~") {
                $prefix = "NOT LIKE";
                $subj = ltrim($subj, "~");
            }
            if (array_key_exists($subj, $subjects)) {
                $subject = $subjects[$subj];
                if ($subj == 'c') {
                    $subject = str_replace("**", $pred, $subject);
                    $xFilter .= "AND " . "$subject " ;
                } else {
                    $xFilter .= "AND " . $subject . " $prefix " . "'$pred' ";
                }
            } else {
                $problem = 1; 
            }        
        }                  	
        if ($problem == 1) {
            $xFilter = '';
            $rfText .= "EXCLUDE: <span style=\"color: #cc0000;\">Syntax Error, no filter applied.</span><br>";
        } else {
            $tmpRf = htmlspecialchars($xString);
            $rfText .= "<b>EXCLUDE -></b> $tmpRf<br>";
        }
    } else {
        $xFilter = '';
    }
 
    // Filters
    function getFilter($index,$theString,$theStatus,$theSID) {

        $toStrip = array("\"","'","`","^");
        $roundOne = str_replace($toStrip, "", $theString);
        $newString = str_replace('\\', '\\\\\\\\', $roundOne);
        
 
        // Types are:  IP, Port, Signature, Signature ID.
        $theFilters = array(
            "0" => "AND (INET_NTOA(src_ip) LIKE '$newString' OR INET_NTOA(dst_ip) LIKE '$newString') $theSID $theStatus",
            "1" => "AND (src_port = '$newString' OR dst_port ='$newString') $theSID $theStatus",
            "2" => "AND (signature LIKE '%$newString%') $theSID $theStatus",
            "3" => "AND (signature_id = '$newString') $theSID $theStatus",
            "x" => "$theSID $theStatus",
            "w" => ""
        );
        return $theFilters[$index];
    }

    $wFilter = getFilter($wType,$wString,$theStatus,$theSID);
    $aFilter = getFilter($aType,$aString,$theStatus,$theSID);

    // Query types. These are the base queries. Column defs are here as well.
    $theQueries = array(
        "q0" => "SELECT COUNT(signature) as count, signature, signature_id, ip_proto, MAX(timestamp) AS maxTime, COUNT(DISTINCT(src_ip)), COUNT(DISTINCT(dst_ip))
                 FROM event
                 LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                 LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
                 WHERE $when
                 $wFilter
                 $aFilter
                 $xFilter
                 $cFilter
                 GROUP BY signature, ip_proto
                 ORDER BY maxTime DESC
                 LIMIT $recLimit",
        "c0" =>  "Count,20||Src,20||Dst,20||Signature,709||SigID,20||Proto,20||Last Event,120",

        "q1" => "SELECT COUNT(signature) AS count, MAX(timestamp) AS maxTime, INET_NTOA(src_ip), map1.cc as src_cc, INET_NTOA(dst_ip), map2.cc as dst_cc, signature, signature_id, ip_proto
                 FROM event
                 LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                 LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
                 WHERE $when
                 $wFilter
                 $aFilter
                 $xFilter
                 $cFilter
                 GROUP BY src_ip, src_cc, dst_ip, dst_cc, signature, signature_id, ip_proto 
                 ORDER BY maxTime DESC
                 LIMIT $recLimit",
        "c1" => "Count,30||Last Event,110||Source,105||CC,20||Destination,105||CC,20||Signature,469||SigID,20",

        "q2" => "SELECT event.status, timestamp, INET_NTOA(src_ip), map1.cc as src_cc, src_port, INET_NTOA(dst_ip), map2.cc as dst_cc, dst_port, signature, signature_id, sid, cid, ip_proto
                 FROM event
                 LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                 LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
                 WHERE $when
                 $wFilter
                 $aFilter
                 $xFilter
                 $cFilter
                 ORDER BY timestamp DESC
                 LIMIT $recLimit",
        "c2" => "ST,10||Timestamp,110||Source,110||Src Port,20||CC,20||Destination,110||Dst Port,20||CC,20||Signature,\"\"||SigID,20"
    );

    // Supplemental queries. Used for charts. Under most circumstances, these aren't expensive.
    $supQueries = array(
        "status" => "SELECT event.status, COUNT(event.status) as count
                     FROM event
                     LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                     LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
                     WHERE $when
                     $wFilter
                     $aFilter
                     $xFilter
                     $cFilter
                     GROUP BY status
                     ORDER BY status ASC",
        "hdwmy" => "SELECT COUNT(*) as count, SUBSTRING(timestamp,1,13) as time 
                     FROM event
                     LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                     LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
                     WHERE $when
                     $wFilter
                     $aFilter
                     $xFilter
                     $cFilter
                     GROUP BY time 
                     ORDER BY time ASC",
          "scc" => "SELECT COUNT(src_ip) as count, map1.cc as src_cc, map1.c_long 
                     FROM event
                     LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                     LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
                     WHERE $when
                     $wFilter
                     $aFilter
                     $xFilter
                     $cFilter
                     AND src_ip NOT BETWEEN 167772160 AND 184549375
                     AND src_ip NOT BETWEEN 2886729728 AND 2886795263
                     AND src_ip NOT BETWEEN 3232235520 AND 3232301055
                     AND map1.cc IS NOT NULL
                     GROUP BY map1.cc
                     ORDER BY count DESC",
          "dcc" => "SELECT COUNT(dst_ip) as count, map2.cc as dst_cc, map2.c_long
                     FROM event
                     LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                     LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
                     WHERE $when
                     $wFilter
                     $aFilter
                     $xFilter
                     $cFilter
                     AND dst_ip NOT BETWEEN 167772160 AND 184549375
                     AND dst_ip NOT BETWEEN 2886729728 AND 2886795263
                     AND dst_ip NOT BETWEEN 3232235520 AND 3232301055
                     AND map2.cc IS NOT Null
                     GROUP BY map2.cc
                     ORDER BY count DESC");

    // Start timing
    $st = microtime(true);
    $statusQuery = mysql_query($supQueries['status']);
    $hdwmyQuery = mysql_query($supQueries['hdwmy']);

    // Country Queries
    if ($hMap == 1) {
        $sccQuery = mysql_query($supQueries['scc']);
        $dccQuery = mysql_query($supQueries['dcc']);
    } else {
        $sccQuery = 0;
        $dccQuery = 0;
    }
    
    // Base query
    $qText = $theQueries["q".$qLogic];
    $theQuery = mysql_query($theQueries["q".$qLogic]);
    $theCols = explode("||",$theQueries["c".$qLogic]);
    $numRows = mysql_num_rows($theQuery);

    if ($numRows == $recLimit) {
        $dEvents = "$numRows <b>(Event limit hit, try using a filter)</b>";
    } else {
        $dEvents = $numRows;
    }

    // Stop Timing
    $et = microtime(true);
    $time = $et - $st;
    $rt = sprintf("%01.3f",$time);

    $sum = 0;

    if ($numRows > 0) {
        // Event counts for summary and threshold
        if ($qLogic != 2) {
            while ($row = mysql_fetch_row($theQuery)) {
                $sum += $row[0];
                $th[] = $row[0];
            }
            // Establish threshold
            if ($numRows != "0") {
                $threshold = ret95($th);
            }
        } else {
            $sum = $numRows;
        }
        // Reset Pointer
        mysql_data_seek($theQuery, 0); 
    }

    // Last Event Time
    $ltQuery = mysql_query("SELECT timestamp, UTC_TIMESTAMP() FROM event WHERE $when $wFilter $aFilter ORDER BY timestamp DESC LIMIT 1");
    $lastTime = mysql_fetch_row($ltQuery);
    if ($lastTime == "") {
        $ltQuery = mysql_query("SELECT timestamp, UTC_TIMESTAMP() FROM event ORDER BY timestamp DESC LIMIT 1");
        $lastTime = mysql_fetch_row($ltQuery);
    }

    $utc_now =  gmdate("U", strtotime("$lastTime[1]"));
    $utc_last = gmdate("U", strtotime("$lastTime[0]"));

    if ($utc_last > 0) {
        $exs = "s";
        $ago = $utc_now - $utc_last;
        if ($ago <= 0) {
            $ago_time = "Now";
        } elseif ($ago < 60) {
            if ($ago == 1) { $exs = ''; }
            $ago_time = "$ago second$exs ago";
        } elseif ($ago < 3600) {
            if ($ago == 60) { $exs = ''; }
            $ago_time = round($ago / 60,2) . " minute$exs ago";
        } elseif ($ago < 86400) {
            if ($ago == 3600) { $exs = ''; }
            $ago_time = round($ago / 3660,2) . " hour$exs ago";
        } elseif ($ago >= 86400) {
            if ($ago == 86400) { $exs = ''; }
            $ago_time = round($ago / 86400,2) . " day$exs ago";
        }
        $local_last = formatStamp($lastTime[0],0);
        $leString = "$local_last ($ago_time)";
    } else {
        $leString = "Unknown, check DB connection";
    } 

    // The Grid
    if ($numRows > 0) {
        $theGrid = createGrid($hdwmyQuery,$dHour,$startDate);
        mysql_data_seek($hdwmyQuery,0);
        echo $theGrid;
        $repBorder = " border-top: none;";
    } else {
        $repBorder = " border-top: 1pt solid gray;"; 
    }

    // Report Summary
    echo "\r<table style=\"border-collapse: collapse; border: 1pt solid gray; border-bottom: none;$repBorder background: #ffffff;\" cellpadding=3 cellspacing=0 width=100% align=center>
          \r<tr>
          \r<td width=15% align=right style=\"font-size: 8pt; padding-top: 20px;\"><b>Report Period:&nbsp;</b></td>
          \r<td style=\"font-size: 8pt; padding-top: 20px;\">$dispDate <i>($dDay day$ess)</i></td>
          \r</tr><tr>
          \r<td align=right style=\"font-size: 8pt;\"><b>Report Filter(s):&nbsp;</b></td>
          \r<td style=\"font-size: 8pt;\">$rfText</td>
          \r</tr><tr>
          \r<td align=right style=\"font-size: 8pt;\"><b>Distinct Event(s):&nbsp;</b></td>
          \r<td style=\"font-size: 8pt;\">$dEvents</td>
          \r</tr><tr>
          \r<td align=right style=\"font-size: 8pt;\"><b>Total Event(s):&nbsp;</b></td>
          \r<td style=\"font-size: 8pt;\">$sum</td>
          \r</tr><tr>
          \r<td align=right style=\"font-size: 8pt;\"><b>Last Event:&nbsp;</b></td>
          \r<td><span style=\"font-size: 8pt; font-weight: bold; background: #f4f4f4;\">$leString</span></td>
          \r</tr><tr>
          \r<td align=right style=\"font-size: 8pt;\"><b>Query Time:&nbsp;</b></td>
          \r<td style=\"font-size: 8pt;\">$rt seconds</td>
          \r</tr>";

    if ($debug == "yes") {
      echo "\r<tr>        
            \r<td width=10% align=right style=\"font-size: 8pt; padding-bottom: 20px;\"><b>Debug:&nbsp;</b></td>
            \r<td style=\"font-size: 8pt;\">$qText</td>
            \r</tr>";
    }

    // Position of protocol column (used for graphs).
    switch ($qLogic) {
        case 0:
            $pos = 3; break;
        case 1:
            $pos = 8; break;
        case 2:
            $pos = 12; break;
    }

    if ($hMap == 1) {
        $shMap = array('none','','');
    } else {
        $shMap = array('','none','none');
    }

    if ($hViz == 1) {
        $shViz = array('none','','');
    } else {
        $shViz = array('','none','none');
    }

    // #### SECTION: Navigation ####
    echo "\r<tr>
          \r<td colspan=2 align=right style=\"padding-right: 20px;\">
          \r<div style=\"float: right; border-top: 1pt solid #c9c9c9; padding: 5px;\">
          \r<a class=vis id=graphs_yes style=\"display: $shViz[0];\" href=\"javascript:tab('graphs','yes');\">visuals &#9701</a>
          \r<a class=vis id=graphs_no style=\"display: $shViz[1]; color: black;\" href=\"javascript:tab('graphs','no');\">visuals &#9698</a>
          \r&nbsp;
          \r<a class=vis id=map_yes style=\"display: $shMap[0];\" href=\"javascript:tab('map','yes');\">map &#9701</a>
          \r<a class=vis id=map_no style=\"display: $shMap[1]; color: black;\" href=\"javascript:tab('map','no');\">map &#9698</a>
          \r&nbsp; 
          \r<a class=vis id=links_yes style=\"display: '';\" href=\"javascript:tab('links','yes');\">create &#9701</a>
          \r<a class=vis id=links_no style=\"display: none; color: black;\" href=\"javascript:tab('links','no');\">create &#9698</a>
          \r&nbsp;
          \r<a class=vis id=ip2c_yes style=\"display: '';\" href=\"javascript:tab('ip2c','yes');\">ip2c &#9701</a>
          \r<a class=vis id=ip2c_no style=\"display: none; color: black;\" href=\"javascript:tab('ip2c','no');\">ip2c &#9698</a>
          \r</div></td></tr>";          

    // #### SECTION: Visuals ####
    if ($numRows > 0) {
        echo "<tr id=graphs style=\"display: $shViz[2];\"><td colspan=2>";
        doCharts($theQuery,$pos,$statusQuery,$hdwmyQuery,$dDay);
        echo "<script>function draw() { doCharts(); } window.onload = draw; </script>";
        echo "</td></tr>";
    }

    // #### SECTION: MAP ####
    echo "<tr id=map style=\"display: $shMap[2];\"><td colspan=2>";
    if ($hMap == '1') {
        doWorld($sccQuery,$dccQuery);
    } else {
        echo "<br><div align=center style=\"font-weight: bold; font-size: 10px;\">
              <input class=rb onclick=\"poof('wrkn','yes');\" id=base name=base class=round type=submit value=\"create map\">
              </div><br>
              <center><span id=\"wrkn\" name=\"wrkn\" style=\"display: none;\"><img src=.inc/work.gif></span></center><br>";
    }        

    echo "</td></tr>";

    // #### SECTION: Link Graphs ####
    $qp = strtohex("$when $wFilter $aFilter $xFilter $cFilter");
    echo "\r<tr id=links style=\"display: none;\"><td colspan=2>
    <IFRAME id=links-frame name=links-frame src=\".inc/edv.php?qp=$qp&id=$id\" width=100% height=1000 frameborder=0 scrolling=no></IFRAME>
    </td></tr>";

    // #### SECTION: IP2C ####
    $qp = strtohex($when);
    echo "\r<tr id=ip2c style=\"display: none;\"><td colspan=2>
          \r<IFRAME id=\"ip2c-frame\" name=\"ip2c-frame\" src=\".inc/ip2c.php?qp=$qp&id=$id\" width=100% frameborder=0 scrolling=no></IFRAME>
          \r</td></tr>";

    echo "<tr><td colspan=2></td></tr></table>\n";

    // Start main table
    echo "<table id=results style=\"border: 1pt solid gray;\" cellpadding=1 cellspacing=0 width=100% align=center class=sortable>\n";

    if ($numRows <= 0) {
        echo "<tfoot><tr><td colspan=6 class=msg>Your query returned no results.</td></tr></tfoot></table></body></html>";
        exit(0);
    } else {

    // Column Headings
         
    echo "<thead><tr>\n";

    $numCols = sizeof($theCols);

    for ($i = 0; $i < $numCols; ++$i) {
        list($name,$width) = explode(",",$theCols[$i]);

        if ($name == 'Count') {
            echo "<th class=sorttable_nosort width=4></th>\n";
        }            
  
        echo "<th class=sort width=$width align=left>$name</th>\n"; 

    }

    echo "</tr></thead>\n";

    // Begin Data

        $rC = 0;

        while ($row = mysql_fetch_row($theQuery)) {
            $rC ++;
            $cntID =  "cm-cnt-$rC";
            $scntID = "cm-scnt-$rC";
            $dcntID = "cm-dcnt-$rC";
            $trigger = ($rC%2);
            if ($trigger == 0) {
                $class = 'line1';
            } else {
                $class = 'line2';
            }

            echo "\n<tr class=lines name=row-$rC id=row-$rC>\n";

            switch ("q".$qLogic) {
                case "q0":
                    $count =	$row[0];
                    $sigName =	$row[1];
                    $sigID =	$row[2];
                    $proto =	getProto($row[3]);
                    $time =	formatStamp($row[4],0);
                    $srcC =     $row[5];
                    $dstC =     $row[6];
                    $_sigName = urlencode($sigName);
                    $sigHTML = SignatureLine($sigName,$rC);
                    $sidHTML = SigidLine($sigID,$rC);
                    $severity = getSeverity($count,$threshold,$startHex,$endHex);

                    echo "<td style=\"background: $severity; font-size: 0pt; color: $severity; border: none;\">$count</td>";
                    echo "<td onclick=\"mClick('w','cm-sig-$rC'); submit();\" class=sort>$count</td>";
                    echo "<td class=tros style=\"color: #555;\">$srcC</td>";
                    echo "<td class=tros style=\"color: #555;\">$dstC</td>";
                    echo "$sigHTML";
                    echo "$sidHTML";
                    echo "<td class=tros>$proto</td>";
                    echo "<td class=tros style=\"font-size: 9px;\"><b>$time</b></td>\n";
                    break;

                case "q1":
                    $count =	$row[0];
                    $time =	formatStamp($row[1],0);
                    $srcIP =	$row[2];
                    $srcCC =	$row[3];
                    $dstIP =	$row[4];
                    $dstCC =	$row[5];
                    $sigName =	$row[6];
                    $sigID =	$row[7];
                    $srcHTML = IPLine($srcIP,'NA','src',$srcCC,$rC);
                    $dstHTML = IPLine($dstIP,'NA','dst',$dstCC,$rC);
                    $_sigName = urlencode($sigName);
                    $sigHTML = SignatureLine($sigName,$rC);
                    $sidHTML = SigidLine($sigID,$rC);
                    $severity = getSeverity($count,$threshold,$startHex,$endHex);

                    echo "<td width=4 style=\"background: $severity; font-size: 0pt; color: $severity; border: none;\">$count</td>\n";
                    echo "<td class=tros>$count</td>\n";
                    echo "<td class=tros style=\"font-size: 9px;\"><b>$time</b></td>\n";
                    echo "$srcHTML\n";
                    echo "$dstHTML\n";
                    echo "$sigHTML\n";
                    echo "$sidHTML\n";
                    break;

                case "q2":
                    $status =	Status($row[0]);
                    $time =	formatStamp($row[1],0);
                    $srcIP =	$row[2];
                    $srcCC =	$row[3];
                    $srcPort =	$row[4];
                    $dstIP =	$row[5];
                    $dstCC =	$row[6];
                    $dstPort =	$row[7];
                    $sigName =	$row[8];
                    $sigID =	$row[9];
                    $sid =		$row[10];
                    $cid =		$row[11];
                    $srcHTML = IPLine($srcIP,$srcPort,'src',$srcCC,$rC);
                    $dstHTML = IPLine($dstIP,$dstPort,'dst',$dstCC,$rC);
                    $sigHTML = SignatureLine($sigName,$rC);
                    $sidHTML = SigidLine($sigID,$rC);

                    echo "$status\n";
                    echo "<td id=t-$rC class=sort style=\"font-weight: bold;\" onclick=\"window.open('.inc/packet.php?sid=$sid&cid=$cid','$cid','width=1000,left=0,top=0,menubar=no,scrollbars=yes,status=no,toolbar=no,resizable=yes')\">$time</b></td>\n";
                    echo "$srcHTML\n";
                    echo "$dstHTML\n";
                    echo "$sigHTML\n";
                    echo "$sidHTML\n";
                    break;
            }
        echo "</tr>";
        }
    }
    echo "</table>\n";
}

// Can we connect?
cCheck();

$lout = '';

// Country selection.
if(!isset($_REQUEST['hCl'])) { $hCl = 0; } else { $hCl = $_REQUEST['hCl']; }
if ($hCl == 1) {$shCl = array('none','','');} else {$shCl = array('','none','none');}

?>

<!-- Controls start here -->

<form id=squert method=post action="p-query.php?<?php echo "id=$id&s=$s&e=$e";?>">

<table width=100% id=controls border=0 align=center cellpadding=1 cellspacing=0>
<tr>
<td align=right colspan=2 style="padding-left: 20px; font-size: 10px;"><b>WHERE: </b><?php qButtons('wType');?>
<?php
    if(!isset($_REQUEST['wString'])) { $wString = ''; } else { $wString = $_REQUEST['wString']; }
?>
&nbsp;<input class=input type=text size=100 id=wString name="wString" maxlength="256" value="<?php echo $wString;?>">
&nbsp;<a class="x" href="javascript:clear('wString');">&#x21BA;</a>
</td>
</tr>

<tr>
<td align=right colspan=2 style="padding-left: 20px; font-size: 10px;"><b>AND:</b> <?php qButtons('aType');?>
<?php
    if(!isset($_REQUEST['aString'])) { $aString = ''; } else { $aString = $_REQUEST['aString']; }
?>
&nbsp;<input class=input type=text size=100 id=aString name="aString" maxlength="256" value="<?php echo $aString;?>">
&nbsp;<a class="x" href="javascript:clear('aString');">&#x21BA;</a>
</td>
</tr>

<tr>
<td align=right colspan=2 style="padding-left: 20px; font-size: 10px;">
<a style="display: <?php echo $shCl[0];?>; color: #000000;" id=cchelp_yes class=vis href="javascript:poof('cchelp','yes');" onclick="hCl.value=1;"><b>COUNTRY</b>&nbsp;&#9701;</a>
<a style="display: <?php echo $shCl[1];?>; color: #000000;" id=cchelp_no class=vis href="javascript:poof('cchelp','no');" onclick="hCl.value=0;"><b>COUNTRY</b>&nbsp;&#9698;</a>
<?php
    if(!isset($_REQUEST['cString'])) { $cString = ''; } else { $cString = $_REQUEST['cString']; }
?>
&nbsp;<input class=input type=text size=100 id=cString name="cString" maxlength="256" value="<?php echo $cString;?>">
&nbsp;<a class="x" href="javascript:clear('cString');">&#x21BA;</a>
</td>
</tr>

<tr><td colspan=2 name=cchelp id=cchelp style="padding-top: 20px; padding-bottom: 20px; display: <?php echo $shCl[2];?>;">
<?php cSel($timeParts[0],$hCl);?>
</td></tr>

<tr>
<td align=right colspan=2 style="padding-left: 20px; font-size: 10px;">
<a style="display:; color: #000000;" id=exhelp_yes class=vis href="javascript:poof('exhelp','yes');"><b>EXCLUDE</b>&nbsp;&#9701;</a>
<a style="display: none; color: #000000;" id=exhelp_no class=vis href="javascript:poof('exhelp','no');"><b>EXCLUDE</b>&nbsp;&#9698;</a>
<?php
    if(!isset($_REQUEST['xString'])) { $xString = ''; } else { $xString = $_REQUEST['xString']; }
?>
&nbsp;<input class=input type=text size=100 id=xString name="xString" maxlength="5000" value="<?php echo $xString;?>">
&nbsp;<a class="x" href="javascript:clear('xString');">&#x21BA;</a>
</tr>
<tr name=exhelp id=exhelp style="display: none;">
<td colspan=2 align=center style="font-family: verdana; font-size: .7em; color: gray; padding-top: 10px;">
<span style="color: #000000;">subjects:</span> sig | sig_id | sen_id | src_ip | dst_ip | src_port | dst_port | c&nbsp;&nbsp;
<span style="color: #000000;">like match:</span> prefix subject with '~'. '%' is wild&nbsp;&nbsp;<br>
<span style="color: #000000;">examples:</span> dst_port=80;src_ip=10.0.0.1;c=UKRAINE <span style="color: #000000;">or</span> ~sig=ET RBN%;~src_ip=192.168.%.%;sig_id=2012043;c=US;c=CA
</td>
</tr>

<tr>
<td align=center>
<span id=note style="display: none; padding: 2px; font-weight: normal; font-size: .8em; color: #cc0000;">Query criteria modified</span>
</td>

<td align=right style="font-size: 10px; padding-top: 20px;">
<b>VIEW:</b>
<SELECT id=qLogic name=qLogic class=input>
<?php
    if(!isset($_REQUEST['qLogic'])) { $qLogic = 0; } else { $qLogic = $_REQUEST['qLogic']; }
    mkSelect($qList,$qLogic);
?>
</SELECT>
&nbsp;&nbsp;
<b>SENSOR:</b>
<SELECT id=qSID name=qSID class=input>
<?php 
    if(!isset($_REQUEST['qSID'])) { $qSID = 1024; } else { $qSID = $_REQUEST['qSID']; }
    mkSensor($qSID);
?>
</SELECT>

&nbsp;&nbsp;<b>STATUS:</b>
<SELECT id=eStatus name=eStatus class=input>
<?php
    if(!isset($_REQUEST['eStatus'])) { $eStatus = 42; } else { $eStatus = $_REQUEST['eStatus']; }
    mkSelect($statusList,$eStatus);
?>
</SELECT>
</td>
</tr>
   
<tr>
<td colspan=2 align=right style="font-size: 10px; padding-top: 20px;">          
<b>START:</b>&nbsp;
<input type="text" name=sDate id=sDate value="<?php echo $sDate; ?>" onchange="chk_date(0,0)" size="12" maxlength="10" readonly="readonly" class="w3em format-y-m-d split-date divider-dash no-transparency highlight-days-06 range-high-today" style="font-size: 10px; border: 1pt solid #c4c4c4; background: #f4f4f4;">
&nbsp;&nbsp;
<SELECT name=sHour id=sHour onchange="chk_date(0,0)" class=input>
<?php qTime('sh',23,0);?>
</SELECT>
<b>:</b>
<SELECT name=sMin id=sMin onchange="chk_date(0,0)" class=input>
<?php qTime('sm',59,0);?>
</SELECT>
<b>:</b>
<SELECT name=sSec id=sSec onchange="chk_date(0,0)" class=input>
<?php qTime('ss',59,0);?>
</SELECT>
      
<a class="x" href="javascript:chk_date('1','<?php echo "$initSdate.$initStime"; ?>');">&#x21BA;</a>

&nbsp;&nbsp;&nbsp;<b>END:</b>&nbsp;
<input type="text" name=eDate id=eDate value="<?php echo $eDate; ?>" onchange="chk_date(0,0)" size="12" maxlength="10" readonly="readonly" class="w3em format-y-m-d split-date divider-dash no-transparency highlight-days-06 range-high-<?php echo $today;?>" style="font-size: 10px; border: 1pt solid #c4c4c4; background: #f4f4f4;">
&nbsp;&nbsp;
 
<SELECT name=eHour id=eHour onchange="chk_date(0,0)" class=input>
<?php qTime('eh',23,23);?>
</SELECT>
<b>:</b>
<SELECT name=eMin id=eMin onchange="chk_date(0,0)" class=input>
<?php qTime('em',59,59);?>
</SELECT>
<b>:</b>
<SELECT name=eSec id=eSec onchange="chk_date(0,0)" class=input>
<?php qTime('es',59,59);?>
</SELECT>

<a class="x" href="javascript:chk_date('2','<?php echo "$initEdate.$initEtime"; ?>');">&#x21BA;</a>
&nbsp;&nbsp;

<input id=base name=base type="submit" value=submit class=rb>
<input type="button" value="reset" onClick="location.href='p-query.php?id=<?php echo $id;?>';" class=rb>
</td>
</tr>
</table>

<br>

<table cellpadding=0 cellspacing=0 id=divContext style="background: #fafafa; border: 1pt solid gray; border-collapse: collapse; display: none; position: absolute;">
<tr>
<td style="font-size: 10px; background: #000000; color: #ffffff; padding: 7px 5px 7px 10px; border-bottom: 1pt solid gray;"><b>Actions</b></td>
<td align=right style="font-size: 10px; background: #000000; color: #ffffff; padding: 7px 5px 7px 10px; border-bottom: 1pt solid gray;"> 
<input class=rb style="font-size: .8em; font-family: verdana; width: 30px;" id=cmtop type=button onClick="CloseContext(); self.scrollTo(0,0);" value=up>
<input class=rb style="font-size: .8em; font-family: verdana; width: 30px;" type=button value=X onClick="CloseContext()"></td></tr>
</td>
</tr>
<tr>
<td colspan=2 id=cmwhere class=cmenu onclick="mClick('w')">add item to WHERE clause (0)</td>
</tr>
<tr>
<td colspan=2 id=cmand class=cmenu onclick="mClick('a')">add item to AND clause (0)</td>
</tr>
<tr>
<td colspan=2 id=cmcc class=cmenu onclick="mClick('c')">add item to COUNTRY clause (0)</td>
</tr>
<tr>
<td colspan=2 id=cmex class=cmenu onclick="mClick('x')">add item to EXCLUDE clause (0)</td>
</tr>
<tr>
<td colspan=2 id=cmsig class=cmenu onclick="sigLU()" style="display: none;">lookup signature</td>
</tr>
<tr>
<td colspan=2 id=cmlip class=cmenu onclick="localLookup()" style="display: none;">lookup address</td>
</tr>
<tr>
<td colspan=2 id=cmprofile class=cmenu onclick="profile()" style="display: none;">profile this item</td>
</tr>
<tr>
<td colspan=2 id=cmprofile class=cmenu onclick="profile()" style="display: none;">profile this page</td>
</tr>
<tr><td colspan=2 class=unemc style="border-bottom: none; padding: 5px 5px 5px 5px;"><b>View:</b>&nbsp;
<select id=qLogic1 name=qLogic1 onchange="update()" style='background: #ffffff; font-size: 10px; border: 1px solid #c4c4c4;'><?php mkSelect($qList,$qLogic);?></select>
<input class=rb id=incon name=base class=round type="submit" value=submit>
</td></tr>
</table>

<?php 
    if(!isset($_REQUEST['hViz'])) { $hViz = 0; } else { $hViz = $_REQUEST['hViz']; }
    if(!isset($_REQUEST['hMap'])) { $hMap = 0; } else { $hMap = $_REQUEST['hMap']; } 
?>

<center>
<input name=hViz id=hViz type=hidden maxlength=1 value="<?php echo $hViz;?>">
<input name=hMap id=hMap type=hidden maxlength=1 value="<?php echo $hMap;?>">
<input name=hCl id=hCl type=hidden maxlength=2 value="<?php echo $hCl;?>">
<input name=tP id=tP type=hidden maxlength=255 value="<?php $xyz = strtohex($timeParts[0]); echo $xyz;?>">
</center>
<?php
if (isset($_POST['base'])) {
    switch ($_POST['base']) {
        case "update cloud":
            $hCl == 1;
            break;
        case "submit":
            DoQueries($timeParts);
            break;
        default:
            DoQueries($timeParts);
            break;
   }
}
?>
<script type="text/javascript" src=".js/menu.js"></script>
</form>

