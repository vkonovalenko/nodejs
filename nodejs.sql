-- phpMyAdmin SQL Dump
-- version 4.6.4deb1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 06, 2017 at 12:59 AM
-- Server version: 5.7.17-0ubuntu0.16.10.1
-- PHP Version: 7.0.8-3ubuntu3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `findme`
--

-- --------------------------------------------------------

--
-- Table structure for table `uploaded_files`
--

CREATE TABLE `uploaded_files` (
  `id` int(11) NOT NULL,
  `src` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(127) DEFAULT NULL,
  `pushToken` varchar(255) DEFAULT NULL,
  `deviceOs` enum('android','ios') NOT NULL,
  `password` varchar(500) NOT NULL,
  `firstName` varchar(127) NOT NULL,
  `lastName` varchar(127) DEFAULT NULL,
  `nickName` varchar(127) NOT NULL,
  `requestsTo` varchar(512) DEFAULT '[]',
  `requestsFrom` varchar(512) DEFAULT '[]',
  `friends` varchar(512) DEFAULT '[]',
  `allowFriends` tinyint(1) NOT NULL DEFAULT '1',
  `allowRandom` tinyint(1) NOT NULL DEFAULT '1',
  `meetsCount` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `wasOnline` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `token`, `avatar`, `phone`, `pushToken`, `deviceOs`, `password`, `firstName`, `lastName`, `nickName`, `requestsTo`, `requestsFrom`, `friends`, `allowFriends`, `allowRandom`, `meetsCount`, `wasOnline`, `updatedAt`, `createdAt`) VALUES
(5, 'asd@asdd.com', '1', NULL, NULL, NULL, 'android', '43814346e21444aaf4f70841bf7ed5ae93f55a9d', '11', NULL, '11', '[]', '[]', '[6]', 1, 1, 0, NULL, '2017-01-29 11:36:04', '2016-11-12 14:14:04'),
(6, 'test@test.com', '2', NULL, NULL, NULL, 'android', 'dfssssssssssssssss', '22', NULL, '22', '[]', '[]', '[5]', 1, 1, 0, NULL, '2017-01-28 21:38:03', NULL),
(15, 'slavik@ko.com', 'a039c628-de08-4278-b339-ffd0ac68dbdb', '/asd/test.jpg', NULL, NULL, 'android', 'b4cc50660fe12f4a1dbd80f55c1a7c8449809791', 'slavik', 'konovalenko', 'koslavik', '[]', '[]', '[]', 1, 1, 0, NULL, '2017-02-05 14:12:33', '2017-02-05 14:12:33');

-- --------------------------------------------------------

--
-- Table structure for table `user_messages`
--

CREATE TABLE `user_messages` (
  `id` int(11) NOT NULL,
  `userFrom` int(11) NOT NULL,
  `userTo` int(11) NOT NULL,
  `message` text,
  `isDelivered` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user_messages`
--

INSERT INTO `user_messages` (`id`, `userFrom`, `userTo`, `message`, `isDelivered`, `createdAt`, `updatedAt`) VALUES
(44, 5, 6, 'test', 1, '2017-01-10 21:06:18', '2017-01-10 21:44:04'),
(45, 5, 6, 'test', 1, '2017-01-10 21:06:32', '2017-01-10 21:44:04'),
(46, 5, 6, 'test', 1, '2017-01-10 21:46:19', '2017-01-10 21:46:41'),
(47, 5, 6, 'hello user 6', 0, '2017-01-28 21:20:34', '2017-01-28 21:20:34'),
(48, 5, 6, 'hello user 6', 0, '2017-01-28 21:21:22', '2017-01-28 21:21:22'),
(49, 5, 6, 'hello user 6', 0, '2017-01-28 21:25:28', '2017-01-28 21:25:28'),
(50, 5, 6, 'hello user 6', 0, '2017-01-28 21:25:37', '2017-01-28 21:25:37'),
(51, 5, 6, 'hello user 6', 0, '2017-01-28 21:25:37', '2017-01-28 21:25:37'),
(52, 5, 15, 'hello user 6', 1, '2017-01-28 21:31:54', '2017-02-05 18:34:28'),
(53, 5, 15, 'hello user 6', 1, '2017-01-28 21:34:36', '2017-02-05 18:53:03'),
(54, 5, 15, 'hello user 6', 0, '2017-01-28 21:34:45', '2017-02-05 18:40:52'),
(55, 5, 15, 'hello user 6', 0, '2017-01-28 21:37:18', '2017-02-05 18:50:28'),
(56, 5, 15, 'hello user 6', 0, '2017-01-28 21:38:03', '2017-02-05 18:47:50'),
(57, 15, 5, 'hello, user', 0, '2017-02-05 20:23:49', '2017-02-05 20:23:49'),
(60, 5, 15, 'asdas', 0, '2017-02-05 20:27:17', '2017-02-05 20:27:17'),
(61, 5, 15, 'asdas', 1, '2017-02-05 20:31:15', '2017-02-05 20:31:15'),
(62, 5, 15, 'asdas', 1, '2017-02-05 20:31:23', '2017-02-05 20:31:23'),
(63, 5, 15, 'whosg gds gesgs u gg iwg ue wigewige iguwuwge', 1, '2017-02-05 20:31:32', '2017-02-05 20:31:32'),
(64, 5, 15, 'whosg iguwuwge', 1, '2017-02-05 20:36:34', '2017-02-05 20:36:34'),
(65, 5, 15, 'whosg iguwuwge', 1, '2017-02-05 20:37:34', '2017-02-05 20:37:34'),
(66, 5, 15, 'whosg iguwuwge', 1, '2017-02-05 20:38:42', '2017-02-05 20:38:42'),
(67, 5, 15, 'whosg iguwuwge', 1, '2017-02-05 20:39:13', '2017-02-05 20:39:13');

-- --------------------------------------------------------

--
-- Table structure for table `user_photos`
--

CREATE TABLE `user_photos` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `file` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `uploaded_files`
--
ALTER TABLE `uploaded_files`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_messages`
--
ALTER TABLE `user_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userFrom` (`userFrom`),
  ADD KEY `userTo` (`userTo`),
  ADD KEY `userFrom_2` (`userFrom`,`userTo`,`isDelivered`),
  ADD KEY `isRead` (`isDelivered`,`userTo`);

--
-- Indexes for table `user_photos`
--
ALTER TABLE `user_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `uploaded_files`
--
ALTER TABLE `uploaded_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
--
-- AUTO_INCREMENT for table `user_messages`
--
ALTER TABLE `user_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;
--
-- AUTO_INCREMENT for table `user_photos`
--
ALTER TABLE `user_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
