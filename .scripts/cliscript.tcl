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

set VERSION "SGUIL-0.8.0 OPENSSL ENABLED"
set SERVER 10.13.1.226
set PORT 7734

# Comment out the following 2 lines if 
# you wish to be prompted for a user/pass

set USERNAME "paulh"
set PASSWD "oplC*($@"

#########################################################################
# Get cmd line args
#########################################################################

proc DisplayUsage { cmdName } {

    puts "Usage: $cmdName \[-s <server>\] \[-p <port>\] \[-u <username>\]"
    puts "  \[-o <filename>\] \[-sensor <sensorname>\] \[-timestamp  <timestamp>\]"
    puts "  \[-sid <sensorid>\] \[-sip <sip>\] \[-dip <dip>\]"
    puts "  \[-spt <spt>\] \[-dpt <dpt>\]\n"
    puts "  -s         <servername>: Hostname of sguild server."
    puts "  -p         <port>: Port of sguild server."
    puts "  -u         <username>: Username to connect as."
    puts "  -o         <filename>: PATH to tls libraries if needed."
    puts "  -sensor    <sensorname>: The sensor name."
    puts "  -timestamp <\"timestamp\">: Event timestamp. e.g.: \"2012-08-18 16:28:00\""
    puts "  -sid       <sensorid>: The sensor ID."
    puts "  -sip       <sip>: Source IP."
    puts "  -dip       <dip>: Destination IP."
    puts "  -spt       <spt>: Source port."
    puts "  -dpt       <dpt>: Destination port.\n"
    exit 1

}

set state flag

foreach arg $argv {

    switch -- $state {

        flag {
            switch -glob -- $arg {
                -s { set state server }
                -p { set state port }
                -u { set state username }
                -o { set state openssl }
                -sensor { set state sensorname }
                -timestamp { set state timestamp }
                -sid { set state sensorid }
                -sip { set state sip }
                -dip { set state dip }
                -spt { set state spt }
                -dpt { set state dpt }
                default { DisplayUsage $argv0 }
            }
        }

        server { set SERVER $arg; set state flag }
        port { set PORT $arg; set state flag }
        username { set USERNAME $arg; set state flag }
        openssl { set TLS_PATH $arg; set state flag }
        sensorname { set SENSORNAME $arg; set state flag }
        timestamp { set TIMESTAMP $arg; set state flag }
        sensorid { set SENSORID $arg; set state flag }
        sip { set SRCIP $arg; set state flag }
        dip { set DSTIP $arg; set state flag }
        spt { set SRCPORT $arg; set state flag }
        dpt { set DSTPORT $arg; set state flag }
        default { DisplayUsage $argv0 }

    }

}

# Check if we got all of our arguments

if { [catch {set eventInfo "$SENSORNAME \"$TIMESTAMP\" $SENSORID $SRCIP $DSTIP $SRCPORT $DSTPORT"}] } {
    DisplayUsage $argv0
} 

# Now verify

if { [regexp -expanded {

            ^.+\s
            \"\d\d\d\d-\d\d-\d\d\s\d\d:\d\d:\d\d\"\s
            \d+\s
            \d+\.\d+\.\d+\.\d+\s
            \d+\.\d+\.\d+\.\d+\s
            \d+\s
            \d+$ } $eventInfo match] } {

} else {

    DisplayUsage $argv0

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
if { [catch {tls::import $socketID} tlsError] } { 

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

# Get username if not provided at cmd line
if { ![info exists USERNAME] } {

    puts -nonewline "Enter username: "
    flush stdout
    set USERNAME [gets stdin]

}

# Get users password

if { ![info exists PASSWD] } {
    puts -nonewline "Enter password: "
    flush stdout
    exec stty -echo
    set PASSWD [gets stdin]
    exec stty echo
    flush stdout
    puts ""
}

# Authenticate with sguild
SendToSguild $socketID [list ValidateUser $USERNAME $PASSWD]

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

# DeleteEventIDList 14 none 2.3995041
# DeleteEventIDList 12 none {2.3995048 2.3995046 2.3995044 2.3995043 2.3995042 2.3995039}


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
