<?php
/*
 * This script will export the current svn tree to a directory and put the 
 * files in a tarball. This tarball will then be ready for installation to
 * a web server. 
 * 
 * Example usage: (run from svn directory)
 * 
 * php export_version.php /var/www/dev/capuchn_release/
 * 
 * will output tarball in /var/www/dev/capuchn_release/capuchnsvn.tar.gz
 * 
 * This file should be able to be uploaded to a webserver and will not clobber
 * any normal custom configurations.
 */

$default_filename = "capuchnsvn.tar.gz";
echo "Currnet path: ".`pwd`."\n";

if(is_dir($argv[1])){
	echo "outputting to ".$argv[1].$default_filename."\n";
}else{
	echo $argv[1];
	exit("invalid path");
}
$tmpdir = $argv[1]."capuchnrltmp";
echo "temp dir (must be writeable) : ".$tmpdir."\n";
$pwd = `pwd`;
$pwd = trim($pwd);
$svncommand = "svn export  ".$pwd." ".$tmpdir;
echo "exporting from ".$pwd."\n";
$out = shell_exec($svncommand);
echo "Svn export sez: ". $out."\n";

$dbg .= `find $tmpdir -type d -exec chmod 755 {} \;`;
$dbg .= `find $tmpdir -type f -exec chmod 644 {} \;`;
echo "Permissions applied \n";
$picdir = $tmpdir."/app/webroot/img/pictures";
$dbg .= `rm -fR $picdir`;
$core = $tmpdir."/app/config/core.php";
$db = $tmpdir."/app/config/database.php";
$dbg .= `rm -f $core`;
$dbg .= `rm -f $db`;
echo "Removed config files\n";

//This should now, not clobber anything that must be changed server side for 
//any existing install.. 

$outpath = $argv[1].$default_filename;
$files = ". .htaccess";
`cd $tmpdir`;
$dbg .= `tar -czvf $outpath -C $tmpdir $files`; 
echo "tarbal created: $outpath";
`cd $pwd`;
$dbg .= `rm -fR $tmpdir`;
echo "Temp dir removed: $tmpdir";
echo "debug: ".$dbg;
?>
