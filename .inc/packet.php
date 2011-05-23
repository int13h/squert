<?php
//
//
//      Copyright (C) 2006 Paul Halliday <paul.halliday@gmail.com>
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
include_once 'config.php';
include_once 'functions.php';

// Connect
$db = mysql_connect($dbHost,$dbUser,$dbPass) or die(mysql_error());
mysql_select_db($dbName,$db) or die(mysql_error());

function Packet($sid,$cid) {

$ipData = "SELECT INET_NTOA(src_ip), INET_NTOA(dst_ip), ip_ver, ip_hlen, ip_tos, ip_len, ip_id,ip_flags,
           ip_off, ip_ttl, ip_csum, src_port, dst_port, ip_proto, signature, signature_id, timestamp
           FROM event
           WHERE sid='$sid' and cid='$cid'";

$tmpQuery = mysql_query($ipData) or die(mysql_error());

while ($row = mysql_fetch_row($tmpQuery)) {
    $srcIP =	$row[0];
    $dstIP =	$row[1];
    $ipVer =	$row[2];
    $ipHlen =   $row[3];
    $ipTOS =	$row[4];
    $ipLen =	$row[5];
    $ipID =	$row[6];
    $ipFlags =	$row[7];
    $ipOff =	$row[8];
    $ipTTL =	$row[9];
    $ipCsum =	$row[10];
    $srcPort =  $row[11];
    $dstPort =  $row[12];
    $ipProto =	$row[13];
    $sigDesc =	$row[14];
    $sigID =	$row[15];
    $timeStamp = formatStamp($row[16],0);
    $theDay = date(l, strtotime($timeStamp));
    $thePayload = '';
}

// Only do these if ipProto dictates.

if ($ipProto == 1) {

    $icmpData = "SELECT event.icmp_type, event.icmp_code, icmphdr.icmp_csum, icmphdr.icmp_id, icmphdr.icmp_seq
                 FROM event, icmphdr WHERE event.sid=icmphdr.sid AND event.cid=icmphdr.cid AND event.sid='$sid'
                 AND event.cid='$cid'";

    $tmpQuery = mysql_query($icmpData) or die(mysql_error());

    while ($row = mysql_fetch_row($tmpQuery)) {
        $icmpType = $row[0];
        $icmpCode = $row[1];
        $icmpCsum = $row[2];
        $icmpID =   $row[3];
        $icmpSeq =  $row[4];
    }

} elseif ($ipProto == 6) {

    $tcpData = "SELECT tcp_seq, tcp_ack, tcp_off, tcp_res, tcp_flags, tcp_win, tcp_urp, tcp_csum
                FROM tcphdr WHERE sid='$sid' and cid='$cid'";

    $tmpQuery = mysql_query($tcpData) or die(mysql_error());

    while ($row = mysql_fetch_row($tmpQuery)) {
        $tcpSeq =	$row[0];
        $tcpAck =	$row[1];
        $tcpOff =	$row[2];
        $tcpRes =	$row[3];
        $tcpFlags =	$row[4];
        $tcpWin =	$row[5];
        $tcpUrp =	$row[6];
        $tcpCsum =	$row[7];
    }

    $binFlags = decbin($tcpFlags);
    $binFlags = substr("00000000",0,8 - strlen($binFlags)) . $binFlags;
    list($tcpR1, $tcpR0, $tcpURG, $tcpACK, $tcpPSH, $tcpRST, $tcpSYN, $tcpFIN) = $binFlags;

} elseif ($ipProto == 17) {

    $udpData = "SELECT udp_len, udp_csum FROM udphdr WHERE sid='$sid' and cid='$cid'";

    $tmpQuery = mysql_query($udpData) or die(mysql_error());

    while ($row = mysql_fetch_row($tmpQuery)) {
        $udpLen =    $row[0];
        $udpCsum =   $row[1];
    }
}

// We do the payload regardless
$payloadData = "SELECT data_payload FROM data WHERE sid='$sid' AND cid='$cid'";

$tmpQuery = mysql_query($payloadData) or die(mysql_error());

while ($row = mysql_fetch_row($tmpQuery)) {
    $thePayload	= $row[0];
}

echo "<table style=\"border-collapse: collapse; border: 1pt solid black; border-bottom: none;\" border=0 cellpadding=1 cellspacing=0 width=900 align=center>
      <tr>
      <td width=50 class=info align=center rowspan=2><b>INFO</b></td>
      <td width=200 class=back align=center><b>Timestamp</b>
      <td class=back align=center><b>Signature</b></td>
      <td class=back align=center><b>Signature ID</b></td>
      <td class=back align=center><b>Sensor ID</b></td>
      <td class=back align=center><b>Event ID</b></td>
      </tr>
      <tr>
      <td class=datafill style=\"padding: 5px;\">$theDay <br>$timeStamp</td>
      <td class=datafill style=\"padding: 5px;\"><a class=blockB href=\"#\" onclick=\"window.open('rule.php?sigID=$sigID','','width=800,height=200,left=0,top=0,menubar=no,scrollbars=yes,status=no,toolbar=no,resizable=yes');\">$sigDesc</a></td>
      <td class=datafill style=\"padding: 5px;\">$sigID</td>
      <td class=datafill style=\"padding: 5px;\">$sid</td>
      <td class=datafill style=\"padding: 5px;\">$cid</td>
      </tr>
      </table>"; 


// Begin IP Titles

echo "<table style=\"border-collapse: collapse; border: 1pt solid black; border-bottom: none;\" border=0 cellpadding=1 cellspacing=0 width=900 align=center>
      <tr>    
      <td width=50 rowspan=2 class=ip align=center><b>IP</b></td>
      <td width=200 class=back align=center><b>SrcIP</b></td>
      <td width=200 class=back align=center><b>DstIP</b></td>
      <td class=back align=center><b>Ver</b>
      <td class=back align=center><b>IHL</b></td>
      <td class=back align=center><b>TOS</b></td>
      <td class=back align=center><b>Length</b></td>
      <td class=back align=center><b>ID</b></td>
      <td class=back align=center><b>Flags</b></td>
      <td class=back align=center><b>Offset</b></td>
      <td class=back align=center><b>TTL</b></td>
      <td class=back align=center><b>ChkSum</b></td>
      </tr>";

// Begin IP Values
$srcLink = "<a class=blockB href=\"#\" onclick=\"window.open('lookup.php?ip=$srcIP','','width=600,height=200,left=0,top=0,menubar=no,scrollbars=yes,status=no,toolbar=no,resizable=yes');\">$srcIP</a>";
$dstLink = "<a class=blockB href=\"#\" onclick=\"window.open('lookup.php?ip=$dstIP','','width=600,height=200,left=0,top=0,menubar=no,scrollbars=yes,status=no,toolbar=no,resizable=yes');\">$dstIP</a>";

echo "<tr>
      <td class=datafill>$srcLink</td>
      <td class=datafill>$dstLink</td>
      <td class=datafill>$ipVer</td>
      <td class=datafill>$ipHlen</td>
      <td class=datafill>$ipTOS</td>
      <td class=datafill>$ipLen</td>
      <td class=datafill>$ipID</td>
      <td class=datafill>$ipFlags</td>
      <td class=datafill>$ipOff</td>
      <td class=datafill>$ipTTL</td>
      <td class=datafill>$ipCsum</td>
      </tr>
      </table>";

if ($ipProto == 1) {
    
    // Begin ICMP
    
    echo "<table style=\"border-collapse: collapse; border: 1pt solid black; border-bottom: none;\" border=0 cellpadding=1 cellspacing=0 width=9000 align=center>
          <tr><td width=50 rowspan=2 class=tcpudp align=center><b>ICMP</b></td>
          <td width=190 class=back align=center><b>Type</b></td>
          <td width=190 class=back align=center><b>Code</b></td>
          <td width=190 class=back align=center><b>Checksum</b></td>
          <td width=190 class=back align=center><b>ID</b></td>
          <td width=190 class=back align=center><b>Seq#</b></td>
          </tr>";
 
    // ICMP Values

    echo "<tr>
          <td class=datafill>$icmpType</td>
          <td class=datafill>$icmpCode</td>
          <td class=datafill>$icmpCsum</td>
          <td class=datafill>$icmpID</td>
          <td class=datafill>$icmpSeq</td>
          </tr>
          </table>";

} elseif ($ipProto == 6) {

    // Begin TCP

    echo "<table style=\"border-collapse: collapse; border: 1pt solid black; border-bottom: none;\" border=0 cellpadding=1 cellspacing=0 width=900 align=center>
          <tr>
          <td width=50 rowspan=2 class=tcpudp align=center><b>TCP</b></td>
          <td class=back align=center><b>SrcPort</b></td>
          <td class=back align=center><b>DstPort</b></td>
          <td width=30 class=back align=center><b>R1</b></td>
          <td width=30 class=back align=center><b>R0</b></td>
          <td width=30 class=back align=center><b>URG</b></td>
          <td width=30 class=back align=center><b>ACK</b></td>
          <td width=30 class=back align=center><b>PSH</b></td>
          <td width=30 class=back align=center><b>RST</b></td>
          <td width=30 class=back align=center><b>SYN</b></td>
          <td width=30 class=back align=center><b>FIN</b></td>
          <td class=back align=center><b>Seq#</b></td>
          <td class=back align=center><b>Ack#</b></td>
          <td class=back align=center><b>Offset</b></td>
          <td class=back align=center><b>Res</b></td>
          <td class=back align=center><b>Window</b></td>
          <td class=back align=center><b>Urp</b></td>
          <td class=back align=center><b>ChkSum</b></td>
          </tr>\n";

    // TCP Values

    echo "<tr>
          <td class=datafill>$srcPort</td>
          <td class=datafill>$dstPort</td>
          <td class=datafill>$tcpR1</td>
          <td class=datafill>$tcpR0</td>
          <td class=datafill>$tcpURG</td>
          <td class=datafill>$tcpACK</td>
          <td class=datafill>$tcpPSH</td>
          <td class=datafill>$tcpRST</td>
          <td class=datafill>$tcpSYN</td>
          <td class=datafill>$tcpFIN</td>
          <td class=datafill>$tcpSeq</td>
          <td class=datafill>$tcpAck</td>
          <td class=datafill>$tcpOff</td>
          <td class=datafill>$tcpRes</td>
          <td class=datafill>$tcpWin</td>
          <td class=datafill>$tcpUrp</td>
          <td class=datafill>$tcpCsum</td>
          </tr></table>";

    // End TCP

} elseif ($ipProto == 17) {

    // Begin UDP

    echo "<table style=\"border-collapse: collapse; border: 1pt solid black; border-bottom: none;\" border=0 cellpadding=1 cellspacing=0 width=900 align=center>
          <tr>
          <td width=50 rowspan=2 class=tcpudp align=center><b>UDP</b></td>
          <td width=250 class=back align=center><b>SrcPort</b></td>
          <td width=250 class=back align=center><b>DstPort</b></td>
          <td width=250 class=back align=center><b>Length</b></td>
          <td class=back align=center><b>Checksum</b></td>
          </tr>
          <tr>
          <td class=datafill>$srcPort</td>
          <td class=datafill>$dstPort</td>
          <td class=datafill>$udpLen</td>
          <td class=datafill>$udpCsum</td>
          </tr>
          </table>\n";

    // End UDP
}

// Begin Data

FormatPayload($thePayload);

}

function FormatPayload ($thePayload) {

    $break0 = 0;
    $break1 = 0;
    $strLength = strlen($thePayload);
    $theHex = $theString = $fullString = '';   

    if ($strLength == 0) {
        $theHex = "<br><center>No Data Sent.</center><br>";
        $theString = "<br><center>&nbsp&nbsp No Data Sent.</center><br>";
    
    } else {  

        for($i=0;$i<$strLength;$i+=2) {

            $break0 ++;
            $break1 ++;

            $hex = substr($thePayload,$i,2);
            $intValue = hexdec($hex);

            if (($intValue < 32) || ($intValue > 126)) {
                $theHex.="$hex ";
                $theString.= ".";
                $fullString.= ".";
            } elseif ($intValue == 60) {
                $theHex.="$hex ";
                $theString.= "&lt;";
                $fullString.= "&lt;";
            } elseif ($intValue == 62) {
                $theHex.="$hex ";
                $theString.= "&gt;";
                $fullString.= "&gt;";
            } else {
                $theHex.="$hex ";
                $theString.=chr(hexdec(substr($thePayload,$i,2)));
                $fullString.=chr(hexdec(substr($thePayload,$i,2)));
            }

            if (($break0 == 16) && ($i < $strLength)) {
                $theHex.= "<br>\n";
                $theString.= "<br>\n";
                $break0 = 0;
            }
          
            if (($break1 == 120) && ($i < $strLength)) {
                $fullString.= "<br>\n";
                $break1 = 0;
            }
        }
    }

    echo "<table style=\"border-collapse: collapse; border: 1pt solid black; border-bottom: 1pt solid black;\" border=0 cellpadding=1 cellspacing=0 width=900 align=center>
          <tr>
          <td width=50 class=data align=center><b>DATA</b></td>
          <td width=425 class=dataleft><samp>$theHex</samp></td>
          <td width=425 class=dataleft><samp>$theString</samp></td>
          </tr>
          </table>";

    if ($strLength > 0) {
        echo "<table style=\"border-collapse: collapse; border: 1pt solid black; border-top: none;\" border=0 cellpadding=1 cellspacing=0 width=900 align=center>
              <td width=900 class=string><samp><B>$fullString</b></samp></td></table>";
    }

}
?>

<?php

$sid = $_REQUEST['sid'];
$cid = $_REQUEST['cid'];

?>

<html>
<head>
<TITLE>Event ID:<?php echo $cid;?></TITLE>
<link href="../.css/squert.css" rel="stylesheet" type="text/css">
</head>
<body>

<?php Packet($sid,$cid)?>

</body>
</html>
