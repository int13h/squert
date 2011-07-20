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

include_once 'config.php';

// This returns rule info.
function Rule($sigID) {

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
                            echo "<u><b>$ruleMsg[1]</b></u><br><br>\n";
                            echo "$line";
                            echo "<br><br>";
                            echo "<b>$ruleFile, line $lineNumber.</b>";
                            $wasMatched = 1;
                            break;
                        }
                    $lineNumber++;
                    } 
                }
           } 
   
           closedir($ruleDir);
    }

    if($wasMatched != 1) {
        echo "No match for signature ID $sigID.";
    }
}
?>

<?php

$sigID = $_REQUEST['sigID'];

?>

<html>
<head>
<TITLE>Signature ID:<?php echo $sigID;?></TITLE>
<link href="../.css/squert.css" rel="stylesheet" type="text/css">
</head>
<body style="color: #000000; background: #f4f4f4; font-size: .8em;">

<?php Rule($sigID)?>

</body>
</html>
