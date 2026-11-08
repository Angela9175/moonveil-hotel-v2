-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Nov 08, 2026 at 04:30 PM
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
-- Database: `moonveil_v2`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `room_instance_id` int(11) DEFAULT NULL,
  `room_name` varchar(255) NOT NULL,
  `room_number` varchar(100) DEFAULT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `guest_name` varchar(255) NOT NULL,
  `guest_email` varchar(255) NOT NULL,
  `check_in` varchar(50) DEFAULT NULL,
  `check_out` varchar(50) DEFAULT NULL,
  `guests` int(11) DEFAULT 1,
  `adults` int(11) NOT NULL DEFAULT 1,
  `children` int(11) NOT NULL DEFAULT 0,
  `special_requests` text DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `downpayment_amount` decimal(10,2) DEFAULT 0.00,
  `remaining_balance` decimal(10,2) DEFAULT 0.00,
  `extra_charges` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(50) DEFAULT 'Pending',
  `payment_status` varchar(50) DEFAULT 'Pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `cancelled_by` int(11) DEFAULT NULL,
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `guest_phone` varchar(50) DEFAULT NULL,
  `booking_date` datetime DEFAULT current_timestamp(),
  `booking_reference` varchar(50) DEFAULT NULL,
  `checked_in_at` datetime DEFAULT NULL,
  `checked_out_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `guest_address` varchar(255) DEFAULT NULL,
  `guest_city` varchar(100) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `review_comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `room_id`, `room_instance_id`, `room_name`, `room_number`, `floor`, `guest_name`, `guest_email`, `check_in`, `check_out`, `guests`, `adults`, `children`, `special_requests`, `total_price`, `downpayment_amount`, `remaining_balance`, `extra_charges`, `status`, `payment_status`, `payment_method`, `payment_date`, `cancelled_at`, `cancelled_by`, `cancellation_reason`, `created_at`, `updated_at`, `guest_phone`, `booking_date`, `booking_reference`, `checked_in_at`, `checked_out_at`, `notes`, `guest_address`, `guest_city`, `rating`, `review_comment`) VALUES
(8, 1, 2, NULL, 'Executive Suite', NULL, NULL, 'Guest', 'admin@moonveil.com', '2026-10-16', '2026-10-18', 2, 2, 0, '', 13000.00, 0.00, 0.00, 0.00, 'Confirmed', 'Paid', 'pay_at_hotel', '2026-10-15 14:48:12', NULL, NULL, NULL, '2026-10-15 14:48:12', '2026-10-15 14:48:12', NULL, '2026-10-15 15:29:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 7, 2, NULL, 'Executive Suite', NULL, NULL, 'max', 'max@gmail.com', '2026-10-16', '2026-10-18', 2, 2, 0, '', 13800.00, 0.00, 0.00, 800.00, 'Confirmed', 'Pending', 'pay_at_hotel', NULL, NULL, NULL, NULL, '2026-10-15 17:17:23', '2026-10-15 17:17:23', '09748723974235', '2026-10-15 17:17:23', 'BK-1792055843839', NULL, NULL, '', '', '', NULL, NULL),
(25, 15, 2, NULL, 'Executive Suite', '301', 'Floor 3', 'Gl Santos', 'glsantos17@gmail.com', '2026-10-29 14:00', '2026-10-31 12:00', 2, 2, 0, '', 13100.00, 0.00, 0.00, 100.00, 'Cancelled', 'Pending', 'pay_at_hotel', NULL, '2026-10-30 19:01:53', 15, 'Cancelled by user', '2026-10-28 13:44:26', '2026-10-30 19:01:53', '09872345678', '2026-10-28 13:44:26', 'BK-1793166266236', NULL, NULL, '', '', '', NULL, NULL),
(26, 15, 5, NULL, 'Superior Twin Room', NULL, '2', 'Gl santos', 'glsantos17@gmail.com', '2026-10-30 23:00', '2026-11-01 12:00', 2, 2, 0, '', 5950.00, 0.00, 0.00, 350.00, 'Confirmed', 'Paid', 'gcash', '2026-10-30 21:57:35', NULL, NULL, NULL, '2026-10-30 21:57:35', '2026-10-30 21:57:35', '09123456789', '2026-10-30 21:57:35', 'BK-1793368655233', NULL, NULL, '', '', '', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `booking_charges`
--

CREATE TABLE `booking_charges` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `charge_type` varchar(50) NOT NULL DEFAULT 'extra_service',
  `description` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `amount` decimal(10,2) NOT NULL,
  `added_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_charges`
--

INSERT INTO `booking_charges` (`id`, `booking_id`, `charge_type`, `description`, `quantity`, `amount`, `added_by`, `created_at`) VALUES
(1, 8, 'late_checkout', 'Late Checkout Fee', 1, 500.00, 7, '2026-10-31 15:44:46');

-- --------------------------------------------------------

--
-- Stand-in structure for view `booking_totals`
-- (See below for the actual view)
--
CREATE TABLE `booking_totals` (
`booking_id` int(11)
,`total_price` decimal(10,2)
,`extra_total` decimal(42,2)
,`grand_total` decimal(43,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `hotel_info`
--

CREATE TABLE `hotel_info` (
  `id` int(11) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hotel_info`
--

INSERT INTO `hotel_info` (`id`, `name`, `address`, `phone`, `email`, `description`, `check_in_time`, `check_out_time`) VALUES
(1, 'Moonveil Hotel', '123 Serenity Ave, Manila', '+63 2 8888 0000', 'info@moonveil.com', 'A serene escape in the heart of the city.', '14:00:00', '12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `status` enum('Pending','Resolved','Archived') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `first_name`, `last_name`, `email`, `message`, `status`, `created_at`) VALUES
(1, 'Gl', 'Santos', 'glsantos@gmail.com', 'hiiiiiii, i have a question', 'Resolved', '2026-11-08 14:13:12');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `room_name` varchar(255) DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `booking_id`, `room_id`, `room_name`, `guest_name`, `rating`, `comment`, `created_at`, `user_id`) VALUES
(1, NULL, 5, 'Superior Twin Room', 'Gl Santos', 4, 'niceee', '2026-11-08 15:15:57', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text NOT NULL,
  `amenities` text DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `available` tinyint(1) DEFAULT 1,
  `bookings` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `capacity` int(11) DEFAULT 2,
  `allowed_floors` varchar(100) DEFAULT '1,2,3'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `type`, `price`, `description`, `amenities`, `image`, `rating`, `available`, `bookings`, `created_at`, `updated_at`, `capacity`, `allowed_floors`) VALUES
(1, 'Deluxe Room', 'Deluxe', 3500.00, 'Elegant room with city view.', '[\"WiFi\",\"AC\",\"TV\",\"Breakfast\"]', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 4.5, 0, 0, '2026-10-14 09:15:10', '2026-11-08 22:55:45', 2, '1,2,3'),
(2, 'Executive Suite', 'Suite', 6500.00, 'Spacious suite with lounge.', '[\"WiFi\",\"AC\",\"TV\",\"Breakfast\",\"Minibar\",\"Bathtub\"]', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 4.8, 1, 0, '2026-10-14 09:15:10', '2026-11-02 21:55:21', 4, '3,4'),
(3, 'Standard Room', 'Standard', 2200.00, 'Cozy room for solo travelers.', '[\"WiFi\",\"AC\",\"TV\"]', 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800', 4.0, 1, 0, '2026-10-14 09:15:10', '2026-10-14 09:15:10', 2, '1,2,3'),
(4, 'Penthouse', 'Penthouse', 15000.00, 'Top-floor luxury with private terrace.', '[\"WiFi\",\"AC\",\"TV\",\"Kitchen\",\"Jacuzzi\",\"Terrace\",\"Butler\"]', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 5.0, 1, 0, '2026-10-14 09:15:10', '2026-11-02 21:55:21', 6, '5'),
(5, 'Superior Twin Room', 'Standard', 2800.00, 'Comfortable twin setup featuring two separate beds for friends or colleagues.', NULL, '[\"/images/241284612.jpg\", \"/images/241272980.jpg\", \"/images/241272951.jpg\"]', 4.3, 1, 0, '2026-10-28 15:43:44', '2026-10-28 21:13:53', 2, '1,2,3'),
(6, 'Accessible Room', 'Standard', 3000.00, 'Specially designed room with wider doorways and accessible bathroom amenities.', NULL, '[\"/images/577799980.jpg\", \"/images/241287737.jpg\", \"/images/605833820.jpg\"]', 4.6, 1, 0, '2026-10-28 15:43:44', '2026-10-28 21:13:53', 2, '1,2,3'),
(7, 'Studio Loft', 'Deluxe', 3800.00, 'Modern multi-level layout with a dedicated workspace and cozy lounge feel.', NULL, '[\"/images/605833812.jpg\", \"/images/605833811.jpg\", \"/images/478838650.jpg\"]', 4.5, 1, 0, '2026-10-28 15:43:44', '2026-11-02 21:55:21', 3, '2,3'),
(8, 'Junior Suite', 'Suite', 4200.00, 'Open-plan suite with an integrated seating area and extra room amenities.', NULL, '[\"/images/478838646.jpg\", \"/images/466970692.jpg\", \"/images/243439187.jpg\"]', 4.7, 1, 0, '2026-10-28 15:43:44', '2026-11-02 21:55:21', 3, '2,3'),
(9, 'Family Suite', 'Family', 5200.00, 'Spacious multi-bed setup designed specifically for families and small groups.', NULL, '[\"/images/243439177.jpg\", \"/images/241284612.jpg\", \"/images/577799980.jpg\"]', 4.8, 1, 0, '2026-10-28 15:43:44', '2026-11-02 21:55:21', 4, '3,4'),
(10, 'Presidential Suite', 'Suite', 9800.00, 'Ultra-luxury suite featuring panoramic views, a lounge, and high-end finishes.', NULL, '[\"/images/605833820.jpg\", \"/images/478838650.jpg\", \"/images/243439187.jpg\"]', 4.9, 1, 0, '2026-10-28 15:43:44', '2026-11-02 21:55:21', 5, '4');

-- --------------------------------------------------------

--
-- Table structure for table `room_images`
--

CREATE TABLE `room_images` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `angle_label` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_images`
--

INSERT INTO `room_images` (`id`, `room_id`, `image_url`, `angle_label`, `sort_order`, `created_at`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 'Bedroom', 0, '2026-10-14 09:15:10'),
(2, 1, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 'Bathroom', 1, '2026-10-14 09:15:10'),
(3, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'Bedroom', 0, '2026-10-14 09:15:10'),
(4, 2, 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800', 'Living', 1, '2026-10-14 09:15:10'),
(5, 3, 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800', 'Bedroom', 0, '2026-10-14 09:15:10'),
(6, 4, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'View', 0, '2026-10-14 09:15:10'),
(7, 4, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800', 'Living', 1, '2026-10-14 09:15:10');

-- --------------------------------------------------------

--
-- Table structure for table `room_instances`
--

CREATE TABLE `room_instances` (
  `id` int(11) NOT NULL,
  `type_id` int(11) DEFAULT NULL,
  `room_number` varchar(100) NOT NULL,
  `floor` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'Available',
  `type_name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `key` varchar(100) NOT NULL,
  `value` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`key`, `value`) VALUES
('currency', 'PHP'),
('extra_guest_fee', '300'),
('hotel_name', 'Moonveil Hotel'),
('late_checkout_fee', '500'),
('max_children_per_room', '2'),
('online_booking_enabled', '1'),
('tax_rate', '12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `staff_position` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `created_at`, `updated_at`, `staff_position`, `department`, `employee_id`, `location`, `contact_number`, `address`, `city`) VALUES
(1, 'Admin', 'User', 'admin@moonveil.com', '$2a$10$Eh9mTzfe/QhTnQrjSAtEoO95E9TKk/cQCP5cpX2vYZxPKsSj66UkW', 'admin', '2026-10-14 09:15:10', '2026-10-14 09:15:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'david', 'reyes', 'davidreyes@gmail.com', '$2a$10$y54IkrYyRVcFbozEF1roHeTjsrNBhfLlrBTN4ZOqq/p4sEoBYOk/.', 'staff', '2026-10-15 16:01:21', '2026-10-15 16:29:16', 'Front Desk', 'Front Office', 'MOON-001', 'Cagayan de Oro', NULL, NULL, NULL),
(15, 'Gl', 'Santos', 'glsantos17@gmail.com', '$2a$10$eK6m6iHZaclodr3jfyG8/OQYuSy28ueXYbQm0SJK5xtETm.rT29Hm', 'user', '2026-10-28 13:42:57', '2026-10-28 13:42:57', NULL, NULL, NULL, NULL, '09876543210', 'Macabalan 17', 'Cagayan de Oro City');

-- --------------------------------------------------------

--
-- Structure for view `booking_totals`
--
DROP TABLE IF EXISTS `booking_totals`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `booking_totals`  AS SELECT `b`.`id` AS `booking_id`, `b`.`total_price` AS `total_price`, coalesce(sum(`c`.`quantity` * `c`.`amount`),0) AS `extra_total`, `b`.`total_price`+ coalesce(sum(`c`.`quantity` * `c`.`amount`),0) AS `grand_total` FROM (`bookings` `b` left join `booking_charges` `c` on(`c`.`booking_id` = `b`.`id`)) GROUP BY `b`.`id`, `b`.`total_price` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bk_user` (`user_id`),
  ADD KEY `fk_bk_room` (`room_id`),
  ADD KEY `fk_bk_instance` (`room_instance_id`),
  ADD KEY `fk_bk_cancelled` (`cancelled_by`);

--
-- Indexes for table `booking_charges`
--
ALTER TABLE `booking_charges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_charge_booking` (`booking_id`),
  ADD KEY `fk_charge_user` (`added_by`);

--
-- Indexes for table `hotel_info`
--
ALTER TABLE `hotel_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reset_user` (`user_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `room_images`
--
ALTER TABLE `room_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_roomimg_room` (`room_id`);

--
-- Indexes for table `room_instances`
--
ALTER TABLE `room_instances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_number` (`room_number`),
  ADD KEY `fk_instance_room` (`type_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `booking_charges`
--
ALTER TABLE `booking_charges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hotel_info`
--
ALTER TABLE `hotel_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `room_images`
--
ALTER TABLE `room_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `room_instances`
--
ALTER TABLE `room_instances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_bk_cancelled` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bk_instance` FOREIGN KEY (`room_instance_id`) REFERENCES `room_instances` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bk_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_charges`
--
ALTER TABLE `booking_charges`
  ADD CONSTRAINT `fk_charge_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_charge_user` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_images`
--
ALTER TABLE `room_images`
  ADD CONSTRAINT `fk_roomimg_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_instances`
--
ALTER TABLE `room_instances`
  ADD CONSTRAINT `fk_instance_room` FOREIGN KEY (`type_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
