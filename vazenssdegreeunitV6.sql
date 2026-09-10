-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 10, 2026 at 10:37 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vazenssdegreeunit`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_details`
--

CREATE TABLE `academic_details` (
  `student_id` int(11) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `nss_year` enum('FY','SY','TY') NOT NULL,
  `class` enum('FY','SY','TY') NOT NULL,
  `program` varchar(20) NOT NULL,
  `division` varchar(2) NOT NULL,
  `roll_no` varchar(4) NOT NULL,
  `total_hrs` decimal(4,1) NOT NULL DEFAULT 0.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `academic_details`
--

INSERT INTO `academic_details` (`student_id`, `academic_year`, `nss_year`, `class`, `program`, `division`, `roll_no`, `total_hrs`) VALUES
(15, '2026-27', 'TY', 'TY', 'BSCIT', 'A', '001', 0.0),
(27, '2026-27', 'TY', 'TY', 'BSC', 'A', '002', 2.5),
(28, '2026-27', 'SY', 'SY', 'BSC', 'A', '026', 5.0),
(29, '2026-27', 'TY', 'TY', 'BSCIT', 'A', '060', 0.0),
(30, '2026-27', 'TY', 'TY', 'BSCIT', 'A', '001', 0.0),
(31, '2026-27', 'TY', 'TY', 'BSCIT', 'A', '059', 0.0);

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `username` varchar(15) NOT NULL,
  `email` varchar(50) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) DEFAULT NULL,
  `mobile` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('programme officer','nss team') NOT NULL,
  `clg_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `username`, `email`, `first_name`, `last_name`, `mobile`, `password`, `role`, `clg_id`, `created_at`, `updated_at`) VALUES
(2, 'vighneshvtawade', 'vighneshvtawade1605@gmail.com', 'Vighnesh', 'Tawade', '8928676618', '$2y$10$RYKNYTO6MrzB3OOc5Rc47.Aw8IkY/XWzb7SPg8.vHUtcCjCmxKBGm', 'programme officer', 1, '2026-07-18 23:17:22', '2026-07-18 23:17:22'),
(46, 'Vighnesh@123', 'vighneshvtawade1605@gmail.com', 'Vighnesh', 'Tawade', '8956231245', '$2y$10$wKX1Z4go9jcotCHEvRzY2uPoJ6orl8xxpjrwCJwQI8T9mtYWZ0AbS', 'programme officer', 1, '2026-07-23 07:01:12', '2026-07-23 07:01:12'),
(48, 'ggg@123', 'vighneshvtawade1605@gmail.com', 'ggg', 'Tawade', '8928614562', '$2y$10$iRwOnUGQAh7sXEwvaDkCkeCN0QNFuFIXSbKCnR00TRZBsIgrlAe1q', 'programme officer', 1, '2026-07-23 07:07:17', '2026-07-23 07:07:17'),
(51, 'ttt@123', 'vighneshvtawade1605@gmail.com', 'ttt', 'Tawade', '8928614565', '$2y$10$r7JLiB7bBDR8ZYTSHfGTC.jJWLYyudPI0RqBnlE0wIL.FVAfVEGeS', 'programme officer', 1, '2026-07-23 07:15:30', '2026-07-23 07:15:30'),
(55, 'Vigh@123', 'vighneshvtawade1605@gmail.com', 'Vigh', 'Tawade', '8946132546', '$2y$10$e.w/aHI8tm9.S4yXSB9LhOhVGReV.sUTAdr.4p7eAfvs8vBvVfXEG', 'programme officer', 1, '2026-07-23 13:22:29', '2026-07-23 13:22:29'),
(58, 'Vi@123', 'vighneshvtawade1605@gmail.com', 'Vi', 'Tawade', '8946132532', '$2y$10$sGoMxtkmLc7RN4WTtQ/TQe8zYAR4epCArMyIBIsGpsEQnfL4f.ZJi', 'programme officer', 1, '2026-07-23 13:26:02', '2026-07-23 13:26:02'),
(62, 'vigh3@123', 'asd@gafds.com', 'vigh3', 'gjh', '7613792558', '$2y$10$f2DdBc.XrgkMHruIQNPA..YrCzOUFausnE2f5JG.rQDGWoLml4VNK', 'programme officer', 1, '2026-07-23 13:37:17', '2026-07-23 13:37:17'),
(63, 'vigh5@123', 'asd@fg.com', 'vigh5', 'df', '8613254689', '$2y$10$KjsbcDTmF6nbzAHIZkKLpeHLxPVDqYMgVGPcXH2QLxJKDd5VFIrBy', 'nss team', 1, '2026-07-23 13:37:56', '2026-07-23 13:37:56');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `event_id` int(11) NOT NULL,
  `attendance_no` int(11) NOT NULL,
  `reporting_mark` timestamp NULL DEFAULT NULL,
  `isabsent` enum('yes','no') DEFAULT NULL,
  `student_id` int(11) NOT NULL,
  `marked_by_leader` int(11) DEFAULT NULL,
  `marked_by_admin` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`event_id`, `attendance_no`, `reporting_mark`, `isabsent`, `student_id`, `marked_by_leader`, `marked_by_admin`) VALUES
(2, 1, '2026-08-22 21:06:47', 'no', 28, NULL, NULL),
(3, 1, '2026-08-13 21:16:59', 'no', 28, NULL, NULL),
(3, 2, '2026-08-13 21:16:59', 'no', 27, NULL, NULL),
(5, 1, '2026-08-13 18:53:19', 'no', 28, NULL, 2),
(5, 2, '2026-09-03 17:39:32', 'no', 29, NULL, 2),
(7, 1, '2026-09-06 14:08:38', 'no', 28, NULL, 2);

-- --------------------------------------------------------

--
-- Table structure for table `college`
--

CREATE TABLE `college` (
  `clg_id` int(11) NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `college`
--

INSERT INTO `college` (`clg_id`, `name`, `password`) VALUES
(1, 'vaze', 'vazenss');

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `event_id` int(11) NOT NULL,
  `name` varchar(40) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `venue` varchar(150) DEFAULT NULL,
  `organised_by` varchar(20) NOT NULL,
  `collaboration` varchar(30) DEFAULT NULL,
  `event_type` varchar(20) NOT NULL,
  `approx_hrs` decimal(2,1) DEFAULT 1.0,
  `max_participation` int(11) DEFAULT NULL,
  `status` enum('Tentative','Scheduled','Active','Completed','Cancelled') NOT NULL,
  `reporting_time` time DEFAULT NULL,
  `reporting_venue` varchar(100) DEFAULT NULL,
  `description` mediumtext NOT NULL,
  `attendance_status` enum('Pending','Completed') DEFAULT 'Pending',
  `report_status` enum('Pending','Completed') DEFAULT 'Pending',
  `feedback_status` enum('Pending','Active','Closed','') NOT NULL DEFAULT 'Pending',
  `alloted_hrs` decimal(4,1) NOT NULL DEFAULT 0.0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by_admin` int(11) DEFAULT NULL,
  `created_by_leader` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event`
--

INSERT INTO `event` (`event_id`, `name`, `date`, `time`, `venue`, `organised_by`, `collaboration`, `event_type`, `approx_hrs`, `max_participation`, `status`, `reporting_time`, `reporting_venue`, `description`, `attendance_status`, `report_status`, `feedback_status`, `alloted_hrs`, `created_at`, `updated_at`, `created_by_admin`, `created_by_leader`) VALUES
(2, 'Tree Plantation', '2026-09-16', '07:30:00', 'college', 'clg', 'no', 'ABP-1', 2.0, 2, 'Cancelled', '07:00:00', 'unit', 'ewrwefdawrefwaef', 'Pending', 'Pending', 'Pending', 0.0, '2026-07-23 15:32:01', '2026-09-03 17:41:57', 2, NULL),
(3, 'Independance Day', '2026-08-15', '08:00:00', 'college', 'NSS Degree Unit', 'NONE', 'CL', 2.0, 40, 'Completed', '07:30:00', 'college foyer', '', 'Completed', 'Pending', 'Active', 2.5, '2026-07-30 20:01:21', '2026-08-13 19:17:24', 2, NULL),
(5, 'Cleanliness Drive', '2026-08-10', '08:00:00', 'college', 'NSS Degree Unit', 'NONE', 'ABP-1', 2.5, 40, 'Completed', '07:30:00', 'college foyer', '', 'Completed', 'Completed', 'Active', 0.0, '2026-08-01 19:12:16', '2026-08-09 20:45:38', 2, NULL),
(6, 'Republic day ', '2027-01-26', '08:00:00', 'College', 'College', 'None', 'CL', 2.0, 20, 'Scheduled', '07:30:00', 'College foyer', '', 'Pending', 'Pending', 'Pending', 0.0, '2026-08-07 15:55:56', '2026-08-28 12:51:32', 2, NULL),
(7, 'Cleanliness drive', '2026-09-20', '08:30:00', 'Gravyard Road', 'NSS Degree Unit', 'NA', 'ABP-1', 2.0, 40, 'Completed', '08:00:00', 'NSS Degree Unit', 'The 🔰 NSS Degree Unit🔰 of The KET\'s V. G. Vaze College is organizing a 🧹 Cleanliness Drive to promote cleanliness, hygiene, and environmental responsibility among students and the college community.\r\n\r\nThe drive aims to encourage NSS volunteers to actively contribute towards maintaining a clean, healthy, and sustainable campus while spreading awareness about the importance of cleanliness and responsible waste management. 🌱♻️', 'Completed', 'Pending', 'Pending', 2.5, '2026-08-09 19:41:56', '2026-08-28 12:36:03', 2, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `faq`
--

CREATE TABLE `faq` (
  `f_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `answer` text DEFAULT NULL,
  `ans_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `q_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `q_type` enum('rating','textarea','text','') NOT NULL,
  `event_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`q_id`, `question`, `q_type`, `event_id`) VALUES
(1, 'how', 'text', 3),
(2, 'Rate the event', 'rating', 3),
(3, 'How was the event?', 'rating', 5);

-- --------------------------------------------------------

--
-- Table structure for table `report`
--

CREATE TABLE `report` (
  `report_id` int(11) NOT NULL,
  `male_count` int(11) DEFAULT NULL,
  `female_count` int(11) DEFAULT NULL,
  `description` text NOT NULL,
  `conclusion` text NOT NULL,
  `expense` decimal(5,0) DEFAULT NULL,
  `report_url` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `for_event` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report`
--

INSERT INTO `report` (`report_id`, `male_count`, `female_count`, `description`, `conclusion`, `expense`, `report_url`, `created_by`, `for_event`) VALUES
(17, 2, 0, 'ewfWE', 'FwefWEF', 0, 'https://res.cloudinary.com/wq24l7zu/raw/upload/v1789071968/reports/2026-08-10_Cleanliness%20Drive.docx', NULL, 5);

-- --------------------------------------------------------

--
-- Table structure for table `response`
--

CREATE TABLE `response` (
  `r_id` int(11) NOT NULL,
  `answer` text NOT NULL,
  `q_id` int(11) DEFAULT NULL,
  `ans_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `response`
--

INSERT INTO `response` (`r_id`, `answer`, `q_id`, `ans_by`) VALUES
(3, 'Grear', 1, 28),
(4, '5', 2, 28);

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `std_id` int(11) NOT NULL,
  `username` varchar(20) DEFAULT NULL,
  `first_name` varchar(20) NOT NULL,
  `father_name` varchar(20) NOT NULL,
  `mother_name` varchar(20) NOT NULL,
  `surname` varchar(20) DEFAULT NULL,
  `email` varchar(225) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `blood_grp` enum('A+','B+','AB+','O+','A-','B-','AB-','O-') NOT NULL,
  `caste` varchar(20) NOT NULL,
  `dob` date NOT NULL,
  `role` enum('Volunteer','Leader') DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`std_id`, `username`, `first_name`, `father_name`, `mother_name`, `surname`, `email`, `gender`, `mobile`, `blood_grp`, `caste`, `dob`, `role`, `password`, `approved_by`, `created_at`, `updated_at`, `assigned_by`) VALUES
(15, 'vignesh2544', 'Vignesh', 'Vijay', 'Vinaya', 'Tawade', 'vigh127823@gmail.com', 'Male', '8946132544', 'B+', 'GENERAL', '2006-05-16', 'Leader', '$2y$10$.PKQpkS18AjyOovxQEKfwOfWf1CEEc/SMm8c50CW2Znx2tVpVMSWS', 29, '2026-07-30 18:36:53', '2026-07-30 18:36:53', 2),
(27, 'akshay3264_1', 'Akshay', 'Santosh', 'Sonali', 'Pawar', 'akshay123@gmail.com', 'Male', '9865323264', 'A+', 'GENERAL', '2006-06-15', 'Volunteer', '$2y$10$k2fgY1mZxMi69aoSlcZ4oOGmQ41VHCxRESQ/1XyniVe9DNgCnP3qO', 29, '2026-08-06 19:16:31', '2026-08-06 19:16:31', NULL),
(28, 'santosh1132_1', 'Santosh', 'Sunil', 'Sunita', 'Shinde', 'san123@gmail.com', 'Male', '9892741132', 'O+', 'GENERAL', '2007-04-16', 'Volunteer', '$2y$10$ma7NTw7dfjFsCXLf7Kv.Auy16YF37APWqJRDgz9RL9oMH6m5IWAYu', 29, '2026-08-06 21:16:20', '2026-08-06 21:16:20', NULL),
(29, 'dhananjay1236_1', 'Dhananjay', 'Prakash', 'Pramila', 'Shelar', 'Dhanajay26@gmail.com', 'Male', '7896541236', 'A+', 'GENERAL', '2006-09-26', 'Leader', '$2y$10$Dr0xHAJcweADqb0aKgsXo.LTlJ8OTHMxuHTJoWgAL7ic9bzJhmSlq', 29, '2026-08-10 19:31:57', '2026-08-10 19:31:57', 2),
(30, 'akshay4512', 'Akshay', 'Santosh', 'Sonali', 'Pawar', 'akshay245@gmail.com', 'Male', '8956234512', 'B+', 'GENERAL', '2007-05-16', 'Volunteer', '$2y$10$InWQU64rsqo1aXMZyK99QeulbpsxWMW5SqFIAn.napW6p9f2FO3f2', 29, '2026-08-24 20:25:14', '2026-08-24 20:25:14', NULL),
(31, 'vighnesh1245', 'Vighnesh', 'Vijay', 'Vinaya', 'Tawade', 'vighneshtawade16@gmail.com', 'Male', '8965321245', 'B+', 'GENERAL', '2006-05-16', 'Volunteer', '$2y$10$6Rt1nfthyJl3Me9n3lz.3uVEmIA.wC2t5HIM3rVjUhd9yD.CwRJca', 29, '2026-08-25 20:30:03', '2026-08-25 20:30:03', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_details`
--
ALTER TABLE `academic_details`
  ADD PRIMARY KEY (`student_id`,`academic_year`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `mobile` (`mobile`),
  ADD UNIQUE KEY `password` (`password`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `clg_id` (`clg_id`),
  ADD KEY `email` (`email`) USING BTREE;

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`event_id`,`attendance_no`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `marked_by` (`marked_by_leader`);

--
-- Indexes for table `college`
--
ALTER TABLE `college`
  ADD PRIMARY KEY (`clg_id`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `created_by_admin` (`created_by_admin`),
  ADD KEY `created_by_leader` (`created_by_leader`);

--
-- Indexes for table `faq`
--
ALTER TABLE `faq`
  ADD PRIMARY KEY (`f_id`),
  ADD KEY `ans_by` (`ans_by`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`q_id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `report`
--
ALTER TABLE `report`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `for_event` (`for_event`);

--
-- Indexes for table `response`
--
ALTER TABLE `response`
  ADD PRIMARY KEY (`r_id`),
  ADD KEY `q_id` (`q_id`),
  ADD KEY `ans_by` (`ans_by`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`std_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `password` (`password`),
  ADD UNIQUE KEY `username` (`username`,`email`,`password`),
  ADD KEY `student_ibfk_1` (`approved_by`),
  ADD KEY `student_ibfk_2` (`assigned_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `college`
--
ALTER TABLE `college`
  MODIFY `clg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `q_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `report`
--
ALTER TABLE `report`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `response`
--
ALTER TABLE `response`
  MODIFY `r_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `std_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `academic_details`
--
ALTER TABLE `academic_details`
  ADD CONSTRAINT `academic_details_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`std_id`);

--
-- Constraints for table `admin`
--
ALTER TABLE `admin`
  ADD CONSTRAINT `admin_ibfk_1` FOREIGN KEY (`clg_id`) REFERENCES `college` (`clg_id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`),
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student` (`std_id`),
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`marked_by_leader`) REFERENCES `student` (`std_id`);

--
-- Constraints for table `event`
--
ALTER TABLE `event`
  ADD CONSTRAINT `event_ibfk_1` FOREIGN KEY (`created_by_admin`) REFERENCES `admin` (`admin_id`),
  ADD CONSTRAINT `event_ibfk_2` FOREIGN KEY (`created_by_leader`) REFERENCES `student` (`std_id`);

--
-- Constraints for table `faq`
--
ALTER TABLE `faq`
  ADD CONSTRAINT `faq_ibfk_1` FOREIGN KEY (`ans_by`) REFERENCES `student` (`std_id`);

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`);

--
-- Constraints for table `report`
--
ALTER TABLE `report`
  ADD CONSTRAINT `report_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `student` (`std_id`),
  ADD CONSTRAINT `report_ibfk_2` FOREIGN KEY (`for_event`) REFERENCES `event` (`event_id`) ON DELETE CASCADE;

--
-- Constraints for table `response`
--
ALTER TABLE `response`
  ADD CONSTRAINT `response_ibfk_1` FOREIGN KEY (`q_id`) REFERENCES `feedback` (`q_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `response_ibfk_2` FOREIGN KEY (`ans_by`) REFERENCES `student` (`std_id`);

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `student_ibfk_1` FOREIGN KEY (`approved_by`) REFERENCES `student` (`std_id`),
  ADD CONSTRAINT `student_ibfk_2` FOREIGN KEY (`assigned_by`) REFERENCES `admin` (`admin_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
