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

session_start();
if (!(isset($_SESSION['sLogin']) && $_SESSION['sLogin'] != '')) {
    header ("Location: login.php");
}

function Links($string,$ofPre,$vType,$eLength,$vLabel,$lProps,$bgcolor,$mode) {
    include_once "config.php";
    include_once "functions.php";
    $WHERE = hextostr($string);
    $baseQuery = "SELECT COUNT(signature) AS count, MAX(timestamp) AS maxTime, INET_NTOA(src_ip), map1.cc as src_cc, INET_NTOA(dst_ip), map2.cc as dst_cc, signature, signature_id, ip_proto 
                  FROM event 
                  LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
                  LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip 
                  WHERE $WHERE
                  GROUP BY src_ip, src_cc, dst_ip, dst_cc, signature, signature_id, ip_proto 
                  ORDER BY maxTime DESC $LIMIT";

    $stamp = date("Ymd-H:i:s");
    $num = rand(100,999);
    $suffix = '';
    if (strlen($ofPre) > 0) {
        $toStrip = array("\"","'","`","*","^","\\","/","|","(",")","<",">","{","}","[","]",".png");   
        $pass1 = str_replace($toStrip, "", $ofPre);
        $suffix = "-" . str_replace(" ", "_", $pass1);
    }

    $dashN = '';
    if ($vLabel === "1") {   
        $dashN = "-n";
    }
    
    $outFile =  "${stamp}-${num}${suffix}.png";
    $outThumb = "${stamp}-${num}${suffix}_thumb.png";
    $hit = "no";

    if ($glowDebug == "yes") {
        $dotOut = "-o .debug/dot.txt";
        $glowErr = ".debug/glow.txt";
    } else {
        $dotOut = "-Tpng -o $baseDir/$outFile";
        $glowErr = "/dev/null";
    }

    // Start timing
    $qst = microtime(true);

    // Perform Query
    $db = mysql_connect($dbHost,$dbUser,$dbPass);
    mysql_select_db("$dbName",$db);
    $theData = mysql_query("$baseQuery");

    // Stop Timing
    $qet = microtime(true);
    $qtime = $qet - $qst;
    $qrt = sprintf("%01.3f",$qtime);

    while ($row = mysql_fetch_array($theData)) {
        $hit = "yes";
        // Source, Destination, Signature, Count
        $d_01[] = $row[2];
        $d_02[] = $row[4];
        $d_03[] = wordwrap($row[6],40,"\\n",true);
        $d_04[] = $row[0];
    }

    // Open Afterglow and feed it our results

    // Start timing
    $gst = microtime(true);
    $glowCmd = "$glowPath -c .props/$lProps $glowArgs -e $eLength -p $mode $dashN | $dotPath -K$vType -Gbgcolor=$bgcolor $dotArgs $dotOut";
    $dspec = array(0 => array("pipe", "r"), 1 => array("pipe", "w"),2 => array("file", "$glowErr", "a"));
    $process = proc_open($glowCmd, $dspec, $pipes);

    if (is_resource($process)) {
        if ($hit == "yes") {
            for ($i = 0; $i < sizeof($d_01); $i++) {
                fwrite($pipes[0],"\"$d_03[$i]\",\"$d_01[$i]\",\"$d_02[$i]\",$d_04[$i]\n");
            }
        } else {
            fclose($pipes[0]);
            fclose($pipes[1]);
            proc_close($process);
            unlink("$baseDir/$outFile");
            $html =  "The query returned no results.\n";
            return array("$html","Null");
        }

        fclose($pipes[0]);
        fclose($pipes[1]);
        proc_close($process);
    }

    // Stop Timing
    $get = microtime(true);
    $gtime = $get - $gst;
    $grt = sprintf("%01.3f",$gtime);

    // Scale the image to something a little more manageable.

    // Start timing
    $ist = microtime(true);

    if (file_exists("$baseDir/$outFile")) { 
         imgScale("$baseDir/$outFile",$width,$height);
    } else {
        $html =  "Failed to locate base file. This can happen if:<br>
                  <br>1) The image directory is not writable or does no exist. 
                  <br>2) We exhausted system memory. If this is the case, limit your results and try again.\n";

        return array("$html","Null");
    }

    // Stop Timing
    $iet = microtime(true);
    $itime = $iet - $ist;
    $irt = sprintf("%01.3f",$itime);
    $html = "\r<table width=100% border=0 cellpadding=1 cellspacing=0>
             \r<tr><td><center><a href=$baseDir/$outFile target=_new><img onLoad=\"poof('wrkn','no');\" src=$baseDir/$outThumb border=0></a></center></td></tr>
             \r<tr><td align=right style=\"color: #545454;\"><samp>query: ${qrt} graphviz: ${grt} scale: ${irt}</samp></td></tr>
             \r</table>";

    return array("$html","$outFile");
}

// Scale
function imgScale($inImg,$width,$height) {

    $fullName = pathinfo("$inImg");
    $dir = $fullName['dirname'];
    $_long = $fullName['basename'];
    $ext = $fullName['extension'];
    $long = str_replace(".png", "_thumb.$ext", $_long);
    list($width_orig, $height_orig) = getimagesize($inImg);
    $ratio_orig = $width_orig/$height_orig;
    
    if ($width/$height > $ratio_orig) {
        $width = $height*$ratio_orig;
    } else {
        $height = $width/$ratio_orig;
    }

    $image_p = imagecreatetruecolor($width, $height);
    $image = imagecreatefrompng($inImg);
    imagecopyresampled($image_p, $image, 0, 0, 0, 0, $width, $height, $width_orig, $height_orig);
    imagepng($image_p, "${dir}/${long}", 9);
}

function ShowImg($xyz) {

    include_once "config.php";
    if ($xyz != "0") {
        $thumb = str_replace('.png','_thumb.png',$xyz);
        $html = "<table width=100% border=0 cellpadding=1 cellspacing=0>
                 \r<tr><td><center><u>$xyz</u></center></td></tr>
                 \r<tr><td><center><a href=$baseDir/$xyz target=_new><img src=$baseDir/$thumb border=0></a></center></td></tr>
                 \r</table>";
    }
    return $html;
}

function delImg($xyz) {

    $html = '';
    if ($xyz != "0") {
        $thumb = str_replace('.png','_thumb.png',$xyz);
        if (file_exists("images/$xyz")) {
            unlink("images/$xyz");
        }
        if (file_exists("images/$thumb")) {
            unlink("images/$thumb");
        }
        if ((!file_exists("images/$xyz")) || (!file_exists("images/$thumb"))) {
            $html = "<table width=100% border=0 cellpadding=1 cellspacing=0>
                     \r<tr><td style=\"color: #cc0000\"><center><u>Deleted $xyz</u></center></td></tr>
                     \r</table>";
        } else {
            $html = "<table width=100% border=0 cellpadding=1 cellspacing=0>
                     \r<tr><td style=\"color: #cc0000\"><center><u>Delete Failed! This was either already deleted or I cant get a lock on the file.</u></center></td></tr>
                     \r</table>";
        }
    }
    return $html;
}

function DirList($active) {
    $files = scandir('images');
    if ($files != false && count($files) > 2) {
        for ($i = 0, $fc = count($files) - 1; $i <= $fc; $i++) {
            if (($files[$i] != ".") && ($files[$i] != "..")) {
                if (!preg_match("/_thumb.png/i", $files[$i])) {
                    if ($files[$i] == "$active") {
                        $selected = 'selected';
                    } else {
                        $selected = '';
                    }
                    $fShort = str_replace("images", "", $files[$i]);
                    echo "\r<option value=\"$files[$i]\" $selected>$fShort</option>";
                }
            }
        }
    } else {
        echo "\r<option value=0>No images found</option>";
    }
}

function propList($active) {
    $files = scandir('.props');
    if ($files != false && count($files) > 2) {
        for ($i = 0, $fc = count($files) - 1; $i <= $fc; $i++) {
            if (($files[$i] != ".") && ($files[$i] != "..")) {
                if ($files[$i] == "$active") {
                    $selected = 'selected';
                } else {
                    $selected = '';
                }
                $fShort = str_replace(".props", "", $files[$i]);
                echo "\r<option value=\"$files[$i]\" $selected>$fShort</option>";
            }
        }
    } else {
        echo "\r<option value=0>.props is empty or invalid!</option>";
    }
}

function TheHTML($string,$fileName,$outFile,$vType,$eLength,$vLabel,$lProps,$bgcolor,$mode) {

    include_once 'functions.php';
    $vTypes = array(
                     "neato"  => "neato||Null",
                     "fdp"    => "fdp||Null",
                     "sfdp"   => "sfdp||Null",
                     "circo"  => "circo||Null",
                     "dot"    => "dot||Null",
                     "twopi"  => "twopi||Null");

    for ($l = 0; $l <= 10; $l++) {
        $eLengths[] = $l;
    }

    $vLabels = array(
                      "0" => "yes||Null",
                      "1" => "no||Null");

    $bgcolList = array(
                        "#FFFFFF" => "white||Null",
                        "#000000" => "black||Null",
                        "#cc0000" => "red||Null");

    $modes = array(
                    "0" => "once per common event||Null",
                    "1" => "once per unique source||Null",
                    "2" => "once per unique target||Null",
                    "3" => "once per unique source and target||Null");

    $omo  = "onMouseOver=\"style.backgroundColor='#ffffff';\" onMouseOut=\"style.backgroundColor='#DDDDDD';\"";
    $omox = "onMouseOver=\"style.backgroundColor='#ff0000';\" onMouseOut=\"style.backgroundColor='#B80028';\"";
    echo "<html>
          \r<head>
          \r<script type=\"text/javascript\" src=\".js/squert.js\"></script>
          \r<style type=\"text/css\" media=\"screen\">@import \".css/squert.css\";</style>
          \r</head>
          \r<body style=\"background: #ffffff;\">
          \r<form id=edv method=post action=edv.php>
          \r<input type=hidden id=qText name=qText value=\"$string\">
          \r<center>
          \r<table class=round width=100% border=0 cellpadding=1 cellspacing=0 style=\"background: #f4f4f4; padding: 5px; border: 2pt solid #c4c4c4;\">
          \r<tr id=help style=\"display: none;\"><td colspan=2 align=left style=\"padding-top: 5px; font-size: 10px;\">
          \r<ul style=\"padding-left: 30px;\">
          \r<li>This still needs a lot of work.
          \r<li>The same logic that was used during your last query will be used to create the graph.<br>
          \r<li>If the \"new\" field is left empty a timestamp will be used.<br>
          \r<li>Each filter produces a different result. Play. For more information take a look <a class=blockB href=\"http://www.graphviz.org/About.php\" target=graphviz>here</a>.<br>
          \r<li>Increasing the \"edge\" value (neato only) can help disperse dense clusters by providing a larger canvas to work with.<br>
          \r<li>If \"labels\" is set to \"no\", node labelling with be suppressed. Having no labels makes it a lot easier to discern patterns.<br>
          \r<li>The graphs that you see are scaled versions of what was actually created. Click on the image to see the original.<br>
          \r<li>The originals can be quite large. You can use a tool like zoomfox to comfortably navigate them.<br>
          \r<li>After a graph has been generated it will be selected on the right. If you don't want what you produced, click the delete button.<br>
          \r<li>If you have a lot of events you will need a lot of RAM to produce a result.<br>
          \r<li>If things are failing, try increasing: \"max_execution_time\" and \"memory_limit\" in your php.ini.<br>
          \r<li>Not all visuals are useful :)
          \r</ul>
          \r</td></tr>";
    // From controls
    echo "<tr><td align=right style=\"padding-top: 15px; font-size: 10px;\">filter:</td>
          \r<td align=left style=\"padding-top: 15px; font-size: 10px;\">
          \r&nbsp;<SELECT id=vType name=vType style=\"background: #ffffff; font-size: 9px; border: 1px solid #c4c4c4;\">";
          mkSelect($vTypes,$vType);
    echo "</SELECT>&nbsp;&nbsp;
          edge:&nbsp;<SELECT id=eLength name=eLength style=\"background: #ffffff; font-size: 9px; border: 1px solid #c4c4c4;\">";
          mkSelect($eLengths,$eLength);
    echo "</SELECT>&nbsp;&nbsp;
          labels:&nbsp;<SELECT id=vLabel name=vLabel style=\"background: #ffffff; font-size: 9px; border: 1px solid #c4c4c4;\">";
          mkSelect($vLabels,$vLabel);
    echo "</SELECT>&nbsp;&nbsp;
         \rproperties file:&nbsp;<SELECT name=lProps id=lProps style=\"font-size: 10px; border: 1px solid #c4c4c4;\">";
          propList($lProps);
    echo "</SELECT>&nbsp;&nbsp;
          \rcanvas:&nbsp;<SELECT name=bgcolor id=bgcolor style=\"font-size: 10px; border: 1px solid #c4c4c4;\">";
          mkSelect($bgcolList,$bgcolor);
    echo "</SELECT>&nbsp;&nbsp;
          \rmode:&nbsp;<SELECT name=mode id=mode style=\"font-size: 10px; border: 1px solid #c4c4c4;\">";
          mkSelect($modes,$mode);
    echo "</SELECT>      
          \r&nbsp;&nbsp;<a class=vis id=help_yes style=\"display: ''; font-size: 1em;\" href=\"javascript:poof('help','yes');\"><b>Help?</b></a>
          \r&nbsp;&nbsp;<a class=vis id=help_no style=\"display: none; font-size: 1em; color: black;\" href=\"javascript:poof('help','no');\"><b>Help?</b></a>
          \r</td></tr>       
          \r<tr><td align=right style=\"padding-top: 15px; font-size: 10px;\">new:</td>
          \r<td align=left style=\"padding-top: 15px; font-size: 10px;\">
          \r&nbsp;<input id=lgname name=lgname value=\"$outFile\" type=text size=30 maxlength=20 style=\"font-size: 9px; border: none; border: 1pt solid #c4c4c4;\">";
    echo "<span id=\"wrkn\" name=\"wrkn\" style=\"display: none;\">&nbsp;&nbsp;<img src=work.gif></span>
          \r</td>
          \r</tr>
          \r<tr><td align=right style=\"padding-top: 15px; font-size: 10px;\">existing:</td>
          \r<td align=left style=\"padding-top: 15px; font-size: 10px;\">
          \r&nbsp;<SELECT name=lFiles id=lFiles style=\"font-size: 10px; border: 1px solid #c4c4c4;\">";
          DirList($fileName);
    echo "</SELECT>&nbsp;
          \r</td></tr><td colspan=2 align=center style=\"padding-top: 15px; padding-bottom: 10px; font-size: 10px;\">
          \r<input $omo id=lgraph name=lgraph type=submit value=\"create\" onclick=\"poof('wrkn','yes');\" class=rb style=\"width:50;\">
          \r<input $omo id=view name=view type=submit value=view class=rb style=\"width:50;\">&nbsp;&nbsp;&nbsp;<span style=\"font-size: 1em; font-weight: bold;\">|</span>&nbsp;&nbsp;&nbsp;
          \r<input $omox id=delete name=delete type=submit value=delete class=rb style=\"width:50; color: white; background: #B80028;\">
          \r</td></tr>
          \r</table>
          \r</center>
          \r</form>
          \r</body>
          \r</html>";
}

?>
<?php
$html = '';
if(!isset($_REQUEST['qText'])) { $string = $_REQUEST['qp']; } else { $string = $_REQUEST['qText']; }
if(!isset($_REQUEST['lFiles'])) { $fileName = ''; } else { $fileName = $_REQUEST['lFiles']; }
if(!isset($_REQUEST['lgname'])) { $outFile = ''; } else { $outFile = $_REQUEST['lgname']; }
if(!isset($_REQUEST['vType'])) { $vType = 'neato'; } else { $vType = $_REQUEST['vType']; }
if(!isset($_REQUEST['eLength'])) { $eLength = '3'; } else { $eLength = $_REQUEST['eLength']; }
if(!isset($_REQUEST['vLabel'])) { $vLabel = 'yes'; } else { $vLabel = $_REQUEST['vLabel']; }
if(!isset($_REQUEST['lProps'])) { $lProps = 'default_3.props'; } else { $lProps = $_REQUEST['lProps']; }
if(!isset($_REQUEST['bgcolor'])) { $bgcolor = 'white'; } else { $bgcolor = $_REQUEST['bgcolor']; }
if(!isset($_REQUEST['mode'])) { $mode = '0'; } else { $mode = $_REQUEST['mode']; }

if (@$_REQUEST['lgraph']) {
    $string = $_REQUEST['qText'];
    $result = Links($string,$outFile,$vType,$eLength,$vLabel,$lProps,$bgcolor,$mode);
    $html = $result[0];
    $fileName = $result[1];
}
if (@$_REQUEST['view']) {
    $html = ShowImg($fileName);
    $status = 1;
}
if (@$_REQUEST['delete']) {
    $html = delImg($fileName);
}

TheHTML($string,$fileName,$outFile,$vType,$eLength,$vLabel,$lProps,$bgcolor,$mode);
echo $html;
?>
