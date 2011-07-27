<?php

function randCa() {
    $randomcolor = '#' . strtoupper(dechex(rand(0,10000000)));
    if (strlen($randomcolor) != 7){
        $randomcolor = str_pad($randomcolor, 10, '0', STR_PAD_RIGHT);
        $randomcolor = substr($randomcolor,0,7);
    }
    return $randomcolor;
}

function randCb(){
    mt_srand((double)microtime()*1000000);
    $c = '';
    while(strlen($c)<6){
        $c .= sprintf("%02X", mt_rand(0, 255));
    }
    return $c;
}

$list = '';
$nc = 15;

echo "<html><body>";

for ($i = 1; $i <=$nc; $i++) {
    $col = randCb();
    echo "<div style=\"width: 100px; background: #$col;\">$i: $col</div>\n";
    $list .= "'#${col}',";
}

$list = rtrim($list, ',');
echo "<br>";
echo $list;
echo "</body></html>";

?>

