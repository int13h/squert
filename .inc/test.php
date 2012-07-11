#!/usr/local/bin/php
<?php

function urlMkr($line) {

    // Match reference sequence
    $pattern = '/reference:url,([^;]+)/';
    $new = preg_replace($pattern, '<a class=rref href="http://$1">$1</a>',  $line);
    echo $new;
}

$line = 'alert tcp $HOME_NET 10000 -> $EXTERNAL_NET any (msg:\"ET EXPLOIT NDMP Notify Connect - Possible Backup Exec Remote Agent Recon\"; flow:established,from_server; content:\"|00 00 05 02|\"; offset:16; depth:20; content: \"|00 00 00 03|\"; offset: 28; depth: 32; reference:url,www.ndmp.org/download/sdk_v4/draft-skardal-ndmp4-04.txt; reference:url,doc.emergingthreats.net/bin/view/Main/2002068; classtype:attempted-recon; sid:2002068; rev:8;)';

$matches = urlMkr($line);

?>
