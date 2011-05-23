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

// Session init
session_start();

function sKill() {
    session_destroy();
    session_unset();
    header ("Location: /squert/p-login.php");
    exit();
}

function sInt() {
     header ("Location: /squert/p-login.php");
     exit();
}

if (!(isset($_SESSION['sLogin']) && $_SESSION['sLogin'] != '')) {
     sKill();
}

// Session variables
if (!isset($_SESSION['sUser']))  { sInt(); }  else { $sUser  = $_SESSION['sUser'];}
if (!isset($_SESSION['sEmail'])) { sInt(); }  else { $sEmail = $_SESSION['sEmail'];}
if (!isset($_SESSION['sType']))  { sInt(); }  else { $sType  = $_SESSION['sType'];}
if (!isset($_SESSION['sTime']))  { sInt(); }  else { $sTime  = $_SESSION['sTime'];}
if (!isset($_REQUEST['id']))     { $id = 0; } else { $id     = $_REQUEST['id'];}

// Kill the session if the ids dont match.
if ($id != $_SESSION['id']) {
    sKill();
}

// Kill the session if timeout is exceeded.
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > $sTime)) {
    sKill();
}

// Kill the sesssion if the user requests it
if (isset($_POST['base']) && $_POST['base'] == "Log out") {
    sKill();
}

// We dont want anything cached
//header ("Expires: Sun, 11 Nov 1973 05:00:00 GMT");
//header ("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
//header ("Cache-Control: no-cache, must-revalidate");
//header ("Pragma: no-cache");

?>
