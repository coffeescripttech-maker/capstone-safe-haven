# Check MySQL timezone settings
mysql -u root -p -e "SELECT @@global.time_zone, @@session.time_zone, NOW();"
