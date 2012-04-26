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

include_once '.inc/session.php';
include_once '.inc/config.php';
include_once '.inc/functions.php';
include_once '.inc/ribbon.php';

$loFilter = "";
dbC();

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
   "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<link rel="stylesheet" type="text/css" href=".css/squert.css" />
<script type="text/javascript" src=".js/jq.js"></script>
<script type="text/javascript" src=".js/squert.js"></script>
<script type="text/javascript" src=".js/sorttable.js"></script>
<script type="text/javascript" src=".js/worldmap.js"></script>
<title>squert</title>
</head>
<body>
<div id=tab_group class=tab_group>
<div id=t_sum class=tab_active>Main</div>
<!--<div id=t_sig class=tab>Signature</div>
<div id=t_ip class=tab>IP</div-->
<div id=t_map class=tab>Map</div>
<div id=t_usr class=user>Welcome&nbsp;&nbsp;<b><?php echo $sUser;?></b>&nbsp;&nbsp;|&nbsp;&nbsp;<span id=settings class=links>Settings</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span id=logout class=links>Logout</span></div>
<form name=squert id=squert method=post action="<?php echo "index.php?id=$id&s=$s&e=$e";?>">
<div id=t_search class=search>
<span id=settings class=links>Saved</span>
&nbsp;&nbsp;|&nbsp;&nbsp;Search:&nbsp;
<input class=search id=search type=text size=50 maxlength=1000>
<span id=clear_search class=clear>&#x21BA;</span>
</div>
</form>
<?php echo $timeLinks;?>
</div>
<br>

<div id=t_sum_content class=content_active>
<table width=970 align=center><tr><td>
<?php echo $todayLink;?><br>
<?php include_once '.stub/brief.php';?>
<?php include_once '.stub/signature.php';?>
</td></tr></table>
</div>
<br>

<div id=t_sig_content class=content>
<table width=970 align=center><tr><td>
</td></tr></table>
</div>

<div id=t_ip_content class=content>
<table width=970 align=center><tr><td>
</td></tr></table>
</div>

<div id=t_map_content class=content>
<div class=wm>
<canvas class=wm1 id=wm1 width=970 height=500>[No canvas support]></canvas>
</div>
</div>

<div id=debug class=debug>
</div>

<div id=set_content class=content>
<span id=set_close>Settings</span>
</div>

<div id=bottom class=bottom>
<div id=b_event class=b_event></div>
<div id=b_update class=b_update>update</div>
<div id=b_top class=b_top>top</div>
</div>

<input id=timestamp type=hidden value="<?php echo strtohex($when[0]);?>" />
<input id=eventclass type=hidden value="-1" />
</body>
</html>
<?php $_SESSION['LAST_ACTIVITY'] = time();?>
