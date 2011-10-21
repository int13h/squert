# Squert 0.9.3

* Fixed issue #21 Escalated events not filtering properly
* Fixed issue #16 Exclude not working correclty
* Misc adjustments to accommodate http_agent

# Squert 0.9.2

* Added 'last time' indicators to summary tab
* Fixed display logic when viewing spans on summary tab
* Added record count selector to summary tab
* Changed country and signature charts to donut variant. Cleaner
* Truncate long key entries for country and signature charts
* Countries were not being filtered when added to the exclude filter. This has been fixed
* Very likely a couple other things

# Squert 0.9.1

* Fixed country array in ip2c.tcl
* Moved key in bar charts below x-axis labels
* Added src and dst IP tables to summary tab


# Squert 0.9.0

* tabbed interface
* CSS/JS fixes and cleanup
* Bunch of new stuff


# Squert 0.8.0

* country mappings can now be done in the background via cron
* an input box has been added that will accept country names and codes to filter queries
* a country 'tag cloud' that can be primed prior to event queries has bee added
* an exclude input box has been added so that you can pick away at your query results
* different property files can be used when creating link graphs
* different split modes can be used when creating link graphs
* canvas colour can be changed when creating link graphs
* fixed protocol function to acknowledge unknown entries (fail gracefully)
* fixed sorting problem with 'existing files' drop down
* sensor selection now fully enumerates the sensor table and (supported) agent types


# Squert 0.7.0

* fixed time boundary for default queries
* fixed IP sorting
* fixed tailing white-space issue when signatures are pasted
* made last event difference more accurate
* grid is now linked
* added distinct SRC and DST to base query
* added "seconds" drop downs
* cleaned up map section by consolidating the results
* cleaned up section navigation
