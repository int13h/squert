#!/usr/bin/perl
#
# Copyright (c) 2009 by Raffael Marty and Chrisitan Beedgen
# 
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#  
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
#
# Written by:	Christian Beedgen (krist@digitalresearch.org)
# 		Raffael Marty (ram@cryptojail.net)
#
# Version:	1.6.0
#
# URL:		http://afterglow.sourceforge.net
#
# Sample Usage:
# 		tcpdump -vttttnnelr /home/ram/defcon.07.31.10.14.tcpdump.1 | 
# 		./tcpdump2csv.pl "sip dip ttl" | ../graph/afterglow.pl 
# 		-c /home/ram/color.defcon.properties -p 2 | neato -Tgif -o test.gif
#
# Known Issues:	
# 		1. Parser splits on the first and second comma. Input like: 
# 			"sss,ggg","asdf,ass",sss
# 		   is not parsed correctly! Need to use Text::CSV
#		2. Also, if the labels contain " it screws up the handling of nodes
#
# ChangeLog:	
#
# 1.1		Adding option to omit node labels	
# 1.1.1		Adding option to color nodes
# 1.1.2		Adding option to make nodes invisible
# 1.1.3		Adding option to eliminate one to one edges (omit threshold)
# 1.1.4		Adding option to show node counts
# 1.1.5		Adding option to color edges
# 1.1.6		Fixing node counts for non-common event nodes
# 1.2		Refining labels: Instead of just setting them globally, allow for 
# 		setting them per node type. Also if no label is applied, the node 
# 		should be smaller
# 		Making event nodes smaller by default
# 1.3		Adding capability to define colors independant
# 		of the node (color=...)
#		Introducing label.{source,event,targate}=[0|1] to disable labels
# 1.4		Clustering Nodes together into one cluster
# 		cluster=expression
#		cluster.{source,event,target}=expression
#		Functions: any_regex()
#			   regex()
#			   match()
#			   regex_replace()
#		Functions work for clusters and colors!
#		Fixing omit-threshold bug. Only draw edges if BOTH nodes have
#		a higher threshold, not just one of them.
# 1.5		Adding GNU license. Finally!
# 		Playing with fan-out filtering (introducing -f and -g command line switches)
#		Indicating line number where error occured in property file
#		Adding "exit" property file entry to stop processing
#		Fixing property file parsing to be more flexible (bug in regex: s to \s)
#		Fixing annoyance with "no color assigned" errors, assign default colors 
#		if not explicitely set in property file.
# 1.5.1		Making parsing of property file a bit more flexible
#		Adding subnet() function
#		Adding field() function, returning the current field value
#		Adding version information to usage();
#		Fixing error message "not a color: " that showed all the time
#		  it was checking edge colors when they were not even defined
#		Don't evaluate clusters, if no clusters defined.
#		Trying to do some code optimization by checking whether
#		  a certain feature is needed
#		Doing some optimization by intorudcing a color cache! MUCH faster!
#		TBD: Introduce a cluster cache!
#		TBD: Are there variables that can be omitted by using others?
# 1.5.2		There was a bug for the event fan out threshold which would cause
# 		that the source nodes would not be drawn with the -g option!
# 1.5.3		There was a bug when you use -p 1 and -f 1. The source nodes
# 		are eliminated for clusters that should not show, but the rest of the 
# 		nodes were still drawn!
# 1.5.4		New configuration option: variable. Code in this assignment will be 
# 		executed in the beginning and can be used to boot-strap variables
# 1.5.5		The invisible color check needs to be after clustering!
# 1.5.6		Fixing bug that match() would not work in the color assignment
# 		Basically globalField was not set.
#		Removed regex() function. match() is doing the same thing ... Duh...
# 1.5.7		Adding label to the graph : -a option, enabled by default
#		Color nodes which are sources and targets at the same time with a specific
#		color. A new property in the properties file:
#			color.sourcetarget=...
#		This was something I had planned before and Neil Desai pushed me a bit to
#		finally get it done. 
#		Neil Desai contributed a couple of lines of code to use Text::CSV to do 
#			safe CSV parsing. Thanks!
# 1.5.8		Allowing size on nodes to be configured!
# 			size.[source|target|event]=<perl returning integer>
#		Option to define the maximum node size on command line (-m <value>)
#			maxnodesize=<value> also defines the maximum node size, but in 
#		the property file. See README for more information on sizing.
#		Define whether AfterGlow should automatically sum nodes or not.
#			sum.[source|target|event]=[0|1];
#	        By default scaling is disabled.
#		Added capability to define thresholds per node type in properties file
#			threshold.[source|event|target]=<threshold>;
#		Added capability for changing the node shape:
#			shape.[source|event|target]=
#			    (box|polygon|circle|ellipse|invtriangle|octagon|pentagon|diamond|point|triangle|plaintext)
#		Removed semicolon at end of every line in property file.
#		Updated description for -o action in usage().
#		Updated the link to the graphviz project.
#		Coloring bug with source/target nodes
#			Along the way I changed the semantics a bit:
#			- source color wins over target color for sourc/target nodes,
#			  if the source/target color is not set!
#			- "color" wins over source and target color for source/target nodes, if 
#			  the source/target color is not set!
#		I did some research around edge sizes. Sorry, graphviz does not support it.
#		Label color was never implemented. Fixed
#		Fixing a bug related to sourcetarget colors. The variable had a capital T.
#			This should make the "not a color:" error go away!
#		Added new heuristic to determine color. A catch-all assignment will not be considered
#		if there was a more specific assignment that was possible. See README for more details.
# 1.5.9		Adding property to add a URL element to nodes. See sample.properties for an example.
#		Adding label property to change labels on nodes. This overwrites the old 
#			label.(source|event|target) to use not only boolean values.
#			If you are using [0|1] it turns labels on or off. Otherwise it uses the 
#			expression as the label
#		New is also that you can define "label" which defines the label for all the nodes
# 1.6.0		If you had quote around the shape value, it would not recignize it. Fixed.
# 		label.(source|event|target)=0 now turns off labels for real.
#		Adding edge thickness:
#			size.edge=<perl returning integer>
#			Note that the sizes are absolute! No scaling done!
#			The default edge size is 1
#		Another fix for the "not a color:" error. Only scream if a color as actually set
#		New command line functions:
#			-q      : Quiet mode. Suppress all output. Attention! 
#			-i file : Read input from a file, instead of from STDIN
#			-w file : Write output to a file, instead of to STDOUT
#       Adding new get_severity function for configs to color based on a severity:
#           color.source=get_severity($fields[2])
#           color.source=get_severity($fields[0],20)
#           Second, optional argument, is for the maximum number of steps. The highest
#           severity is red, the lowest is green, the ones inbetween shades.
#	
##############################################################

# ------------------------------------------------------------
# Main program.
# ------------------------------------------------------------

# Program version
my $version = "1.6.0";

use Text::CSV;
my $csvline = Text::CSV->new();

# Whether or not verbose mode is enabled.
# A value of '1' indicates that verbose mode is enabled.
# By default, verbose mode is disabled.
my $verbose = 0;

my $DEBUG = 0;

# Whether or not to split source and target nodes.
# A value of '1' indicates that the nodes will be split.
# Any other value means the nodes will not be split.
my $splitSourceAndTargetNodes = 0;

# Split mode for event nodes.
my $eventNodeSplitMode = 0;

# The number of lines to skip before starting to read.
my $skipLines = 0;

# Two node mode (objects are skipped).
my $twonodes = 0;

# The maximum number of lines to read.
my $maxLines = 999999;

# Print node labels? (yes by default)
my $nodeLabels = 1;

# source node label?
$sourceLabel=1;

# target node label?
$targetLabel=1;

# event node label?
$eventLabel=1;

# default edge length
my $edgelen = 3;

# default label color
my $labelColor = "black";

# default edge size
my $defaultEdgeSize = 1;

# invisible color
my $invisibleColor = "invisible";

# Ommit node-count. 1 means that every node with a count of 1 or smaller is not drawn!
my $omitThreshold = 0;
my $sourceThreshold = 0;
my $targetThreshold = 0;
my $eventThreshold = 0;

# Fan out of nodes to omit. 1 means that every node with a fan out of one is omitted.
my $sourceFanOutThreshold = 0;

# Fan out of nodes to omit. 1 means that every node with a fan out of one is omitted.
my $eventFanOutThreshold = 0;

# Clustering Nodes? 	name -> regex
my @clusters;
my @source_clusters;
my @event_clusters;
my @target_clusters;

# Print Node Count
my $nodeCount = 0;

# Edge Style
my $edgeStyle = "solid";

# Maximum Node Size, default is 0.2
my $maxNodeSize = 0.2;
# Don't want any division by zero ;)
my $maxActualSourceNodeSize = 1;
my $maxActualTargetNodeSize = 1;
my $maxActualEventNodeSize = 1;

# Disabling summary of sizes by default
my $sumSource = 0;
my $sumTarget = 0;
my $sumEvent = 0;

my $shapeSource = "ellipse";
my $shapeTarget = "ellipse";
my $shapeEvent = "ellipse";

# URL for nodes, off by default
my $url=0;

# Process commandline options.
&init;

# Echo options if verbose.
print STDERR "Verbose mode is on.\n" if $verbose;
print STDERR "Skipping $skipLines lines.\n" if $verbose;
print STDERR "Reading a maximum of $maxLines lines.\n" if $verbose;
print STDERR "Two node mode (objects are skipped.\n" if $verbose && $twonodes;
print STDERR "Splitting source and target nodes.\n" if $verbose && $splitSourceAndTargetNodes;
print STDERR "Split mode for events is $eventNodeSplitMode.\n" if $verbose;
print STDERR "Threshold $omitThreshold.\n" if $verbose;
print STDERR "Source Threshold $sourceThreshold.\n" if $verbose;
print STDERR "Target Threshold $targetThreshold.\n" if $verbose;
print STDERR "Event Threshold $eventThreshold.\n" if $verbose;
print STDERR "Maximum Node Size $maxNodeSize.\n" if $verbose;
# TBD: Add new options!
print STDERR "\n" if $verbose;

&propertyfile;

# the color map
%colorIndex = ();
$colorIndexCount=1;
@colors=qw{aliceblue antiquewhite antiquewhite1 antiquewhite2
antiquewhite3 antiquewhite4 aquamarine aquamarine1 aquamarine2 aquamarine3
aquamarine4 azure azure1 azure2 azure3 azure4 beige bisque bisque1
bisque2 bisque3 bisque4 black blanchedalmond blue blue1 blue2 blue3
blue4 blueviolet brown brown1 brown2 brown3 brown4 burlywood burlywood1
burlywood2 burlywood3 burlywood4 cadetblue cadetblue1 cadetblue2
cadetblue3 cadetblue4 chartreuse chartreuse1 chartreuse2 chartreuse3
chartreuse4 chocolate chocolate1 chocolate2 chocolate3 chocolate4
coral coral1 coral2 coral3 coral4 cornflowerblue cornsilk cornsilk1
cornsilk2 cornsilk3 cornsilk4 crimson cyan cyan1 cyan2 cyan3 cyan4
darkgoldenrod darkgoldenrod1 darkgoldenrod2 darkgoldenrod3 darkgoldenrod4
darkgreen darkkhaki darkolivegreen darkolivegreen1 darkolivegreen2
darkolivegreen3 darkolivegreen4 darkorange darkorange1 darkorange2
darkorange3 darkorange4 darkorchid darkorchid1 darkorchid2 darkorchid3
darkorchid4 darksalmon darkseagreen darkseagreen1 darkseagreen2
darkseagreen3 darkseagreen4 darkslateblue darkslategray darkslategray1
darkslategray2 darkslategray3 darkslategray4 darkslategrey darkturquoise
darkviolet deeppink deeppink1 deeppink2 deeppink3 deeppink4 deepskyblue
deepskyblue1 deepskyblue2 deepskyblue3 deepskyblue4 dimgray dimgrey
dodgerblue dodgerblue1 dodgerblue2 dodgerblue3 dodgerblue4 firebrick
firebrick1 firebrick2 firebrick3 firebrick4 floralwhite forestgreen
gainsboro ghostwhite gold gold1 gold2 gold3 gold4 goldenrod goldenrod1
goldenrod2 goldenrod3 goldenrod4 gray gray0 gray1 gray10 gray100 gray11
gray12 gray13 gray14 gray15 gray16 gray17 gray18 gray19 gray2 gray20
gray21 gray22 gray23 gray24 gray25 gray26 gray27 gray28 gray29 gray3
gray30 gray31 gray32 gray33 gray34 gray35 gray36 gray37 gray38 gray39
gray4 gray40 gray41 gray42 gray43 gray44 gray45 gray46 gray47 gray48
gray49 gray5 gray50 gray51 gray52 gray53 gray54 gray55 gray56 gray57
gray58 gray59 gray6 gray60 gray61 gray62 gray63 gray64 gray65 gray66
gray67 gray68 gray69 gray7 gray70 gray71 gray72 gray73 gray74 gray75
gray76 gray77 gray78 gray79 gray8 gray80 gray81 gray82 gray83 gray84
gray85 gray86 gray87 gray88 gray89 gray9 gray90 gray91 gray92 gray93
gray94 gray95 gray96 gray97 gray98 gray99 green green1 green2 green3
green4 greenyellow grey grey0 grey1 grey10 grey100 grey11 grey12 grey13
grey14 grey15 grey16 grey17 grey18 grey19 grey2 grey20 grey21 grey22
grey23 grey24 grey25 grey26 grey27 grey28 grey29 grey3 grey30 grey31
grey32 grey33 grey34 grey35 grey36 grey37 grey38 grey39 grey4 grey40
grey41 grey42 grey43 grey44 grey45 grey46 grey47 grey48 grey49 grey5
grey50 grey51 grey52 grey53 grey54 grey55 grey56 grey57 grey58 grey59
grey6 grey60 grey61 grey62 grey63 grey64 grey65 grey66 grey67 grey68
grey69 grey7 grey70 grey71 grey72 grey73 grey74 grey75 grey76 grey77
grey78 grey79 grey8 grey80 grey81 grey82 grey83 grey84 grey85 grey86
grey87 grey88 grey89 grey9 grey90 grey91 grey92 grey93 grey94 grey95
grey96 grey97 grey98 grey99 honeydew honeydew1 honeydew2 honeydew3
honeydew4 hotpink hotpink1 hotpink2 hotpink3 hotpink4 indianred
indianred1 indianred2 indianred3 indianred4 indigo ivory ivory1 ivory2
ivory3 ivory4 khaki khaki1 khaki2 khaki3 khaki4 lavender lavenderblush
lavenderblush1 lavenderblush2 lavenderblush3 lavenderblush4 lawngreen
lemonchiffon lemonchiffon1 lemonchiffon2 lemonchiffon3 lemonchiffon4
lightblue lightblue1 lightblue2 lightblue3 lightblue4 lightcoral
lightcyan lightcyan1 lightcyan2 lightcyan3 lightcyan4 lightgoldenrod
lightgoldenrod1 lightgoldenrod2 lightgoldenrod3 lightgoldenrod4
lightgoldenrodyellow lightgray lightgrey lightpink lightpink1 lightpink2
lightpink3 lightpink4 lightsalmon lightsalmon1 lightsalmon2 lightsalmon3
lightsalmon4 lightseagreen lightskyblue lightskyblue1 lightskyblue2
lightskyblue3 lightskyblue4 lightslateblue lightslategray lightslategrey
lightsteelblue lightsteelblue1 lightsteelblue2 lightsteelblue3
lightsteelblue4 lightyellow lightyellow1 lightyellow2 lightyellow3
lightyellow4 limegreen linen magenta magenta1 magenta2 magenta3 magenta4
maroon maroon1 maroon2 maroon3 maroon4 mediumaquamarine mediumblue
mediumorchid mediumorchid1 mediumorchid2 mediumorchid3 mediumorchid4
mediumpurple mediumpurple1 mediumpurple2 mediumpurple3 mediumpurple4
mediumseagreen mediumslateblue mediumspringgreen mediumturquoise
mediumvioletred midnightblue mintcream mistyrose mistyrose1 mistyrose2
mistyrose3 mistyrose4 moccasin navajowhite navajowhite1 navajowhite2
navajowhite3 navajowhite4 navy navyblue oldlace olivedrab olivedrab1
olivedrab2 olivedrab3 olivedrab4 orange orange1 orange2 orange3 orange4
orangered orangered1 orangered2 orangered3 orangered4 orchid orchid1
orchid2 orchid3 orchid4 palegoldenrod palegreen palegreen1 palegreen2
palegreen3 palegreen4 paleturquoise paleturquoise1 paleturquoise2
paleturquoise3 paleturquoise4 palevioletred palevioletred1 palevioletred2
palevioletred3 palevioletred4 papayawhip peachpuff peachpuff1 peachpuff2
peachpuff3 peachpuff4 peru pink pink1 pink2 pink3 pink4 plum plum1 plum2
plum3 plum4 powderblue purple purple1 purple2 purple3 purple4 red red1
red2 red3 red4 rosybrown rosybrown1 rosybrown2 rosybrown3 rosybrown4
royalblue royalblue1 royalblue2 royalblue3 royalblue4 saddlebrown salmon
salmon1 salmon2 salmon3 salmon4 sandybrown seagreen seagreen1 seagreen2
seagreen3 seagreen4 seashell seashell1 seashell2 seashell3 seashell4
sienna sienna1 sienna2 sienna3 sienna4 skyblue skyblue1 skyblue2 skyblue3
skyblue4 slateblue slateblue1 slateblue2 slateblue3 slateblue4 slategray
slategray1 slategray2 slategray3 slategray4 slategrey snow snow1
snow2 snow3 snow4 springgreen springgreen1 springgreen2 springgreen3
springgreen4 steelblue steelblue1 steelblue2 steelblue3 steelblue4
tan tan1 tan2 tan3 tan4 thistle thistle1 thistle2 thistle3 thistle4
tomato tomato1 tomato2 tomato3 tomato4 transparent turquoise turquoise1
turquoise2 turquoise3 turquoise4 violet violetred violetred1 violetred2
violetred3 violetred4 wheat wheat1 wheat2 wheat3 wheat4 white invisible};

# Bunch of associative arrays we will need.
%sourceMap = (); %eventMap = (); %targetMap = ();
%sourceEventLinkMap = (); %eventTargetLinkMap = ();
%sourceTargetLinkMap = {};
our (@sourceColorExp, @targetColorExp, @eventColorExp, @edgeColorExp, @sourcetargetColorExp);
# size of nodes
our (@sourceSizeExp,@targetSizeExp,@eventSizeExp);
# size of edges
our (@edgeSizeExp);
# labels of nodes
our (@sourceLabelExp,@targetLabelExp,@eventLabelExp);

# counting how many times the nodes show up
our (%sourceCount, %eventCount, %targetCount);
our %sourceFanOut = {};
our %eventFanOut = {};
# if fan out threshold are used, this hash is used to keep track of th enodes
# that need to be printed. Otherwise there are orphand nodes lingering in the graph
our %printNode = {};

# need this for the property functions
our $globalField;

# Write dot header.
print "digraph structs {\n";

# global parameters
if ($label) { 
	print "graph [label=\"AfterGlow ".$version;
	# if ($splitSourceAndTargetNodes) { print "split ";
	if ($eventNodeSplitMode) {print " - Split Mode: ".$eventNodeSplitMode;}
	if ($omitThreshold) {print " - Omit Threshold: ".$omitThreshold;}
	if ($sourceThreshold) {print " - Source Threshold: ".$sourceThreshold;}
	if ($eventThreshold) {print " - Event Threshold: ".$eventThreshold;}
	if ($targetThreshold) {print " - Target Threshold: ".$targetThreshold;}
	if ($sourceFanOutThreshold) {print " - Source Fan Out: ".$sourceFanOutThreshold;}
	if ($eventFanOutThreshold) {print " - Event Fan Out: ".$eventFanOutThreshold;}
	if ($propFileName) {print " - Property File: ".$propFileName;}
	print "\", fontsize=8]\n"; 
} else {
	print "graph [label=\"AfterGlow ".$version."\", fontsize=8];\n";
}

# print "graph [bgcolor=black];\n";
# print "node [shape=ellipse, fillcolor=deepskyblue3, style=filled, fontsize=10, width=0.5, height=0.08, label=\"$source\"];\n";

my $options = "";

if (defined(@sourceSizeExp) || defined(@eventSizeExp) || defined(@targetSizeExp)) { 
	$options = ", fixedsize=true";
}

if ($url) {
	$options .= ", URL=\"$url\"";
}

print "node [shape=ellipse, style=filled, fontsize=10, width=$maxNodeSize, height=$maxNodeSize, fontcolor=$labelColor $options];\n";
print "edge [len=$edgelen];\n";

# The line counter.

$lineCount = 0;

# Read each line from the file.
while (($lineCount < $skipLines + $maxLines) and $line = <STDIN>) {
   
    chomp ($line);   	

    # Increment the line count.
    $lineCount += 1;
    
    # Verbose progress output.
    if ($verbose) {
       if ($lineCount < $skipLines) { $skippedLines = $lineCount; }
       else { $skippedLines = $skipLines; }
       $processedLines = $lineCount - $skipLines if $verbose;
       print STDERR "\rLines read so far: $lineCount. Skipped: $skippedLines. Processed: $processedLines";
    }

    # Are we still suppoed to skip lines?
    next if $lineCount < $skipLines;
    
    # Split the input into source, event and target.
    $csvline->parse($line);
    @fields = $csvline->fields();

    if ($twonodes) {
        $source = $fields[0];
	$target = $fields[1];
        print STDERR "====> Processing: $source -> $target\n" if $verbose;
    }
    else {
        $source = $fields[0];
	$event = $fields[1];
	$target = $fields[2];
        $meta1 = $fields[3];
        $meta2 = $fields[4];
        print STDERR "====> Processing: $source -> $event -> $target\n" if $verbose;
    };

    # Figure out the clustering

    # if any of the cluster regexes matches, make a new node with the cluster name
    if (defined(@clusters)) { 
        $type="source";
	$source=getCluster($source,@clusters); 
        $type="target";
    	$target=getCluster($target,@clusters);
        $type="event";
        $event=getCluster($event,@clusters) unless ($twonodes);
    }
    if (defined(@source_clusters)) { 
        $type="source";
	$source=getCluster($source,@source_clusters);
    }
    if ( (defined(@event_clusters)) && (!$twonodes) ) { 
    	$type="event";
        $event=getCluster($event,@event_clusters); 
    }
    if (defined(@target_clusters)) { 
        $type="target";
        $target=getCluster($target,@target_clusters);
    }

    # we also have to change the fields array, not just the individual values
    # in order to make the colors work, they are using the fields array!
    if ($twonodes) {
	    # Wow... UGLY. BUT: If you are using a -t option on a three-column input,
	    # you might want to use the third column to steer some kind of property (size, etc.)
	    # In order for that to work, we need to add this value back here ;)
	    @fields=($source,$target,$fields[2]); 
    } else {
	    @fields=($source,$event,$target,$meta1,$meta2);
    }

    # End Clustering

    # Edges with invisible nodes are discarded all the way
    if (getColor("sourcetarget", @fields) eq $invisibleColor) { next; }
    if ($twonodes) {
	    if ((getColor("source", @fields) eq $invisibleColor) 
		|| (getColor("target", @fields) eq $invisibleColor)) { next; }

    } else {
	    if ((getColor("source", @fields) eq $invisibleColor) 
		|| (getColor("event",@fields) eq $invisibleColor)
		|| (getColor("target", @fields) eq $invisibleColor)) { next; }
    }

    # Figure out the node names.
    $sourceName = &getSourceName($source, $event, $target, $splitSourceAndTargetNodes);
    $eventName = &getEventName($source, $event, $target, $splitSourceAndTargetNodes) unless ($twonodes);
    $targetName = &getTargetName($source, $event, $target, $splitSourceAndTargetNodes);

    # Figure out color for source node and store it. 
    # Known limitation: the last value this evaluates to is the one that will be used.
    # A nice thing would be nodes that have multiple colors.
    $sourceColorMap{$sourceName} = getColor("source", @fields);

    # count how many times a source shows up. This allows for filtering based on how many times
    # a node is used in the graph.
    $sourceCount{$sourceName} += 1;

    # keep track of the node's label
    $source=getLabel("source", @fields);
    # print STDERR "sourceLabel: $source / @fields\n";
    if ($source eq "__NULL_") {
	$sourceMap{$sourceName} = ""; 		
    } else {
	$sourceMap{$sourceName} = $source;
    }

    # keep track of fan out : a reference to the hash!
    # only evaluate if option is used!
    if ($sourceFanOutThreshold > 0) {
	    my $temp = $sourceFanOut{$sourceName};
	    my %foo = %$temp;

	    if ($twonodes) {
		$foo{$targetName}=1;
	    } else {
		$foo{$eventName}=1;
	    }
	    $sourceFanOut{$sourceName} = \%foo;
    }

    # calculate the size of the node
    if (defined(@sourceSizeExp)) { 
	    # calculate the size of the node. Add to existing value to take care of 
	    # source/target nodes and nodes showing up multiple times
	    if ($sumSource) {
		    $sourceNodeSize{$sourceName} += getSize("source",@fields);
	    } else {
		    $sourceNodeSize{$sourceName} = getSize("source",@fields);
	    }
    	    if ($sourceNodeSize{$sourceName} > $maxActualSourceNodeSize) { $maxActualSourceNodeSize = $sourceNodeSize{$sourceName}; }
    }


    if (!$twonodes) {
	    # repeat all the above for the event node
	    $eventColorMap{$eventName} = getColor("event", @fields);
	    $eventCount{$eventName} += 1;
	    $event=getLabel("event", @fields);
	    if ($event eq "__NULL_") {
		$eventMap{$eventName} = ""; 		
	    } else {
		$eventMap{$eventName} = $event;
	    }
	    
    	    if ($eventFanOutThreshold > 0) {
		    # fan out : a reference to the hash!
		    $temp = $eventFanOut{$eventName};
		    my %foo = %$temp;
		    $foo{$targetName}=1;
		    $eventFanOut{$eventName} = \%foo;
	    }

	    # calculate the size of the node. Add to existing value to take care of 
	    # source/target nodes and nodes showing up multiple times
	    if (defined(@eventSizeExp)) { 
	    	    if ($sumEvent) {
			    $eventNodeSize{$eventName} += getSize("event",@fields);
		    } else {
			    $eventNodeSize{$eventName} = getSize("event",@fields);
		    }
    	   	    if ($eventNodeSize{$eventName} > $maxActualEventNodeSize) { $maxActualEventNodeSize = $eventNodeSize{$eventName}; }
	    }

    }
    
    # repeat all the above for the target node
    $targetColorMap{$targetName} = getColor("target", @fields);
    $targetCount{$targetName} += 1;
    $target=getLabel("target", @fields);
    if ($target eq "__NULL_") {
   	$targetMap{$targetName} = ""; 		
    } else {
        $targetMap{$targetName} = $target;
    }
    if (defined(@targetSizeExp)) { 
	    if ($sumTarget) {
		    $targetNodeSize{$targetName} += getSize("target",@fields);
	    } else {
		    $targetNodeSize{$targetName} = getSize("target",@fields);
	    }
	    if ($targetNodeSize{$targetName} > $maxActualTargetNodeSize) { $maxActualTargetNodeSize = $targetNodeSize{$targetName}; }
    }

    # source / target nodes... Because the node is going to be a source and target, it is okay
    # to only keep track of the color for the source node.
    $sourcetargetColorMap{$sourceName} = getColor ("sourcetarget", @fields);

    # Edge Colors::
			
    # Add to maps. We need this is order to pick the proper
    # name for each node to add labels and other properties.
    if ($twonodes) {

        $sourceTargetLinkName = "$sourceName $targetName";
        $sourceTargetLinkMap{$sourceTargetLinkName} = $sourceTargetLinkName; 

        # Edge Color
	if (defined(@edgeColorExp)) {
		$edgeColor{$sourceTargetLinkName} = getColor("edge",@fields);
	}
	# Edge Size
	if (defined(@edgeSizeExp)) {
		$edgeSize{$sourceTargetLinkName} = getSize("edge",@fields);
	}


    } else {

        $sourceEventLinkName = "$sourceName $eventName";
        $sourceEventLinkMap{$sourceEventLinkName} = $sourceEventLinkName;

        # Edge Color
	if (defined(@edgeColorExp)) {
		$edgeColor{$sourceEventLinkName} = getColor("edge",@fields);
	}
	# Edge Size
	if (defined(@edgeSizeExp)) {
		$edgeSize{$sourceEventLinkName} = getSize("edge",@fields);
	}

        $eventTargetLinkName = "$eventName $targetName";
        $eventTargetLinkMap{$eventTargetLinkName} = $eventTargetLinkName;

        # Edge Color
	if (defined(@edgeColorExp)) {
		$edgeColor{$eventTargetLinkName} = getColor("edge",@fields);
	}
	# Edge Size
	if (defined(@edgeSizeExp)) {
		$edgeSize{$eventTargetLinkName} = getSize("edge",@fields);
	}

    }

}

# We are done with all the book kepping, output everything we learned

# First print the edges
if ($twonodes) {

    for my $sourceTargetLinkName (keys %sourceTargetLinkMap) {

        # TBD: Can we make this parsing safer?
	my ($sourceName, $targetName) = $sourceTargetLinkName =~ /("[^"]*") (.*)/;

	# do the fan out calculation
	my $size=1; # set to one to make the check further down true if the threshold 
		    # is not set
    	if ($sourceFanOutThreshold > 0) {
		my $temp = $sourceFanOut{$sourceName};
		$size = keys %$temp;
	}

	# either of the nodes needs a support of > $omitThreshold to be drawn
	# and the source-node needs a fan out > sourceFanOutThreshold
	if (($sourceCount{$sourceName} > $omitThreshold) 
		&& ($sourceCount{$sourceName} > $sourceThreshold)
		&& ($targetCount{$targetName} > $omitThreshold) 
		&& ($targetCount{$targetName} > $targetThreshold)
		&& ($size > $sourceFanOutThreshold) ) {

		# Color
		my $color = ();
		if (defined(@edgeColorExp)) {
			$color = "color=".$edgeColor{$sourceTargetLinkName}.", style=$edgeStyle";
		}

		# Size
		my $size = ();
		if (defined(@edgeSizeExp)) {
			if (defined($color)) {
				$size = ", ";	
			}
			$size .= "penwidth=".$edgeSize{$sourceTargetLinkName};

			# print STDERR "size: $size / color: $color\n";
		}
		
		# Source -> target link. 


		if ($color || $size) {
			print "$sourceName -> $targetName [$color$size];\n"; 
		} else {
			print "$sourceName -> $targetName;\n"; 
		}

		$printNode{$sourceName}=1;
		$printNode{$targetName}=1;

	} else {

		print STDERR "Omitting: $sourceName -> $targetName\n" if ($verbose);
		
	}

    }

} else {

	# we need to do the event target pair first do determine Problem Number 1 below
    for my $sourceEventLinkName (keys %sourceEventLinkMap) {
        
        # Source -> event link.
	my ($sourceName, $eventName) = $sourceEventLinkName =~ /("[^"]*") (.*)/;

	my $sourceSize = 1;
    	if ($sourceFanOutThreshold > 0) {
		my $temp = $sourceFanOut{$sourceName};
		$sourceSize = keys %$temp;
	}
	my $eventSize = 1;
    	if ($eventFanOutThreshold > 0) {
		my $temp = $eventFanOut{$eventName};
		$eventSize = keys %$temp;
	}
	
	#print STDERR "sourceFanOut: $sourceName: $size\n";

	if (($sourceCount{$sourceName} > $omitThreshold) 
		&& ($sourceCount{$sourceName} > $sourceThreshold)
		&& ($eventCount{$eventName} > $omitThreshold)
		&& ($eventCount{$eventName} > $eventThreshold)
		&& ($sourceSize > $sourceFanOutThreshold) 
		&& ($eventSize > $eventFanOutThreshold) ) {

		# Color
		my $color = ();
		if (defined(@edgeColorExp)) {
			$color = "color=".$edgeColor{$sourceEventLinkName}.",style=$edgeStyle";
		}
	
		# Size
		my $size = ();
		if (defined(@edgeSizeExp)) {
			if (defined($color)) {
				$size = ", ";	
			}
			$size .= "penwidth=".$edgeSize{$sourceEventLinkName};

			# print STDERR "size: $size / color: $color\n";
		}
		
		# Source -> Event link. 

		if ($color || $size) {
			print "$sourceName -> $eventName [$color$size];\n"; 
		} else {
			print "$sourceName -> $eventName;\n"; 
		}

		$printNode{$sourceName}=1;
		$printNode{$eventName}=1;

	} else {

		print STDERR "Omitting: $sourceName -> $eventName\n" if ($verbose);

	}

    }

    for my $eventTargetLinkName (keys %eventTargetLinkMap) {

        # Event -> target link.
	my ($eventName, $targetName) = $eventTargetLinkName =~ /("[^"]*") (.*)/;

	if (!$printNode{$eventName}) {
		next;
	}

	my $size = 1;
    	if ($eventFanOutThreshold > 0) {
		my $temp = $eventFanOut{$eventName};
		$size = keys %$temp;
	}
	
	if ( ($eventCount{$eventName} > $omitThreshold) 
		&& ($eventCount{$eventName} > $eventThreshold)
		&& ($targetCount{$targetName} > $omitThreshold)
		&& ($targetCount{$targetName} > $targetThreshold)
		&& ($size > $eventFanOutThreshold) ) {
		# print STDERR "targetFanOut: $targetName: $size\n";

		# Color
		my $color = ();
		if (defined(@edgeColorExp)) {
			$color = "color=".$edgeColor{$eventTargetLinkName}.",style=$edgeStyle";
		}

		# Size
		my $size = ();
		if (defined(@edgeSizeExp)) {
			if (defined($color)) {
				$size = ", ";	
			}
			$size .= "penwidth=".$edgeSize{$eventTargetLinkName};

			# print STDERR "size: $size / color: $color\n";
		}
		
		# Source -> Event link. 

		if ($color || $size) {
			print "$eventName -> $targetName [$color$size];\n"; 
		} else {
			print "$eventName -> $targetName;\n"; 
		}
		
		$printNode{$eventName}=1;
		$printNode{$targetName}=1;

	} else {

		# Probelm Number 1: if the eventNode or the targetNode is not displayed for 
		# some reason, we have to check that the sourceNode that belongs to these guys 
		# still has neighbors! Otherwise it has to be eliminated as well!
		# This scenario is taken care of in the next section...
		
		print STDERR "Omitting: $eventName -> $targetName\n" if ($verbose);

	}
    }



}
   
# Write properties for the source nodes.
foreach $sourceName (keys %sourceMap) {

    my $size=1;
    if ($sourceFanOutThreshold > 0) {
	    my $temp = $sourceFanOut{$sourceName};
	    $size = keys %$temp;
    }
	
    if (($sourceCount{$sourceName} <= $omitThreshold) 
	    || ($sourceCount{$sourceName} <= $sourceThreshold)
	    || ($size <= $sourceFanOutThreshold) 
    	    || (!$printNode{$sourceName}) )  {
		
	$sourceMap{$sourceName}=(); 	# set to null so it could still 
					# be written as the target node
	print STDERR "Omitting Node: $sourceName \n" if ($verbose);
	next;
    }

    # Assign differnet color to a node which is a source and target at the same time?
    if ($targetMap{$sourceName}) {
	if (defined(@sourcetargetColorExp)) {
		$sourceColor = $sourcetargetColorMap{$sourceName};
	} else {
		# print the node already here instead of in the target section
		if (defined(@sourceColorExp)) {
			$sourceColor = $sourceColorMap{$sourceName};
		} else {
			# print STDERR "foo\n";
			$sourceColor = $targetColorMap{$sourceName};
		}
	}
    } else {
    	$sourceColor = $sourceColorMap{$sourceName};
    }

    $source = $sourceMap{$sourceName};

    if (!$nodeLabels) { $source=""; } 
    if (!$sourceLabel) { $source=""; } 

    if (!$sourceColor) { 
	    print STDERR "Color Not Assigned for: $source\n";
	    $sourceColor="white";
    }

    if ($printSourceNodes) {
	    print STDERR $source."\n";
    }

    # Prepare the node property
    if ($nodeCount) { $source .= " : ".$sourceCount{$sourceName}; }

    my $out = "$sourceName [fillcolor=$sourceColor, label=\"$source\"";

    # size of node
    if (defined(@sourceSizeExp)) { 
        #print STDERR "MaxActualSize: $maxActualSourceNodeSize maxNodeSize: $maxNodeSize currentSize: $sourceNodeSize{$sourceName}\n";
	my $size=0;
	$size = sprintf ("%.2f",($maxNodeSize / $maxActualSourceNodeSize) * $sourceNodeSize{$sourceName});
	$out .= ",width=\"$size\"";
	$out .= ",height=\"$size\"";
    }

    if ($shapeSource ne "ellipse") {
	    $out .= ",shape=$shapeSource";
    }
    
    $out .= "]\n";
    print $out;

}

# Write properties for the event nodes.
unless ($twonodes) {

    foreach $eventName (keys %eventMap) {

        # prevent overwriting an already defined node.
        if ($sourceMap{$eventName}) { next; }

        my $size=1;
        if ($eventFanOutThreshold > 0) {
        	my $temp = $eventFanOut{$eventName};
        	$size = keys %$temp;
	}

        if (($eventCount{$eventName} <= $omitThreshold) 
	    || ($eventCount{$eventName} <= $eventThreshold)
	    || ($size <= $eventFanOutThreshold)
    	    || (!$printNode{$eventName}) )  {

		$eventMap{$eventName}=(); 	# set to null so it could still 
						# be written as the target node
		print STDERR "Omitting Node: $eventName \n" if ($verbose);
		next;

	}

        $eventColor = $eventColorMap{$eventName};

    	if ((!$nodeLabels) || (!$eventLabel)) { 
		$event=""; 
	} else { 
		$event = $eventMap{$eventName}; 
	}

        if (!$eventColor) { 
	    print STDERR "Color Not Assigned for: $event\n";
	    $eventColor="cyan";
	}

        if ($nodeCount) { $event .= " : ".$eventCount{$eventName}; }

	my $out = "$eventName [shape=box, fillcolor=$eventColor, label=\"$event\"";

	# size of node
	if (defined(@eventSizeExp)) { 
		my $size=0;
		$size = sprintf ("%.2f",($maxNodeSize / $maxActualEventNodeSize) * $eventNodeSize{$eventName});
		$out .= ",width=\"$size\"";
		$out .= ",height=\"$size\"";
	}

	# Node Shape
    	if ($shapeEvent ne "ellipse") {
	    $out .= ",shape=$shapeEvent";
	}
	    
	$out .= "]\n";
	print $out;

    }

}

# Write properties for the target nodes.
foreach $targetName (keys %targetMap) {

    # prevent overwriting an already defined node.
    if ($sourceMap{$targetName}) { next; }
    if ($eventMap{$targetName}) { next; }

    if ( ($targetCount{$targetName} <= $omitThreshold) 
            || ($targetCount{$targetName} <= $targetThreshold)
    	    || (!$printNode{$targetName}) )  {

	print STDERR "Omitting Node: $targetName \n" if ($verbose);
	next;
    }

    # The source/target coloring is already done in the source node part.
    $targetColor = $targetColorMap{$targetName};

    $target = $targetMap{$targetName};

    if (!$nodeLabels) { $target=""; } 
    if (!$targetLabel) { $target=""; } 
    if (!$targetColor) { 
	    print STDERR "Color Not Assigned for: $target\n";
	    $targetColor="red";
    }

    if ($nodeCount) { $target .= " : ".$targetCount{$targetName}; }

    my $out = "$targetName [fillcolor=$targetColor, label=\"$target\"";

    # size of node
    if (defined(@targetSizeExp)) { 
	    # print STDERR "MaxActualSize: $maxActualTargetNodeSize maxNodeSize: $maxNodeSize currentSize: $targetNodeSize{$targetName} targetName: $targetName\n";
	my $size=0;
	$size = sprintf ("%.2f",($maxNodeSize / $maxActualTargetNodeSize) * $targetNodeSize{$targetName});
        $out .= ",width=\"$size\"";
        $out .= ",height=\"$size\"";
    }

    # Node Shape
    if ($shapeTarget ne "ellipse") {
        $out .= ",shape=$shapeTarget";
    }
    
    $out .= "]\n";
    print $out;
    
}

# Write dot footer.
print "}\n";

# Debug output.
print STDERR "\n\nAll over, buster.\n" if $verbose;

#
#
# And this is the end of all things.
#
#

# ------------------------------------------------------------
# Color-Properties Subroutines.
# ------------------------------------------------------------

# function: subnet(value,network/mask)
# return:   0 or 1 depending on whether value is in the network 
#   	    with the given mask
# example:  subnet($fields[0],0.0.0.0/7)
# Note:     I am sure you can make this more efficient (instead 
# 	    of converting both IPs and then masking them.
# 	    Well, thinking about it while running, this is needed.
sub subnet {
	my ($value,$value2) = @_;

	my @temp = split(/\./,$value);
	# return if not an IP address
	return(0) if (scalar(@temp) != 4);	# very simplistic test!

	my $ip=unpack("N",pack("C4",@temp));

	my ($network,$mask) = $value2 =~ /([^\/]+)\/(.*)/;
	$network=unpack("N",pack("C4",split(/\./,$network)));

    	$mask = (((1 << $mask) - 1) << (32 - $mask));
	$newNet = join(".",unpack("C4",pack("N",$ip & $mask)));
	$newNetwork = join(".",unpack("C4",pack("N",$network & $mask)));

	# return ($network == $newNet);
	if ($newNetwork eq $newNet) {
		# print STDERR "match: $value newnetwork: $newNetwork newNet: $newNet\n";
		return 1;
	} else {
		# print STDERR "no match: $value newNetwork: $newNetwork network: $network newNet: $newNet\n";
		return 0;
	}
}

# function: any_regex("match_and_return_regex")
# return:   0 or 1 depending on whether the regex matches on any of
# 	    the columns
# example:  TBD
sub any_regex {
	($value) = @_;
	#print STDERR "any_regex(): $value\n";
	foreach my $field (@fields) {
		if ($field =~ /$value/) {
			return 1;
		}
	}
	return 0;
}

# function: field()
# return:   Type-relative (source, event, target). 
# 	 
# example:  "red" if (field() eq "foo");
sub field {

	if ($type eq "sourcetarget") { return $fields[0];}
	if ($type eq "source") { return $fields[0];}
	if (($type eq "event") || ($twonodes)) { return $fields[1];}
	if (($type eq "target") && (!$twonodes)) { return $fields[2];}

}

# ram: 06/28/06 This is really the same as match() without the global field, but that is set
#               anyways, so killing it!
# function: regex("match_and_return_regex")
# return:   
# 	    Type-relative (source, event, target). Only returns if that column 
# 	    matches.
# 	 
# example:  color="cornflowerblue" if (regex("Internal"));
# sub regex {
# ($value) = @_;
# #print STDERR "type: $type / value: $value\n";
# if ($type eq "source") { return ($fields[0] =~ /$value/)[0];}
# if (($type eq "event") || ($twonodes)) { #print STDERR "foo: $fields[1]\n";
# return ($fields[1] =~ /$value/)[0];}
# if (($type eq "target") && (!$twonodes)) { return ($fields[2] =~ /$value/)[0];}
# }

sub match {
	($regex) = @_;
	return $globalField =~ /$regex/;
}

# function: regex_replace("replace_regex")
# return:   Use a regular expression to replace the input string. The match is 
# 	    returned
# 	    Type-relative (source, event, target). Only returns if that column 
# 	    matches.
# example:  cluster.source=regex_replace("(\\d\+\\.\\d+)")."/16" \
# 	      if (!match("^(212\.254\.110|195\.141\.69)")) 
#	    if one of the two ranges match(), then return the first two octets of 
#	    the source IP and add the "/16" string.
sub regex_replace {
	($regex) = @_;
	#print STDERR "globalField: $globalField / regex: $regex \n";

	return ($globalField =~ /$regex/)[0]; 
}

# function: get_severity(severity, [steps])
# return:   A hex color string based on the severity of the input and the number
#           of steps, which indicate highest severity
# example:  color.source=get_severity($fields[2])
sub interpolate {
    ($pBegin, $pEnd, $pStep, $pMax) = @_;

    if ($pBegin < $pEnd) {
      return (($pEnd - $pBegin) * ($pStep / $pMax)) + $pBegin;
    } else {
      return (($pBegin - $pEnd) * (1 - ($pStep / $pMax))) + $pEnd;
    }

}

sub get_severity {
    ($value, $steps, $start, $end) = @_;

    if (!$steps) { $steps = 10; }  # if number of steps is not defined, make it 10
    if (!$start) { $start = 0x000000; }  # if not supplied, make it green
    if (!$end) { $end = 0xFFFFFF; }  # if not supplied, make it red

    # round the value
    $x = int($value + .5 * ($value <=> 0));

    if ($x >= $steps) {
        $x = $steps;
    }

    $theR0 = ($start & 0xff0000) >> 16;
    $theG0 = ($start & 0x00ff00) >> 8;
    $theB0 = ($start & 0x0000ff) >> 0;

    $theR1 = ($end & 0xff0000) >> 16;
    $theG1 = ($end & 0x00ff00) >> 8;
    $theB1 = ($end & 0x0000ff) >> 0;
    $theR = interpolate($theR0, $theR1, $x, $steps);
    $theG = interpolate($theG0, $theG1, $x, $steps);
    $theB = interpolate($theB0, $theB1, $x, $steps);

    $theVal = ((($theR << 8) | $theG) << 8) | $theB;
    return sprintf("#%06X", $theVal);

}

sub hexcol {
    ($col) = @_;
    return sprintf("#%06X", $col);
}

# function: notreg("return_regex","match_regex")
# return:   Execute the return_regex on the field, if match_regex does NOT match. 
# 	    Type-relative (source, event, target). Only returns if that column 
# 	    matches.
# example:  cluster.source=notreg("(\\d\+\\.\\d+)","^(212\.254\.110|195\.141\.69)")
#	    if NOT one of the two ranges, then return the first two octets of the IP
#	    restrict to only source nodes!
#sub notreg {
#($output,$match) = @_;
#if (!match($match)) { return ($globalField=~/$output/)[0]; }
#}

# ------------------------------------------------------------
# Subroutines.
# ------------------------------------------------------------

# Computes clusters
sub getCluster {
 
    my ($field,@clusters) = @_;
    my $return;

    for my $cluster (@clusters) {
	    #print STDERR "getCluster() field: $field / cluster: $cluster\n";	

	    # setting the globalField for the function!
	    $globalField=$field;

	    if ($return = eval ($cluster)) { last; }

    }

    if ($return) {$field=$return;} 
    #print STDERR "return: $field\n";	
    return $field;

}

# Computes the name to use for a source node.
sub getSourceName {
    
    # Get the arguments.
    ($source, $event, $target) = @_;

    # Return value depends on whether or not to split nodes.
    return "\"S:$source\"" if $splitSourceAndTargetNodes;
    return "\"$source\"";
}

# Computes the name to use for a source node.
sub getEventName {
    
    # Get the arguments.
    ($source, $event, $target) = @_;

    return "\"$source $event\"" if $eventNodeSplitMode == 1;
    return "\"$event $target\"" if $eventNodeSplitMode == 2;
    return "\"$source $event $target\"" if $eventNodeSplitMode == 3;
    return "\"$event\"";
}

# Computes the name to use for a source node.
sub getTargetName {
    
    # Get the arguments.
    ($source, $event, $target) = @_;

    # Return value depends on whether or not to split nodes.
    return "\"T:$target\"" if $splitSourceAndTargetNodes;
    return "\"$target\"";
}

# Return the color for this node

# Optimization FROM: 
# %Time ExclSec CumulS #Calls sec/call Csec/c  Name
#  75.5   10.78 15.242   6000   0.0018 0.0025  main::getColor
#  31.0   4.434  4.434 192000   0.0000 0.0000  main::subnet
# TO:
#  76.3   0.636  0.731   6000   0.0001 0.0001  main::getColor
#  10.5   0.088  0.088   1920   0.0000 0.0000  main::subnet
# By using a cache!
sub getColor {

    print STDERR "getColor()" if $DEBUG;
    
    # Get the arguments
    # type element of ["source"|"target"|"event"]
    ($type, @fields) = @_;

    # build a cache so we don't have to go through it all
    my $index;
    if ($twonodes) {
	    $index = $fields[0].$fields[1].$type; 
    } else {
	    $index = $fields[0].$fields[1].$fields[2].$fields[3].$fields[4].$type;
    }

    # cache hit?
    if (defined($cache{$index})) { 
	    print STDERR " cache hit: $cache{$index}\n" if $DEBUG;
	    return $cache{$index}; 
    }

    $variableColExp = $type."ColorExp";
    my $color=();

    # setting the globalField for the functions!
    if (($type eq "source") || ($type eq "sourcetarget")) {$globalField=$fields[0];}
    if ($twonodes) {
    	if ($type eq "target") {$globalField=$fields[1];}
    } else {
	if ($type eq "event") {$globalField=$fields[1];}
     	if ($type eq "target") {$globalField=$fields[2];}
    }

    print STDERR " | value: $globalField" if $DEBUG;
    print STDERR " | type: $type" if $DEBUG;

    if ($notCatchAllColor{$type.$globalField}) {
	    # print STDERR "$type :: $globalField\n";
	    return $notCatchAllColor{$type.$globalField};
    }

    for my $var (@$variableColExp) {
	    print STDERR " | eval: $var" if $DEBUG;
	    print STDERR " | field(): ".field() if $DEBUG;
	    if ($color = eval($var)) { 
		    # check whether the assignment happened in a "catch-all" condition, which can
		    # be identified by not having a "if" in the statement.
		    # if ($type eq "target") {print STDERR "eval: $var :: $fields[1]\n";}
		    #if ($var =~ /if/) {$notCatchAllColor{$type.$globalField}=$color;}
		    last;
	    }
    }

    print STDERR " | color: $color" if $DEBUG;

    # if the entry in the log is not a color name, index ourselves
    if ($color =~ /\#[\da-fA-F]{6,8}/) {
	    $color="\"$color\"";
    }
    elsif ((!grep(/$color/,@colors))  || (!defined($color))) {

	# did we already index this color?
	if (exists($colorIndex{$color})) {
		$color=$colorIndex{$color};
 	} else {	

		# Only scream if the color was actually set.
		if ($color) {print STDERR "Not a color: $color\n";}

		$colorIndex{$color}=$colors[$colorIndexCount];	
		$color=$colors[$colorIndexCount];
		$colorIndexCount ++;
	}
    }

    # add to cache
    $cache{$index} = $color;

    print STDERR "\n" if $DEBUG;

    # Error check, printing it is not really useful.
    # if (!$color) { print STDERR "ERROR: No color assigned\n"; }
    return $color;

}

sub getSize {
    
    # Get the arguments
    # type element of ["source"|"target"|"event"]
    ($type, @fields) = @_;

    # build a cache so we don't have to go through it all
    #my $index;
    #if ($twonodes) {
    #$index = $fields[0].$fields[1].$type; 
    #} else {
    #$index = $fields[0].$fields[1].$fields[2].$type;
    #}

    # cache hit?
    #if (defined($cache{$index})) { return $cache{$index}; }

    # setting the globalField for the functions! [sourcetarget is no really needed
    # but it does not hurt]
    if (($type eq "source") || ($type eq "sourcetarget")) {$globalField=$fields[0];}
    if ($twonodes) {
    	if ($type eq "target") {$globalField=$fields[1];}
    } else {
	if ($type eq "event") {$globalField=$fields[1];}
     	if ($type eq "target") {$globalField=$fields[2];}
    }

    $variableSizeExp = $type."SizeExp";
    my $size=0;

    if ($notCatchAllSize{$type.$globalField}) {
	    # print STDERR "$type :: $globalField\n";
	    return $notCatchAllSize{$type.$globalField};
    }

    for my $var (@$variableSizeExp) {
	    if ($size = eval($var)) { 
		    # check whether the assignment happened in a "catch-all" condition, which can
		    # be identified by not having a "if" in the statement.
		    # if ($type eq "target") {print STDERR "eval: $var :: $fields[1]\n";}
		    if ($var =~ /if/) {$notCatchAllSize{$type.$globalField}=$size;}
		    last; 
	    }
    }

    # for undefined edge sizes:
    if ((!$size) && ($type eq "edge")) {$size = $defaultEdgeSize;}
    
    # print STDERR "getSize: $size \n";

    # add to cache
    #$cache{$index} = $color;

    return $size;

}

sub getLabel {
    
    # Get the arguments
    # type element of ["source"|"target"|"event"]
    ($type, @fields) = @_;

    # build a cache so we don't have to go through it all
    #my $index;
    #if ($twonodes) {
    #$index = $fields[0].$fields[1].$type; 
    #} else {
    #$index = $fields[0].$fields[1].$fields[2].$type;
    #}

    # cache hit?
    #if (defined($cache{$index})) { return $cache{$index}; }

    # setting the globalField for the functions! [sourcetarget is no really needed
    # but it does not hurt]
    if (($type eq "source") || ($type eq "sourcetarget")) {$globalField=$fields[0];}
    if ($twonodes) {
    	if ($type eq "target") {$globalField=$fields[1];}
    } else {
	if ($type eq "event") {$globalField=$fields[1];}
     	if ($type eq "target") {$globalField=$fields[2];}
    }

    $variableLabelExp = $type."LabelExp";
    # print STDERR "$type :: $variableLabelExp\n";

    my $label=();

    if ($notCatchAllLabel{$type.$globalField}) {
	    # print STDERR "$type :: $globalField\n";
	    return $notCatchAllLabel{$type.$globalField};
    }

    for my $var (@$variableLabelExp) {
	    #print STDERR "var: $var\n";
	    if (($var eq "0") || ($var eq "")) {
		    # no labels (Yes, it's __NULL_)
		    $label="__NULL_";
		    last;
	    }
	    if ($label = eval($var)) { 
		    # check whether the assignment happened in a "catch-all" condition, which can
		    # be identified by not having a "if" in the statement.
		    # if ($type eq "target") {print STDERR "eval: $var :: $fields[1]\n";}
		    if ($var =~ /if/) {$notCatchAllLabel{$type.$globalField}=$label;}
		    last; 
	    }
    }

    if (!defined($label)) {
	    $label=$globalField;
    }

    #print STDERR "getLabel: $label \n";

    # add to cache
    #$cache{$index} = $color;

    return $label;

}

# Process property file
sub propertyfile() {

	if (!$propFileName) {
		print STDERR "No property file specified, using default settings.\n";
		return;
	}
	
	open PROPFILE, "< $propFileName" or die "Cannot open $propFileName: $!";

	my $line = 0;

	print STDERR "----------- Property File:\n" if ($verbose);

	while ($ln = <PROPFILE>) {


		$line++;

		chomp $ln;
		next if ($ln =~ /^\s*#/); # ignore comments
		next if ($ln =~ /^\s*$/); # ignore empty lines
		$ln =~ s/[^"]#.*$//;    # Remove line comments in the properties file.
		@nv = split /\s*=/,$ln,2;
		$value = $nv[1];
		$value =~ s/^\s*=?\s*//;
		$value =~ s/\s*$//;
		$value =~ s/;$//;
		$value =~ s/^"(.*)"$/\1/;
		$name = $nv[0];
		$name =~ s/^\s*//;
		$name =~ s/\s*$//;

		# print STDERR "$name=$value\n"; ### DEBUG ###

		if ($name eq "color") {
			# generic coloring
			push (@sourceColorExp,$value);
			push (@targetColorExp,$value);
			push (@eventColorExp,$value);
			push (@sourcetargetColorExp,$value);
		} 
		elsif ($name eq "color.source") {
			push (@sourceColorExp,$value);
		} 
		elsif ($name eq "color.target") {
			push (@targetColorExp,$value);
		} 
		elsif ($name eq "color.event") {
			push (@eventColorExp,$value);
		}
		elsif ($name eq "color.edge") {
			push (@edgeColorExp,$value);
		}
		elsif ($name eq "color.sourcetarget") {
			push (@sourcetargetColorExp,$value);
			}
		elsif ($name eq "size") {
			push (@sourceSizeExp,$value);
			push (@targetSizeExp,$value);
			push (@eventSizeExp,$value);
			}
		elsif ($name eq "size.source") {
			push (@sourceSizeExp,$value);
			}
		elsif ($name eq "size.target") {
			push (@targetSizeExp,$value);
			}
		elsif ($name eq "size.event") {
			push (@eventSizeExp,$value);
			}
		elsif ($name eq "size.edge") {
			push (@edgeSizeExp,$value);
			}
		elsif ($name eq "threshold") {
			$omitThreshold = $value;
			$omitThreshold =~ s/.*?(\d*).*/\1/;
			}
		elsif ($name eq "threshold.source") {
			$sourceThreshold = $value;
			$sourceThreshold =~ s/.*?(\d*).*/\1/;
			}
		elsif ($name eq "threshold.event") {
			$eventThreshold = $value;
			$eventThreshold =~ s/.*?(\d*).*/\1/;
			}
		elsif ($name eq "threshold.target") {
			$targetThreshold = $value;
			$targetThreshold =~ s/.*?(\d*).*/\1/;
			}
		elsif ($name eq "shape.source") {
			if ($value !~ /^(box|polygon|circle|ellipse|invtriangle|octagon|pentagon|diamond|point|triangle|plaintext|Mrecord|egg);?$/) {
				print STDERR "Property File Error, unrecognized value for shape.source: $value, line $line\n";
			} else {
				$shapeSource=$value;
				print STDERR "Source Shape: $shapeSource\n" if ($verbose);
			}
		}
		elsif ($name eq "shape.target") {
			if ($value !~ /^(box|polygon|circle|ellipse|invtriangle|octagon|pentagon|diamond|point|triangle|plaintext|Mrecord|egg);?$/) {
				print STDERR "Property File Error, unrecognized value for shape.target: $value, line $line\n";
			} else {
				$shapeTarget=$value;
				print STDERR "Target Shape: $shapeTarget\n" if ($verbose);
			}
		}
		elsif ($name eq "shape.event") {
			if ($value !~ /^(box|polygon|circle|ellipse|invtriangle|octagon|pentagon|diamond|point|triangle|plaintext|Mrecord|egg);?$/) {
				print STDERR "Property File Error, unrecognized value for shape.event: $value, line $line\n";
			} else {
				$shapeEvent=$value;
				print STDERR "Source Shape: $shapeEvent\n" if ($verbose);
			}
		}
		elsif ($name eq "sum.source") {
			if ($value !~ /^[01];?$/) {
				print STDERR "Property File Error, unrecognized value for sum.source: $value, line $line\n";
			} else {
				$sumSource=$value;
			}
		}
		elsif ($name eq "sum.target") {
			if ($value !~ /^[01]$/) {
				print STDERR "Property File Error, unrecognized value for sum.target: $value, line $line\n";
			} else {
				$sumTarget=$value;
			}
		}
		elsif ($name eq "sum.event") {
			if ($value !~ /^[01];?$/) {
				print STDERR "Property File Error, unrecognized value for sum.event: $value, line $line\n";
			} else {
				$sumEvent=$value;
			}
		}
		elsif ($name eq "label") {
			push (@sourceLabelExp,$value);
			push (@eventLabelExp,$value);
			push (@targetLabelExp,$value);
		}
		elsif ($name eq "label.source") {
			push (@sourceLabelExp,$value);
			#print STDERR "val: $value\n";
		}
		elsif ($name eq "label.target") {
			push (@targetLabelExp,$value);
		}
		elsif ($name eq "label.event") {
			push (@eventLabelExp,$value);
		}
		elsif ($name eq "url") {
			$url = $value;
		}
		elsif ($name =~ /^cluster/) {
			# print STDERR "cluster: $cluster_name $regex\n";
			if ($name eq "cluster") {
				push (@clusters,$value);
			} elsif ($name eq "cluster.source") {
				push (@source_clusters,$value);
			} elsif ($name eq "cluster.event") {
				push (@event_clusters,$value);
			} elsif ($name eq "cluster.target") {
				push (@target_clusters,$value);
			} else {
				print STDERR "Property File Error, unrecongnized name for cluster: $name, line $line\n";
			}
		}
		elsif (lc($name) eq "maxnodesize") {
			$maxNodeSize = $value;
			$maxNodeSize =~ s/.*?(\d*).*/\1/;
		}
		elsif ($name eq "variable") {
			eval $value;
		}
		elsif ($name eq "exit") {
			last;
		}
		else
		{
			print STDERR "Property File Error, unrecongnized entry: $name, line $line\n";
		}

	}
	
	print STDERR "----------- Done Reading Properties\n" if ($verbose);
	print STDERR "\n" if ($verbose);

	close(PROPFILE);

}

# Command line options processing.
sub init() {
    my %opt;
    use Getopt::Std;
    getopts("adnhtvsqri:w:p:l:b:e:c:o:f:g:m:x:", \%opt ) or usage();

    # Help?
    usage() if $opt{h};
    
    # Verbose?
    $verbose = 1 if $opt{v};

    # Number of lines to skip?
    $skipLines = $opt{b} if $opt{b};

    # Maximum number of lines to read?
    $maxLines = $opt{l} if $opt{l};

    # Two node mode (skip objects)?
    $twonodes = $opt{t} if $opt{t};

    # Split source and target nodes?
    $splitSourceAndTargetNodes = 1 if $opt{s};

    # Split mode for event nodes?
    $eventNodeSplitMode = $opt{p} if $opt{p};

    # Print node labels?
    $nodeLabels = 0 if $opt{n};

    # Edge Length
    $edgelen = $opt{e} if $opt{e};

    # Label Color
    $labelColor = $opt{x} if $opt{x};

    # Configuration file
    $propFileName= $opt{c} if ($opt{c});

    # Omit single nodes?
    $omitThreshold = $opt{o} if $opt{o};

    # Source FanOut Threshold
    $sourceFanOutThreshold = $opt{f} if $opt{f};

    # Event FanOut Threshold
    $eventFanOutThreshold = $opt{g} if $opt{g};

    # Print node count?
    $nodeCount = 1 if $opt{d};

    # Ouput configuration?
    $label = 1;		# set by default
    $label = 0 if $opt{a};

    # print source nodes?
    $printSourceNodes = 0;
    $printSourceNodes  = 1 if $opt{r};

    # Maximum node size
    $maxNodeSize = $opt{m} if $opt{m};

    if ($opt{q}) {
	    open (STDOUT, ">/dev/null") or die ("Quiet mode did not work! Could not redirect STDOUT to /dev/null");
	    open (STDERR, ">/dev/null") or die ("Quiet mode did not work! Could not redirect STDERR to /dev/null");
    }
    
    if ($opt{w}) {
	    open (STDOUT, ">$opt{w}") or die ("Could not redirect STDERR to $opt{w}");
    }

    if ($opt{i}) {
	    open (STDIN, "<$opt{i}") or die ("Could not redirect STDERR to $opt{i}");
    }

}

# Message about this program and how to use it.
sub usage() {

    print STDERR << "EOF";

Afterglow $version ---------------------------------------------------------------
    
A program to visualize network activitiy data using graphs.
Uses the dot graph layout program fromt the Graphviz suite.
Input data is expected to be in this simple CSV-style format:
    
    [subject],  [predicate], [object]
    10.10.10.10, ACCEPT,     216.239.37.99

Usage:   afterglow.pl [-adhnstv] [-b lines] [-c conffile] [-e length] [-f threshold ] [-g threshold] [-l lines] [-o threshold] [-p mode] [-x color] [-m maxsize]

-a 	     : turn off labelelling of the output graph with the configuration used
-b lines     : number of lines to skip (e.g., 1 for header line)
-c conffile  : color config file
-d	     : print node count
-e length    : edge length
-f threshold : source fan out threshold
-g threshold : event fan out threshold (only in three node mode)
-h           : this (help) message
-i file      : read from input file, instead of from STDIN
-l lines     : the maximum number of lines to read
-m           : the maximum size for a node
-n           : don't print node labels
-o threshold : omit threshold (minimum count for nodes to be displayed) 
	       Non-connected nodes will be filtered too.
-p mode      : split mode for predicate nodes where mode is
                0 = only one unique predicate node (default)
                1 = one predicate node per unique subject node.
                2 = one predicate node per unique target node.
                3 = one predicate node per unique source/target node.
-q           : suppress all output. Attention! You should use -w to write output to a file!
-r           : print source node names
-s           : split subject and object nodes
-t           : two node mode (skip over objects)
-v           : verbose output
-w file      : write output to a file instead of STDOUT
-x           : text label color

Example: cat somedata.csv | afterglow.pl -v | dot -Tgif -o somedata.gif

The dot exectutable from the Graphviz suite can be obtained
from the AT&T research website: http://www.graphviz.org

EOF
    exit;
}

