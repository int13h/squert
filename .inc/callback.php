<?php
$base = dirname(__FILE__);
//include "$base/session.php";
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
    echo "boo!";
}

function ec() {

    $when = hextostr(mysql_real_escape_string($_REQUEST['ts']));

    $query = "SELECT COUNT(*) AS count FROM event
              WHERE $when";

    $result = mysql_query($query);

    $rows = array();

    while ($row = mysql_fetch_assoc($result)) {
        $rows[] = $row;
    }
    $theJSON = json_encode($rows);
    echo $theJSON;

}

function si() {

    $sigID = $_REQUEST['sid'];
    global $rulePath;
    $wasMatched = '';
    $dirs = explode("||",$rulePath);
    $dc = (count($dirs) - 1);

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

    if ($wasMatched != 1) {
        $result = array("ruletxt" => "No match for signature ID $sigID",
                        "rulefile"  => "n/a",
                        "ruleline"  => "n/a",                 
        );
    }

    $theJSON = json_encode($result);
    echo $theJSON;

}

function eg() {

    global $dbTime;
    $sid = mysql_real_escape_string($_REQUEST['object']);
    $when = hextostr(mysql_real_escape_string($_REQUEST['ts']));

    $query = "SELECT COUNT(signature) AS count, CONVERT_TZ(MAX(timestamp),'+00:00','$dbTime') AS maxTime, INET_NTOA(src_ip) AS src_ip, map1.c_long as src_cc,
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

    global $dbTime;
    $comp = mysql_real_escape_string($_REQUEST['object']);
    $when = hextostr(mysql_real_escape_string($_REQUEST['ts']));
    list($type,$ln,$sid,$src_ip,$dst_ip) = explode(",", $comp);
    $src_ip = ip2long($src_ip);
    $dst_ip = ip2long($dst_ip);

    $query = "SELECT status, CONVERT_TZ(timestamp,'+00:00','$dbTime') AS timestamp, INET_NTOA(src_ip) AS src_ip,
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

$type();

?>
