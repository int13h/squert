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

include 'config.php';

$username = $password = $err = '';
$focus = 'username';

function cleanUp($string) {
    if (get_magic_quotes_gpc()) {
        $string = stripslashes($string);
    }
    $string = mysql_real_escape_string($string);
    return $string;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST'){
    $username = $_REQUEST['username'];
    $password = $_REQUEST['password'];
    $ua = $_SERVER['HTTP_USER_AGENT'];
    $ua .= rand(0,4200);
    $id = md5($ua);
    $db = mysql_connect($dbHost,$dbUser,$dbPass);
    $link = mysql_select_db($dbName, $db);

    if ($link) {
        $user = cleanUp($username);
        $query = "SELECT * FROM user_info WHERE username = '$user'";
        $result = mysql_query($query);
        $numRows = mysql_num_rows($result);

        if ($numRows > 0) {
            while ($row = mysql_fetch_row($result)) {
                $userName	= $row[1];
                $lastLogin	= $row[2];
                $userHash	= $row[3];
                $userEmail      = $row[4];
                $userType       = $row[5];
                $userTime       = $row[6];
            }
            // The first 2 chars are the salt     
            $theSalt = substr($userHash, 0,2);

            // The remainder is the hash
            $theHash = substr($userHash, 2);

            // Now we hash the users input                 
            $testHash = sha1($password . $theSalt);

            // Does it match? If yes, start the session.
            if ($testHash === $theHash) {
                session_start();

                // Protect against session fixation attack
                if (!isset($_SESSION['initiated'])) {
                    session_regenerate_id();
                    $_SESSION['initiated'] = true;
                }

                $_SESSION['sLogin']	= '1';
                $_SESSION['sUser']	= $userName;
                $_SESSION['sEmail']	= $userEmail;
                $_SESSION['sType']      = $userType;
                $_SESSION['sTime']	= $userTime;
                $_SESSION['id']         = $id;
	        header ("Location: squert.php?id=$id");
            } else {
                $err = 'Invalid Password';
                $focus = 'password';
            }
        } else {   
            $err = 'Invalid User';
            $focus = 'username';     
        }
    } else {
        $err = 'Connection Failed';
    }
}
?>

<html>
<head>
<title>Please login to continue</title>
<style>
td.header {
  font-size: .9em;
  font-weight: bold;
  padding: 20px 0px 20px 40px;
  background: #000000;
  color: #c4c4c4;
  border-bottom: 1px solid #c4c4c4;
}
td.boxes {
  font-size: .8em;
  padding: 20px 0px 5px 40px;
}
table.boxes {
  border-collapse: collapse;
  border: 1pt solid #c4c4c4;
  background: #ffffff;
}
.rb {
  background: #DDDDDD;
  color: #000000;
  border: none;
  border: 1pt solid gray;
  font-size: 1em;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  height: 40;
  width: 100;
}
.in {
  border: 1pt solid #c4c4c4;
  height: 30;
  width: 250;
  font-size: 1.5em;
}
.err {
  color: #cc0000;
  font-size: .8em;
}
.cp {
  font-size: .7em;
  margin: 0 auto;
  width: 450px;
  text-align: right;
  color: #bababa;
}
</style>
</head>
<body style="background: #fafafa; font-family: verdana, trebuchet ms, helvetica, sans";>
<form name=credcheck method=post action=login.php>
<br><br><br><br><br>
<table class=boxes width=450 align=center cellpadding=1 cellspacing=0>
<tr><td colspan=2 class=header>
SQueRT - Please login to continue</td></tr>
<tr><td colspan=2 class=boxes>
Username<br>
<input class=in type=text name=username value="<?php echo $username;?>" maxlength="32"></td></tr>
<tr><td colspan=2 class=boxes>
Password<br>
<input class=in type=password name=password value="" maxlength="32"></td></tr>
<tr><td class=boxes>
<input id=logmein name=logmein class=rb type=submit name=login value=submit onMouseOver="style.backgroundColor='#ffffff';" onMouseOut="style.backgroundColor='#DDDDDD';"><br><br></td>
<td class=err><?php echo $err;?></td></tr>
</table>
<div class=cp>&copy;2011 Paul Halliday</div>
</form>
<script type="text/javascript">document.credcheck.<?php echo $focus;?>.focus();</script>
</body>
</html>
