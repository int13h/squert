#!/bin/sh
# Run tcl from users PATH \
exec tclsh "$0" "$@"

#
#
#      Copyright (C) 2010 Paul Halliday <paul.halliday@gmail.com>
#
#      This program is free software: you can redistribute it and/or modify
#      it under the terms of the GNU General Public License as published by
#      the Free Software Foundation, either version 3 of the License, or
#      (at your option) any later version.
#
#      This program is distributed in the hope that it will be useful,
#      but WITHOUT ANY WARRANTY; without even the implied warranty of
#      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#      GNU General Public License for more details.
#
#      You should have received a copy of the GNU General Public License
#      along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
#

### The RIR's
set site1 "AFRINIC ftp://ftp.afrinic.net/pub/stats/afrinic/ delegated-afrinic-latest"
set site2 "APNIC ftp://ftp.apnic.net/pub/stats/apnic/ delegated-apnic-latest"
set site3 "ARIN ftp://ftp.arin.net/pub/stats/arin/ delegated-arin-latest"
set site4 "LACNIC ftp://ftp.lacnic.net/pub/stats/lacnic/ delegated-lacnic-latest"
set site5 "RIPE ftp://ftp.ripe.net/ripe/stats/ delegated-ripencc-latest"

### Consolidated outfile (the results)
set workDir "[pwd]"
set resultsFile "results.txt"

### Config
set configFile "../../.inc/config.php"

### Countries.
set countryFile "../../.inc/countries.php"

### Load extended tcl
if [catch {package require Tclx} tclxVersion] {
    puts "ERROR: Package TclX not found"
    exit
}

### Load mysql support.
if [catch {package require mysqltcl} mysqltclVersion] {
    puts "ERROR: Package mysqltcl not found"
    exit
}

### Load uri support
if [catch {package require uri} uriVersion] {
    puts "ERROR: Package uri not found"
    exit
}

### Load ftp support
if [catch {package require ftp} ftpVersion] {
    puts "ERROR: Package ftp not found"
    exit
}
if [catch {package require ftp::geturl} ftpgeturlVersion] {
    puts "ERROR: Package ftp::geturl not found"
    exit
}

### Load MD5 support
if [catch {package require md5} md5Version] {
    puts "ERROR: Package md5 not found"
    exit
}

#--------------- Procedures ---------------#

### SQL inserts
proc popMysql { query } {

    global dbSocketID
    global resultsFile    

    if {[catch {mysqlexec $dbSocketID $query} dbError]} {
        puts "ERROR: $dbError"
        cleanUp 4
        exit
    }
}

### Process data
proc proData { data fileID } {

    ### Open data file
    set fsize [file size "$data"]
    set fp [open "$data" r]
    set rawData [read $fp $fsize]
    close $fp

    ### Line counters
    set yesCount 0
    set noCount 0
   
    foreach line $rawData {   
        set line [split $line |]
    
        #### Strip !IPv4 lines and lines w/o enough fields (headers and comments)
        set test1 [lindex $line 2]
        set test2 [llength $line]
    
        if {$test1 == "ipv4" && $test2 >= 7 } {
            set go yes
            set yesCount [expr $yesCount + 1]
        } else {
            set go no
            set noCount [expr $noCount +1]
        }
 
        if {$go == "yes"} {                              
            ### We do start and value first because we need to calculate end
            set start [lindex $line 3]                   
            set value [lindex $line 4]
            
            ### Convert IP's to integers                   
            set result [ipLong $start $value]            
                                                         
            ### We can now build the results               
            set registry [lindex $line 0]                
            set cc [lindex $line 1]                      
            set type [lindex $line 2]                    
            set start [lindex $result 0]                 
            set end [lindex $result 1]                   
            set date [lindex $line 5]                    
            set status [lindex $line 6]

            ### Output to file
            puts -nonewline $fileID "$registry||$cc||[cLong $cc]||$type||$start||$end||$date||$status\n"
        }
    }

    ### Display counts.
    puts "Processed $yesCount IPv4 records and skipped $noCount.\n"

}

### IP Conversion
proc ipLong { start value } {

    set ipParts [split $start .]

    set o1 [lindex $ipParts 0]
    set o2 [lindex $ipParts 1]
    set o3 [lindex $ipParts 2]
    set o4 [lindex $ipParts 3]

    ### expr will return a (-) integer if we exclude the format.
    set n1 [format "%u" [expr $o1*16777216]]
    set n2 [format "%u" [expr $o2*65536]]
    set n3 [format "%u" [expr $o3*256]]
   
    set ipStart [format "%u" [expr $n1+$n2+$n3+$o4]]
    set ipEnd [format "%u" [expr $ipStart+($value-1)]]
   
    set answer [list $ipStart $ipEnd]

    return $answer

}

### Country long lookup
proc cLong { cc } {

    global countryArray
    set answer $countryArray($cc)
    return $answer

}

### Cleanup
proc cleanUp { code } {

    global resultsFile

    if {$code == 4} {
        if {[file exists $resultsFile]} {  
            file rename -force $resultsFile $resultsFile.failed
        }
    }        
}

#--------------- Begin Main ---------------#

### Remove old results
if {[file exists $resultsFile]} {
    file delete -force $resultsFile
}

### Check if last run failed.
if {[file exists $resultsFile.failed]} {

    set fail yes
    set a 1
    file rename -force $resultsFile.failed $resultsFile
    puts "It looks like the last run failed. Retrying.."

} else {

    set fail no
    set a 0

}

### Scan config file
if {[file exists $configFile]} {

    for_file line $configFile {

        if { [regexp {^\$([^\s]+)\s+=\s+['"]([^'"]+)['"]} $line match theVar theVal] } {

            set configArray($theVar) $theVal

        }

    }

    set DBHOST $configArray(dbHost)
    set DBUSER $configArray(dbUser)
    set DBPASS $configArray(dbPass)
    set DBNAME $configArray(dbName)
    set DBTABLE ip2c
    set DBPORT 3306

} else {

    set fail yes

}    

### Create country array
if {[file exists $countryFile]} {

    for_file line $countryFile {

        if { [regexp {\"(.*)\|(.*)\|(.*)\"} $line match country cc colour] } {

            set countryArray($cc) $country

        }

    }

} else {

    set fail yes

}

if {$fail == "no"} {

    ### Open new result file for writing
    set fileID [open $resultsFile "w"]

    ## Lets go!
    foreach site [list $site1 $site2 $site3 $site4 $site5] {

        set siteDesc [lindex $site 0]
        set siteLoc [lindex $site 1]
        set siteFile [lindex $site 2]

        array set urlparts [uri::split $siteLoc]

        if {$urlparts(user) == {}} {
            set urlparts(user) "anonymous"
        }
        if {$urlparts(pwd) == {}} {
            set urlparts(pwd) "user@localhost.localdomain"
        }
        if {$urlparts(port) == {}} {
            set urlparts(port) 21
        }

        if {[file exists $siteFile\_current.md5]} {
            file rename -force $siteFile\_current.md5 $siteFile\_last.md5
            set noMD5 no
        } else {
            set noMD5 yes
        }

        ### We do 2 runs through the list. One for MD5 and one for data. These let us
        ### know which state we are in.
        set x 0
        set state 0

        while { $x < 2 } {

            if {[set fdc [ftp::Open $urlparts(host) $urlparts(user) $urlparts(pwd) \
            	-port $urlparts(port) -mode passive]] == -1} {

                puts "$siteDesc timed out. Moving on.."
                break
            }

            if {$state == 0 && $fdc >=0} {
                set OUTFILE "$siteFile\_current.md5"
                set toGet $siteFile.md5
                set msg "Fetching $siteDesc Checksum.."
                set doGet "yes"
            } elseif {$state == 1 && $fdc >=0} {
                set OUTFILE "$siteFile.txt"
                set toGet $siteFile
            }      

            puts $msg

            if {[catch {ftp::Get $fdc $urlparts(path)/$toGet $OUTFILE} ftpError]} {
                puts "ERROR: $ftpError"
            } else {
                ftp::Close $fdc
            }

            set curMD5 [md5::md5 -hex -file $OUTFILE]

            if {$state == 0 && $fdc >=0} {
                if {$noMD5 == "yes"} {
                    set msg "Bookmark not found, Fetching $siteDesc Data."
                    set doGet yes
                    set a 1
                } else {
                    puts -nonewline "Bookmark found, looking for changes.. "             
                    set preMD5 [md5::md5 -hex -file $siteFile\_last.md5]

                    if {$preMD5 == $curMD5} {
                        puts "No revisions, skipping.\n"
                        set x [expr $x + 1]
                    } else {
                        set msg "Fetching new data from $siteDesc\n"
                        set a 1
                    }
                }
            }

            if {$state == 1 && $fdc >=0} {
                ### Afrinic formats their MD5's funny
                if {$siteDesc == "AFRINIC"} {
                    set fiveLoke 0
                } else {
                    set fiveLoke 3   
                }
          
                set fp [open "$siteFile\_current.md5" r]
                set data [read $fp]
                close $fp

                set fileMD5 [string toupper [lindex $data $fiveLoke]]
                puts -nonewline "Verifying transfer.. "

                if {$curMD5 == $fileMD5} {
                    puts "Looks good, processing.."
                    proData $OUTFILE $fileID
                } else {
                    puts "Checksum Mismatch. Retrying..\n"
                    set x [expr $x - 1]
                }
            }       

            ### Delete temporary files.
            file delete -force $siteFile\_last.md5
            file delete -force $siteFile.txt
            set x [expr $x + 1]
            set state 1
        }

    }

### Close results file.
close $fileID
}

### Do inserts
if {$a == 1} {

    ### Connect to mysqld
    set dbConnectCmd "-host $DBHOST -user $DBUSER -port $DBPORT -password $DBPASS"
    if [catch {eval mysqlconnect $dbConnectCmd} dbSocketID] {
        puts "ERROR: Unable to connect to $DBHOST on $DBPORT: Make sure mysql is running."
        puts "$dbSocketID"
        cleanUp 4
        exit
    }
                
    #### See if the DB we want to use exists
    if {[catch {mysqluse $dbSocketID $DBNAME} noDBError]} {
        puts "ERROR: $noDBError"
        cleanUp 4 
        exit
    }

    puts "Updating database.."
    popMysql "LOAD DATA LOCAL INFILE '$workDir/$resultsFile' INTO TABLE $DBNAME.$DBTABLE FIELDS TERMINATED BY '||'"

    if {[file exists $resultsFile]} {
        file delete -force $resultsFile
    }

} else {

    puts "No new information exists, exiting."

}
