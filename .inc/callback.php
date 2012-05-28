<?php
$base = dirname(__FILE__);
include_once "$base/config.php";
include_once "$base/functions.php";

$link = mysql_connect($dbHost,$dbUser,$dbPass);
$db = mysql_select_db($dbName,$link);

$type = $_REQUEST['type'];

$types = array(
                 0 => "ec",
                 1 => "si",
                 2 => "eg",
                 3 => "ed",
                 4 => "pd",
);

$type = $types[$type];

if (!$type) {
    exit;
}

function ec() {

    $when = hextostr(mysql_real_escape_string($_REQUEST['ts']));

    $query = "SELECT COUNT(*) AS count FROM event
              WHERE $when";

    $result = mysql_query($query);

    $rows = array();

    $row = mysql_fetch_assoc($result);
    $rows[] = $row;
    $theJSON = json_encode($rows);
    echo $theJSON;

}

function si() {

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

function eg() {

    global $offset;
    $sid = mysql_real_escape_string($_REQUEST['object']);
    $when = hextostr(mysql_real_escape_string($_REQUEST['ts']));

    $query = "SELECT COUNT(signature) AS count, MAX(CONVERT_TZ(timestamp,'+00:00','$offset')) AS maxTime, INET_NTOA(src_ip) AS src_ip, map1.c_long as src_cc,
              INET_NTOA(dst_ip) AS dst_ip, map2.c_long as dst_cc
              FROM event
              LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
              LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
              WHERE $when
              AND signature_id = '$sid'
              GROUP BY src_ip, src_cc, dst_ip, dst_cc
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
    list($type,$ln,$sid,$src_ip,$dst_ip) = explode(",", $comp);
    $src_ip = sprintf("%u", ip2long($src_ip));
    $dst_ip = sprintf("%u", ip2long($dst_ip));

    $query = "SELECT status, CONVERT_TZ(timestamp,'+00:00','$offset') AS timestamp, INET_NTOA(src_ip) AS src_ip,
              src_port, INET_NTOA(dst_ip) AS dst_ip, dst_port, sid, cid, ip_proto
              FROM event
              WHERE $when
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
    list($type,$ln,$sid,$cid) = explode(",", $comp);

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

$type();

?>
