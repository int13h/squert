<?php

session_start();

if (!(isset($_SESSION['sLogin']) && $_SESSION['sLogin'] != '')) {
    header ("Location: session.php?id=0");
    exit();
}

$base = dirname(__FILE__);
include_once "$base/config.php";
include_once "$base/functions.php";

$link = mysql_connect($dbHost,$dbUser,$dbPass);
$db = mysql_select_db($dbName,$link);

$type = $_REQUEST['type'];

$types = array(
                 0 => "es",
                 1 => "eg",
                 2 => "ed",
                 3 => "pd",
                 4 => "si",
                 5 => "tb",
                 6 => "ec",
                 7 => "tx",
                 8 => "fi",
);

$type = $types[$type];

if (!$type) {
    exit;
}

function ec() {

    $when = hextostr(mysql_real_escape_string($_REQUEST['ts']));

    $query = "SELECT COUNT(*) AS count FROM event
              LEFT JOIN sensor AS s ON event.sid = s.sid
              WHERE $when
              AND agent_type = 'snort'";

    $result = mysql_query($query);

    $rows = array();

    $row = mysql_fetch_assoc($result);
    $rows[] = $row;
    $theJSON = json_encode($rows);
    echo $theJSON;

}

function si() {

    function urlMkr($line) {
        $pattern = '/reference:url,([^;]+)/';
        $answer = preg_replace($pattern, 'reference:url,<a class=rref href="http://$1" target=rule>$1</a>',  $line);
        return $answer;
    }

    $object = $_REQUEST['sid'];
    list($sigID, $gID) = explode("-", $object);
    global $rulePath;
    $wasMatched = 0;
    $dirs = explode("||",$rulePath);

    if ( $gID > 100 ) {
        $dc = 0;
        $wasMatched = 2;
    } else { 
        $dc = (count($dirs) - 1);
    }

    for ($i = 0; $i <= $dc; $i++)
        if ($ruleDir = opendir($dirs[$i])) {
            while (false !== ($ruleFile = readdir($ruleDir))) {
                if ($ruleFile != "." && $ruleFile != "..") {
                    $ruleLines = file("$dirs[$i]/$ruleFile");
                    $lineNumber = 1;

                    foreach($ruleLines as $line) {

                        $searchCount = preg_match("/sid\:\s*$sigID\s*\;/",$line);

                        if($searchCount > 0) {
                            $tempMsg = preg_match("/\bmsg\s*:\s*\"(.+?)\"\s*;/i",$line,$ruleMsg);

                            $line = urlMkr(htmlspecialchars($line));
                            
                            $result = array("ruletxt"	=> $line,
                                            "rulefile"	=> $ruleFile,
                                            "ruleline"	=> $lineNumber,
                            );
                            $wasMatched = 1;
                            break;
                        }
                    $lineNumber++;
                    }
                }
           }

           closedir($ruleDir);
    }

    if ($wasMatched == 0) {
        $result = array("ruletxt" => "No match for signature ID $sigID",
                        "rulefile"  => "n/a",
                        "ruleline"  => "n/a",                 
        );
    }

    if ($wasMatched == 2) {
        $result = array("ruletxt" => "Generator ID > 100. This event belongs to a preprocessor or the decoder. <b>Generator ID:</b> $gID ",
                        "rulefile"  => "n/a",
                        "ruleline"  => "n/a",
        );
    }

    $theJSON = json_encode($result);
    echo $theJSON;

}

function es() {   
    global $offset;
    $object = mysql_real_escape_string($_REQUEST['object']);
    $parts = explode('-', $object);

    switch ($parts[1]) {
        case 'ccc':
            $filter = "AND (map1.cc = '$parts[2]' OR map2.cc = '$parts[2]')";
            break;
        default:
            $filter = "";
            break;
    }

    $when = hextostr(mysql_real_escape_string($_REQUEST['ts']));
 
    $query = "SELECT COUNT(event.signature) AS f1,
              event.signature AS f2,
              event.signature_id AS f3,
              event.signature_gen AS f4,
              MAX(CONVERT_TZ(event.timestamp,'+00:00','$offset')) AS f5,
              COUNT(DISTINCT(event.src_ip)) AS f6, 
              COUNT(DISTINCT(event.dst_ip)) AS f7,
              event.ip_proto AS f8,
              GROUP_CONCAT(DISTINCT(event.status)) AS f9,
              GROUP_CONCAT(DISTINCT(event.sid)) AS f10,
              GROUP_CONCAT(event.status) AS f11,
              GROUP_CONCAT(SUBSTRING(CONVERT_TZ(timestamp, '+00:00', '$offset'),12,2)) AS f12
              FROM event
              LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
              LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
              WHERE $when
              $filter
              GROUP BY f3
              ORDER BY f5 DESC";

    $result = mysql_query($query);

    $rows = array();

    while ($row = mysql_fetch_assoc($result)) {
        $rows[] = $row;
    }
    $theJSON = json_encode($rows);
    echo $theJSON;
}

function eg() {

    global $offset;
    $sid = mysql_real_escape_string($_REQUEST['object']);
    $when = hextostr(mysql_real_escape_string($_REQUEST['ts']));

    $query = "SELECT COUNT(signature) AS count, MAX(CONVERT_TZ(timestamp,'+00:00','$offset')) AS maxTime, 
              INET_NTOA(src_ip) AS src_ip, map1.c_long AS src_cc,
              INET_NTOA(dst_ip) AS dst_ip, map2.c_long AS dst_cc,
              map1.cc AS srcc, map2.cc AS dstc,
              GROUP_CONCAT(event.sid) AS c_sid, GROUP_CONCAT(event.cid) AS c_cid,
              GROUP_CONCAT(event.status) AS c_status,
              GROUP_CONCAT(SUBSTR(CONVERT_TZ(timestamp,'+00:00','$offset'),12,5)) AS c_ts,
              GROUP_CONCAT(SUBSTRING(CONVERT_TZ(timestamp, '+00:00', '$offset'),12,2)) AS f12
              FROM event
              LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
              LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
              WHERE $when
              AND signature_id = '$sid'
              GROUP BY event.src_ip, src_cc, event.dst_ip, dst_cc
              ORDER BY maxTime DESC";

    $result = mysql_query($query);

    $rows = array();

    while ($row = mysql_fetch_assoc($result)) {
        $rows[] = $row;
    }
    $theJSON = json_encode($rows);
    echo $theJSON;

}

function ed() {

    global $offset;
    $comp = mysql_real_escape_string($_REQUEST['object']);
    $when = hextostr(mysql_real_escape_string($_REQUEST['ts']));
    $adqp = hextostr(mysql_real_escape_string($_REQUEST['adqp']));

    if ($adqp === "empty") {
        $adqp = "";
    }

    list($ln,$sid,$src_ip,$dst_ip) = explode("-", $comp);
    $src_ip = sprintf("%u", ip2long($src_ip));
    $dst_ip = sprintf("%u", ip2long($dst_ip));

    $query = "SELECT status, CONVERT_TZ(timestamp,'+00:00','$offset') AS timestamp, INET_NTOA(src_ip) AS src_ip,
              src_port, INET_NTOA(dst_ip) AS dst_ip, dst_port, sid, cid, ip_proto
              FROM event
              WHERE $when
              $adqp
              AND (signature_id = '$sid' AND src_ip = '$src_ip' AND dst_ip = '$dst_ip')
              ORDER BY timestamp DESC";

    $result = mysql_query($query);
    $rows = array();

    while ($row = mysql_fetch_assoc($result)) {
        $rows[] = $row;
    }
    $theJSON = json_encode($rows);
    echo $theJSON;

}

function pd() {

    global $offset;
    $comp = mysql_real_escape_string($_REQUEST['object']);
    list($sid,$cid) = explode("-", $comp);

    $query = "SELECT INET_NTOA(src_ip), INET_NTOA(dst_ip), ip_ver, ip_hlen, ip_tos, ip_len, ip_id,ip_flags,
             ip_off, ip_ttl, ip_csum, src_port, dst_port, ip_proto, signature, signature_id, CONVERT_TZ(timestamp,'+00:00','$offset')
             FROM event
             WHERE sid='$sid' and cid='$cid'";

    $result = mysql_query($query);

    $rows = array();

    $row = mysql_fetch_assoc($result);
    $rows[] = $row;
    $ipp = $row["ip_proto"];

    // Protocol
    switch ($ipp) {

        case 1:
            $query = "SELECT event.icmp_type AS icmp_type, event.icmp_code AS icmp_code, icmphdr.icmp_csum AS icmp_csum, 
                      icmphdr.icmp_id AS icmp_id, icmphdr.icmp_seq AS icmp_seq
                      FROM event, icmphdr WHERE event.sid=icmphdr.sid AND event.cid=icmphdr.cid AND event.sid='$sid'
                      AND event.cid='$cid'";
            
            $result = mysql_query($query);

            $row = mysql_fetch_assoc($result);
            $rows[] = $row;
            break;

        case 6:
            $query = "SELECT tcp_seq, tcp_ack, tcp_off, tcp_res, tcp_flags, tcp_win, tcp_urp, tcp_csum
                      FROM tcphdr WHERE sid='$sid' and cid='$cid'";
            
            $result = mysql_query($query);

            $row = mysql_fetch_assoc($result);
            $rows[] = $row;
            break;
         
        case 17:
            $query = "SELECT udp_len, udp_csum FROM udphdr WHERE sid='$sid' and cid='$cid'";

            $result = mysql_query($query);

            $row = mysql_fetch_assoc($result);
            $rows[] = $row;
            break;
    }

    // Data
    $query = "SELECT data_payload FROM data WHERE sid='$sid' AND cid='$cid'";

    $result = mysql_query($query);

    $row = mysql_fetch_assoc($result);
    $rows[] = $row;
    $theJSON = json_encode($rows);
    echo $theJSON;

}

function tb() {
    //session_start();
    $tab = $_REQUEST['tab'];
    $_SESSION['sTab'] = $tab;
}

function tx() {

    global $offset;
    $txdata = hextostr($_REQUEST['txdata']);
    list($sid, $timestamp, $sip, $spt, $dip, $dpt) = explode("|", $txdata);

    // Lookup sensorname
    $query = "SELECT hostname FROM sensor
              WHERE sid = '$sid'";

    $qResult = mysql_query($query);
    
    $sensorName = mysql_result($qResult, 0);
 
    if ($offset != "+00:00") {
        $timestamp = gmdate("Y-m-d H:i:s", strtotime($timestamp));
    }

    $cmd = "cliscript.tcl -sensor \"$sensorName\" -timestamp \"$timestamp\" -sid $sid -sip $sip -spt $spt -dip $dip -dpt $dpt";

    exec("../.scripts/$cmd",$raw);

    $fmtd = $debug = '';

    foreach ($raw as $line) {

        $line = htmlspecialchars($line);
        $type = substr($line, 0,3);

        switch ($type) {
            case "DEB": $debug .= preg_replace('/^DEBUG:.*$/', "<span class=txtext_dbg>$0</span>", $line) . "<br>"; $line = ''; break;
            case "HDR": $line = preg_replace('/(^HDR:)(.*$)/', "<span class=txtext_hdr>$2</span>", $line); break;
            case "DST": $line = preg_replace('/^DST:.*$/', "<span class=txtext_dst>$0</span>", $line); break;
            case "SRC": $line = preg_replace('/^SRC:.*$/', "<span class=txtext_src>$0</span>", $line); break;
        }

        if (strlen($line) > 0) {
            $fmtd  .= $line . "<br>";
        }
    }

    $fmtd  .= "<br>" . $debug;
    $result = array("tx"  => "$fmtd",
                    "dbg" => "$debug",
                    "cmd" => "$cmd");

    $theJSON = json_encode($result);
    echo $theJSON;
}

function fi() {   
    $user = mysql_real_escape_string($_REQUEST['user']);
    $mode = mysql_real_escape_string($_REQUEST['mode']);

    switch ($mode) {
        case "query"  : 
            $query = "SELECT name, alias, HEX(filter) as filter, notes, age
                      FROM filters
                      WHERE username = '$user'
                      ORDER BY name DESC";

            $result = mysql_query($query);

            $rows = array();

            while ($row = mysql_fetch_assoc($result)) {
                $rows[] = $row;
            }

            $theJSON = json_encode($rows); 

            break;

        case "update" :
            $data = hextostr($_REQUEST['data']);
            list($alias, $name, $notes, $filter) = explode("||", $data); 
            $filter = mysql_real_escape_string($filter);

            $query = "INSERT INTO filters (name,alias,username,filter,notes)
                      VALUES ('$name','$alias','$user','$filter','$notes')
                      ON DUPLICATE KEY UPDATE 
                      name='$name',alias='$alias',filter='$filter',notes='$notes'";

            mysql_query($query);
            $result = mysql_error();
            $return = array("msg" => $result);
            $theJSON = json_encode($return);

            break;

        case "remove" : 
            $alias =  mysql_real_escape_string($_REQUEST['data']);  
            $query = "DELETE FROM filters WHERE username = '$user' AND alias = '$alias'";
            mysql_query($query);
            $result = mysql_error();
            $return = array("msg" => $result);
            $theJSON = json_encode($return); 

            break;

    }

    echo $theJSON;

}

$type();

?>
