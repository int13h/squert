#!/usr/local/bin/tclsh

# clicat.tcl - Based on "quickscript.tcl"
# Portions Copyright (C) 2013 Paul Halliday <paul.halliday@gmail.com>

# Copyright (C) 2002-2006 Robert (Bamm) Visscher <bamm@sguil.net>
#
# This program is distributed under the terms of version 1.0 of the
# Q Public License.  See LICENSE.QPL for further details.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

########################## GLOBALS ##################################

### Load extended tcl
if [catch {package require Tclx} tclxVersion] {
    puts "ERROR: Package TclX not found"
    exit
}

set CONFIG "../.inc/config.php"
if {[file exists $CONFIG]} {
    for_file line $CONFIG {
        if { [regexp {^\$([^\s]+)\s+=\s+['"]([^'"]+)['"]} $line match theVar theVal] } {
            set configArray($theVar) $theVal
        }
    }
    set VERSION  $configArray(sgVer)
    set SERVER   $configArray(sgHost)
    set PORT     $configArray(sgPort)
} else {
    puts "ERROR: No configuration file found"
    exit 1
}

### Types:
# 0 = categorize            DeleteEventIDList status comment sid.cid list
# 1 = new autocat rule      AutoCatRequest erase sensor sip sport dip dport proto sig status comment
# 2 = enable autocat rule   EnableAutoCatRule id
# 3 = disable autocat rule  DisableAutoCatRule id

set TYPE [lindex $argv 0]

switch $TYPE {
    0 {
        if { $argc == 5 } {
            set USR [lindex $argv 1]
            set CAT [lindex $argv 2]
            set MSG [lindex $argv 3]
            set LST [lindex $argv 4]
        } else {
            puts "ERROR: Not enough arguments"
            exit 1
        } 
 
        # Verify event category
        set validCats {1 2 11 12 13 14 15 16 17}
        if { [lsearch -exact $validCats $CAT] == -1 } {
            puts "ERROR: Invalid event category"
            exit 1
        }

        # Verify event list
        if { ![regexp -expanded {^(\d+\.\d+,){0,}(\d+\.\d+$){1}} $LST match] } {
            puts "ERROR: List format error"
            exit 1
        } else {
            set SCIDLIST [split $LST ,] 
        }
        set COMMAND [list DeleteEventIDList $CAT $MSG $SCIDLIST]
    }
    1 {
        if { $argc == 12 } {
            set USR [lindex $argv 1]
            set EXP [lindex $argv 2]
            set SEN [lindex $argv 3]
            set SIP [lindex $argv 4]
            set SPT [lindex $argv 5]
            set DIP [lindex $argv 6]
            set DPT [lindex $argv 7]
            set PRT [lindex $argv 8]
            set SIG [lindex $argv 9]
            set STA [lindex $argv 10]
            set CMT [lindex $argv 11] 
        } else {
            puts "ERROR: Not enough arguments"
            exit 1
        }
        set COMMAND [list AutoCatRequest $EXP $SEN $SIP $SPT $DIP $DPT $PRT $SIG $STA $CMT]
    }
    2 {
        if { $argc == 3 } {
            set USR [lindex $argv 1]
            set AID [lindex $argv 2]
        } else {
            puts "ERROR: Not enough arguments"
            exit 1
        }
        set COMMAND [list EnableAutoCatRule $AID]
    }
    3 {
        if { $argc == 3 } {
            set USR [lindex $argv 1]
            set AID [lindex $argv 2]
        } else {
            puts "ERROR: Not enough arguments"
            exit 1
        }
        set COMMAND [list DisableAutoCatRule $AID]
    }
    default { 
        puts "ERROR: No type match was found"
        exit 1 
    }
}


#########################################################################
# Package/Extension Requirements
#########################################################################

# Check to see if a path to the tls libs was provided
if { [info exists TLS_PATH] } {

    if [catch {load $TLS_PATH} tlsError] {

        puts "ERROR: Unable to load tls libs ($TLS_PATH): $tlsError"
        DisplayUsage $argv0

    }

}

if { [catch {package require tls} tlsError] } {

    puts "ERROR: The tcl tls package does NOT appear to be installed on this sysem."
    puts "Please see http://tls.sourceforge.net/ for more info."
    exit 1

}


#########################################################################
# Procs 
#########################################################################

# A simple proc to send commands to sguild and catch errors
proc SendToSguild { socketID message } {

    if { [catch {puts $socketID $message} sendError] } {

        # Send failed. Close the socket and exit.
        catch {close $socketID} closeError

        if { [info exists sendError] } { 

            puts "ERROR: Caught exception while sending data: $sendError"

        } else {

            puts "ERROR: Caught unknown exception"

        }

        exit 1

    }

}

#########################################################################
# Main
#########################################################################

flush stdout

# Try to connect to sguild
if [catch {socket $SERVER $PORT} socketID ] {

    # Exit on fail.
    puts "ERROR: Connection failed"
    exit 1

}

# Successfully connected
fconfigure $socketID -buffering line

# Check version compatibality
if [catch {gets $socketID} serverVersion] {

    # Caught an unknown error
    puts "ERROR: $serverVersion"
    catch {close $socketID}
    exit 1

}

if { $serverVersion == "Connection Refused." } {

    # Connection refused error
    puts "ERROR: $serverVersion"
    catch {close $socketID}
    exit 1

} 

if { $serverVersion != $VERSION } {

    # Mismatched versions
    catch {close $socketID}
    puts "ERROR: Mismatched versions.\nSERVER= ($serverVersion)\nCLIENT= ($VERSION)"
    exit 1

}

# Send the server our version info
SendToSguild $socketID [list VersionInfo $VERSION]

# SSL-ify the socket
if { [catch {tls::import $socketID -ssl2 false -ssl3 false -tls1 true } tlsError] } { 
    puts "ERROR: $tlsError"
    exit 1

}

# Give SSL a sec
after 1000

# Send sguild a ping to confirm comms
SendToSguild $socketID "PING"
# Get the PONG
set INIT [gets $socketID]

#
# Auth starts here
#

# Get users password
set PWD [gets stdin]

# Authenticate with sguild
SendToSguild $socketID [list ValidateUser $USR $PWD]

# Get the response. Success will return the users ID and failure will send INVALID.
if { [catch {gets $socketID} authMsg] } { 

    puts "ERROR: $authMsg"
    exit 1

}

set authResults [lindex $authMsg 1]
if { $authResults == "INVALID" } { 

    puts "ERROR: Authentication failed."
    exit 1

}

# Send command to sguild
SendToSguild $socketID $COMMAND

catch {close $socketID} 
puts -nonewline "0"
exit 0
