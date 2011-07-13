<?php

//
//
//      Copyright (C) 2011 Paul Halliday <paul.halliday@gmail.com>
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
include_once '.inc/tabs.php';
include_once '.inc/functions.php';

?>

<html>
<head>
<title>SQueRT</title>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
<style type="text/css" media="screen">@import ".css/squert.css";</style>
<style type="text/css" media="screen">@import ".css/tabs.css";</style>
<script type="text/javascript" src=".js/squert.js"></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.core.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.bar.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.hbar.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.line.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.scatter.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.context.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.tooltips.js"></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.zoom.js"></script>
</head>

<body>
<?php include_once '.inc/header.php';?>
<table id=main-table width=1000 align=center cellpadding=0 cellspacing=0">
<tr>
<td>
<?php 
  tabber("IP",$id);
  dbC();
?>
<div id="main">
<div id="contents" class="main">
<?php include_once '.inc/charts/ip.php';?>
<?php include_once '.inc/charts/ip_scatter.php';?>
</div>
</div>
</td>
</tr>
</table>
</body>
</html>
