-- phpMyAdmin SQL Dump
-- version 2.11.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 03, 2008 at 11:11 PM
-- Server version: 4.1.22
-- PHP Version: 5.2.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `stillboy_sinvertical`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` bigint(20) NOT NULL auto_increment,
  `name` varchar(32) NOT NULL default '',
  `value` text NOT NULL,
  `description` text NOT NULL,
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=12 ;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `value`, `description`) VALUES(7, 'absoluteimageurl', '/img/pictures/', 'auto-generated site variable');
INSERT INTO `admins` (`id`, `name`, `value`, `description`) VALUES(8, 'imagepath', '/img/pictures/', 'auto-generated site variable');
INSERT INTO `admins` (`id`, `name`, `value`, `description`) VALUES(9, 'defaultvolume', '0', 'auto-generated site variable');
INSERT INTO `admins` (`id`, `name`, `value`, `description`) VALUES(10, 'emailtopostpass', '', 'auto-generated site variable');
INSERT INTO `admins` (`id`, `name`, `value`, `description`) VALUES(11, 'absoluteimgurl', '/img/pictures/', 'auto-generated site variable');

-- --------------------------------------------------------

--
-- Table structure for table `albums`
--

CREATE TABLE `albums` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(64) NOT NULL default '',
  `parent_id` int(11) NOT NULL default '0',
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=32 ;

--
-- Dumping data for table `albums` - Add default so the dropdowns will have that option
--

INSERT INTO `albums` (`id`, `name`, `parent_id`) VALUES(0, 'Default', 0);
-- --------------------------------------------------------

--
-- Table structure for table `cake_sessions`
--

CREATE TABLE `cake_sessions` (
  `id` varchar(255) NOT NULL default '',
  `data` text,
  `expires` int(11) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL auto_increment,
  `location` text NOT NULL,
  `thumb` text NOT NULL,
  `width` smallint(6) NOT NULL default '0',
  `height` smallint(6) NOT NULL default '0',
  `name` varchar(64) NOT NULL default '',
  `album_id` int(11) NOT NULL default '0',
  `user_id` int(11) NOT NULL default '0',
  `cid` varchar(128) NOT NULL default '',
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=179 ;


--
-- Table structure for table `mags`
--

CREATE TABLE `mags` (
  `id` int(11) NOT NULL auto_increment,
  `header` text NOT NULL,
  `content` text NOT NULL,
  `type` varchar(16) NOT NULL default '',
  `editor` varchar(16) NOT NULL default 'html',
  `date` date NOT NULL default '0000-00-00',
  `volume_id` int(11) NOT NULL default '0',
  `user_id` int(20) NOT NULL default '0',
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=59 ;

--
-- Table structure for table `mailboxes`
--

CREATE TABLE `mailboxes` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(64) NOT NULL default '',
  `type` varchar(32) NOT NULL default '',
  `username` varchar(64) NOT NULL default '',
  `password` varchar(64) NOT NULL default '',
  `autopostpass` varchar(16) NOT NULL default '',
  `user_id` int(11) NOT NULL default '0',
  `server` text NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;


-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL auto_increment,
  `subject` text NOT NULL,
  `body` text NOT NULL,
  `from` text NOT NULL,
  `to` text NOT NULL,
  `mailbox_id` int(11) NOT NULL default '0',
  `user_id` int(11) NOT NULL default '0',
  `image_id` int(11) NOT NULL default '0',
  `album_id` int(11) NOT NULL default '0',
  `date` date NOT NULL default '0000-00-00',
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=92 ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL auto_increment,
  `username` varchar(64) NOT NULL default '',
  `password` varchar(32) NOT NULL default '',
  `account_type` varchar(8) NOT NULL default '',
  `first_name` varchar(32) NOT NULL default '',
  `last_name` varchar(32) NOT NULL default '',
  `email` varchar(64) NOT NULL default '',
  `profile` text NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `username` (`username`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `account_type`, `first_name`, `last_name`, `email`, `profile`) VALUES(1, 'admin', 'admin', 'admin', 'User', 'Name', 'none@none.com', '{"layout":{"columnOne":["8"],"columnTwo":["9"]},"8":{"prof":"save"},"9":{"prof":"save"}}');

-- --------------------------------------------------------

--
-- Table structure for table `volumes`
--

CREATE TABLE `volumes` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(128) NOT NULL default '',
  `parent_id` int(11) NOT NULL default '0',
  `template` varchar(64) NOT NULL default '',
  `style` varchar(64) NOT NULL default '',
  `publish` tinyint(4) NOT NULL default '1',
  `limit` int(11) NOT NULL default '0',
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

--
-- Dumping data for table `volumes` - add default volume
--

INSERT INTO `volumes` (`id`, `name`, `parent_id`, `template`, `style`, `publish`, `limit`) VALUES(1, 'Main', 0, '0', 'blog', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `widgets`
--

CREATE TABLE `widgets` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(128) NOT NULL default '',
  `admin_xhtml` text NOT NULL,
  `display_xhtml` text NOT NULL,
  `icon` text NOT NULL,
  `type` tinyint(4) NOT NULL default '0',
  `callback` text NOT NULL,
  `version` varchar(16) NOT NULL default '',
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

--
-- Dumping data for table `widgets`
--

INSERT INTO `widgets` (`id`, `name`, `admin_xhtml`, `display_xhtml`, `icon`, `type`, `callback`, `version`) VALUES(8, 'Twitter', '<div id="twitter_div">\n<h2 class="twitter-title">Twitter Updates</h2>\n<ul id="twitter_update_list"></ul></div>\n<script type="text/javascript" src="http://twitter.com/javascripts/blogger.js"></script>\n<script type="text/javascript" src="http://twitter.com/statuses/user_timeline/stillboy.json?callback=twitterCallback2&count=10"></script>\n\n', ' ', '', 0, ' ', '0.0');
INSERT INTO `widgets` (`id`, `name`, `admin_xhtml`, `display_xhtml`, `icon`, `type`, `callback`, `version`) VALUES(9, 'Todo List', '*Fix Widgets icons<br/>\n*Fix json returns, change all to be comment filtered and handle correctly<br/>\n*Add site editor tab to edit admin variables<br/>\n*Edit the template ala drupal style.<br/>\n*View site in a tab<br/>\n', ' ', '', 0, ' ', '0.0');

--
-- Table structure for table `filters`
--


CREATE TABLE `filters` (
`id` INT NOT NULL AUTO_INCREMENT,
`name` VARCHAR( 128 ) NOT NULL ,
`text` TEXT NOT NULL ,
`type` VARCHAR( 16 ) NOT NULL ,
`code` TEXT NOT NULL ,
`active` BOOL NOT NULL ,
PRIMARY KEY ( `id` )
) ENGINE = MYISAM ;
