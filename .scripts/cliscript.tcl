#!/usr/local/bin/tclsh

# cliscript.tcl - Based on "quickscript.tcl"
# Portions Copyright (C) 2012 Paul Halliday <paul.halliday@gmail.com>

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
    puts "Error: Package TclX not found"
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
    puts "I could not find a confguration file"
    exit 1
}

if { $argc == 8 } {
    set USR [lindex $argv 0]
    set SEN [lindex $argv 1]
    set TS  [lindex $argv 2]
    set SID [lindex $argv 3]
    set SIP [lindex $argv 4]
    set DIP [lindex $argv 5]
    set SPT [lindex $argv 6]
    set DPT [lindex $argv 7]
} else {
    puts "ERROR: Not enough arguments"
    exit 1
}

set eventInfo "\"$SEN\" \"$TS\" $SID $SIP $DIP $SPT $DPT"

# Now verify
if { ![regexp -expanded { ^\".+\"\s\"\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}\:\d{2}\"\s\d+\s\d+\.\d+\.\d+\.\d+\s\d+\.\d+\.\d+\.\d+\s\d+\s\d+$ } $eventInfo match] } {

    puts "ERROR: Arguments failed logic tests"
    exit 1

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

# Send info to Sguild
SendToSguild $socketID [list CliScript $eventInfo]

set SESSION_STATE DEBUG

# Xscript data comes in the format XscriptMainMsg window message
# Tags are HDR, SRC, and DST. They are sent when state changes.

while { 1 } {

    if { [eof $socketID] } { puts "ERROR: Lost connection to server."; exit 1 }

    if { [catch {gets $socketID} msg] } {

        puts "ERROR: $msg"
        exit 1

    }
  
    # Strip the command and faux winname from the msg
    set data [lindex $msg 2]


    switch -exact -- $data {

        HDR     { set SESSION_STATE HDR }
        SRC     { set SESSION_STATE SRC }
        DST     { set SESSION_STATE DST }
        DEBUG   { set SESSION_STATE DEBUG }
        DONE    { break }
        ERROR   { set SESSION_STATE ERROR }
        default { puts "${SESSION_STATE}: [lindex $msg 2]" }

    }

    # Exit if agent returns no data after debug
    if { $SESSION_STATE == "DEBUG" && $data == "" } {
        break
    }

}

catch {close $socketID} 
