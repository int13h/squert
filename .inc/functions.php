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

function retAv($x) {
    $y = array_sum($x);
    if ($y > 0) {
        $answer = $y / count($x);
        return $answer;
    }
    return 0;
}

function ret95($x) {
    sort($x);
    $answer = $x[round((95/100) * count($x) - .5)];
    return $answer;
}

function retND($x) {
    $x_std = stats_standard_deviation($x);
    $x_av = retAv($x);
    $answer = (array_sum($x) - $x_av) / $x_std;
    return $answer;
}

function retSD($x) {
    $answer = stats_standard_deviation($x);
    return $answer;
}

function cCheck() {
    if (file_exists('.inc/config.php')) {
        global $dbHost,$dbName,$dbUser,$dbPass;
        $link = mysql_connect($dbHost,$dbUser,$dbPass);

        if (!$link) {
            die('Connection failed: ' . mysql_error());
        }

        $db = mysql_select_db($dbName,$link);
    
        if (!$db) {
            die('Database selection failed: ' . mysql_error());
        }

        mysql_close($link);
    } else {
        echo "<center>
              <b>Configuration file not found</b><br>
              Edit 'config.php.sample' to taste and then rename it to 'config.php'
              </center>";
        die();
    }

}

function dbC() {
    if (file_exists('.inc/config.php')) {
        global $dbHost,$dbName,$dbUser,$dbPass;
        $link = mysql_connect($dbHost,$dbUser,$dbPass);

        if (!$link) {
            die('Connection failed: ' . mysql_error());
        }

        $db = mysql_select_db($dbName,$link);

        if (!$db) {
            die('Database selection failed: ' . mysql_error());
        }

    } else {
        echo "<center>
              <b>Configuration file not found</b><br>
              Edit 'config.php.sample' to taste and then rename it to 'config.php'
              </center>";
        die();
    }

}

// Query date and time
function fixTime($sDate, $sTime, $eDate, $eTime) {
    global $offset;
    $_start = strtotime("$sDate $sTime");
    $_end = strtotime("$eDate $eTime");
    if ($offset[0] == "-") {
        $start = $_start - $offset;
        $end = $_end - $offset;
    } else {
        $start = $_start + $offset;
        $end = $_end + $offset;
    }

    $startDate = date("Y-m-d H:i:s", $start);
    $endDate = date("Y-m-d H:i:s", $end);
    $when = "timestamp BETWEEN '$startDate' AND '$endDate'";

    // Report Date
    $rstart = date("l M j, Y H:i:s", strtotime("$sDate $sTime"));
    $rend = date("l M j, Y H:i:s", strtotime("$eDate $eTime"));
    $dispDate = "Between $rstart and $rend";
    $dDay = round(($_end - $_start) / 86400,2);
    $dHour = round(($_end - $_start) / 3600,2);
    return array($when,$dispDate,$dDay,$dHour,$startDate);
}

// If not GMT, adjust timestamps
function formatStamp($dateTime,$type) {
    global $offset;
    switch ($type) {
        case 0: $format = 'y-m-d H:i:s'; break;
        case 1: $format = 'd H:i'; break;
        case 2: $format = 'G'; break;
        case 3: $format = 'm-d'; break;
        case 4: $format = 'H:i:s'; break;
    }

    if ($offset === 0) {
       return date($format,strtotime($dateTime));
    } else {
       return date($format,strtotime($dateTime . "$offset seconds"));
    }
}

// This builds a select box
function mkSelect($items,$active) {

    foreach ($items as $id => $value) {
  
        $parts = explode("||",$value);

        if ($id == $active) {
            $selected="selected";
        } else {
            $selected="";
        }
        echo "\r<option value=\"$id\" $selected>$parts[0]</option>";
    }
}

// Sensor list
function mkSensor($active) {
    global $dbHost,$dbName,$dbUser,$dbPass;
    $db = mysql_connect($dbHost,$dbUser,$dbPass) or die(mysql_error());
    mysql_select_db($dbName,$db) or die();
    $query = "SELECT net_name,agent_type,hostname,sid FROM sensor 
              WHERE agent_type = 'snort' OR agent_type = 'modsecurity' OR agent_type = 'ossec' OR agent_type = 'http'
              ORDER BY hostname ASC";
    $sensors = mysql_query($query);

    while ($row = mysql_fetch_row($sensors)) {
        $nn[] = $row[0];
        $ag[] = $row[1];
        $hn[] = $row[2];
        $si[] = $row[3];
    }

    // Network SID's
    $uniqNets = array_values(array_unique($nn));
    $nList = '';
    $rn = 0;
    for ($i = 0, $x = count($uniqNets); $i < $x; ++$i) {
        $netName = $uniqNets[$i];
        $theKeys = array_keys($nn, $netName);

        // Catch all.
        if ($i == 0) { $nList .= "1024::(all networks)::Network;";}

        // Now loop through each net and get the SID's
        $sids = '';
        for ($j = 0, $y = count($theKeys); $j < $y; ++$j) {
            $sids .= "${rn}-" . $si[$theKeys[$j]] . ",";
            $rn++;
        }

        $sids = rtrim($sids,',');
        $nList .= $sids . "::" . $netName . ";";
    }

    $nList = rtrim($nList,';');
    
    // Agents SID's
    $uniqAgents = array_values(array_unique($ag));
    $aList = '';
    for ($i = 0, $x = count($uniqAgents); $i < $x; ++$i) {
        $agents = '';
        $agentType = $uniqAgents[$i];
        $theKeys = array_keys($ag, $agentType);
        $sids = '';
        // find all SID's for this agent type
        for ($j = 0, $y = count($theKeys); $j < $y; ++$j) {
            // Catch all for agent types
            $sids .= "${rn}-" . $si[$theKeys[$j]] . ",";
            $rn++;
            $agents .= "${rn}-" . $si[$theKeys[$j]] . "::" . $hn[$theKeys[$j]] . ";";
            $rn++;
        }

        $sids = rtrim($sids,',');
        $agents = rtrim($agents, ';');
        $aList .= "$sids::(all $agentType)::$agentType;$agents;";
    }
    $aList = rtrim($aList,';');
    $items = "$nList;$aList";

    // Now populate the box
    $heading = "";
    $pairs = explode(";",$items);
    $itemCount = (count($pairs) - 1);

    for ($i = 0; $i <= $itemCount; $i++){

        $ilist = explode("::",$pairs[$i]);
        $id =	$ilist[0];
        $desc = $ilist[1];

        if (count($ilist) > 2) {
            $heading = $ilist[2];
            $sh = strtoupper($heading[0]) . substr($heading,1);
            echo "<optgroup style='font-family: verdana;' label=$sh>\n";
        }

        $selected = '';

        if ($id == $active) {
            $selected="selected=\"yes\"";
        }

        echo "<option value=\"$id\" $selected>$desc</option>\n";

        if ($heading) {
            "</optgroup>\n";
        }
    }
}

// Protocols
function getProto($proto) {
    $types = array(
        0   => "PP",
        1   => "ICMP",
        6   => "TCP",
        17  => "UDP",
        41  => "IPv6",
        150 => "URL"
    );

    if (array_key_exists($proto, $types)) {
        $answer = $types[$proto];
    } else {
        $answer = "---";
    }

    return $answer;
}

// Radio buttons
function qButtons($id) {
    $typeList = "0:IP,1:Port,2:Signature,3:SigID";
    $pairs = explode(",",$typeList);
    $itemCount = (count($pairs) - 1);
    if (!isset($_REQUEST[$id])) {
        $value = 0;
    } else {
        $value = $_REQUEST[$id];
    }

    for ($i = 0; $i <= $itemCount; $i++){
        list($type, $typeDesc) = explode(":",$pairs[$i]);

        if ($type == $value) {
            $checked='checked';
        } else {
            $checked='';
        }
        echo "\r<span style=\"vertical-align: -3;\"><input type=radio name=$id value=$type onClick=\"cFocus('base');\" $checked></span><span style=\"font-size: 7pt; vertical-align: 1;\">$typeDesc</span>";
    }
}

// Checkbox
function Segments($type) {
    $style = 'style="border: none; background: #e9e9e9;"';

    switch($type) {
        case 0:
            echo "\r<input type=checkbox name=oc1 $style checked><input type=checkbox name=oc2 $style checked><input type=checkbox name=oc3 $style checked><input type=checkbox name=oc4>";
            break;
        case 1:
            echo "\r<input type=checkbox name=sig1 $style checked><input type=checkbox name=sig2 $style checked>";
            break;
    }
}

// Time Picker
function qTime($type,$stop,$extra) {
   
    if(!isset($_REQUEST['sHour'])) { $sHour = $extra; } else { $sHour = $_REQUEST['sHour']; }
    if(!isset($_REQUEST['sMin'])) { $sMin = $extra; } else { $sMin = $_REQUEST['sMin']; }
    if(!isset($_REQUEST['sSec'])) { $sSec = $extra; } else { $sSec = $_REQUEST['sSec']; }
    if(!isset($_REQUEST['eHour'])) { $eHour = $extra; } else { $eHour = $_REQUEST['eHour']; } 
    if(!isset($_REQUEST['eMin'])) { $eMin = $extra; } else { $eMin = $_REQUEST['eMin']; }
    if(!isset($_REQUEST['eSec'])) { $eSec = $extra; } else { $eSec = $_REQUEST['eSec']; }
 
    if (($type == 'sh') && ($stop == 23)) {
        $selPart = $sHour;
    }

    if (($type == 'sm') && ($stop == 59)) {
        $selPart = $sMin;
    }

    if (($type == 'ss') && ($stop == 59)) {
        $selPart = $sSec;
    }

    if (($type == 'eh') && ($stop == 23)) {
        $selPart = $eHour;
    }

    if (($type == 'em') && ($stop == 59)) {
        $selPart = $eMin;
    }

    if (($type == 'es') && ($stop == 59)) {
        $selPart = $eSec;
    }

for ($i = 0; $i <= $stop; $i++) {
        // Pad single digits
        if (strlen($i) < 2) {
            $option = "0$i";
        } else {
            $option = $i;
        }

        if ($option == $selPart) {
            $selected="selected";
        } else {
            $selected="";
        }

        echo "<option value=\"$option\" $selected>$option</option>\n";
    }
}

// Status. Colourizes the ST column based on Category or priority (RT's).

function Status($status) {
    global $statusList;
    list ($long,$colour,$short) = explode("||",$statusList[$status]);
    return "<td class=sort style=\"background: $colour;\">$short</td>";
}

function SignatureLine($_sigName,$rC) {
    $sigName = htmlspecialchars(rtrim($_sigName));
    $rowID = "cm-sig-$rC";
    $html = "<td class=sort name=$rowID id=$rowID>$sigName</td>";
    return $html;
}

function SigidLine($sigID,$rC) {
     $rowID = "cm-sid-$rC";
     $html = "<td class=sort name=$rowID id=$rowID>$sigID</td>";
     return $html;
}

function IPLine($ip,$port,$type,$cc,$rC) {
    $rowID = "cm-${type}-$rC";
    $portID = "cm-${type[0]}port-$rC";
    $ccID = "cm-${type[0]}cc-$rC";
 
    if ($port == 'NA') {
        $phtml = '';
    } else {
        if ($port == '') {
            $phtml = "<td class=sort name=xxx id=xxx>--</td>";
        } else {
            $phtml = "<td class=sort name=$portID id=$portID>$port</td>";
        }
    }

    if ($cc == '42') {
        $cchtml = '';
    } else {
        if ($cc == '') {
            $cc = '--';
        }
        if (rfc1918($ip) == '0') {
            $cchtml = "<td class=sort name=$ccID id=$ccID style=\"padding: none; color: gray;\">$cc</td>";
        } else {
            $cchtml = "<td class=sort name=$ccID id=$ccID style=\"font-weight: bold;\">$cc</td>";
        }
    }

    $ipInt = sprintf("%u", ip2long($ip));

    $html = "<td sorttable_customkey=\"$ipInt\" class=sort name=$rowID id=$rowID>$ip</td>";
    $html.= "$phtml";
    $html.= "$cchtml";

    return $html;
}

function getSeverity($value,$steps,$startHex,$endHex) {
    $x = round($value);
    $start = hexdec($startHex);
    $end = hexdec($endHex);

    if ($x >= $steps) {
        $x = $steps;
    }

    $theR0 = ($start & 0xff0000) >> 16;
    $theG0 = ($start & 0x00ff00) >> 8;
    $theB0 = ($start & 0x0000ff) >> 0;

    $theR1 = ($end & 0xff0000) >> 16;
    $theG1 = ($end & 0x00ff00) >> 8;
    $theB1 = ($end & 0x0000ff) >> 0;
    $theR = interpolate($theR0, $theR1, $x, $steps);
    $theG = interpolate($theG0, $theG1, $x, $steps);
    $theB = interpolate($theB0, $theB1, $x, $steps);

    $theVal = ((($theR << 8) | $theG) << 8) | $theB;
    $result = sprintf("#%06X", $theVal);

    return $result;
}

function interpolate($pBegin, $pEnd, $pStep, $pMax) {
    if ($pBegin < $pEnd) {
      return (($pEnd - $pBegin) * ($pStep / $pMax)) + $pBegin;
    } else {
      return (($pBegin - $pEnd) * (1 - ($pStep / $pMax))) + $pEnd;
    }
}

function polar($colour) {
    $colour_red = hexdec(substr($colour, 1, 2)); 
    $colour_green = hexdec(substr($colour, 3, 2));
    $colour_blue = hexdec(substr($colour, 5, 2));
    $new_red = dechex(255 - $colour_red);
    $new_green = dechex(255  - $colour_green);
    $new_blue = dechex(255 - $colour_blue);

    if (strlen($new_red) == 1) {$new_red .= '0';}
    if (strlen($new_green) == 1) {$new_green .= '0';}
    if (strlen($new_blue) == 1) {$new_blue .= '0';}
    $answer = '#'.$new_red.$new_green.$new_blue;

   return $answer;
}

function rfc1918($ip) {  
    list($part1, $part2) = explode(".",$ip);
    
    if ($part1 == 10) {    
        return 0;
    } elseif ($part1 == 172 && $part2 >= 16 && $part2 <= 31) {
        return 0;
    } elseif ($part1 == 192 && $part2 == 168) {
        return 0;
    } else {
        return 1;
    }
}

function hextostr($x) {
  $s='';
  foreach(explode("\n",trim(chunk_split($x,2))) as $h) $s.=chr(hexdec($h));
  return($s);
}

function strtohex($x) {
  $s='';
  foreach(str_split($x) as $c) $s.=sprintf("%02X",ord($c));
  return($s);
} 

?>
