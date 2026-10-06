-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 05, 2026 at 09:25 PM
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
  `total_hrs` decimal(4,1) NOT NULL DEFAULT 0.0,
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `academic_details`
--

INSERT INTO `academic_details` (`student_id`, `academic_year`, `nss_year`, `class`, `program`, `division`, `roll_no`, `total_hrs`, `updated_at`) VALUES
(27, '2026-27', 'TY', 'TY', 'BSC', 'A', '002', 2.5, NULL),
(28, '2026-27', 'SY', 'SY', 'BSC', 'A', '026', 5.0, NULL),
(29, '2026-27', 'TY', 'TY', 'BSCIT', 'A', '060', 0.0, NULL),
(35, '2026-27', 'SY', 'SY', 'BSC', 'B', '122', 0.0, '2026-10-05 18:59:17');

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
(70, 'manish456', 'vighneshtawade16@gmail.com', 'Manish', 'Surve', '8956321456', '$2y$10$/7wuiIrWH9OoCURF0D0LhOJ738jEMzyl1uwFaxUpjo3Kjb/nGUWJi', 'nss team', 1, '2026-09-28 19:11:33', '2026-09-28 19:11:33'),
(71, 'manish245', 'manish123@gmail.com', 'Manish', 'Surve', '8965321245', '$2y$10$Jg7apY4iPKCnFWTmx9xzOOG.Ryre9b4nzCPY4Wo/k26PK7MV56BeW', 'nss team', 1, '2026-10-04 16:13:33', '2026-10-04 16:13:33'),
(73, 'siddhart645', 'proffteam30@gmail.com', 'Siddhart', 'Jathar', '8956231645', '$2y$10$97IHyiCVKKxb06T7KSm/j.bsHRwmSkG51P0vv4rbrorgq0ZdQAhJS', 'nss team', 1, '2026-10-05 19:06:59', '2026-10-05 19:06:59');

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
(3, 2, '2026-08-13 21:16:59', 'yes', 27, NULL, NULL),
(5, 1, '2026-08-13 18:53:19', 'no', 28, NULL, 2),
(5, 2, '2026-09-03 17:39:32', 'no', 29, NULL, 2),
(6, 1, NULL, 'yes', 28, NULL, NULL),
(6, 2, NULL, 'yes', 29, NULL, NULL),
(7, 1, '2026-09-06 14:08:38', 'no', 28, NULL, 2),
(8, 1, NULL, 'yes', 28, 29, NULL),
(8, 2, '2026-09-28 22:10:04', 'no', 27, 29, NULL),
(12, 1, '2026-09-29 04:48:56', 'no', 28, NULL, 2),
(12, 2, NULL, 'yes', 29, NULL, NULL);

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
(3, 'Independance Day', '2026-08-15', '08:00:00', 'college', 'NSS Degree Unit', 'NONE', 'CL', 2.0, 40, 'Completed', '07:30:00', 'college foyer', '', 'Completed', 'Completed', 'Active', 2.5, '2026-07-30 20:01:21', '2026-08-13 19:17:24', 2, NULL),
(5, 'Cleanliness Drive', '2026-08-10', '08:00:00', 'college', 'NSS Degree Unit', 'NONE', 'ABP-1', 2.5, 40, 'Completed', '07:30:00', 'college foyer', '', 'Completed', 'Completed', 'Active', 0.0, '2026-08-01 19:12:16', '2026-08-09 20:45:38', 2, NULL),
(6, 'Republic day ', '2027-01-26', '08:00:00', 'College', 'College', 'None', 'CL', 2.0, 2, 'Active', '07:30:00', 'College foyer', '', 'Pending', 'Pending', 'Pending', 0.0, '2026-08-07 15:55:56', '2026-09-28 22:32:59', 2, NULL),
(7, 'Cleanliness drive', '2026-09-20', '08:30:00', 'Gravyard Road', 'NSS Degree Unit', 'NA', 'ABP-1', 2.0, 40, 'Completed', '08:00:00', 'NSS Degree Unit', 'The 🔰 NSS Degree Unit🔰 of The KET\'s V. G. Vaze College is organizing a 🧹 Cleanliness Drive to promote cleanliness, hygiene, and environmental responsibility among students and the college community.\r\n\r\nThe drive aims to encourage NSS volunteers to actively contribute towards maintaining a clean, healthy, and sustainable campus while spreading awareness about the importance of cleanliness and responsible waste management. 🌱♻️', 'Completed', 'Pending', 'Pending', 2.5, '2026-08-09 19:41:56', '2026-08-28 12:36:03', 2, NULL),
(8, 'Tree Plantation', '2026-10-14', '08:00:00', 'Gravyard Road', 'NSS Degree Unit', '', 'ABP-1', 2.0, 2, 'Completed', '08:00:00', 'college foyer', '', 'Completed', 'Pending', 'Active', 0.0, '2026-09-27 18:25:56', '2026-09-28 20:26:08', NULL, 29),
(9, 'Tree Plantation', '2026-11-20', '08:00:00', 'Gravyard Road', 'NSS Degree Unit', 'NA', 'ABP-1', 2.0, 20, 'Scheduled', '07:30:00', 'college foyer', '', 'Pending', 'Pending', 'Pending', 0.0, '2026-09-27 18:28:52', '2026-09-27 18:28:52', NULL, 29),
(10, 'Blood Donation', '2026-12-24', '08:00:00', 'Gravyard Road', 'NSS Degree Unit', 'NA', 'ABP-1', 2.0, 20, 'Scheduled', '07:30:00', 'college foyer', '', 'Pending', 'Pending', 'Pending', 0.0, '2026-09-27 18:29:25', '2026-09-27 18:29:25', NULL, 29),
(12, 'Tree Plantation', '2026-10-29', '08:00:00', 'Gravyard Road', 'NSS Degree Unit', 'NA', 'ABP-1', 2.0, 30, 'Scheduled', '07:30:00', 'college foyer', '', 'Pending', 'Pending', 'Pending', 0.0, '2026-09-28 19:17:29', '2026-09-28 19:17:29', 70, NULL),
(13, 'Tree Plantation', '2026-10-21', '08:00:00', 'Gravyard Road', 'NSS Degree Unit', 'NONE', 'ABP-3', 2.0, 20, 'Scheduled', '07:30:00', 'college foyer', 'ewf', 'Pending', 'Pending', 'Pending', 0.0, '2026-10-02 20:24:01', '2026-10-05 19:10:27', NULL, 29);

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

--
-- Dumping data for table `faq`
--

INSERT INTO `faq` (`f_id`, `question`, `answer`, `ans_by`) VALUES
(1, 'What is Regular?', 'It is 2 yrs NSS volunteering', 29),
(2, 'fwafd', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `q_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `q_type` enum('rating','textarea','text','multiple_choice') NOT NULL,
  `event_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`q_id`, `question`, `q_type`, `event_id`) VALUES
(1, 'how', 'text', 3),
(2, 'Rate the event', 'rating', 3),
(3, 'How was the event?', 'rating', 5),
(5, 'What was event about?', 'multiple_choice', 5),
(6, 'ascd', 'text', 5),
(7, 'efdce', 'text', 8),
(8, 'Theme of event', 'multiple_choice', 5);

-- --------------------------------------------------------

--
-- Table structure for table `question_options`
--

CREATE TABLE `question_options` (
  `option_id` int(11) NOT NULL,
  `q_id` int(11) NOT NULL,
  `option_label` varchar(10) DEFAULT NULL,
  `option_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `question_options`
--

INSERT INTO `question_options` (`option_id`, `q_id`, `option_label`, `option_text`) VALUES
(1, 8, 'A', 'Health'),
(2, 8, 'B', 'Environment');

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
(17, 2, 0, 'ewfWE', 'FwefWEF', 0, 'https://res.cloudinary.com/wq24l7zu/raw/upload/v1789071968/reports/2026-08-10_Cleanliness%20Drive.docx', NULL, 5),
(18, 2, 0, 'wrgv', 'sdv', 222, 'https://res.cloudinary.com/wq24l7zu/raw/upload/v1790356996/reports/2026-08-15_Independance%20Day.docx', NULL, 3);

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
(8, '5', 3, 28),
(9, '', 5, 28),
(10, 'hha', 6, 28),
(11, 'Health', 8, 28),
(12, 'good', 1, 28),
(13, '4', 2, 28);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `field` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'closed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`field`, `status`) VALUES
('registration_status', 'open');

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
  `assigned_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`std_id`, `username`, `first_name`, `father_name`, `mother_name`, `surname`, `email`, `gender`, `mobile`, `blood_grp`, `caste`, `dob`, `role`, `password`, `approved_by`, `created_at`, `assigned_by`) VALUES
(27, 'akshay3264_1', 'Akshay', 'Santosh', 'Sonali', 'Pawar', 'akshay123@gmail.com', 'Male', '9865323264', 'A+', 'GENERAL', '2006-06-15', 'Volunteer', '$2y$10$k2fgY1mZxMi69aoSlcZ4oOGmQ41VHCxRESQ/1XyniVe9DNgCnP3qO', 29, '2026-08-06 19:16:31', NULL),
(28, 'santosh1132_1', 'Santosh', 'Sunil', 'Sunita', 'Shinde', 'san123@gmail.com', 'Male', '9892741132', 'O+', 'GENERAL', '2007-04-16', 'Volunteer', '$2y$10$ma7NTw7dfjFsCXLf7Kv.Auy16YF37APWqJRDgz9RL9oMH6m5IWAYu', 29, '2026-08-06 21:16:20', NULL),
(29, 'dhananjay1236_1', 'Dhananjay', 'Prakash', 'Pramila', 'Shelar', 'Dhanajay26@gmail.com', 'Male', '7896541236', 'A+', 'GENERAL', '2006-09-26', 'Leader', '$2y$10$Dr0xHAJcweADqb0aKgsXo.LTlJ8OTHMxuHTJoWgAL7ic9bzJhmSlq', 29, '2026-08-10 19:31:57', 2),
(35, 'vighnesh6618', 'Vighnesh', 'eqfq', 'ewf', 'Tawade', 'vighneshvawade16@gmail.com', 'Male', '8928676618', 'A-', 'GENERAL', '2010-07-05', 'Volunteer', '$2y$10$dBP5.nUI/JmcEwkseBXVheWDkM23HAbG7mNu.yX1xVzelWOumTFS2', 29, '2026-10-05 18:59:17', NULL);

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
-- Indexes for table `question_options`
--
ALTER TABLE `question_options`
  ADD PRIMARY KEY (`option_id`),
  ADD KEY `fk_options_question` (`q_id`);

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
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`field`);

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
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `college`
--
ALTER TABLE `college`
  MODIFY `clg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `faq`
--
ALTER TABLE `faq`
  MODIFY `f_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `q_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `question_options`
--
ALTER TABLE `question_options`
  MODIFY `option_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `report`
--
ALTER TABLE `report`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `response`
--
ALTER TABLE `response`
  MODIFY `r_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `std_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

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
-- Constraints for table `question_options`
--
ALTER TABLE `question_options`
  ADD CONSTRAINT `fk_options_question` FOREIGN KEY (`q_id`) REFERENCES `feedback` (`q_id`) ON DELETE CASCADE;

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
