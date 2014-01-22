<?php

//
//
//      Copyright (C) 2012 Paul Halliday <paul.halliday@gmail.com>
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
    header ("Location: /squert/login.php");
    exit();
}

function sInt() {
     header ("Location: /squert/login.php");
     exit();
}

if (!(isset($_SESSION['sLogin']) && $_SESSION['sLogin'] != '')) {
     sKill();
}

// Session variables
if (!isset($_SESSION['sUser']))    { sInt();  } else { $sUser    = $_SESSION['sUser'];}
if (!isset($_SESSION['sEmail']))   { sInt();  } else { $sEmail   = $_SESSION['sEmail'];}
if (!isset($_SESSION['sType']))    { sInt();  } else { $sType    = $_SESSION['sType'];}
if (!isset($_SESSION['sTab']))     { sInt();  } else { $sTab     = $_SESSION['sTab'];}
if (!isset($_SESSION['tzoffset'])) { sInt();  } else { $tzoffset = $_SESSION['tzoffset'];}
if (!isset($_REQUEST['id']))       { $id = 0; } else { $id       = $_REQUEST['id'];}

// Kill the session if the ids dont match.
if ($id != $_SESSION['id']) {
    sKill();
}
?>
