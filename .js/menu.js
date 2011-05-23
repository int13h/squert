// Concept taken from here: http://luke.breuer.com/tutorial/javascript-context-menu-tutorial.htm
// I have no idea what I am doing.
var _replaceContext = false;		// replace the system context menu?
var _mouseOverContext = false;		// is the mouse over the context menu?
var _noContext = false;                 // disable the context menu?
var _divContext = $('divContext');	// makes my life easier
var gtarg;
InitContext();

function InitContext() {
    _divContext.onmouseover = function() { _mouseOverContext = true; };
    _divContext.onmouseout = function() { _mouseOverContext = false; };
    document.body.onmousedown = ContextMouseDown;
    document.body.onclick = ContextShow;
}

// call from the onMouseDown event, passing the event if standards compliant
function ContextMouseDown(event) {
    if (_noContext || _mouseOverContext)
        return;

    // we assume we have a standards compliant browser, but check if we have IE
    var target = event.target != null ? event.target : event.srcElement;
    gtarg = target;

    // Conditions for displaying the context menu
    if ((event.button == 0) && (target.id.substr(0,2) === 'cm')) {
        _replaceContext = true;
    } else if (!_mouseOverContext) {
        _divContext.style.display = 'none';
    }
}

function CloseContext() {
    _mouseOverContext;
    _divContext.style.display = 'none';
}

// call from the onContextMenu event, passing the event
// if this function returns false, the browser's context menu will not show up

function ContextShow(event) {
    
    if (_noContext || _mouseOverContext) {
        return;
    }

    // we assume we have a standards compliant browser, but check if we have IE
    var target = event.target != null ? event.target : event.srcElement;
        
    if (_replaceContext) {

        var _qValue =  target.textContent;
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

        if ((target.id.substr(3,3) === 'src') || (target.id.substr(3,3) === 'dst')) {
            $('cmwhere').style.display='';
            $('cmsig').style.display='none';
            $('cmcc').style.display='none';
            $('cmlip').style.display='';
            if (isWhere>0) {
                $('cmand').style.display="";
            } else {
                $('cmand').style.display="none";
            }
        }

        if (target.id.substr(4,4) === 'port') {
            $('cmwhere').style.display='';
            $('cmsig').style.display='none';
            $('cmlip').style.display='none';
            $('cmcc').style.display='none';
            if (isWhere>0) {
                $('cmand').style.display="";
            } else {
                $('cmand').style.display="none";
            }
        }

        if (target.id.substr(3,3) === 'sig') {
            $('cmwhere').style.display='';
            $('cmsig').style.display='';
            $('cmlip').style.display='none';
            $('cmcc').style.display='none';
            if (isWhere>0) {
                $('cmand').style.display="";
            } else {
                $('cmand').style.display="none";
            }
        }

        if (target.id.substr(3,3) === 'sid') {
            $('cmwhere').style.display='';
            $('cmsig').style.display='';
            $('cmlip').style.display='none';
            $('cmcc').style.display='none';
        }

        if (target.id.substr(4,2) === 'cc') {
            $('cmcc').style.display='';
            $('cmwhere').style.display='none';
            $('cmand').style.display='none';
            $('cmsig').style.display='none';
            $('cmlip').style.display='none';
        }

	// document.body.scrollTop does not work in IE
	var scrollTop = document.body.scrollTop ? document.body.scrollTop :
	    document.documentElement.scrollTop;
	var scrollLeft = document.body.scrollLeft ? document.body.scrollLeft :
	    document.documentElement.scrollLeft;

	// hide the menu first to avoid an "up-then-over" visual effect
	_divContext.style.display = 'none';
	_divContext.style.left = event.clientX + scrollLeft + 'px';
	_divContext.style.top = event.clientY + scrollTop + 'px';
	_divContext.style.display = 'block';
	_replaceContext = false;
        
	return false;
    }
}

// comes from prototype.js; this is simply easier on the eyes and fingers
function $(id) {
    return document.getElementById(id);
}
