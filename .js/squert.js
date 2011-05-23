// Copy and paste, trial and error. Be nice.

// Force form submit on enter
document.onkeypress = function (e) {
    if(!e) e=window.event;
    key = e.keyCode ? e.keyCode : e.which;
    if(key == 13) {
        document.getElementById("base").click();
    }
}

function poof(object,visible) {
    if (visible=='yes') {
        document.getElementById(object).style.display='';
        document.getElementById(object + "_yes").style.display='none';
        document.getElementById(object + "_no").style.display='';
    }
    if (visible=='no') {
        document.getElementById(object).style.display='none';
        document.getElementById(object + "_yes").style.display='';
        document.getElementById(object + "_no").style.display='none';
    }
}

function tab(object,visible) {

    var caller = document.getElementById(object);

    switch (caller) {
        case graphs:
            poof(object,visible);
            if (visible=='yes') {
                hViz.value = 1;
                hMap.value = 0;
                poof('map','no');
                poof('links','no');
                poof('ip2c','no');
            }
            if (visible=='no') {
                hViz.value = 0;
            }
            break;
        case map:
            poof(object,visible);
            if (visible=='yes') {
                hMap.value = 1;
                hViz.value = 0;
                poof('graphs','no');
                poof('links','no');
                poof('ip2c','no');
            }
            if (visible=='no') {
                hMap.value = 0;
            }
            break;
        case links:
            poof(object,visible);
            if (visible=='yes') {
                hViz.value = 0;
                hMap.value = 0;
                poof('graphs','no');
                poof('map','no');
                poof('ip2c','no');
            }
            break;
        case ip2c:
            poof(object,visible);
            if (visible=='yes') {
                hViz.value = 0;
                hMap.value = 0;
                poof('graphs','no');
                poof('map','no');
                poof('links','no');
            }
            break;
    }

}

// ip validation
function checkIP(ip) {
    var valid = /^\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
    if (!valid.test(ip)) {
        token = "1";
    }
}

// port validation
function checkPort(port) {
    var valid = /^[0-9]+$\b/;
    if (!valid.test(port)) {
        token = "1";
    }
    if (port > 65535) {
        token = "1";
    }
    if (port.charAt(0) == 0) {
        token ="1";
    }
}

// date validation
function chk_date(type,xargs) {

    // We are checking..
    if ( type == 0 ) {
        var tmp_sDate = document.getElementById("sDate").value;
        var tmp_eDate = document.getElementById("eDate").value;
        var tmp_sHour = document.getElementById("sHour").value;
        var tmp_sMin = document.getElementById("sMin").value;
        var tmp_sSec = document.getElementById("sSec").value;
        var tmp_eHour = document.getElementById("eHour").value;
        var tmp_eMin = document.getElementById("eMin").value;
        var tmp_eSec = document.getElementById("eSec").value;
        var button = document.getElementById("base");

        var sY = tmp_sDate.slice(0,4);
        var sM = tmp_sDate.slice(5,7);
        var sD = tmp_sDate.slice(8,10);
        var sh = tmp_sHour;
        var sm = tmp_sMin.slice(0,2);
        var ss = tmp_sSec.slice(0,2);

        var eY = tmp_eDate.slice(0,4);
        var eM = tmp_eDate.slice(5,7);
        var eD = tmp_eDate.slice(8,10);
        var eh = tmp_eHour;
        var em = tmp_eMin.slice(0,2);
        var es = tmp_eSec.slice(0,2);

        sd_unix = (new Date(sY,sM - 1,sD,sh,sm,ss).getTime()/1000.0);
        ed_unix = (new Date(eY,eM - 1,eD,eh,em,es).getTime()/1000.0);

        if ( sd_unix > ed_unix) {
            button.disabled='disabled';
            button.style.color='red';
        } else {
            button.disabled='';
            button.style.color='black';
        }
    }
 
    // We are clearing..
    if ( type == 1 ) {
        var tmp_sDate = document.getElementById("sDate");
        var tmp_sHour = document.getElementById("sHour");
        var tmp_sMin = document.getElementById("sMin");
        var tmp_sSec = document.getElementById("sSec");
         
        var splitArgs = xargs.split(".");
        tmp_sDate.value=splitArgs[0];
        tmp_sHour.selectedIndex=splitArgs[1];
        tmp_sMin.selectedIndex=splitArgs[2];
        tmp_sSec.selectedInder=splitArgs[3];
        chk_date(0,0);
    }

    if ( type == 2 ) {
        var tmp_eDate = document.getElementById("eDate");
        var tmp_eHour = document.getElementById("eHour");
        var tmp_eMin = document.getElementById("eMin");
        var tmp_eSec = document.getElementById("eSec");

        var splitArgs = xargs.split(".");
        tmp_eDate.value=splitArgs[0];
        tmp_eHour.selectedIndex=splitArgs[1];
        tmp_eMin.selectedIndex=splitArgs[2];
        tmp_eSec.selectedIndex=splitArgs[3];
        chk_date(0,0);
    }
  
    // We are manipulating..
    if ( type == 3 ) {
        var tmp_sDate = document.getElementById("sDate");
        var tmp_sHour = document.getElementById("sHour");
        var tmp_sMin = document.getElementById("sMin");
        var tmp_sSec = document.getElementById("sSec");
        var tmp_eDate = document.getElementById("eDate");
        var tmp_eHour = document.getElementById("eHour");
        var tmp_eMin = document.getElementById("eMin");
        var tmp_eSec = document.getElementById("eSec");

        var splitArgs = xargs.split(".");
        tmp_sDate.value=splitArgs[0];
        tmp_sHour.selectedIndex=splitArgs[1];
        tmp_sMin.selectedIndex=splitArgs[2];
        tmp_sSec.selectedIndex=splitArgs[3];
        tmp_eDate.value=splitArgs[4];
        tmp_eHour.selectedIndex=splitArgs[5];
        tmp_eMin.selectedIndex=splitArgs[6];
        tmp_eSec.selectedIndex=splitArgs[7];
        chk_date(0,0);
        document.getElementById("base").click();
    }

}

function clear(element) {
    document.getElementById(element).value='';
}

// Keeps the "View:" boxes in sync.
function update() {
    var x = document.getElementById("qLogic1").selectedIndex;
    document.getElementById("qLogic").selectedIndex=x;
}

// Manipulate input boxes and controls. Either through links, or the menu.
function mClick(prefix,source) {

    if (source) {
        var x = source;
        qLogic.selectedIndex=1;
    } else {
        var x = gtarg.id;
    }

    var y = document.getElementById(x).innerHTML;
    var object2 = prefix + "String";

    // WHERE and AND
    if (prefix == 'w' || prefix == 'a') {
        var object1 = prefix + "Type"; 
        if ((x.substr(3,3) === 'src') || (x.substr(3,3) === 'dst')) {var z = 0;}
        if (x.substr(4,4)  === 'port') {var z = 1;}
        if (x.substr(3,3)  === 'sig') {var z = 2;}
        if (x.substr(3,3)  === 'sid') {var z = 3;}
        var destCntrl = document.getElementsByName(object1);
        var destBox = document.getElementById(object2);
        y = y.replace(/&lt;/g,"<");
        y = y.replace(/&gt;/g,">");
        y = y.replace(/&amp;/g,"&");
        destBox.value = y;
        destCntrl[z].checked = true;
        document.getElementById("note").style.display = '';
    }

    // COUNTRY
    if (prefix == 'c') {
        var object1 = prefix + "Type";
        var destBox = document.getElementById(object2);
        var oldVal = $('cString').value;
        if (oldVal.length > 0) {var sep = ';';} else {var sep = '';}
        // See if the item already exists
        var exParts = document.getElementById("cString").value.split(";");
        var cp = exParts.indexOf(y);

        if (exParts.indexOf(y) === -1) {
            destBox.value = oldVal + sep + y;
            document.getElementById("note").style.display = '';
        }
    }

    // EXCLUDE
    if (prefix == 'x') {
        if (x.substr(3,3) === 'src')   {var pre = 'src_ip=';}
        if (x.substr(3,3) === 'dst')   {var pre = 'dst_ip=';}
        if (x.substr(3,5) === 'sport') {var pre = 'src_port=';}
        if (x.substr(3,5) === 'dport') {var pre = 'dst_port=';}
        if (x.substr(3,3) === 'sig')   {var pre = 'sig=';}
        if (x.substr(3,3) === 'sid')   {var pre = 'sig_id=';}
        if (x.substr(4,1) === 'c')   {var pre = 'c=';}
        var destBox = document.getElementById(object2);
        var oldVal = $('xString').value;
        if (oldVal.length > 0) {var sep = ';';} else {var sep = '';}
        y = y.replace(/&lt;/g,"<");
        y = y.replace(/&gt;/g,">");
        y = y.replace(/&amp;/g,"&");
        // See if the item already exists
        var exParts = document.getElementById("xString").value.split(";");
        var cp = exParts.indexOf(pre + y);

        if (exParts.indexOf(pre + y) === -1) {
            destBox.value = oldVal + sep + pre + y;
            document.getElementById("note").style.display = '';
        }

    }

    // This is also present in menu.js
    var isWhere = document.getElementById("wString").value.length;
    var isAnd = document.getElementById("aString").value.length;
    var isEx = document.getElementById("xString").value.length;
    var isCC = document.getElementById("cString").value.length;

    if (isWhere > 0) {
        $('cmwhere').innerHTML="add item to WHERE clause (1)";
    } else {
        $('cmwhere').innerHTML="add item to WHERE clause (0)";
    }
    if (isAnd > 0) {
        $('cmand').innerHTML="add item to AND clause (1)";
    } else {
        $('cmand').innerHTML="add item to AND clause (0)";
    }
    if (isEx > 0) {
        var exParts = document.getElementById("xString").value.split(";");
        var exC = exParts.length;
        $('cmex').innerHTML="add item to EXCLUDE clause ("+ exC +")";
    }  else {
        $('cmex').innerHTML="add item to EXCLUDE clause (0)";
    }
    if (isCC > 0) {
            var ccParts = document.getElementById("cString").value.split(";");
            var ccC = ccParts.length;
            $('cmcc').innerHTML="add item to COUNTRY clause ("+ ccC +")";
    }  else {
            $('cmcc').innerHTML="add item to COUNTRY clause (0)";
    }

    if (source) {
        document.getElementById("base").click();
    }
}

// Signature lookup
function sigLU() {
    var x = gtarg.id.replace("g", "d");
    var y = document.getElementById(x).innerHTML;
    var z = ".inc/rule.php?sigID=" + y;
    window.open(z,'Lookup','width=800,height=200,left=0,top=0,menubar=no,scrollbars=yes,status=no,toolbar=no,resizable=yes');
    CloseContext();
}

// Host lookup
function localLookup() {
    var x = gtarg.id;
    var y = document.getElementById(x).innerHTML;
    var z = ".inc/lookup.php?ip=" + y;
    window.open(z,'','width=600,height=200,left=0,top=0,menubar=no,scrollbars=yes,status=no,toolbar=no,resizable=yes');
    CloseContext();
}

function reSize(x) {
    var theImage = document.getElementById(x + "-d_s");
    var theH = theImage.offsetHeight;
    var theFrame = document.getElementById(x + "-frame");

    if (theH > "250") {
        theFrame.style.height = theH + 150;
    } else {
        theFrame.style.height = 375;
    }
}

function cFocus(x) {
    document.getElementById(x).focus();
}

function oC(obj) {
    var oid = document.getElementById(obj);
    var state = oid.style.display;
    if (state == 'none') {
        oid.style.display = '';
    } else {
        oid.style.display = 'none';
    }
}
