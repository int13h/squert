<?php
// Terminate if this launches without a valid session
session_start();
if (!(isset($_SESSION['sLogin']) && $_SESSION['sLogin'] != '')) {
  header ("Location: session.php?id=0");
  exit();
}

$base = dirname(__FILE__);
include_once "$base/config.php";
include_once "$base/functions.php";
// PDO prepared statements
try {
	// first connect to database with the PDO object. 
	$dbpdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=latin1", "$dbUser", "$dbPass", [
	PDO::ATTR_EMULATE_PREPARES => false, 
	PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => false,
	PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
	]); 
} catch(PDOException $e){
	// if connection fails, log PDO error. 
	error_log("Error connecting to mysql: ". $e->getMessage());
}
$type = $_REQUEST['type'];

$types = array(
  '0' => 'level0',
  '1' => 'level1',
  '2' => 'level2',
  '2a' => 'level2a',
  '3' => 'payload',
  '4' => 'signatures',
  '5' => 'tab',
  '6' => 'ec',
  '7' => 'transcript',
  '8' => 'filters',
  '9' => 'cat',
  '10' => 'map',
  '11' => 'comments',
  '12' => 'remove_comment',
  '13' => 'sensors',
  '14' => 'user_profile',
  '15' => 'summary',
  '16' => 'view',
  '17' => 'autocat',
  '18' => 'esquery',
  '19' => 'addremoveobject',
  '20' => 'getcolour',
  '21' => 'objhistory',
  '22' => 'times',
);

$type = $types[$type];

if (isset($_REQUEST['ts'])) {
  // Need EC
  $tsParts = explode("|", hextostr($_REQUEST['ts']));
  $sdate  = $tsParts[0]; 
  $edate  = $tsParts[1];
  $stime  = $tsParts[2];
  $etime  = $tsParts[3];
  $offset = $tsParts[4];
  $start  = "CONVERT_TZ('$sdate $stime','$offset','+00:00')";
  $end    = "CONVERT_TZ('$edate $etime','$offset','+00:00')"; 
  $when   = "event.timestamp BETWEEN $start AND $end";
  // combine start date and start time for prepared statements
  $sdatetime = "$sdate $stime";
  // combine end date and end time for prepared statements
  $edatetime = "$edate $etime";
}

// user can specify sensors
$sensors = '';
$sensorsclean = '';
$in = '';
$sensor_params = array();
if (isset($_REQUEST['sensors'])) {
  $sensors = hextostr($_REQUEST['sensors']);
  if ($sensors == 'empty') {
    $sensors = '';
  } else {
    // $sensors looks like this:
    // AND event.sid IN('3','1')
    // let's clean that up so we can use prepared statements
    $sensorsclean = ltrim($sensors, 'AND event.sid IN(');  
    $sensorsclean = rtrim($sensorsclean, ')');
    $sensorsclean = str_replace("'","", $sensorsclean);
    // now we need to dynamically build IN for prepared statement based on:
    // https://phpdelusions.net/pdo#like
    $ids = explode(",", $sensorsclean);
    foreach ($ids as $i => $item)
    {
      $key = ":id".$i;
      $in .= "$key,";
      $sensor_params[$key] = $item; // collecting values into key-value array
    }
    $in = rtrim($in,","); // :id0,:id1,:id2
    $sensors = "AND event.sid IN($in)";
  }
}

// rt is the queue-only toggle on the left side of the EVENTS tab
$rt = "";
if (isset($_REQUEST['rt']) && $_REQUEST['rt'] == 1) {
  $rt = "AND event.status = 0";
}

// $sv is for sorting.  For example: DESC
// this cannot be done via prepared statement, so we use a whitelist approach
$sv = "";
if (isset($_REQUEST['sv'])) {
  $sv = $_REQUEST['sv'] == 'DESC' ? 'DESC' : 'ASC';
}

// many functions below rely on filters so let's build that out now
if (isset($_REQUEST['filter'])) {
  $filter = hextostr($_REQUEST['filter']);
  // $filter comes from the filter box in the upper right corner of the EVENTS tab.  Default: empty
  if ($filter != 'empty') {
    if (substr($filter, 0,4) == 'cmt ') {
      // user entered cmt into the filter box
      // pull their filter out and place it into the prepared statement array
      $comment = explode('cmt ', $filter);
      $filtercmt = $comment[1];
      $qp2 = "LEFT JOIN history ON event.sid = history.sid AND event.cid = history.cid 
                WHERE history.comment = :filtercmt";
      // build parameters for prepared statement
      $qp2_params = [":filtercmt" => "$filtercmt"];
    } else {
      // if the user didn't enter cmt, then they may be using one of the built-in filters
      // for example, if the user wants to search for alerts with src or dst ip in US:
      // cc us
      // we'll then receive the following:
      // (msrc.cc = 'us' OR mdst.cc = 'us')
      // the general strategy is to try to match this with one of the built-in filters to ensure validity
      // then build a prepared statement
      // this needs to be fixed
      $filter = str_replace('&lt;','<', $filter);
      $filter = str_replace('&gt;','>', $filter);
      // build parameters for prepared statement
      $qp2_params = [":sdatetime" => "$sdatetime", ":edatetime" => "$edatetime", ":soffset" => "$offset", ":eoffset" => "$offset"];
      // find whatever is enclosed in single ticks and replace with $
      $exploded=explode("'",$filter);
      $filtervar=$exploded[1];
      $compfilter = str_replace($filtervar, '$', $filter);
      // retrieve all valid filters from database
      $statement="SELECT UNHEX(filter) from filters where type='filter';";
      $query = $dbpdo->prepare("$statement");
      $query->execute();
      $rows = $query->fetchAll(PDO::FETCH_BOTH);
      // search for user filter in list of valid filters
      $newfilter = "";
      $filter = "";
      // "signature LIKE" is a special case
      if ( "$compfilter" == "(signature LIKE '$' OR signature LIKE '$')" ) {
        $filter = "AND (signature LIKE :filtervar1 OR signature LIKE :filtervar2)";
        $qp2_params[":filtervar1"] = "%$filtervar%";
        $qp2_params[":filtervar2"] = "%$filtervar%";
      } else {
        foreach ($rows as $row) {
          if ( "$compfilter" == "$row[0]" ) {
            $newfilter = $row[0];
            $i=0;
            while (strpos($newfilter, "'\$'") !== false) {
              $newfilter = preg_replace('/\'\$\'/', ":filtervar$i", "$newfilter", 1);
              $qp2_params[":filtervar$i"] = $filtervar;
              $i++;
            }
            $filter = "AND " . $newfilter;
          }
        }
      }
      $qp2 = "WHERE event.timestamp BETWEEN CONVERT_TZ(:sdatetime,:soffset,'+00:00') AND CONVERT_TZ(:edatetime,:eoffset,'+00:00')
        $sensors
        $filter
        $rt";
    }
  } else {
    // filter box was empty so we'll just build a prepared statement using sensors and rt values
    $qp2 = "WHERE event.timestamp BETWEEN CONVERT_TZ(:sdatetime,:soffset,'+00:00') AND CONVERT_TZ(:edatetime,:eoffset,'+00:00')
      $sensors
      $rt";
    // build parameters for prepared statement
    $qp2_params = [":sdatetime" => "$sdatetime", ":edatetime" => "$edatetime", ":soffset" => "$offset", ":eoffset" => "$offset"];
  }
}

if (!$type) {
  exit;
}

function ec() {
  // This function returns event count grouped by status.
  // This is used to populate the numbers in the Classification section on the left side of the EVENTS tab.
  // This function has been updated to use PDO prepared statements.
  global $sdatetime, $edatetime, $offset, $sensors, $sensor_params, $dbpdo;

  // build statement
  $statement = "SELECT COUNT(status) AS count, status FROM event LEFT JOIN sensor AS s ON event.sid = s.sid 
	WHERE event.timestamp BETWEEN CONVERT_TZ(:sdatetime,:soffset,'+00:00') AND CONVERT_TZ(:edatetime,:eoffset,'+00:00')
	$sensors
	GROUP BY status;";
  // debug
  //error_log("$statement");
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // build parameters for prepared statement
  $params = [":sdatetime" => "$sdatetime", ":edatetime" => "$edatetime", ":soffset" => "$offset", ":eoffset" => "$offset"];
  // execute the prepared statement and pass it the local params array and the sensor_params array
  $query->execute(array_merge($params,$sensor_params));
  // fetch the data and encode to json
  $rows = $query->fetchAll(PDO::FETCH_ASSOC); 
  $theJSON = json_encode($rows);
  echo $theJSON;
}

function signatures() {

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

  if ( $gID == 10001 ) {
	$result = array("ruletxt" => "Generator ID $gID. OSSEC rules can be found in /var/ossec/rules/.",
		"rulefile"  => "n/a",
		"ruleline"  => "n/a",
		);
  } elseif ( $gID != 1 && $gID != 3 ) {
	$result = array("ruletxt" => "Generator ID $gID. This event belongs to a preprocessor or decoder.",
		"rulefile"  => "n/a",
		"ruleline"  => "n/a",
		);
  } else { 
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
  }

  $theJSON = json_encode($result);
  echo $theJSON;
}

function level0() {   
  // This function returns the aggegrated event data in the main section of the EVENTS tab.
  // This function has been updated to use PDO prepared statements.
  global $offset, $when, $sensors, $rt, $sdatetime, $edatetime, $sensor_params, $dbpdo, $qp2, $qp2_params, $sv;
  // build statement
  $statement="SELECT COUNT(event.signature) AS f1,
    event.signature AS f2,
    event.signature_id AS f3,
    event.signature_gen AS f4,
    MAX(CONVERT_TZ(event.timestamp,'+00:00',:maxoffset)) AS f5,
    COUNT(DISTINCT(event.src_ip)) AS f6, 
    COUNT(DISTINCT(event.dst_ip)) AS f7,
    event.ip_proto AS f8,
    GROUP_CONCAT(DISTINCT(event.status)) AS f9,
    GROUP_CONCAT(DISTINCT(event.sid)) AS f10,
    GROUP_CONCAT(event.status) AS f11,
    GROUP_CONCAT(SUBSTRING(CONVERT_TZ(event.timestamp, '+00:00', :groupoffset),12,2)) AS f12,
    event.priority AS f13,
    GROUP_CONCAT(DISTINCT(src_tag.value)) AS f14,
    GROUP_CONCAT(DISTINCT(dst_tag.value)) AS f15              
    FROM event
    LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
    LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip
    LEFT JOIN object_mappings AS src_tag ON event.src_ip = src_tag.object AND src_tag.type = 'tag'
    LEFT JOIN object_mappings AS dst_tag ON event.dst_ip = dst_tag.object AND dst_tag.type = 'tag'
    $qp2
    GROUP BY f3
    ORDER BY f5 $sv";
  // add params for local part of statement
  $local_params[':maxoffset'] = "$offset";
  $local_params[':groupoffset'] = "$offset";
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // merge params
  $merged_params = array_merge($local_params, $sensor_params, $qp2_params);
  // debug
  //error_log("statement: $statement");
  //error_log("merged_params: " . print_r($merged_params,1));
  // execute the prepared statement with the params
  $query->execute($merged_params);
  // fetch the data and encode to json
  $rows = $query->fetchAll(PDO::FETCH_ASSOC);
  $theJSON = json_encode($rows);
  echo $theJSON;
}

function level1() {
  // This function is called when the user clicks a number in the Queue column to drill into a group of aggregated events.
  // This function has been updated to use PDO prepared statements.
  global $offset, $when, $sensors, $rt, $sdatetime, $edatetime, $sensor_params, $dbpdo, $qp2, $qp2_params, $sv;
  // sid is signature_id (snort/suricata ID, OSSEC rule ID, etc.)
  $sid = $_REQUEST['object'];
  // add sid to $qp2 and $qp2_params
  $qp2 = "$qp2
    AND event.signature_id = :sid";
  $qp2_params[':sid'] = "$sid";
  // build statement
  $statement = "SELECT COUNT(event.signature) AS count,
    MAX(CONVERT_TZ(event.timestamp,'+00:00', :maxoffset)) AS maxTime,
    INET_NTOA(event.src_ip) AS src_ip,
    msrc.c_long AS src_cc,
    INET_NTOA(event.dst_ip) AS dst_ip,
    mdst.c_long AS dst_cc,
    msrc.cc AS srcc,
    mdst.cc AS dstc,
    osrc.value AS scolour,
    odst.value AS dcolour,
    GROUP_CONCAT(event.sid) AS c_sid,
    GROUP_CONCAT(event.cid) AS c_cid,
    GROUP_CONCAT(event.status) AS c_status,
    GROUP_CONCAT(SUBSTR(CONVERT_TZ(event.timestamp,'+00:00', :groupoffset1),12,5)) AS c_ts,
    GROUP_CONCAT(SUBSTRING(CONVERT_TZ(event.timestamp, '+00:00', :groupoffset2),12,2)) AS f12,
    event.priority AS f13,
    msrc.age AS src_age,
    mdst.age AS dst_age,
    GROUP_CONCAT(DISTINCT(src_tag.value)) AS f14,
    GROUP_CONCAT(DISTINCT(dst_tag.value)) AS f15
    FROM event
    LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
    LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip
    LEFT JOIN object_mappings AS osrc ON event.src_ip = osrc.object AND osrc.type = 'ip_c'
    LEFT JOIN object_mappings AS odst ON event.dst_ip = odst.object AND odst.type = 'ip_c'
    LEFT JOIN object_mappings AS src_tag ON event.src_ip = src_tag.object AND src_tag.type = 'tag'
    LEFT JOIN object_mappings AS dst_tag ON event.dst_ip = dst_tag.object AND dst_tag.type = 'tag'
    $qp2
    GROUP BY event.src_ip, event.dst_ip
    ORDER BY maxTime $sv";
  // add params for local part of statement
  $local_params[':maxoffset'] = "$offset";
  $local_params[':groupoffset1'] = "$offset";
  $local_params[':groupoffset2'] = "$offset";
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // merge params
  $merged_params = array_merge($local_params, $sensor_params, $qp2_params);
  // debug
  //error_log("statement: $statement");
  //error_log("merged_params: " . print_r($merged_params,1));
  // execute the prepared statement with the params
  $query->execute($merged_params);
  // fetch the data and encode to json
  $rows = $query->fetchAll(PDO::FETCH_ASSOC);
  $theJSON = json_encode($rows);
  echo $theJSON;
}

function level2() {
  // This function is called when the user clicks a number in the Queue column in the second level of aggregation.
  // This function has been updated to use PDO prepared statements.
  global $offset, $when, $sensors, $rt, $qp2, $qp2_params, $sensor_params, $sv, $dbpdo;
  $comp = $_REQUEST['object'];
  list($ln,$sid,$src_ip,$dst_ip) = explode("-", $comp);
  $src_ip = sprintf("%u", ip2long($src_ip));
  $dst_ip = sprintf("%u", ip2long($dst_ip));

  // add sid, src_ip, and dst_ip to $qp2 and $qp2_params
  $qp2 = "$qp2
      AND (event.signature_id = :sid 
      AND event.src_ip = :src_ip 
      AND event.dst_ip = :dst_ip)";
  $qp2_params[':sid'] = "$sid";
  $qp2_params[':src_ip'] = "$src_ip";
  $qp2_params[':dst_ip'] = "$dst_ip";

  // build statement using $qp2
  $statement = "SELECT event.status AS f1, 
    CONCAT_WS(',',CONVERT_TZ(event.timestamp,'+00:00',:concatoffset),event.timestamp) AS f2,
    INET_NTOA(event.src_ip) AS f3,
    event.src_port AS f4,
    INET_NTOA(event.dst_ip) AS f5,
    event.dst_port AS f6, 
    event.sid AS f7,
    event.cid AS f8,
    event.ip_proto AS f9,
    event.signature AS f10,
    event.signature_id AS f11,
    event.priority AS f12,
    GROUP_CONCAT(DISTINCT(src_tag.value)) AS f13,
    GROUP_CONCAT(DISTINCT(dst_tag.value)) AS f14
    FROM event
    LEFT JOIN object_mappings AS src_tag ON event.src_ip = src_tag.object AND src_tag.type = 'tag'
    LEFT JOIN object_mappings AS dst_tag ON event.dst_ip = dst_tag.object AND dst_tag.type = 'tag'
    $qp2
    GROUP BY event.sid,event.cid
    ORDER BY event.timestamp $sv";

  // add params for local part of statement
  $local_params[':concatoffset'] = "$offset";
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // merge params
  $merged_params = array_merge($local_params, $sensor_params, $qp2_params);
  // debug
  //error_log("statement: $statement");
  //error_log("merged_params: " . print_r($merged_params,1));
  // execute the prepared statement with the params
  $query->execute($merged_params);
  // fetch the data and encode to json
  $rows = $query->fetchAll(PDO::FETCH_ASSOC);
  // the frontend expects all values to be strings
  for ($i=0;$i<count($rows);$i++) {
    $rows[$i] = array_map('strval', $rows[$i]);
  }
  $theJSON = json_encode($rows);
  echo $theJSON;

}

function level2a() {
  // This function is called when grouping is turned off.
  // This function has been updated to use PDO prepared statements.
  global $offset, $when, $sensors, $rt, $qp2, $qp2_params, $sensor_params, $sv, $dbpdo;
  // build statement
  $statement = "SELECT event.status AS f1, 
    CONCAT_WS(',',CONVERT_TZ(event.timestamp,'+00:00',:concatoffset),event.timestamp) AS f2,
    INET_NTOA(event.src_ip) AS f3,
    event.src_port AS f4, 
    msrc.c_long AS f5,
    msrc.cc AS f6,          
    INET_NTOA(event.dst_ip) AS f7, 
    event.dst_port AS f8,
    mdst.c_long AS f9,
    mdst.cc AS f10,
    event.sid AS f11,
    event.cid AS f12, 
    event.ip_proto AS f13,
    event.signature AS f14,
    event.signature_id AS f15,
    event.priority AS f16,
    event.signature_gen AS f17,
    osrc.value AS f18,
    odst.value AS f19,
    msrc.age AS f20,
    mdst.age AS f21
    FROM event
    LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
    LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip
    LEFT JOIN object_mappings AS osrc ON event.src_ip = osrc.object AND osrc.type = 'ip_c'
    LEFT JOIN object_mappings AS odst ON event.dst_ip = odst.object AND odst.type = 'ip_c'
    $qp2
    GROUP BY event.sid, event.cid
    ORDER BY event.timestamp $sv";
  // add params for local part of statement
  $local_params[':concatoffset'] = "$offset";
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // merge params
  $merged_params = array_merge($local_params, $sensor_params, $qp2_params);
  // debug
  //error_log("statement: $statement");
  //error_log("merged_params: " . print_r($merged_params,1));
  // execute the prepared statement with the params
  $query->execute($merged_params);
  // fetch the data and encode to json
  $rows = $query->fetchAll(PDO::FETCH_ASSOC);
  $theJSON = json_encode($rows);
  echo $theJSON;
}

function payload() {
  // This function retrieves the payload of the event.
  // This function has been updated to use PDO prepared statements.

  global $offset, $dbpdo;
  $comp = $_REQUEST['object'];
  list($sid,$cid) = explode("-", $comp);

  $statement = "SELECT INET_NTOA(event.src_ip), 
              INET_NTOA(event.dst_ip),
              event.ip_ver, event.ip_hlen, event.ip_tos,
              event.ip_len, event.ip_id, event.ip_flags,
              event.ip_off, event.ip_ttl, event.ip_csum,
              event.src_port, event.dst_port, event.ip_proto,
              event.signature, event.signature_id,
              CONVERT_TZ(event.timestamp,'+00:00', :offset), event.sid, event.cid,
              GROUP_CONCAT(history.comment SEPARATOR ' || ') AS comment,
              GROUP_CONCAT(src_tag.value) AS srctag,
              GROUP_CONCAT(dst_tag.value) AS dsttag
              FROM event
              LEFT JOIN history ON event.sid = history.sid AND event.cid = history.cid
              LEFT JOIN object_mappings AS src_tag ON event.src_ip = src_tag.object AND src_tag.type = 'tag'
              LEFT JOIN object_mappings AS dst_tag ON event.dst_ip = dst_tag.object AND dst_tag.type = 'tag'
              WHERE event.sid=:sid AND event.cid=:cid";
  // debug
  //error_log("$statement");
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // build parameters for prepared statement
  $params = [":offset" => "$offset", ":sid" => "$sid", ":cid" => "$cid"];
  // execute the prepared statement with params
  $query->execute(array_merge($params));
  // fetch the data
  $row = $query->fetchall(PDO::FETCH_ASSOC);
  $rows = array();
  if (array_key_exists(0, $row)) {
    $rows[] = $row[0];
  }
  $ipp = $row[0]["ip_proto"];

  // Protocol
  switch ($ipp) {

  case 1:
    $statement = "SELECT event.icmp_type AS icmp_type,
      event.icmp_code AS icmp_code,
      icmphdr.icmp_csum AS icmp_csum, 
      icmphdr.icmp_id AS icmp_id,
      icmphdr.icmp_seq AS icmp_seq
      FROM event, icmphdr
      WHERE event.sid=icmphdr.sid
      AND event.cid=icmphdr.cid
      AND event.sid=:sid
      AND event.cid=:cid";
    // debug
    //error_log("$statement");
    // prepare statement
    $query = $dbpdo->prepare("$statement");
    // build parameters for prepared statement
    $params = [":sid" => "$sid", ":cid" => "$cid"];
    // execute the prepared statement with params
    $query->execute(array_merge($params));
    // fetch the data
    $row = $query->fetchall(PDO::FETCH_ASSOC);
    if (array_key_exists(0, $row)) {
      $rows[] = $row[0];
    }
    break;

  case 6:
    $statement = "SELECT tcp_seq, tcp_ack, tcp_off, tcp_res, tcp_flags, tcp_win, tcp_urp, tcp_csum
      FROM tcphdr 
      WHERE sid=:sid AND cid=:cid";
    // prepare statement
    $query = $dbpdo->prepare("$statement");
    // build parameters for prepared statement
    $params = [":sid" => "$sid", ":cid" => "$cid"];
    // execute the prepared statement with params
    $query->execute(array_merge($params));
    // fetch the data
    $row = $query->fetchall(PDO::FETCH_ASSOC);
    if (array_key_exists(0, $row)) {
      $rows[] = $row[0];
    }
    break;

  case 17:
    $statement = "SELECT udp_len, udp_csum 
      FROM udphdr 
      WHERE sid=:sid AND cid=:cid";
    // prepare statement
    $query = $dbpdo->prepare("$statement");
    // build parameters for prepared statement
    $params = [":sid" => "$sid", ":cid" => "$cid"];
    // execute the prepared statement with params
    $query->execute(array_merge($params));
    // fetch the data
    $row = $query->fetchall(PDO::FETCH_ASSOC);
    if (array_key_exists(0, $row)) {
      $rows[] = $row[0];
    }
    break;
  default:
    $result = array(0 => 0);
    $rows[] = $row;
    break;
  }
  // Data
  $statement = "SELECT data_payload 
    FROM data 
    WHERE sid=:sid AND cid=:cid";
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // build parameters for prepared statement
  $params = [":sid" => "$sid", ":cid" => "$cid"];
  // execute the prepared statement with params
  $query->execute(array_merge($params));
  // fetch the data and encode to json
  $row = $query->fetchall(PDO::FETCH_ASSOC);
  if (array_key_exists(0, $row)) {
    $rows[] = $row[0];
    // Add the row again for Bro agent
    $rows[] = $row[0];
  }
  $theJSON = json_encode($rows);
  echo $theJSON;
}

function tab() {
  $tab = $_REQUEST['tab'];
  $_SESSION['sTab'] = $tab;
}

function transcript() {
	# We no longer use Squert's native transcript functionality.
	# Squert now pivots to CapMe for transcripts.
}

function filters() {   
  // This function queries and updates the filters table.
  // This function has been updated to use PDO prepared statements.
  global $dbpdo;
  $user = $_SESSION['sUser'];
  $mode = $_REQUEST['mode'];

  switch ($mode) {
  case "query"  : 
    $statement = "SELECT type, UNHEX(name) AS name, alias, filter, UNHEX(notes) as notes, age, global, username
      FROM filters 
      ORDER BY global,name ASC";

    $rows = array();

    // debug
    //error_log("$statement");
    // prepare statement
    $query = $dbpdo->prepare("$statement");
    // execute the prepared statement with params
    $query->execute();
    # iterate through each row of the filter table
    while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
	# for each field in that row, we need to sanitize before output
	foreach ($row as &$value) {
		# https://paragonie.com/blog/2015/06/preventing-xss-vulnerabilities-in-php-everything-you-need-know
		$value = htmlentities($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
	}
	# must unset $value per http://php.net/manual/en/control-structures.foreach.php
	unset($value);
	# now add the sanitized row to the $rows array
	$rows[] = $row;
    }

    $theJSON = json_encode($rows); 

    break;

  case "update" :
    $data = hextostr($_REQUEST['data']);
    list($type, $alias, $name, $notes, $filter) = explode("||", $data);
    $name = strtohex($name);
    $notes = strtohex($notes);
    $remove = array("DELETE","UPDATE","INSERT","SELECT","CONCAT",
      "REVERSE","REPLACE","RLIKE","SUBSTR","SUBSTRING");
    $filter = str_ireplace($remove, "", $filter);
    $filter = strtohex($filter);

    $statement = "INSERT INTO filters (type,name,alias,username,filter,notes)
      VALUES (:type1,:name1,:alias1,:user1,:filter1,:notes1)
      ON DUPLICATE KEY UPDATE 
      type=:type2,name=:name2,alias=:alias2,filter=:filter2,notes=:notes2";
    // debug
    //error_log("$statement");
    // prepare statement
    $query = $dbpdo->prepare("$statement");
    // build parameters for prepared statement
    $params = [":type1" => "$type", ":name1" => "$name", ":alias1" => "$alias", ":user1" => "$user", ":filter1" => "$filter", ":notes1" => "$notes", ":type2" => "$type", ":name2" => "$name", ":alias2" => "$alias", ":filter2" => "$filter", ":notes2" => "$notes"];
    // execute the prepared statement with params
    $query->execute(array_merge($params));
    // check for errors
    $error = $query->errorInfo();
    $result = "";
    // if there was no error, then $error[2] should be null
    if ( ! is_null($error[2]) ) {
      $result = $error[2];
    }

    $return = array("msg" => $result);
    $theJSON = json_encode($return);

    break;

  case "remove" : 
    $alias = $_REQUEST['data'];
    $statement = "DELETE FROM filters WHERE username = :user AND (alias = :alias AND global = 0)";
    // debug
    //error_log("$statement");
    // prepare statement
    $query = $dbpdo->prepare("$statement");
    // build parameters for prepared statement
    $params = [":user" => "$user", ":alias" => "$alias"];
    // execute the prepared statement with the params
    $query->execute(array_merge($params));
    // check for errors
    $error = $query->errorInfo();
    $result = "";
    // if there was no error, then $error[2] should be null
    if ( ! is_null($error[2]) ) {
      $result = $error[2];
    }

    $return = array("msg" => $result);
    $theJSON = json_encode($return); 

    break;

  }

  echo $theJSON;

}

function cat() {
  $catdata = $_REQUEST['catdata'];
  $usr     = $_SESSION['sUser'];
  $pwd     = $_SESSION['sPass'];

  list($cat, $msg, $lst) = explode("|||", $catdata);
  $msg = htmlentities($msg);

  $cmdusr = escapeshellarg($usr);
  $cmdcat = escapeshellarg($cat);
  $cmdmsg = escapeshellarg($msg);
  $cmdlst = escapeshellarg($lst);

  $cmd = "../.scripts/clicat.tcl 0 $cmdusr $cmdcat $cmdmsg $cmdlst";
  $descspec = array(
    0 => array("pipe", "r"),
    1 => array("pipe", "w")
  );

  $proc = proc_open($cmd, $descspec, $pipes);
  $debug = "Process execution failed";
  if (is_resource($proc)) {
    fwrite($pipes[0], $pwd);
    fclose($pipes[0]);
    $debug = fgets($pipes[1]);
    fclose($pipes[1]);
  }
  $result = array("dbg"  => htmlspecialchars($debug));

  $theJSON = json_encode($result);
  echo $theJSON;
}

function comments() {
  // This function retrieves comments from the history table.
  // This function has been updated to use PDO prepared statements.
  global $dbpdo;
  $statement = "SELECT COUNT(comment) AS f1,
    comment AS f2,
    u.username AS f3,
    MIN(timestamp) AS f4,
    MAX(timestamp) AS f5,
    GROUP_CONCAT(DISTINCT(status)) AS f6
    FROM history 
    LEFT JOIN user_info AS u ON history.uid = u.uid 
    WHERE timestamp BETWEEN 
    UTC_DATE() - INTERVAL 365 DAY AND UTC_TIMESTAMP()
    AND (comment NOT IN('NULL','Auto Update','') AND comment NOT LIKE ('autoid %'))
    GROUP BY comment
    ORDER BY f5 DESC";
  // debug
  //error_log("$statement");
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // execute the prepared statement
  $query->execute();
  // fetch the data and encode to json
  $rows = $query->fetchAll(PDO::FETCH_ASSOC);
  $theJSON = json_encode($rows);
  echo $theJSON;
}

function remove_comment() {   
  // This function removes a comment from the history table.
  // This function has been updated to use PDO prepared statements.
  global $dbpdo;
  $user = $_SESSION['sUser'];
  $comment = hextostr($_REQUEST['comment']);
  $comment = $comment;
  $statement = "DELETE FROM history WHERE comment = :comment";
  // debug
  //error_log("$statement");
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // build parameters for prepared statement
  $params = [":comment" => "$comment"];
  // execute the prepared statement with the params
  $query->execute(array_merge($params));
  // check for errors
  $error = $query->errorInfo();
  $result = "";
  // if there was no error, then $error[2] should be null
  if ( ! is_null($error[2]) ) {
    $result = $error[2];
  }
  $return = array("msg" => $result);
  $theJSON = json_encode($return); 
  echo $theJSON;
}

function map() {
  // This function is called when the user clicks the SUMMARY tab.
  // This function has been updated to use PDO prepared statements.

  global $when, $sensors, $qp2, $qp2_params, $sensor_params, $sv, $dbpdo;
  $srcstatement = "SELECT COUNT(src_ip) AS c, msrc.cc 
    FROM event
    LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
    LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip 
    $qp2
    AND src_ip NOT BETWEEN 167772160 AND 184549375
    AND src_ip NOT BETWEEN 2886729728 AND 2886795263
    AND src_ip NOT BETWEEN 3232235520 AND 3232301055
    AND msrc.cc IS NOT NULL
    GROUP BY msrc.cc
    ORDER BY c DESC";

  $dststatement = "SELECT COUNT(dst_ip) AS c, mdst.cc 
    FROM event
    LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
    LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip 
    $qp2
    AND dst_ip NOT BETWEEN 167772160 AND 184549375
    AND dst_ip NOT BETWEEN 2886729728 AND 2886795263
    AND dst_ip NOT BETWEEN 3232235520 AND 3232301055
    AND mdst.cc IS NOT NULL
    GROUP BY mdst.cc
    ORDER BY c DESC";
  // prepare statements
  $srcquery = $dbpdo->prepare("$srcstatement");
  // merge params
  $merged_params = array_merge($sensor_params, $qp2_params);
  // debug
  //error_log("srcstatement: $srcstatement");
  //error_log("dststatement: $dststatement");
  //error_log("merged_params: " . print_r($merged_params,1));
  // execute the prepared statement with the params
  $srcquery->execute($merged_params);

  // A => src, B=> dst,  C=> cumulative
  $a1 = $a2 = $b1 = $b2 = array();
  $aHit = $bHit = $cHit = 'no';

  // Source countries and count
  while ($row = $srcquery->fetch(PDO::FETCH_NUM)) {
    $a1[] = $row[0];
    $a2[] = $row[1];
    $c1[] = $row[0];
    $c2[] = $row[1];
    $aHit = 'yes';
    $cHit = 'yes';
  }

  $dstquery = $dbpdo->prepare("$dststatement");
  $dstquery->execute($merged_params);
  // Destination countries and count
  // As we loop through we check to see if we hit a country
  // that we already processed so that we can derive a sum
  while ($row = $dstquery->fetch(PDO::FETCH_NUM)) {
    $b1[] = $row[0];
    $b2[] = $row[1];
    if ($aHit == 'yes') {
      $key = array_search($row[1],$c2);
      if ($key === FALSE) {
        $c1[] = $row[0];
        $c2[] = $row[1];
      } else {
        $base = $c1[$key] + $row[0];
        $c1[$key] = $base;
      }
    } else {
      $c1[] = $row[0];
      $c2[] = $row[1];
    }

    $bHit = 'yes';
    $cHit = 'yes';
  }        

  $aSum = $bSum = $cSum = $aItems = $bItems = $cItems = 0;
  $srcd = $dstd = $alld = "";

  function makeDetail($x1,$x2) {
    $detail = ""; 
    $lc = count($x1);
    for ($i=0; $i<$lc; $i++) {
      $detail .= "\"$x2[$i]\": \"$x1[$i]\"";
      if ($i < $lc-1) {
        $detail .= ",";
      }
    }
    return $detail;
  }

  if ($aHit == 'yes') {
    $aItems = count($a1);
    $aSum = array_sum($a1);
    array_multisort($a1, SORT_DESC, $a2);
    $srcd = makeDetail($a1,$a2);
  }

  if ($bHit == 'yes') {
    $bItems = count($b1);
    $bSum = array_sum($b1);
    array_multisort($b1, SORT_DESC, $b2);
    $dstd = makeDetail($b1,$b2);
  }

  if ($cHit == 'yes') {
    $cItems = count($c1);
    $cSum = array_sum($c1);
    array_multisort($c1, SORT_DESC, $c2);
    $alld = makeDetail($c1,$c2);
  }

  $result = array("src"  => "$srcd", 
    "dst"  => "$dstd", 
    "all"  => "$alld",
    "srcc" => "$aItems",
    "srce" => "$aSum",
    "dstc" => "$bItems",
    "dste" => "$bSum",
    "allc" => "$cItems",
    "alle" => "$cSum",
  );

  $theJSON = json_encode($result);
  echo $theJSON;

}

function sensors() {
  // This function gets the list of sensors.
  // This function has been updated to use PDO prepared statements.
  global $dbpdo;
  //$query = "SELECT net_name AS f1, 
  $statement = "SELECT net_name AS f1, 
    hostname AS f2,
    agent_type AS f3,
    sensor.sid AS f4
    FROM sensor
    WHERE agent_type != 'pcap' 
    AND active = 'Y'
    ORDER BY net_name ASC";
  // debug
  //error_log("$statement");
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // execute the prepared statement
  $query->execute();
  // fetch the data and encode to json
  $rows = $query->fetchAll(PDO::FETCH_ASSOC);
  $theJSON = json_encode($rows);
  echo $theJSON;
}

function user_profile() {
  // This function updates the timezone offset in the user profile.
  // This function has been updated to use PDO prepared statements.
  global $dbpdo;
  $user = $_SESSION['sUser'];
  $tz = hextostr($_REQUEST['tz']);
  $validtz = "/^(-12:00|-11:00|-10:00|-09:30|-09:00|-08:00|-07:00|-06:00|-05:00|-04:30|-04:00|-03:30|-03:00|-02:00|-01:00|\+00:00|\+01:00|\+02:00|\+03:00|\+03:30|\+04:00|\+04:30|\+05:00|\+05:30|\+05:45|\+06:00|\+06:30|\+07:00|\+08:00|\+08:45|\+09:00|\+09:30|\+10:00|\+10:30|\+11:00|\+11:30|\+12:00|\+12:45|\+13:00|\+14:00)$/";

  if (preg_match($validtz, $tz)) { 
    // prepare statement
    $statement = "UPDATE user_info SET tzoffset = :tz WHERE username = :user";
    // debug
    //error_log("$statement");
    // prepare statement
    $query = $dbpdo->prepare("$statement");
    // build parameters for prepared statement
    $params = [":tz" => "$tz", ":user" => "$user"];
    // execute the prepared statement with the params
    $query->execute($params);
    // check for errors
    $error = $query->errorInfo();
    $result = "";
    // if there was no error, then $error[2] should be null
    if ( ! is_null($error[2]) ) {
      $result = $error[2];
    }
    // Update session offset
    $_SESSION['tzoffset'] = $tz;
  } else {
    $result = "Invalid timezone offset";
  }
  $return = array("msg" => $result);
  $theJSON = json_encode($return); 
  echo $theJSON;
}

function summary() {
  // This function is called when the user clicks the SUMMARY tab.
  // This function has been updated to use PDO prepared statements.

  global $when, $sensors, $qp2, $qp2_params, $sensor_params, $sv, $dbpdo;
  $limit = $_REQUEST['limit'];
  $qargs = $_REQUEST['qargs'];
  $filter  = hextostr($_REQUEST['filter']);
  list($type,$subtype) = explode("-", $qargs); 
  $oppip = "src";
  // subtype is controlled by user, don't trust it
  $cleansubtype = "";
  switch ($subtype) {
  case "src":
    $cleansubtype = "src";
    $oppip = "dst";
    break;
  case "dst":
    $cleansubtype = "dst";
    break;
  case "sig":
    $cleansubtype = "sig";
    break;
  } 

  switch ($type) {
  case "ip":
    $statement = "SELECT COUNT(event.{$cleansubtype}_ip) AS f1,
      COUNT(DISTINCT(event.signature)) AS f2,
      COUNT(DISTINCT(event.{$oppip}_ip)) AS f3,
      m{$cleansubtype}.cc AS f4, 
      m{$cleansubtype}.c_long AS f5,
      INET_NTOA(event.{$cleansubtype}_ip) AS f6,
      o{$cleansubtype}.value AS f7 
      FROM event
      LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
      LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip
      LEFT JOIN object_mappings AS o{$cleansubtype} ON event.{$cleansubtype}_ip = o{$cleansubtype}.object 
      AND o{$cleansubtype}.type = 'ip_c'
      $qp2
      GROUP BY f6
      ORDER BY f1 DESC";
    break;
  case "pt":
    $statement = "SELECT COUNT(event.{$cleansubtype}_port) AS f1,
      COUNT(DISTINCT(event.signature)) AS f2,
      COUNT(DISTINCT(event.src_ip)) AS f3,
      COUNT(DISTINCT(event.dst_ip)) AS f4,
      event.{$cleansubtype}_port AS f5
      FROM event
      LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
      LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip
      $qp2
      GROUP BY f5
      ORDER BY f1 DESC";
    break;
  case "sig":
    $statement = "SELECT COUNT(event.signature) AS f1,
      COUNT(DISTINCT(event.src_ip)) AS f2,
      COUNT(DISTINCT(event.dst_ip)) AS f3,
      event.signature_id AS f4,
      event.signature AS f5
      FROM event
      LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
      LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip
      $qp2
      GROUP BY f4
      ORDER BY f1 DESC";
    break;
  case "cc":
    $statement = "SELECT COUNT(event.{$cleansubtype}_ip) AS f1,
      COUNT(DISTINCT(event.signature)) AS f2,
      COUNT(DISTINCT(event.{$oppip}_ip)) AS f3,
      m{$cleansubtype}.cc AS f4,
      m{$cleansubtype}.c_long AS f5,
      COUNT(DISTINCT(event.{$cleansubtype}_ip)) AS f6
      FROM event
      LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
      LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip
      $qp2
      AND event.{$cleansubtype}_ip NOT BETWEEN 167772160 AND 184549375
      AND event.{$cleansubtype}_ip NOT BETWEEN 2886729728 AND 2886795263 
      AND event.{$cleansubtype}_ip NOT BETWEEN 3232235520 AND 3232301055
      AND m{$cleansubtype}.cc IS NOT NULL GROUP BY m{$cleansubtype}.cc ORDER BY f1 DESC"; 
    break; 
  }

  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // merge params
  $merged_params = array_merge($sensor_params, $qp2_params);
  // debug
  //error_log("statement: $statement");
  //error_log("merged_params: " . print_r($merged_params,1));
  // execute the prepared statement with the params
  $query->execute($merged_params);

  $rows = array();
  $i = 0;
  $n = 0;
  // unbuffered query can't do rowCount, replacing with $i below
  //$r = $query->rowCount();

  # iterate through each row of the filter table
  while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
    $n += $row["f1"];
    $i++;
    if ($i <= $limit) $rows[] = $row; 
  }
  $rows[] = array("n" => $n, "r" => $i);
  $theJSON = json_encode($rows);
  echo $theJSON;     
}

function view() {
  // This function is called when the user clicks the VIEWS tab.
  // This function has been updated to use PDO prepared statements.

  global $when, $sensors, $qp2, $qp2_params, $sensor_params, $sv, $dbpdo;
  $qargs   = $_REQUEST['qargs'];
  $filter  = hextostr($_REQUEST['filter']);
  list($type,$subtype) = explode("-", $qargs);

  switch ($type) {
  case "ip":
    $statement = "SELECT CONCAT_WS('|', INET_NTOA(event.src_ip), msrc.cc, msrc.c_long) AS source,
      CONCAT_WS('|', INET_NTOA(event.dst_ip), mdst.cc, mdst.c_long) AS target,
      COUNT(event.src_ip) AS value
      FROM event
      LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
      LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip 
      $qp2 
      AND (INET_NTOA(event.src_ip) != '0.0.0.0' AND INET_NTOA(event.dst_ip) != '0.0.0.0')
      GROUP BY source,target";
    break;
  case "ips":
    $statement = "SELECT CONCAT_WS('|', INET_NTOA(event.src_ip), msrc.cc, msrc.c_long) AS source,
      event.signature AS sig,
      CONCAT_WS('|', INET_NTOA(event.dst_ip), mdst.cc, mdst.c_long) AS target,
      COUNT(event.src_ip) AS value
      FROM event
      LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
      LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip 
      $qp2 
      AND (INET_NTOA(event.src_ip) != '0.0.0.0' AND INET_NTOA(event.dst_ip) != '0.0.0.0')
      GROUP BY source,target";
    break;
  case "sc":
    $statement = "SELECT CONCAT_WS('|' ,msrc.c_long, msrc.cc) AS source,
      CONCAT_WS('|',INET_NTOA(event.dst_ip), mdst.cc) AS target,
      COUNT(event.src_ip) AS value
      FROM event
      LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
      LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip
      $qp2
      AND (INET_NTOA(event.src_ip) != '0.0.0.0' AND INET_NTOA(event.dst_ip) != '0.0.0.0')
      AND event.src_ip NOT BETWEEN 167772160 AND 184549375
      AND event.src_ip NOT BETWEEN 2886729728 AND 2886795263
      AND event.src_ip NOT BETWEEN 3232235520 AND 3232301055
      GROUP BY source,target";
    break;   
  case "dc":
    $statement = "SELECT CONCAT_WS('|', INET_NTOA(event.src_ip), msrc.cc) AS source,
      CONCAT_WS('|', mdst.c_long, mdst.cc) AS target,
      COUNT(event.dst_ip) AS value
      FROM event
      LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
      LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip
      $qp2
      AND (INET_NTOA(event.src_ip) != '0.0.0.0' AND INET_NTOA(event.dst_ip) != '0.0.0.0')
      AND event.dst_ip NOT BETWEEN 167772160 AND 184549375
      AND event.dst_ip NOT BETWEEN 2886729728 AND 2886795263
      AND event.dst_ip NOT BETWEEN 3232235520 AND 3232301055
      GROUP BY source,target";
    break;    
  }
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // merge params
  $merged_params = array_merge($sensor_params, $qp2_params);
  // debug
  //error_log("statement: $statement");
  //error_log("merged_params: " . print_r($merged_params,1));
  // execute the prepared statement with the params
  $query->execute($merged_params);

  // unbuffered query can't do rowCount, replacing with $records below
  //$rc = $query->rowCount();
  $records = 0;
  $rows = $srcs = $tgts = $vals = $skip = $names = $_names = array();
/*
*/
  while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
    if ($type == "ips") {
      $srcs[] = $row["source"]; 
      $tgts[] = $row["sig"];
      $vals[] = $row["value"];
      $srcs[] = $row["sig"];
      $tgts[] = $row["target"];
      $vals[] = $row["value"];
    } else {
      $srcs[] = $row["source"];
      $tgts[] = $row["target"];
      $vals[] = $row["value"];
    }
    $sads[] = 0;
    $records++; 
  }

  if ($records == 0) { 
    $theJSON = json_encode(array("nodes" => $names, "links" => $rows, "records" => $records));
    echo $theJSON;
    exit();
  }  
  // Value counts
  $src_c = array_count_values($srcs);
  $tgt_c = array_count_values($tgts);

  // Accomodate sources that exist as a target with the 
  // current target as a source (not allowed)
  foreach ($srcs as $index => $src) {
    // Find the target
    if (in_array($index, $skip)) { continue; }
    $tgt = $tgts[$index];
    // Find the keys for all instances of the target as a source
    $tgt_keys = array_keys($srcs,$tgt);
    // Now see if any have the source as a target
    foreach ($tgt_keys as $pos) {
      if ($tgts[$pos] == $src) {
        $sads_val = $vals[$pos];
        unset($srcs[$pos]);
        unset($tgts[$pos]);
        unset($vals[$pos]);
        unset($sads[$pos]);
        // Add offset to be skipped
        $skip[] = $pos;
        // By setting this we flag that this source is also a target
        $sads[$index] = $sads_val; 
      }
    }

    // If there is no filter, remove 1:1s with a count of 1
    if ($filter == 'empty') {
      if ( isset($vals[$index]) && $vals[$index] == 1 && isset($sads[$index]) && $sads[$index] == 0 && isset($src_c[$src]) && $src_c[$src] == 1) {
        unset($srcs[$index]);
        unset($tgts[$index]);
        unset($vals[$index]);
        unset($sads[$index]);
      }
    } 
  }       

  // We have probably truncated these so realign the indexes
  $srcs = array_slice($srcs, 0);
  $tgts = array_slice($tgts, 0);
  $vals = array_slice($vals, 0);
  $sads = array_slice($sads, 0);

  // Create distinct names array
  $lc = count($srcs);
  for ($i = 0; $i < $lc; $i++) {
    if (!in_array($srcs[$i], $_names)) {
      $_names[] = $srcs[$i];
    }
    if (!in_array($tgts[$i], $_names)) {
      $_names[] = $tgts[$i]; 
    }

  }

  // Now go through the results and map the
  // sources and targets to the indexes in $_names
  for ($i = 0; $i < $lc; $i++) {
    // get source index
    $skey = array_search($srcs[$i], $_names);
    // get target index
    $dkey = array_search($tgts[$i], $_names);
    $val = (int)$vals[$i];
    $sad = (int)$sads[$i];
    $rows[] = array("source" => $skey, "target" => $dkey, "value" => $val, "sad" => $sad);
    //echo "$skey,$dkey,$val,$sad<br>";
  }

  // Lastly, we reformat names
  foreach ($_names as $name) {
    $names[] = array("name" => $name);
    //echo "$name<br>"; 
  }

  $theJSON = json_encode(array("nodes" => $names, "links" => $rows, "records" => $records));
  echo $theJSON;
}

function autocat() {
  // This function queries and updates sguild's list of autocats.
  // This function has been updated to use PDO prepared statements.
  global $dbpdo;
  $usr    = $_SESSION['sUser'];
  $pwd    = $_SESSION['sPass'];
  $offset = $_SESSION['tzoffset'];
  $mode   = $_REQUEST['mode'];

  switch ($mode) {
  case "query"  : 
    // build statement
    $statement = "SELECT autoid, CONVERT_TZ(erase,'+00:00', :offset1) AS erase, sensorname, 
      src_ip, src_port, dst_ip, dst_port, ip_proto,
      signature, status, active, CONVERT_TZ(timestamp,'+00:00', :offset2) AS ts,
      u.username AS user, comment
      FROM autocat
      LEFT JOIN user_info AS u ON autocat.uid = u.uid
      ORDER BY ts DESC";
    // debug
    //error_log("$statement");
    // prepare statement
    $query = $dbpdo->prepare("$statement");
    // build parameters for prepared statement
    $params = [":offset1" => "$offset", ":offset2" => "$offset"];
    // execute the prepared statement with the params
    $query->execute($params);
    // fetch the data and encode to json
    $rows = $query->fetchAll(PDO::FETCH_ASSOC);
    $theJSON = json_encode($rows); 
    break;

  case "update" :
    $data = hextostr($_REQUEST['data']);
    $v = json_decode($data, true);
    // Is the timestamp freeform?
    $pattern = '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$|^none$/';
    $expires = $v['expires'];  
    if (!preg_match($pattern, $expires)) {
      $expires = gmdate("Y-m-d H:i:s", strtotime("+ $expires"));
    }

    $cmdusr = escapeshellarg($usr);
    $cmdexpires = escapeshellarg($expires);
    $cmdsensor = escapeshellarg($v['sensor']);
    $cmdsrcip = escapeshellarg($v['src_ip']);
    $cmdsrcport = escapeshellarg($v['src_port']);
    $cmddstip = escapeshellarg($v['dst_ip']);
    $cmddstport = escapeshellarg($v['dst_port']);
    $cmdproto = escapeshellarg($v['proto']);
    $cmdsignature = escapeshellarg($v['signature']);
    $cmdstatus = escapeshellarg($v['status']);
    $cmdcomment = escapeshellarg($v['comment']);

    $cmd = "../.scripts/clicat.tcl 1 $cmdusr $cmdexpires $cmdsensor $cmdsrcip $cmdsrcport $cmddstip $cmddstport $cmdproto $cmdsignature $cmdstatus $cmdcomment";
    $descspec = array(0 => array("pipe", "r"), 1 => array("pipe", "w"));
    $proc = proc_open($cmd, $descspec, $pipes);
    $debug = "Process execution failed";
    if (is_resource($proc)) {
      fwrite($pipes[0], $pwd);
      fclose($pipes[0]);
      $debug = fgets($pipes[1]);
      fclose($pipes[1]);
    }

    $result = array("dbg"  => htmlspecialchars($debug)); 
    $theJSON = json_encode($result);
    break;

  case "toggle": 
    $obj = $_REQUEST['obj'];
    $rm = 0;
    list($type, $id) = explode("-", $obj);
    if ($type == 4) {
      $rm = 1;
      $type = 3;
    }                

    $cmdtype = escapeshellarg($type);
    $cmdusr = escapeshellarg($usr);
    $cmdid = escapeshellarg($id);

    $cmd = "../.scripts/clicat.tcl $cmdtype $cmdusr $cmdid";
    $descspec = array(0 => array("pipe", "r"), 1 => array("pipe", "w"));
    $proc = proc_open($cmd, $descspec, $pipes);
    $debug = "Process execution failed";
    $err = "-";
    if (is_resource($proc)) {
      fwrite($pipes[0], $pwd);
      fclose($pipes[0]);
      $debug = fgets($pipes[1]);
      fclose($pipes[1]);
    }

    if ($rm == 1) {
      $statement = "DELETE FROM autocat WHERE autoid = :id";
      // debug
      //error_log("$statement");
      // prepare statement
      $query = $dbpdo->prepare("$statement");
      // build parameters for prepared statement
      $params = [":id" => "$id"];
      // execute the prepared statement with the params
      $query->execute($params);
      $result = $query->errorInfo();
      $err = "";
      // if there was no error, then $result[2] should be null
      if ( ! is_null($result[2]) ) {
        $err = $result[2];
      }

    }

    $result = array("dbg" => htmlspecialchars($debug),
      "err" => htmlspecialchars($err));

    $theJSON = json_encode($result);
    break;
  }

  echo $theJSON;
}

function esquery() {
  global $clientparams;
  $filter    = hextostr($_REQUEST['filter']);
  $logtype   = hextostr($_REQUEST['logtype']);
  $timestamp = hextostr($_REQUEST['se']);
  $tests = 0;
  $msg = "";

  // Check timestamps
  $pattern = '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/';
  if (!preg_match($pattern, $timestamp)) {
    $tests = 1;
    $msg = "Bad time format!";
  }

  list($start,$end) = explode("|", $timestamp);
  $start = strtotime($start) . "000";
  $end = strtotime($end) . "000";
  $now = strtotime("now") . "000";

  if ($start > $end || $start == $end || $start > $now) {
    $tests = 1;
    $msg = "Bad time logic!";
  }    

  // Bail if ts logic isn't sound
  if ($tests == 1) {
    $result = array("dbg"  => "$msg");
    $theJSON = json_encode($result);
    echo $theJSON;
    exit;
  }

  $client = new Elasticsearch\Client($clientparams);
  $params = array();
  $params['size'] = '500';
  $params['ignore'] = '400,404';

  $json = "{
    \"query\": {
      \"filtered\": {
        \"query\": {
          \"query_string\": {
            \"query\": \"type:$logtype AND ($filter)\"
}
},
  \"filter\": {
    \"range\": {
      \"timestamp\": {
        \"from\": $start,
          \"to\": $end
}
}
}
}
},
  \"size\": 500,
  \"sort\": [{
    \"timestamp\": {
      \"order\": \"desc\"
}
}]

}";

$params['body'] = $json;
$result = $client->search($params);
/*
    if ($result[2] == "e") {
        $result = array("dbg"  => "Invalid query!");
    } 
 */
$theJSON = json_encode($result);
echo $theJSON;
}

function addremoveobject() {   
  // This function adds objects to and removes objects from the object_mappings table.
  // This function has been updated to use PDO prepared statements.
  global $dbpdo;
  $obtype = $_REQUEST['obtype'];
  $object = hextostr($_REQUEST['object']); 
  $value  = $_REQUEST['value'];
  $op     = $_REQUEST['op'];

  // For everything but tags we want to replace the existing value
  $hash = md5($obtype . $object);    
  switch ($obtype) {
  case "ip_c":
    $object = sprintf("%u", ip2long($object));
    break;
  case "tag":
    $object = sprintf("%u", ip2long($object)); 
    $hash = md5($obtype . $object . $value);
    break; 
  }

  // Are we adding or removing?
  switch ($op) {
  case "add":
    // If adding object, insert into table.
    $statement = "INSERT INTO object_mappings (type,object,value,hash)
      VALUES (:obtype1,:object1,:value1,:hash1)
      ON DUPLICATE KEY UPDATE 
      type=:obtype2,object=:object2,value=:value2,hash=:hash2";
    // build parameters for prepared statement
    $params = [":obtype1" => "$obtype", ":object1" => "$object", ":value1" => "$value", ":hash1" => "$hash", ":obtype2" => "$obtype", ":object2" => "$object", ":value2" => "$value", ":hash2" => "$hash"];
    break;
  case "rm":
    // If removing object, delete from table.
    $statement = "DELETE FROM object_mappings WHERE hash = :hash";
    // build parameters for prepared statement
    $params = [":hash" => "$hash"];
    break;
  }                
  // debug
  //error_log("$statement");
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // execute the prepared statement with the params
  $query->execute($params);
  // check for errors
  $result = $query->errorInfo();
  $error = "";
  // if there was no error, then $result[2] should be null
  if ( ! is_null($result[2]) ) { 
    $error = $result[2];
  }
  $return = array("msg" => $error);
  $theJSON = json_encode($return); 
  echo $theJSON;
}

function getcolour() {   
  // This function gets the color mappings from the object_mappings table.
  // This function has been updated to use PDO prepared statements.
  global $dbpdo;
  // build statement
  $statement = "SELECT object, value AS colour
    FROM object_mappings
    WHERE type = 'el_c'"; 
  // debug
  //error_log("$statement");
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // execute the prepared statement
  $query->execute();
  // fetch the data and encode to json
  $rows = $query->fetchAll(PDO::FETCH_ASSOC);
  $theJSON = json_encode($rows);
  echo $theJSON;
}

function objhistory () {
  // This function returns the history for an object over the last 7 days.
  // This function has been updated to use PDO prepared statements.
  global $offset, $start, $sdate, $sdatetime, $offset, $dbpdo;
  $object = hextostr($_REQUEST['object']);
  $object = str_replace("aa", "", $object);

  // Is object an IP address?
  $re = '/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/';
  $obtype = 0;
  if (preg_match($re, $object)) {
    $obtype = 1;
  }

  switch ($obtype) {
  case 0: 
    $subject = "signature_id = :object"; 
    $statement = "SELECT
      DATE(CONVERT_TZ(event.timestamp,'+00:00', :offset1)) AS day,
      HOUR(CONVERT_TZ(event.timestamp,'+00:00', :offset2)) AS hour,
      COUNT(event.timestamp) AS value
      FROM event 
      WHERE event.timestamp BETWEEN CONVERT_TZ(:sdatetime1,:offset3,'+00:00') - INTERVAL 6 DAY AND CONVERT_TZ(:sdatetime2,:offset4,'+00:00') + INTERVAL 1 DAY 
      AND signature_id = :object
      GROUP BY day,hour
      ORDER BY day ASC";
    $params = [":offset1" => "$offset", ":offset2" => "$offset", ":sdatetime1" => "$sdatetime", ":offset3" => "$offset", ":sdatetime2" => "$sdatetime", ":offset4" => "$offset", ":object" => "$object"];
  break;

  case 1: 
    $subject = "(src_ip = INET_ATON('$object') OR dst_ip = INET_ATON('$object'))"; 
    $statement = "SELECT
      DATE(CONVERT_TZ(event.timestamp,'+00:00', :offset1)) AS day,
      HOUR(CONVERT_TZ(event.timestamp,'+00:00', :offset2)) AS hour,
      COUNT(event.timestamp) AS value
      FROM event 
      WHERE event.timestamp BETWEEN CONVERT_TZ(:sdatetime1,:offset3,'+00:00') - INTERVAL 6 DAY AND CONVERT_TZ(:sdatetime2,:offset4,'+00:00') + INTERVAL 1 DAY 
      AND (src_ip = INET_ATON(:object1) OR dst_ip = INET_ATON(:object2))
      GROUP BY day,hour
      ORDER BY day ASC";
    $params = [":offset1" => "$offset", ":offset2" => "$offset", ":sdatetime1" => "$sdatetime", ":offset3" => "$offset", ":sdatetime2" => "$sdatetime", ":offset4" => "$offset", ":object1" => "$object", ":object2" => "$object"];
  break;
  } 
  $query = $dbpdo->prepare("$statement");
  // original used unbuffered query, but that doesn't seem to work with PDO?
  //$result = mysql_unbuffered_query($query);
  //$query->setAttribute( PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, False );
  $query->execute(array_merge($params));

  $rows1 = $rows2 = array(); 
  $r1 = $r2 = 0;
  while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
    $rows1[] = $row;
    $r1++;
  }
  $result = "";

  if ($r1 != 0 && $obtype == 1) {
    $statement = "SELECT
      COUNT(signature_id) AS value,
        signature AS label,
        signature_id AS sid
        FROM event
        WHERE event.timestamp BETWEEN CONVERT_TZ(:sdatetime1,:offset1,'+00:00') - INTERVAL 6 DAY AND CONVERT_TZ(:sdatetime2,:offset2,'+00:00') + INTERVAL 1 DAY
        AND (src_ip = INET_ATON(:object1) OR dst_ip = INET_ATON(:object2))
        GROUP BY signature_id
        ORDER BY value DESC";

    $params = [":sdatetime1" => "$sdatetime", ":offset1" => "$offset", ":sdatetime2" => "$sdatetime", ":offset2" => "$offset", ":object1" => "$object", ":object2" => "$object"];
  // original used unbuffered query, but that doesn't seem to work with PDO?
  //$result = mysql_unbuffered_query($query);
  //$query->setAttribute( PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, False );
  $query = $dbpdo->prepare("$statement");
  $query->execute(array_merge($params));
  while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
      $rows2[] = $row;
      $r2++;
    }
  } 

  $theJSON = json_encode(array("rows1" => $rows1, "rows2" => $rows2, "start" => $sdate, "r1" => $r1, "r2" => $r2));
  echo $theJSON;
}

function times() {   
  // This function returns data to the times visualization on the EVENTS tab.
  // This function has been updated to use PDO prepared statements.

  global $offset, $when, $sensors, $qp2, $qp2_params, $sensor_params, $sv, $dbpdo;
  $statement = "SELECT
    SUBSTRING(CONVERT_TZ(event.timestamp,'+00:00',:substringoffset),12,5) AS time,
      COUNT(signature) AS count 
      FROM event
      LEFT JOIN mappings AS msrc ON event.src_ip = msrc.ip
      LEFT JOIN mappings AS mdst ON event.dst_ip = mdst.ip
      $qp2
      GROUP BY time 
      ORDER BY event.timestamp";
  // add params for local part of statement
  $local_params[':substringoffset'] = "$offset";
  // prepare statement
  $query = $dbpdo->prepare("$statement");
  // merge params
  $merged_params = array_merge($local_params, $sensor_params, $qp2_params);
  // debug
  //error_log("statement: $statement");
  //error_log("merged_params: " . print_r($merged_params,1));
  // execute the prepared statement with the params
  $query->execute($merged_params);

  $rows = array();
  $r = $m = 0;

  while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
    $rows[] = $row;
    $cnts[] = $row['count'];
    $r++;
  }
  if ($r > 0) {
    $m = max($cnts);
  } 

  $theJSON = json_encode(array("rows" => $rows, "r" => $r, "m" => $m));
  echo $theJSON;
}

$type();
unset($rows);
unset($rows1);
unset($result);
unset($theJSON); 
?>
