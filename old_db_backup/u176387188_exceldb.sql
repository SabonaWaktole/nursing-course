-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 13, 2026 at 07:02 PM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u176387188_exceldb`
--

-- --------------------------------------------------------

--
-- Table structure for table `Certificate`
--

CREATE TABLE `Certificate` (
  `id` varchar(191) NOT NULL,
  `uniqueId` varchar(191) NOT NULL,
  `issuedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `userId` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Course`
--

CREATE TABLE `Course` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `thumbnail` varchar(191) DEFAULT NULL,
  `category` varchar(191) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `price` double DEFAULT 0,
  `instructorId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Course`
--

INSERT INTO `Course` (`id`, `title`, `description`, `thumbnail`, `category`, `tags`, `price`, `instructorId`, `createdAt`, `updatedAt`) VALUES
('01bf1bc7-a1c4-4b74-add8-9a10fa9beac0', 'Transferring Patients and Residents', 'Transferring patients and residents is one of the most important skills required of nursing\nassistants and healthcare aides. The process involves moving a patient safely from one location\nto ', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-11 01:46:11.246', '2026-03-11 01:46:11.246'),
('08542fed-5841-4427-a02e-31c0d70c8b69', 'Caring for People with Dementia', 'Dementia is one of the most challenging and complex conditions faced in modern healthcare. It\nis a disorder that affects the brain and gradually interferes with a person’s ability to think,\nr', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-07 14:07:59.230', '2026-03-07 14:07:59.230'),
('1995a2fa-7ab2-4474-b2e3-e754efaac7ed', 'Stress and Stress Management', 'Stress is a common part of everyday life and affects every individual at different times. In simple\nterms, stress is the state of being frightened, excited, confused, in danger, or irritated.', '', 'Nursing', '[\"Nursing\"]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-08 23:40:18.610', '2026-03-08 23:40:18.610'),
('21b5d3ef-1ff3-45bb-bcc1-819687d95630', 'Patient and Patient’s Rights', 'This course refers to a patient’s rights and responsibilities regarding their health and health care\nservices. President Bill Clinton appointed an Advisory Commission on Consumer Protection a', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-11 00:58:34.308', '2026-03-11 00:58:34.308'),
('282d7811-acc0-41d1-83b9-618ef8f1ec84', 'Death and Caring for Revised', 'Death can occur suddenly without notice or it can be expected. Older people, or people with\nterminal illnesses, may have time to prepare for death. Preparing for death is a process. It\naffect', '', 'Nursing', '[\"Nursing\"]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-06 22:43:01.929', '2026-03-06 22:43:01.929'),
('2aae581c-7c9a-4651-aca0-c018e06d4f7c', 'Assisting with Urinary and Bowel Elimination', 'Elimination of waste from the body is a basic human need. Just as the body requires\noxygen, nutrition, and rest to survive, it must also remove waste products to maintain\ninternal balance. Wh', '/uploads/thumbnails/1772639616530-407919233.png', 'CNA Prep', '[\"CNAprep\"]', 100, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-04 16:01:14.278', '2026-03-04 16:01:14.278'),
('3a6f0a97-2ecc-40e5-9754-85ed7573a83b', 'Ethics and Legal Ethics', 'Ethics are the knowledge of right and wrong. An ethical person has a sense of duty toward\nothers. It deals with choices or judgements about what should or should not be done. An ethical\nperso', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-09 13:38:16.466', '2026-03-09 13:38:16.466'),
('48bd5617-9cb9-4bc8-9c50-37282f52dc6f', 'Fall Prevention', 'Most accidents in the facility are due to falls. Falls can be caused by an unsafe environment,\nloss of abilities, disease and medications. Problems associated with falls range from minor\nbrui', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-09 00:44:34.931', '2026-03-09 00:44:34.931'),
('5213706d-b5e2-4dfa-97e2-7e0502a5a389', 'Cleanliness and Hygiene', 'Cleanliness and hygiene refer to the practices that individuals follow to maintain their bodies\nand environments in a clean and healthy condition. These practices include bathing, brushing\nte', '', 'Nursing', '[\"Nursing\"]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-05 21:35:35.211', '2026-03-05 21:35:35.211'),
('5c51f7a6-61f9-4548-9b75-0757d1b47310', 'HIPAA', 'The Health Insurance Portability and Accountability Act, commonly known as HIPAA, plays a\ncrucial role in protecting the privacy and confidentiality of patient information in the healthcare\ne', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-09 20:36:36.738', '2026-03-09 20:36:36.738'),
('73dbf1bd-2299-4b32-8768-3c001e8a6c32', 'Grooming Patients and Residents', 'Personal grooming is an essential part of daily care for patients and residents in healthcare\nfacilities. Grooming includes activities such as bathing, hair care, shaving, dressing, and\nmaint', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-09 21:51:35.986', '2026-03-09 21:51:35.986'),
('8e8444d6-b7d7-4dc7-b296-148477d1fae0', 'Vital Signs and Weights', 'Understanding vital signs is one of the most fundamental responsibilities in healthcare. These\nmeasurements provide essential information about how well a person’s body is functioning.\nBecaus', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-11 02:35:46.779', '2026-03-11 02:35:46.779'),
('ab0ea238-38bd-4336-b5a0-9a9412d11871', 'Patient and Resident’s Safety', 'Patient and resident safety is one of the most important responsibilities in any healthcare\nenvironment. Nursing assistants and other healthcare workers play a crucial role in ensuring\nthat p', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-11 00:09:09.056', '2026-03-11 00:09:09.056'),
('c08a4681-1b46-413d-ad58-fabf4d7b78cd', 'Positioning and Lifting Patients', 'Positioning and lifting patients is an essential responsibility for nursing assistants and other\nhealthcare workers. Many patients are unable to move or change their positions on their own\nbe', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-11 01:11:21.339', '2026-03-11 01:11:21.339'),
('c6ef29bf-f6b2-4680-be75-18a1820f250e', 'Communication', 'Communication is the process of exchanging information with others. It includes sending and\nreceiving measures. People communicate in several ways, such as drawings, signs and\nsymbols, includ', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-08 20:43:53.246', '2026-03-08 20:43:53.246'),
('d0f9e929-a01a-42d0-9614-2c26a3f87a4a', 'Nutrition Basics', 'Food and water are vital for life. A well-balanced diet is necessary for the well-being of the\nresidents.\nBad eating habits and other poor habits increase the following:\n Increase the risk fo', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-09 22:37:30.674', '2026-03-09 22:37:30.674'),
('f3ba9ddd-1dcc-4b8c-aa03-911a56f54d5f', 'Infection Control', 'Infection control is one of the most important responsibilities in healthcare. Every healthcare\nworker, whether a nurse, doctor, nursing assistant, or home health aide, plays a role in\npreven', '', 'Nursing', '[]', 0, '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2026-03-09 22:20:34.643', '2026-03-09 22:20:34.643');

-- --------------------------------------------------------

--
-- Table structure for table `Enrollment`
--

CREATE TABLE `Enrollment` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `completed` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Enrollment`
--

INSERT INTO `Enrollment` (`id`, `userId`, `courseId`, `progress`, `completed`, `createdAt`) VALUES
('03ba69b2-400d-40e8-a399-5061e220b5fc', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', '08542fed-5841-4427-a02e-31c0d70c8b69', 0, 0, '2026-03-08 04:17:08.725'),
('0a12f98e-be5f-47a2-8199-db7e2a2cd4a5', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', '5c51f7a6-61f9-4548-9b75-0757d1b47310', 100, 1, '2026-03-10 04:50:14.150'),
('18944c18-4762-44cc-a87d-fb157426a255', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', '48bd5617-9cb9-4bc8-9c50-37282f52dc6f', 0, 0, '2026-03-10 06:47:32.433'),
('2231142b-acc6-4c12-91b9-f3888dd5ce24', 'f85090cc-cba1-4f08-8b7a-2a87ce545305', '282d7811-acc0-41d1-83b9-618ef8f1ec84', 0, 0, '2026-03-07 03:08:05.647'),
('3d06ad03-724d-43a3-a63a-bfff295b6c11', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', 'f3ba9ddd-1dcc-4b8c-aa03-911a56f54d5f', 0, 0, '2026-03-10 04:58:27.815'),
('481eb0f4-c87b-4221-939b-0f71b8ba192b', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', '01bf1bc7-a1c4-4b74-add8-9a10fa9beac0', 0, 0, '2026-03-11 03:53:55.978'),
('55c56e54-daae-45e2-97b0-d850353717c7', 'f85090cc-cba1-4f08-8b7a-2a87ce545305', '5213706d-b5e2-4dfa-97e2-7e0502a5a389', 0, 0, '2026-03-07 03:12:19.418'),
('578f919f-a64d-4fc7-8977-18b4bcea0ef6', '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '2aae581c-7c9a-4651-aca0-c018e06d4f7c', 14, 0, '2026-03-04 18:38:36.428'),
('5f95fbc8-5d83-44a9-a3eb-7d4655fc9946', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', '21b5d3ef-1ff3-45bb-bcc1-819687d95630', 0, 0, '2026-03-11 03:59:19.377'),
('61101d35-af9d-421d-8767-7c652229018a', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', '1995a2fa-7ab2-4474-b2e3-e754efaac7ed', 0, 0, '2026-03-13 05:24:54.916'),
('6b19dc13-ee4d-4caf-afa9-149622840b9e', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', 'c6ef29bf-f6b2-4680-be75-18a1820f250e', 0, 0, '2026-03-10 06:01:52.400'),
('73ba4c24-3899-436b-888a-1e3d5e2b9875', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', 'd0f9e929-a01a-42d0-9614-2c26a3f87a4a', 20, 0, '2026-03-10 04:22:03.193'),
('8ee834f3-e0dd-4d74-ba4f-7e601474028e', 'd9553690-b64b-445c-9033-8a25734eac11', '2aae581c-7c9a-4651-aca0-c018e06d4f7c', 14, 0, '2026-03-04 22:18:39.400'),
('9146fdbe-073a-405a-8bd8-581a13b1b5be', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', '5213706d-b5e2-4dfa-97e2-7e0502a5a389', 0, 0, '2026-03-08 04:51:08.348'),
('9c7caa2b-53da-4f32-b3a8-cc64f159e6f5', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', '3a6f0a97-2ecc-40e5-9754-85ed7573a83b', 0, 0, '2026-03-11 18:42:37.315'),
('a6e27043-a797-4b43-9349-faca454a7180', '150955cc-f53b-4ea6-b77e-c363aabd9e5e', '5213706d-b5e2-4dfa-97e2-7e0502a5a389', 0, 0, '2026-03-06 01:15:03.556'),
('b11c3db6-39d5-4388-a301-ee7aed7cd654', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', '8e8444d6-b7d7-4dc7-b296-148477d1fae0', 0, 0, '2026-03-11 21:09:14.085'),
('bf474d49-fe90-4ae8-b2e9-74ec9bd446ff', 'a20cc7f9-cee4-434f-a99d-1cbb97637bed', '282d7811-acc0-41d1-83b9-618ef8f1ec84', 0, 0, '2026-03-08 04:20:50.312');

-- --------------------------------------------------------

--
-- Table structure for table `Lesson`
--

CREATE TABLE `Lesson` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `videoUrl` varchar(191) DEFAULT NULL,
  `materialUrl` varchar(191) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `moduleId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Lesson`
--

INSERT INTO `Lesson` (`id`, `title`, `description`, `videoUrl`, `materialUrl`, `order`, `moduleId`, `createdAt`) VALUES
('00503131-c17b-432b-91f7-0e688bafd5a2', 'Introduction to Cleanliness and Hygiene', 'Cleanliness and hygiene refer to the practices that individuals follow to maintain their bodies\nand environments in a clean and healthy condition. These practices include bathing, brushing\nte', '/uploads/videos/1772747891997-200998584.mp4', '/uploads/materials/1772746631953-905550263.pdf', 1, '98d8a5e3-2907-4334-926a-2d3dcd8b1f81', '2026-03-05 22:27:50.852'),
('055a6799-d5f6-40c6-a6bb-a58a463750c5', 'Dignity, Respect, Privacy, and Independence in Patient Care', 'An essential part of patient rights in healthcare is the protection of a patient’s dignity, respect,\nprivacy, and independence. These principles ensure that individuals receiving medical care', '/uploads/videos/1773191040854-89502627.mp4', '/uploads/materials/1773190933801-82608988.pdf', 1, '353d50bb-f507-47b8-825a-6332a694bb37', '2026-03-11 01:05:13.487'),
('07425d1d-6fdb-471c-bb12-d13c991927e1', ' Wheelchair to Bed Transfer and Bed to Stretcher Transfer', 'In healthcare settings, patients are often required to move between different types of equipment\nor surfaces depending on their medical needs. Two common procedures include transferring a\npat', '/uploads/videos/1773195877129-98020333.mp4', '/uploads/materials/1773195423645-40924050.pdf', 1, '8dab9dfd-4ffe-4003-8526-d1c4c10bb5d0', '2026-03-11 02:25:19.744'),
('0a0d962e-f97d-4ab5-908e-89b569cc7ed7', 'Assisting with Eyeglasses, Hearing Aids, and Finishing Up', 'Many patients and residents rely on assistive devices such as eyeglasses and hearing aids to\nhelp them see and hear clearly. These devices play an important role in maintaining\nindependence, ', '/uploads/videos/1773094762748-878299897.mp4', '/uploads/materials/1773094682416-875953953.pdf', 1, 'f6c7c9d7-a475-46f1-ac1c-50528d8dc48f', '2026-03-09 22:19:29.677'),
('0b42554d-d2aa-45de-b2d0-5e4a84ba7376', 'Common Signs of Approaching Death', 'As a person approaches the end of life, the body gradually begins to shut down. This process\ndoes not usually happen suddenly; instead, it occurs slowly as different body systems begin to\nwea', '/uploads/videos/1772856611973-790475296.mp4', '/uploads/materials/1772856017373-751868179.pdf', 1, '443354bd-7e0b-4e48-8c11-e364a6d3c137', '2026-03-07 04:11:05.790'),
('0f187775-ad9b-4d76-8ec3-b2c6dc8b7e5f', 'Respiratory Assessment — Measuring and Observing Respiration', 'Respiration is one of the most essential functions of the human body because it allows oxygen\nto enter the body and carbon dioxide to be removed. Oxygen is required by every cell in the\nbody ', '/uploads/videos/1773206718786-502191007.mp4', '/uploads/materials/1773205098741-669138781.pdf', 1, 'ce3e1bae-5145-440a-b205-6cd814288b64', '2026-03-11 05:28:17.134'),
('14f5f775-6c60-4c34-80f2-68d904e944ae', 'Temperature Measurement Procedures (Oral, Rectal, and Alternative Methods)', 'Measuring body temperature is one of the most common and important tasks performed in\nhealthcare settings. Body temperature reflects the balance between heat produced by the body\nand heat los', '/uploads/videos/1773202758659-704090265.mp4', '/uploads/materials/1773201101555-168221891.pdf', 1, 'f1a9fede-e6cd-4e34-b65b-c85aea81cce8', '2026-03-11 04:22:53.979'),
('171e9671-83d8-4b62-a2f9-332204c9cc6c', 'Assisting with Dressing and Hair Care', 'Assisting patients or residents with dressing is an important part of daily personal care in\nhealthcare settings. Dressing not only protects the body and keeps individuals comfortable, but\nit', '/uploads/videos/1773094412922-271676257.mp4', '/uploads/materials/1773093835302-526016366.pdf', 1, '92e1bc81-0f4b-46a3-b14d-42f39ccd73f1', '2026-03-09 22:13:45.673'),
('1a988f85-db1d-45bd-b872-919a345b35ed', 'What to Do When a Fall Occurs', 'Even with the best prevention strategies, falls can still happen. When a fall occurs, it is\nextremely important for caregivers and healthcare workers to respond quickly, calmly, and\ncorrectly', '/uploads/videos/1773063079782-718862807.mp4', '/uploads/materials/1773061448808-902290146.pdf', 1, 'c4336f10-87b8-418c-b171-fef85b5e9349', '2026-03-09 13:36:21.327'),
('1d902f9a-ad58-485e-810c-a1d066a1e311', 'Observation, Reporting, and Communication Barriers', 'When nursing assistants report information about residents, it is very important that the\ninformation is accurate, clear, and factual. Healthcare professionals depend on the information\nthey ', '/uploads/videos/1773008695132-117741216.mp4', '/uploads/materials/1773008130706-59286739.pdf', 1, '33f7ca16-6f13-4262-b506-9f43d5599877', '2026-03-08 22:30:34.283'),
('22bee86e-3462-4812-bffe-5b30cf5b5bc3', 'How to Assist with Bedpans', 'In some situations, residents are unable to get out of bed to use the bathroom. This may be due\nto weakness, paralysis, recent surgery, fall risk, fractures, severe illness, or medical restri', '/uploads/videos/1772645163182-656317642.mp4', '/uploads/materials/1772643880361-866847353.pdf', 1, 'd393580a-e299-4b99-9cea-bd746cfca6a4', '2026-03-04 17:28:44.763'),
('231271a2-da5d-465b-aad0-fac5eb0c0248', 'Who Must Comply with HIPAA, Key HIPAA Rules for CNAs, and Important Privacy Concepts', 'HIPAA compliance applies to a wide range of individuals and organizations within the healthcare\nindustry. Any person or organization that works with health information or has access to\nprotec', '/uploads/videos/1773092684074-43850959.mp4', '/uploads/materials/1773092089160-388536665.pdf', 1, 'ba936a33-6be6-4902-b86a-e1451f20db86', '2026-03-09 21:46:01.791'),
('26988642-a3a1-4946-abaf-3bffc184f42c', 'When Death Occurs and Postmortem Care', 'The moment when a resident dies is a very significant and sensitive time for both the family and\nthe healthcare team. Healthcare workers must approach this moment with professionalism,\ncompas', '/uploads/videos/1772858607404-905198194.mp4', '/uploads/materials/1772858245840-828646675.pdf', 1, 'ce9c1e28-29dc-4389-8a0d-250bb3f11f0c', '2026-03-07 04:43:42.417'),
('28035228-a4fc-4db5-97e4-866c6c48ae5c', 'Standard Precautions and Isolation Practices in Infection Contro', 'In healthcare environments, preventing the spread of infection is a critical responsibility shared\nby all members of the healthcare team. Patients in hospitals, clinics, and long-term care fa', '/uploads/videos/1773095743972-226381983.mp4', '/uploads/materials/1773095623210-297231824.pdf', 1, 'f55fb4c0-951d-4f34-9154-1f9d60d0d768', '2026-03-09 22:35:51.943'),
('2e16a3ba-da90-4c7d-a947-3f1e89ae5136', 'Foundations of Patient Rights and Participation in Healthcare', 'Patient rights are an essential part of modern healthcare. These rights protect individuals who\nare receiving medical services and ensure that they are treated with fairness, dignity, and\nres', '/uploads/videos/1773190850349-467901702.mp4', '/uploads/materials/1773190777568-32357107.pdf', 1, 'd3d65472-5109-43a5-b662-aab98e56bd39', '2026-03-11 01:00:57.625'),
('2e3bcd99-a061-4c8b-ac51-94ec051e0201', 'Caring for a Dying Person', 'Caring for a dying person is one of the most sensitive and meaningful responsibilities in\nhealthcare. When an individual is approaching the end of life, the primary goal of care shifts\nfrom c', '/uploads/videos/1772837876825-253524486.mp4', '/uploads/materials/1772837364835-179221637.pdf', 1, 'a28ffb03-d91b-4c43-b3bd-e971cebfd5c1', '2026-03-07 03:37:10.532'),
('3096606d-a3cc-498b-ae5c-624efb9e6b02', 'Mechanical Lift Transfers and Final Patient Care Procedures', 'In healthcare environments, some patients are unable to assist with transfers due to weakness,\nillness, paralysis, or extreme body weight. In these situations, caregivers must use special\nequ', '/uploads/videos/1773196426449-892292472.mp4', '/uploads/materials/1773196008779-244695685.pdf', 1, '487127d1-1c39-45d4-8ebf-a15920798c76', '2026-03-11 02:34:06.774'),
('39e6237b-fc40-423a-8727-a8b81d2a0933', ' Introduction to Dementia', 'Dementia is one of the most challenging and complex conditions faced in modern healthcare. It\nis a disorder that affects the brain and gradually interferes with a person’s ability to think,\nr', '/uploads/videos/1772893997960-47335848.mp4', '/uploads/materials/1772892552458-541522808.pdf', 1, '135249e5-a507-45db-8308-68d2947d4396', '2026-03-07 14:37:47.571'),
('3bb171c3-d303-4d0e-9a10-b86556058871', 'Special Diets and Therapeutic Nutrition Management', 'In healthcare settings, many residents cannot follow a regular diet due to medical conditions,\nrecovery from illness, or difficulty eating normally. For this reason, healthcare providers ofte', '/uploads/videos/1773097335990-562113527.mp4', '/uploads/materials/1773097181568-126541195.pdf', 1, '3f253274-52f7-457d-9caa-37833baafe66', '2026-03-09 23:11:59.069'),
('4055c5fa-35b9-49d0-81b2-fac2e80fb667', 'Safety Equipment in Fall Prevention: Wheel Locks, Transfer Belts, and Bed Rails', 'Preventing falls in healthcare environments requires not only awareness and supervision but\nalso the correct use of safety equipment. Many injuries occur not because equipment is\nunavailable,', '/uploads/videos/1773031356177-352098641.mp4', '/uploads/materials/1773031911617-489518144.pdf', 1, '57865094-872d-45c4-b456-7c863a756e79', '2026-03-09 04:51:55.537'),
('40ebab70-8fba-4298-abee-fb5b8ffaa7d0', 'Guidelines for Caring for a Dying Resident', 'Caring for a dying resident requires careful attention to both physical comfort and\nemotional well-being. During the final stages of life, a person’s body becomes weaker,\nand many normal body', '/uploads/videos/1772857228070-222698028.mp4', '/uploads/materials/1772856726231-525914615.pdf', 1, '6c68956d-535e-48d2-823f-1ee608b8afd1', '2026-03-07 04:20:35.130'),
('42883e76-4792-4243-9435-65db6fd874be', 'Fundamentals of Nutrition and Essential Nutrients', 'Nutrition is one of the most fundamental components of human health. Food and water are\nessential for life, growth, healing, and maintaining normal body functions. A balanced diet\nensures tha', '/uploads/videos/1773096011001-868501362.mp4', '/uploads/materials/1773095944850-622874608.pdf', 1, 'f41c976b-c55e-477b-9711-ee0ed0b0e175', '2026-03-09 22:40:40.324'),
('45da5c0f-3826-4ae3-aade-26d32dfff281', 'Ways to Treat the Dying Resident and Their Families with Dignity', 'Providing care for a dying resident involves more than managing physical symptoms. It also\nrequires maintaining the dignity, respect, and emotional well-being of both the resident and\ntheir f', '/uploads/videos/1772858133527-887987534.mp4', '/uploads/materials/1772858067653-87827503.pdf', 1, 'f8e93aa3-e15f-40db-996a-6be3273d6c34', '2026-03-07 04:35:39.223'),
('4dd5384a-9548-4eeb-91e7-1cfccc6514d0', 'Understanding and Monitoring Restraints', 'In healthcare environments, maintaining the safety of patients and residents sometimes requires\nthe use of special measures. One of these measures is the use of restraints. Restraints are\nuse', '/uploads/videos/1773188040328-237974380.mp4', '/uploads/materials/1773187951059-880111794.pdf', 1, '850c6cf1-38c8-4cc2-8b1e-40a3a550dbff', '2026-03-11 00:14:17.743'),
('4f686346-cb91-49b5-a69b-8cd417977dd0', 'Signs That Stress Is Not Being Managed Properly', 'Stress is a normal part of life, but problems begin to occur when it is not managed effectively.\nWhen stress builds up over time and individuals do not have healthy ways to cope with it, it c', '/uploads/videos/1773016958217-188622337.mp4', '/uploads/materials/1773016318905-565168988.pdf', 1, '50f5ea9c-6398-4813-ab46-de68d782b0f8', '2026-03-09 00:43:34.260'),
('52c8bbe7-6a84-4537-9e5d-cbd34089dca3', 'HIPAA Course Outline, Course Outcomes, Introduction, and Overview of HIPAA', 'The Health Insurance Portability and Accountability Act, commonly known as HIPAA, plays a\ncrucial role in protecting the privacy and confidentiality of patient information in the healthcare\ne', '/uploads/videos/1773092001053-915935526.mp4', '/uploads/materials/1773088727495-613417066.pdf', 1, 'c998d439-9793-4fb7-8605-412e9f0fed87', '2026-03-09 21:33:37.898'),
('55dc943d-45d1-4ca5-aa77-f3eb150764c8', '4 Medical Asepsis and Barrier Methods', 'Infection control in healthcare settings relies heavily on practical daily actions that prevent\nharmful microorganisms from spreading. Two of the most important components of these\npractices ', '/uploads/videos/1773095538880-763893065.mp4', '/uploads/materials/1773095440573-805323476.pdf', 1, '2de141e8-3eb5-4170-943c-5f4c0c756052', '2026-03-09 22:32:28.434'),
('5d84d746-1c92-4468-838e-b8002e21170c', 'Guidelines: Legal and Ethical Behavior', 'Legal and ethical behavior is one of the most important foundations of professional healthcare\npractice. Healthcare workers are trusted with the responsibility of caring for vulnerable\nindivi', '/uploads/videos/1773085211995-758089675.mp4', '/uploads/materials/1773083561609-524409225.pdf', 1, '7637e3b4-48d5-4cb0-875a-403046c80101', '2026-03-09 19:46:07.315'),
('5ebddc9a-8bb7-4988-a7b0-1079b6e0c8ad', 'How to Assist a Man with a Urinal', 'Male residents commonly use a urinal to void urine when they are unable to walk safely to the bathroombathroombathroom', '/uploads/videos/1772646740929-593577113.mp4', '/uploads/materials/1772645501556-528436297.pdf', 1, 'd375d014-f177-4d5f-a7d9-d5dda2bfefd3', '2026-03-04 17:53:59.554'),
('5f6b770e-e05c-4b66-8b79-89a6a8865096', 'Common Confidentiality Violations, Patient Privacy Rights, and Protection of Confidential Information', 'Protecting patient confidentiality is one of the most important responsibilities of healthcare\nprofessionals. While HIPAA establishes rules designed to safeguard protected health\ninformation,', '/uploads/videos/1773092963337-716784511.mp4', '/uploads/materials/1773092824901-953557206.pdf', 1, '059b0db7-89b0-489f-9ca7-f45aea3f5111', '2026-03-09 21:50:42.330'),
('603856ee-6d06-4ba1-a57e-2ef85575d662', 'Fall Prevention – Introduction, Facts, and Learning Objectives', 'Falls are one of the most common and serious safety problems affecting older adults today. In\nhealthcare facilities such as nursing homes, assisted living centers, and hospitals, falls\nrepres', '/uploads/videos/1773018018529-795699595.mp4', '/uploads/materials/1773017136671-28371293.pdf', 1, '334b66ea-a837-4b38-83b0-b30352d79bef', '2026-03-09 01:01:37.664'),
('60d03036-6cd9-480f-9329-da44e47f1492', 'Body Mechanics and Patient Assessment Before Transfer', 'When assisting patients or residents with movement, healthcare workers must understand two\ncritical concepts: body mechanics and patient assessment. These principles ensure that\ntransfers are', '/uploads/videos/1773194427403-952813217.mp4', '/uploads/materials/1773194004349-34090031.pdf', 1, '9d209b3a-05a8-4d7a-a01c-6989bcfc05d1', '2026-03-11 02:00:44.216'),
('70046091-09a7-4c4e-8c8e-e35e6ee94ede', 'Providing Oral Care', 'Oral care involves cleaning the mouth, teeth, gums, and tongue. Maintaining oral hygiene is\nessential because the mouth contains many bacteria that can cause infections if not properly\ncontro', '/uploads/videos/1772753800590-389452765.mp4', '/uploads/materials/1772750243817-946823022.pdf', 1, '83a6b5d8-ab92-4e11-b46c-fc2f53972a03', '2026-03-05 23:40:28.940'),
('7053598f-78af-4493-b7fc-6d05229f1955', 'Abuse', 'Abuse is a serious issue in healthcare settings, especially when caring for vulnerable individuals\nsuch as older adults, children, or people with disabilities. Healthcare professionals have a', '/uploads/videos/1773083453065-343947620.mp4', '/uploads/materials/1773081972382-695831120.pdf', 1, 'bfc7d58e-4db7-4be9-b621-02792ad08455', '2026-03-09 19:11:38.321'),
('771b2c60-f601-482a-b0c7-da5abd7f21a5', 'Fire Prevention and Fire Emergency Response', 'Fire emergencies are among the most dangerous situations that can occur in healthcare\nfacilities. Hospitals, nursing homes, and long-term care centers often house individuals who\nmay be ill, ', '/uploads/videos/1773190149701-179494080.mp4', '/uploads/materials/1773189729267-531190613.pdf', 1, '23a25346-7840-4c28-8b74-05372bb0bf05', '2026-03-11 00:50:32.124'),
('7745e6aa-5050-48d5-87e5-9705deb0a9a4', 'Cardiovascular Vital Signs — Pulse and Blood Pressure', 'Monitoring the cardiovascular system is a major part of assessing a patient’s health. Two of the\nmost important vital signs used to evaluate the cardiovascular system are pulse rate and blood', '/uploads/videos/1773204370678-329199347.mp4', '/uploads/materials/1773203036272-823229111.pdf', 1, '66fc8894-c649-48b0-addd-b05a30d74f32', '2026-03-11 04:47:34.986'),
('7bd38329-a174-4683-95c5-b189796e6f2c', 'Medical Emergencies, Accident Response, and Final Safety Procedures', 'Healthcare environments are designed to promote healing and recovery, but emergencies can\noccur at any time. Patients and residents in hospitals or long-term care facilities often have\nmedica', '/uploads/videos/1773190587220-540178560.mp4', '/uploads/materials/1773190476127-593535027.pdf', 1, '673b7145-6961-4517-aec7-0396a83793ff', '2026-03-11 00:57:23.314'),
('83387642-6775-48db-a775-10fc11c73fd9', 'Applying Physical Restraints Safely', 'In healthcare settings, physical restraints are sometimes required to protect patients or\nresidents from harming themselves or others. While the use of restraints is carefully regulated\nand s', '/uploads/videos/1773188610506-707872800.mp4', '/uploads/materials/1773188126972-901001362.pdf', 1, 'dd424ba2-6adf-4233-8e98-e2aeff3256c7', '2026-03-11 00:41:21.380'),
('86b92e9f-356f-4d7c-8f14-e34b3d7e4b65', 'Foundations of Communication', 'Communication is the process of exchanging information with other people. It involves both\nsending and receiving messages between individuals. Communication allows people to share\nideas, feel', '/uploads/videos/1773004535320-83543348.mp4', '/uploads/materials/1773002700572-546475341.pdf', 1, '7275823f-d2b8-4d2c-a421-4dd58d9664bd', '2026-03-08 21:16:40.267'),
('8790d34c-a217-4eee-9fa6-49ae79be415c', 'Common Behaviors in People with Dementia', 'People who are living with dementia often display behaviors that may seem unusual, confusing,\nor difficult for caregivers to understand. These behaviors are not intentional. They occur\nbecaus', '/uploads/videos/1772898853927-881821060.mp4', '/uploads/materials/1772897244366-429966837.pdf', 1, '6384f5ee-383d-4142-81e9-67c72ebfd9fa', '2026-03-07 15:54:59.539'),
('8b8c362f-1945-4c75-a415-9c0c46a51f67', 'Common Patient Positions and Their Purposes', 'In healthcare settings, patients are often placed in specific positions to improve comfort, support\ntreatment, and prevent complications. Proper positioning helps maintain body alignment, red', '/uploads/videos/1773192935652-13435620.mp4', '/uploads/materials/1773192471424-43040031.pdf', 1, 'a8566fff-f24d-4633-b797-93e63ff3afd8', '2026-03-11 01:35:40.862'),
('8ce87e09-1978-41fc-8083-2a06affccdf9', 'Introduction, Patient Empathy, and Preparation Before Positioning Patients', 'Positioning and lifting patients is an essential responsibility for nursing assistants and other\nhealthcare workers. Many patients are unable to move or change their positions on their own\nbe', '/uploads/videos/1773191979546-227411940.mp4', '/uploads/materials/1773191538605-987089742.pdf', 1, 'f9c54910-0f2e-47ef-b59f-810a02f7f026', '2026-03-11 01:20:53.893'),
('8d00323e-e04c-430d-b538-ad5e4697b272', 'Foundations of Patient and Resident Safety', 'One of the most important duties of a nursing assistant is to protect patients and residents from\nhazards that exist within healthcare settings. These hazards may include physical dangers suc', '/uploads/videos/1773187903988-81520295.mp4', '/uploads/materials/1773187834755-140042113.pdf', 1, 'bd8b1d08-9b94-4f14-813c-a13f62ca0b88', '2026-03-11 00:11:48.843'),
('8e1a7602-7e2e-45f5-8f9f-64d23314c002', 'Guidelines for Stress Management', 'Stress is a natural part of life, but learning how to manage it effectively is essential for\nmaintaining both mental and physical well-being. Stress management refers to the techniques,\nhabit', '/uploads/videos/1773016239730-466422184.mp4', '/uploads/materials/1773013911208-27732612.pdf', 1, 'fa5e83ed-a18d-4ebf-984b-7e92ef772fa1', '2026-03-09 00:31:01.560'),
('9518afad-8468-45a5-b8c9-1af200bcf995', 'Measuring Height and Weight and Their Importance in Patient Care', 'Height and weight are important physical measurements used in healthcare to assess a\nperson’s overall health status. These measurements are not technically classified as vital signs\nlike temp', '/uploads/videos/1773209031066-427999907.mp4', '/uploads/materials/1773207689249-574766419.pdf', 1, 'b1827ce0-2a79-4327-9afe-dd9e9a59b2d5', '2026-03-11 07:13:58.923'),
('9a60b3d9-1ff4-4741-9f9f-c9a5a116c50f', 'Introduction and Course Overview', 'Introduction to the course and topics covered', '/uploads/videos/1772641541698-171440296.mp4', '/uploads/materials/1772642014639-287211184.pdf', 1, '20fb960e-559a-4333-a554-63091b7ecc4a', '2026-03-04 16:33:50.349'),
('9be485e6-44fb-4046-8676-bf0af4cd9d24', 'How to Care for a Person with an Indwelling Urinary Catheter', 'Some residents are unable to urinate using a toilet, bedpan, or urinal. In these situations, a\nurinary catheter may be inserted. An indwelling urinary catheter is a tube that is inserted into', '/uploads/videos/1772657028313-782122895.mp4', '/uploads/materials/1772647072712-428247868.pdf', 1, '970d32a7-39ef-4ba9-9408-7f5cc185cf98', '2026-03-04 20:47:27.324'),
('9d4e5acd-c665-4902-b978-c2cb98a9d4a0', ' Foundations of Vital Signs and Temperature Measurement Basics', 'Understanding vital signs is one of the most fundamental responsibilities in healthcare. These\nmeasurements provide essential information about how well a person’s body is functioning.\nBecaus', '/uploads/videos/1773197053456-136326219.mp4', '/uploads/materials/1773196619189-940797825.pdf', 1, 'b4534cc4-8ae7-4af4-bf62-dcee222643cd', '2026-03-11 02:44:21.243'),
('9eab65ce-5e97-4a27-8dc1-b86d8f8cca76', 'Communication in Special and Challenging Situation', 'Effective communication requires more than simply speaking and listening. It also involves\nbeing aware of how messages are expressed through tone, body language, and emotional\nresponses. Ther', '/uploads/videos/1773013077830-121802491.mp4', '/uploads/materials/1773009118946-382151537.pdf', 1, '2dc3e292-7a09-4fd1-9742-af8b73a0e2ca', '2026-03-08 23:38:54.537'),
('a8516464-1694-4d0f-b52a-40dff701ade0', 'Fluid Balance, Hydration, and Intake and Output Monitoring', 'Maintaining proper fluid balance is one of the most important aspects of human health. Water\nplays a critical role in almost every physiological process in the body. It supports digestion,\nre', '/uploads/videos/1773098963074-452631811.mp4', '/uploads/materials/1773098843185-495433527.pdf', 1, '80a5ac13-fcea-4061-9531-10573c7bf068', '2026-03-09 23:29:28.364'),
('a8cfe2ba-cf35-4e82-ba2c-145f1a379d87', ' Meal Assistance, Feeding Practices, and Monitoring Nutritional Status', 'Providing food to residents is not simply a routine task; it is a crucial part of healthcare that\ndirectly affects a person’s physical health, emotional well-being, and dignity. Many individu', '/uploads/videos/1773099355893-555760123.mp4', '/uploads/materials/1773099285518-176695243.pdf', 1, 'a14aec7b-2974-422a-b414-e8722c909688', '2026-03-09 23:36:41.985'),
('a9c70f83-67d3-4236-afab-9b31b58ecc4a', 'Body Mechanics and Safety Principles for Lifting Patients', 'Assisting patients with movement and repositioning is a common responsibility for healthcare\nworkers. While helping patients move is essential for their comfort and health, it can also be\nphy', '/uploads/videos/1773192411643-176307090.mp4', '/uploads/materials/1773192302958-830352820.pdf', 1, '49e1b0c3-426e-4451-9dc2-3e51d24d056e', '2026-03-11 01:26:55.745'),
('ae4b1038-18b9-4e86-a956-9a342ed33bd8', 'Stages of Death', 'Death is a natural part of the human life cycle, yet it remains one of the most emotionally\ncomplex experiences for individuals and their families. Some deaths occur suddenly, such as\nthose r', '/uploads/videos/1772837279205-894782570.mp4', '/uploads/materials/1772837058525-776641947.pdf', 1, 'e0a361ac-5ba2-4d54-a224-17fc26e51ffa', '2026-03-06 22:48:12.851'),
('b1e002d9-eec9-4406-8e12-780a615678dc', 'The Chain of Infection, Why Infections Spread Easily, and Microbes & Communicable Infections', 'Understanding infection control requires more than simply knowing that germs exist. Healthcare\nworkers must understand how infections actually spread. One of the most important concepts\nin in', '/uploads/videos/1773095170516-153232726.mp4', '/uploads/materials/1773095078701-367171348.pdf', 1, '11a970c3-1dfa-47c1-9598-447b5f6eb2b4', '2026-03-09 22:26:18.598'),
('b2db4f6d-8ef2-4c04-9392-f0139178abf2', 'Introduction to Grooming and Getting Ready', 'One of the most important reasons grooming is necessary is that it helps maintain physical\nhealth. Proper grooming removes dirt, sweat, oils, and microorganisms from the body. When\nmicrobes a', '/uploads/videos/1773093755824-386786158.mp4', '/uploads/materials/1773093152813-591017822.pdf', 1, '9ba7eb7d-439f-44df-8483-26389ff291bc', '2026-03-09 22:02:45.327'),
('b773ea42-39b7-41dc-bc58-676c8d383ece', ' How to Care for a Person with Dementia', 'Caring for a person with dementia requires patience, compassion, and a clear understanding of\nhow the disease affects the individual. As dementia progresses, people gradually lose the ability', '/uploads/videos/1772902470565-552939628.mp4', '/uploads/materials/1772901181812-915106283.pdf', 1, '987fbb1f-6ee6-4e55-bb76-8c31ee3822db', '2026-03-07 18:14:43.153'),
('b86af85f-92f4-4356-b4ad-8d63b98a5b0d', 'Introduction and Legal Aspect of Ethics', 'Ethics and legal responsibilities are extremely important in healthcare. Every healthcare\nprofessional must understand the difference between right and wrong, and they must always act\nin a wa', '/uploads/videos/1773071729558-659199653.mp4', '/uploads/materials/1773069927263-398683148.pdf', 2, '6d0f7453-5889-4f5d-a803-e5d79d43f8aa', '2026-03-09 16:03:57.234'),
('b9c359e6-3789-48b5-8f21-6d43d43dcbfc', 'Introduction to Infection Control and Its Purpose', 'Infection control is one of the most important responsibilities in healthcare. Every healthcare\nworker, whether a nurse, doctor, nursing assistant, or home health aide, plays a role in\npreven', '/uploads/videos/1773095001272-246322899.mp4', '/uploads/materials/1773094890856-888299690.pdf', 1, '564e3025-fd52-46ae-ab72-54978456c784', '2026-03-09 22:23:28.685'),
('bff87b16-ff23-48d4-9acb-49dc9430aa26', 'Preparation', 'Preparation is the foundation of safe and professional elimination care. Before assisting a\nresident with any urinary or bowel procedure, proper preparation ensures safety, infection\ncontrol,', '/uploads/videos/1772643553206-405164145.mp4', '/uploads/materials/1772643702665-101079382.pdf', 1, '84861509-9f2d-473d-9f09-e672c7359939', '2026-03-04 17:01:48.113'),
('c2d7eda1-a8f0-4d4d-a17a-006e12eae622', 'How to Measure Urine Output, Incontinence, and Ostomy Care', 'In many facilities, urine drainage bags are routinely emptied and the urine measured at the end\nof each shift, unless ordered otherwise. The urine drainage bag should also be emptied\nwhenever', '/uploads/videos/1772658619547-427035567.mp4', '/uploads/materials/1772657363148-361865704.pdf', 1, 'f6e0799a-6a64-45ff-ae17-75f9fc2070fa', '2026-03-04 21:13:39.070'),
('c392da45-7434-46c9-914e-0744404bdf1d', 'Providing Perineal Care', 'Perineal care involves cleaning the genital and anal areas of the body. These areas are\nsensitive and require careful hygiene because bacteria can easily grow in warm and moist\nenvironments.\n', '/uploads/videos/1772757150598-798513825.mp4', '/uploads/materials/1772754764065-23455306.pdf', 1, '48817eec-fa72-4e0b-b449-36cc4914ec8f', '2026-03-06 00:33:26.777'),
('c3bd3f9d-e690-4f71-91d2-257525a7272c', 'Proper Communication and Resident Interaction', 'Proper communication is an essential part of providing quality care and building respectful\nrelationships with residents. Communication should always be professional, respectful, and\nfocused ', '/uploads/videos/1773008001414-976039981.mp4', '/uploads/materials/1773007394146-756792860.pdf', 1, 'e0490c38-d3a1-4ef5-92ab-3faf1042bc60', '2026-03-08 22:14:00.715'),
('c74ee923-bee4-4694-8854-fe4436f79954', 'Giving a Shower or Tub Bath', 'Bathing is an essential part of personal hygiene. It helps remove sweat, dirt, bacteria, and dead\nskin cells that accumulate on the body throughout the day. Regular bathing helps maintain\nhea', '/uploads/videos/1772754546407-748620656.mp4', '/uploads/materials/1772754067465-894464341.pdf', 1, '3f9e9498-a79b-4802-aae5-2ad6ebe25cc0', '2026-03-05 23:51:30.495'),
('cd27ca8b-e0f2-4022-8067-79a2b269a8df', 'Foundations of Patient Transfer and Safety Principles', 'Transferring patients and residents is one of the most important skills required of nursing\nassistants and healthcare aides. The process involves moving a patient safely from one location\nto ', '/uploads/videos/1773193828674-408806433.mp4', '/uploads/materials/1773193718598-169217067.pdf', 1, '64876c96-c996-40e3-8666-24781a33b5f0', '2026-03-11 01:51:20.434'),
('ce9a88c7-249a-457f-8c4a-0977db2ddf3e', 'Breaking the Chain of Infection and Basic Practices of Infection Control', 'In healthcare, understanding how infections spread is only the first step. The real goal of\ninfection control is to stop infections from spreading in the first place. This is done by\ninterrup', '/uploads/videos/1773095368125-454842461.mp4', '/uploads/materials/1773095254721-288585210.pdf', 1, '361825f0-e983-4f70-9532-c2919448dff3', '2026-03-09 22:29:35.248'),
('dad54d74-d0d4-47af-a610-be77f5d183ef', 'Medical Information, Refusing Treatment, Use of Restraints, and Practical Applications', 'Another critical aspect of patient rights focuses on access to medical information, the ability to\nrefuse treatment, and the safe and ethical use of restraints. These rights ensure that patie', '/uploads/videos/1773191248674-345113756.mp4', '/uploads/materials/1773191186525-297998346.pdf', 1, '55644d60-9d40-4dd3-bf7a-3bd69238f24b', '2026-03-11 01:10:27.700'),
('dc338afc-b621-4b21-b0b0-e148faa4d625', 'Bed to Wheelchair Transfer Procedure', 'One of the most common transfers performed in healthcare settings is moving a patient from a\nbed to a wheelchair. This transfer allows patients to leave the bed for activities such as meals,\n', '/uploads/videos/1773195317032-214769502.mp4', '/uploads/materials/1773194515178-923840057.pdf', 1, '6f2d91ac-c6e3-493e-91a5-c9bc48cca53d', '2026-03-11 02:15:44.060'),
('dd08b7a9-918c-4c3d-ab6d-c935ab456e2e', ' Stages of Dementia', 'Dementia is a progressive condition, which means that the symptoms gradually worsen over\ntime. Although the rate of progression varies from person to person, dementia generally follows\na patt', '/uploads/videos/1772896038022-89738408.mp4', '/uploads/materials/1772894356397-221392643.pdf', 1, 'b010875c-0bb2-4816-8b53-f366f77cde84', '2026-03-07 15:25:58.287'),
('deafe302-2c7f-463f-909d-d0ca7ef4a5ed', ' Introduction to Stress', 'Stress is a common part of everyday life and affects every individual at different times. In simple\nterms, stress is the state of being frightened, excited, confused, in danger, or irritated.', '/uploads/videos/1773013811949-557371271.mp4', '/uploads/materials/1773013301895-544732274.pdf', 1, 'd742136f-f25e-40d6-bf31-cee27af16e61', '2026-03-08 23:50:51.670'),
('def6b9fd-1ec0-4291-b22f-2fc4bb523873', 'Assisting Patients With Repositioning and Turning in Bed', 'Helping patients move and change positions in bed is one of the most common responsibilities\nin patient care. Many patients are unable to move independently because of illness, weakness,\ninju', '/uploads/videos/1773193417441-137965625.mp4', '/uploads/materials/1773192997261-673728304.pdf', 1, 'dce842e3-cc0b-4a8b-a42b-7abd2ca1182f', '2026-03-11 01:45:14.368'),
('e361c57e-a433-4cb1-8d67-360117427f24', 'Finishing Up Steps', 'When completing a procedure, always follow a routine to ensure the resident’s safety and\ncomfort. Start by confirming that the person is comfortable and properly aligned in bed or in a\nchair.', '/uploads/videos/1772659620963-613832303.mp4', '/uploads/materials/1772658904076-377731480.pdf', 1, '5d23201e-b891-4350-b2f8-d6923cf7382e', '2026-03-04 21:29:14.538'),
('e7ca7053-00e1-473e-a579-f79d26fefbb4', 'Factors That Cause Falls and Guidelines for Prevention', 'Understanding why falls occur is one of the most important steps in preventing them. Falls rarely\nhappen because of a single cause. Instead, they usually occur because several risk factors\nco', '/uploads/videos/1773024174161-123266377.mp4', '/uploads/materials/1773018216120-179376094.pdf', 1, 'dd515ef4-7b61-4d86-942d-b5f55e7023e8', '2026-03-09 03:42:03.296'),
('eb75b3c8-7af8-44b7-be36-f11cb68847b3', 'How to Manage Difficult Behaviors', 'Managing difficult behaviors in people with dementia is one of the most important\nresponsibilities for caregivers and healthcare workers. As dementia progresses, individuals\noften lose the ab', '/uploads/videos/1772900548355-686375249.mp4', '/uploads/materials/1772898966033-649637047.pdf', 1, 'e7b21bc9-22e5-4a6c-a3a5-d7285d0eb668', '2026-03-07 16:31:46.049'),
('f613f76c-7455-4c53-9744-c6b306d6d3de', ' Factors Affecting Nutrition and Dietary Planning', 'Nutrition is influenced by many biological, social, psychological, and environmental factors.\nWhile the human body requires a consistent intake of nutrients to maintain health, individuals do', '/uploads/videos/1773097002670-947500078.mp4', '/uploads/materials/1773096827701-563556530.pdf', 1, 'b83cc9b9-9c3e-4fcc-897d-b9ca19eade92', '2026-03-09 22:58:31.400'),
('f8b15b63-0134-4c61-932a-354397aa07bc', 'Complications of Immobility', 'When patients are unable to move or change their position for long periods of time, their bodies\ncan begin to develop serious health problems. This condition is known as immobility, and it ca', '/uploads/videos/1773192223737-910318569.mp4', '/uploads/materials/1773192111433-445759857.pdf', 1, 'b70c82dd-8e94-44d1-b378-d7793332c63f', '2026-03-11 01:23:47.811'),
('fba0dce4-f0dc-45a8-b6d9-f840e398a574', 'Shaving a Man’s Face and Assisting with Care of Hands and Feet', 'Shaving is an important part of personal grooming for many male patients and residents.\nMaintaining facial hair hygiene helps individuals feel clean, comfortable, and confident in their\nappea', '/uploads/videos/1773094577771-539658420.mp4', '/uploads/materials/1773094496684-247883199.pdf', 1, '7411912f-8c6e-4107-aac6-ca37f8188381', '2026-03-09 22:16:40.414'),
('fd86ff0e-2a89-4efa-9573-9a850764a42f', ' Legal Rights and Preferences of a Terminally Ill Resident', 'When a person is approaching the end of life, healthcare providers must not only focus on\nphysical care and comfort but also respect the legal rights and personal wishes of the patient.\nTermi', '/uploads/videos/1772857931745-627999450.mp4', '/uploads/materials/1772857447408-781686983.pdf', 1, '07625501-751b-4f5f-b068-8d9f10e84c37', '2026-03-07 04:33:15.942');

-- --------------------------------------------------------

--
-- Table structure for table `Module`
--

CREATE TABLE `Module` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `courseId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Module`
--

INSERT INTO `Module` (`id`, `title`, `order`, `courseId`, `createdAt`) VALUES
('059b0db7-89b0-489f-9ca7-f45aea3f5111', 'Common Confidentiality Violations, Patient Privacy Rights, and Protection of Confidential Information', 3, '5c51f7a6-61f9-4548-9b75-0757d1b47310', '2026-03-09 21:46:19.691'),
('07625501-751b-4f5f-b068-8d9f10e84c37', 'Legal Rights and Preferences of a Terminally Ill Resident', 5, '282d7811-acc0-41d1-83b9-618ef8f1ec84', '2026-03-07 04:21:04.813'),
('11a970c3-1dfa-47c1-9598-447b5f6eb2b4', 'The Chain of Infection, Why Infections Spread Easily, and Microbes & Communicable Infections', 2, 'f3ba9ddd-1dcc-4b8c-aa03-911a56f54d5f', '2026-03-09 22:23:50.147'),
('135249e5-a507-45db-8308-68d2947d4396', ' Introduction to Dementia', 1, '08542fed-5841-4427-a02e-31c0d70c8b69', '2026-03-07 14:08:24.478'),
('20fb960e-559a-4333-a554-63091b7ecc4a', 'Introduction and Course Overview', 1, '2aae581c-7c9a-4651-aca0-c018e06d4f7c', '2026-03-04 16:02:32.804'),
('23a25346-7840-4c28-8b74-05372bb0bf05', 'Fire Prevention and Fire Emergency Response', 4, 'ab0ea238-38bd-4336-b5a0-9a9412d11871', '2026-03-11 00:41:37.618'),
('2dc3e292-7a09-4fd1-9742-af8b73a0e2ca', 'Communication in Special and Challenging Situation', 4, 'c6ef29bf-f6b2-4680-be75-18a1820f250e', '2026-03-08 22:31:18.631'),
('2de141e8-3eb5-4170-943c-5f4c0c756052', 'Medical Asepsis and Barrier Methods', 4, 'f3ba9ddd-1dcc-4b8c-aa03-911a56f54d5f', '2026-03-09 22:30:03.279'),
('334b66ea-a837-4b38-83b0-b30352d79bef', 'Fall Prevention – Introduction, Facts, and Learning Objectives', 1, '48bd5617-9cb9-4bc8-9c50-37282f52dc6f', '2026-03-09 00:44:57.952'),
('33f7ca16-6f13-4262-b506-9f43d5599877', 'Observation, Reporting, and Communication Barriers', 3, 'c6ef29bf-f6b2-4680-be75-18a1820f250e', '2026-03-08 22:14:57.701'),
('353d50bb-f507-47b8-825a-6332a694bb37', 'Dignity, Respect, Privacy, and Independence in Patient Care', 2, '21b5d3ef-1ff3-45bb-bcc1-819687d95630', '2026-03-11 01:01:31.553'),
('361825f0-e983-4f70-9532-c2919448dff3', 'Breaking the Chain of Infection and Basic Practices of Infection Control', 3, 'f3ba9ddd-1dcc-4b8c-aa03-911a56f54d5f', '2026-03-09 22:26:47.406'),
('3f253274-52f7-457d-9caa-37833baafe66', 'Special Diets and Therapeutic Nutrition Management', 3, 'd0f9e929-a01a-42d0-9614-2c26a3f87a4a', '2026-03-09 22:58:56.191'),
('3f9e9498-a79b-4802-aae5-2ad6ebe25cc0', 'Giving a Shower or Tub Bath', 3, '5213706d-b5e2-4dfa-97e2-7e0502a5a389', '2026-03-05 23:12:22.398'),
('443354bd-7e0b-4e48-8c11-e364a6d3c137', 'Common Signs of Approaching Death', 3, '282d7811-acc0-41d1-83b9-618ef8f1ec84', '2026-03-07 03:59:38.060'),
('487127d1-1c39-45d4-8ebf-a15920798c76', 'Mechanical Lift Transfers and Final Patient Care Procedures', 5, '01bf1bc7-a1c4-4b74-add8-9a10fa9beac0', '2026-03-11 02:26:05.734'),
('48817eec-fa72-4e0b-b449-36cc4914ec8f', 'Providing Perineal Care', 4, '5213706d-b5e2-4dfa-97e2-7e0502a5a389', '2026-03-05 23:52:02.016'),
('49e1b0c3-426e-4451-9dc2-3e51d24d056e', 'Body Mechanics and Safety Principles for Lifting Patients', 3, 'c08a4681-1b46-413d-ad58-fabf4d7b78cd', '2026-03-11 01:24:13.175'),
('50f5ea9c-6398-4813-ab46-de68d782b0f8', 'Signs That Stress Is Not Being Managed Properly', 3, '1995a2fa-7ab2-4474-b2e3-e754efaac7ed', '2026-03-09 00:31:24.225'),
('55644d60-9d40-4dd3-bf7a-3bd69238f24b', 'Medical Information, Refusing Treatment, Use of Restraints, and Practical Applications', 3, '21b5d3ef-1ff3-45bb-bcc1-819687d95630', '2026-03-11 01:05:38.879'),
('564e3025-fd52-46ae-ab72-54978456c784', 'Introduction to Infection Control and Its Purpose', 1, 'f3ba9ddd-1dcc-4b8c-aa03-911a56f54d5f', '2026-03-09 22:20:54.770'),
('57865094-872d-45c4-b456-7c863a756e79', 'Safety Equipment in Fall Prevention: Wheel Locks, Transfer Belts, and Bed Rails', 3, '48bd5617-9cb9-4bc8-9c50-37282f52dc6f', '2026-03-09 04:00:44.089'),
('5d23201e-b891-4350-b2f8-d6923cf7382e', 'Summary', 7, '2aae581c-7c9a-4651-aca0-c018e06d4f7c', '2026-03-04 21:14:05.666'),
('6384f5ee-383d-4142-81e9-67c72ebfd9fa', 'Common Behaviors in People with Dementia', 3, '08542fed-5841-4427-a02e-31c0d70c8b69', '2026-03-07 15:26:52.727'),
('64876c96-c996-40e3-8666-24781a33b5f0', 'Foundations of Patient Transfer and Safety Principles', 1, '01bf1bc7-a1c4-4b74-add8-9a10fa9beac0', '2026-03-11 01:46:38.583'),
('66fc8894-c649-48b0-addd-b05a30d74f32', 'Cardiovascular Vital Signs — Pulse and Blood Pressure', 3, '8e8444d6-b7d7-4dc7-b296-148477d1fae0', '2026-03-11 04:23:19.182'),
('673b7145-6961-4517-aec7-0396a83793ff', 'Medical Emergencies, Accident Response, and Final Safety Procedures', 5, 'ab0ea238-38bd-4336-b5a0-9a9412d11871', '2026-03-11 00:53:55.254'),
('6c68956d-535e-48d2-823f-1ee608b8afd1', 'Guidelines for Caring for a Dying Resident', 4, '282d7811-acc0-41d1-83b9-618ef8f1ec84', '2026-03-07 04:11:29.611'),
('6d0f7453-5889-4f5d-a803-e5d79d43f8aa', 'Introduction and Legal Aspect of Ethics', 1, '3a6f0a97-2ecc-40e5-9754-85ed7573a83b', '2026-03-09 13:38:39.505'),
('6f2d91ac-c6e3-493e-91a5-c9bc48cca53d', 'Bed to Wheelchair Transfer Procedure', 3, '01bf1bc7-a1c4-4b74-add8-9a10fa9beac0', '2026-03-11 02:01:08.860'),
('7275823f-d2b8-4d2c-a421-4dd58d9664bd', 'Foundations of Communication', 1, 'c6ef29bf-f6b2-4680-be75-18a1820f250e', '2026-03-08 20:44:18.662'),
('7411912f-8c6e-4107-aac6-ca37f8188381', 'Shaving a Man’s Face and Assisting with Care of Hands and Feet', 3, '73dbf1bd-2299-4b32-8768-3c001e8a6c32', '2026-03-09 22:14:12.837'),
('7637e3b4-48d5-4cb0-875a-403046c80101', 'Guidelines: Legal and Ethical Behavior', 3, '3a6f0a97-2ecc-40e5-9754-85ed7573a83b', '2026-03-09 19:12:05.154'),
('80a5ac13-fcea-4061-9531-10573c7bf068', 'Fluid Balance, Hydration, and Intake and Output Monitoring', 4, 'd0f9e929-a01a-42d0-9614-2c26a3f87a4a', '2026-03-09 23:26:56.329'),
('83a6b5d8-ab92-4e11-b46c-fc2f53972a03', 'Providing Oral Care', 2, '5213706d-b5e2-4dfa-97e2-7e0502a5a389', '2026-03-05 22:36:36.198'),
('84861509-9f2d-473d-9f09-e672c7359939', 'Preparation', 2, '2aae581c-7c9a-4651-aca0-c018e06d4f7c', '2026-03-04 16:35:08.360'),
('850c6cf1-38c8-4cc2-8b1e-40a3a550dbff', 'Understanding and Monitoring Restraints', 2, 'ab0ea238-38bd-4336-b5a0-9a9412d11871', '2026-03-11 00:11:58.446'),
('8dab9dfd-4ffe-4003-8526-d1c4c10bb5d0', ' Wheelchair to Bed Transfer and Bed to Stretcher Transfer', 4, '01bf1bc7-a1c4-4b74-add8-9a10fa9beac0', '2026-03-11 02:16:23.830'),
('92e1bc81-0f4b-46a3-b14d-42f39ccd73f1', 'Assisting with Dressing and Hair Care', 3, '73dbf1bd-2299-4b32-8768-3c001e8a6c32', '2026-03-09 22:03:08.417'),
('970d32a7-39ef-4ba9-9408-7f5cc185cf98', 'How to Care for a Person with an Indwelling Urinary Catheter', 5, '2aae581c-7c9a-4651-aca0-c018e06d4f7c', '2026-03-04 17:56:51.124'),
('987fbb1f-6ee6-4e55-bb76-8c31ee3822db', ' How to Care for a Person with Dementia', 5, '08542fed-5841-4427-a02e-31c0d70c8b69', '2026-03-07 16:32:26.174'),
('98d8a5e3-2907-4334-926a-2d3dcd8b1f81', 'Introduction to Cleanliness and Hygiene', 1, '5213706d-b5e2-4dfa-97e2-7e0502a5a389', '2026-03-05 21:36:06.957'),
('9ba7eb7d-439f-44df-8483-26389ff291bc', 'Introduction to Grooming and Getting Ready', 1, '73dbf1bd-2299-4b32-8768-3c001e8a6c32', '2026-03-09 21:51:55.569'),
('9d209b3a-05a8-4d7a-a01c-6989bcfc05d1', 'Body Mechanics and Patient Assessment Before Transfer', 2, '01bf1bc7-a1c4-4b74-add8-9a10fa9beac0', '2026-03-11 01:52:47.830'),
('a14aec7b-2974-422a-b414-e8722c909688', ' Meal Assistance, Feeding Practices, and Monitoring Nutritional Status', 5, 'd0f9e929-a01a-42d0-9614-2c26a3f87a4a', '2026-03-09 23:34:18.224'),
('a28ffb03-d91b-4c43-b3bd-e971cebfd5c1', 'Caring for a Dying Person', 2, '282d7811-acc0-41d1-83b9-618ef8f1ec84', '2026-03-06 22:48:41.673'),
('a8566fff-f24d-4633-b797-93e63ff3afd8', 'Common Patient Positions and Their Purposes', 4, 'c08a4681-1b46-413d-ad58-fabf4d7b78cd', '2026-03-11 01:27:14.942'),
('b010875c-0bb2-4816-8b53-f366f77cde84', ' Stages of Dementia', 2, '08542fed-5841-4427-a02e-31c0d70c8b69', '2026-03-07 14:38:37.583'),
('b1827ce0-2a79-4327-9afe-dd9e9a59b2d5', 'Measuring Height and Weight and Their Importance in Patient Care', 5, '8e8444d6-b7d7-4dc7-b296-148477d1fae0', '2026-03-11 05:40:58.431'),
('b4534cc4-8ae7-4af4-bf62-dcee222643cd', ' Foundations of Vital Signs and Temperature Measurement Basics', 1, '8e8444d6-b7d7-4dc7-b296-148477d1fae0', '2026-03-11 02:36:17.332'),
('b70c82dd-8e94-44d1-b378-d7793332c63f', 'Complications of Immobility', 2, 'c08a4681-1b46-413d-ad58-fabf4d7b78cd', '2026-03-11 01:21:16.584'),
('b83cc9b9-9c3e-4fcc-897d-b9ca19eade92', ' Factors Affecting Nutrition and Dietary Planning', 2, 'd0f9e929-a01a-42d0-9614-2c26a3f87a4a', '2026-03-09 22:53:17.375'),
('ba936a33-6be6-4902-b86a-e1451f20db86', 'Who Must Comply with HIPAA, Key HIPAA Rules for CNAs, and Important Privacy Concepts', 2, '5c51f7a6-61f9-4548-9b75-0757d1b47310', '2026-03-09 21:34:15.454'),
('bd8b1d08-9b94-4f14-813c-a13f62ca0b88', 'Foundations of Patient and Resident Safety', 1, 'ab0ea238-38bd-4336-b5a0-9a9412d11871', '2026-03-11 00:09:27.405'),
('bfc7d58e-4db7-4be9-b621-02792ad08455', 'Abuse', 2, '3a6f0a97-2ecc-40e5-9754-85ed7573a83b', '2026-03-09 16:46:56.589'),
('c4336f10-87b8-418c-b171-fef85b5e9349', 'What to Do When a Fall Occurs', 4, '48bd5617-9cb9-4bc8-9c50-37282f52dc6f', '2026-03-09 13:03:32.491'),
('c998d439-9793-4fb7-8605-412e9f0fed87', 'HIPAA Course Outline, Course Outcomes, Introduction, and Overview of HIPAA', 1, '5c51f7a6-61f9-4548-9b75-0757d1b47310', '2026-03-09 20:36:58.354'),
('ce3e1bae-5145-440a-b205-6cd814288b64', 'Respiratory Assessment — Measuring and Observing Respiration', 4, '8e8444d6-b7d7-4dc7-b296-148477d1fae0', '2026-03-11 04:57:35.892'),
('ce9c1e28-29dc-4389-8a0d-250bb3f11f0c', 'When Death Occurs and Postmortem Care', 7, '282d7811-acc0-41d1-83b9-618ef8f1ec84', '2026-03-07 04:36:00.459'),
('d375d014-f177-4d5f-a7d9-d5dda2bfefd3', 'How to Assist a Man with a Urinal', 4, '2aae581c-7c9a-4651-aca0-c018e06d4f7c', '2026-03-04 17:29:20.758'),
('d393580a-e299-4b99-9cea-bd746cfca6a4', 'How to Assist with Bedpans', 3, '2aae581c-7c9a-4651-aca0-c018e06d4f7c', '2026-03-04 17:02:19.729'),
('d3d65472-5109-43a5-b662-aab98e56bd39', 'Foundations of Patient Rights and Participation in Healthcare', 1, '21b5d3ef-1ff3-45bb-bcc1-819687d95630', '2026-03-11 00:58:52.527'),
('d742136f-f25e-40d6-bf31-cee27af16e61', ' Introduction to Stress', 1, '1995a2fa-7ab2-4474-b2e3-e754efaac7ed', '2026-03-08 23:41:01.519'),
('dce842e3-cc0b-4a8b-a42b-7abd2ca1182f', 'Assisting Patients With Repositioning and Turning in Bed', 5, 'c08a4681-1b46-413d-ad58-fabf4d7b78cd', '2026-03-11 01:36:03.973'),
('dd424ba2-6adf-4233-8e98-e2aeff3256c7', 'Applying Physical Restraints Safely', 3, 'ab0ea238-38bd-4336-b5a0-9a9412d11871', '2026-03-11 00:14:38.775'),
('dd515ef4-7b61-4d86-942d-b5f55e7023e8', 'Factors That Cause Falls and Guidelines for Prevention', 2, '48bd5617-9cb9-4bc8-9c50-37282f52dc6f', '2026-03-09 01:02:30.760'),
('e0490c38-d3a1-4ef5-92ab-3faf1042bc60', 'Proper Communication and Resident Interaction', 2, 'c6ef29bf-f6b2-4680-be75-18a1820f250e', '2026-03-08 22:02:47.888'),
('e0a361ac-5ba2-4d54-a224-17fc26e51ffa', 'Stages of Death', 1, '282d7811-acc0-41d1-83b9-618ef8f1ec84', '2026-03-06 22:43:35.395'),
('e7b21bc9-22e5-4a6c-a3a5-d7285d0eb668', 'How to Manage Difficult Behaviors', 4, '08542fed-5841-4427-a02e-31c0d70c8b69', '2026-03-07 15:55:26.803'),
('f1a9fede-e6cd-4e34-b65b-c85aea81cce8', 'Temperature Measurement Procedures (Oral, Rectal, and Alternative Methods)', 2, '8e8444d6-b7d7-4dc7-b296-148477d1fae0', '2026-03-11 02:44:47.404'),
('f41c976b-c55e-477b-9711-ee0ed0b0e175', 'Fundamentals of Nutrition and Essential Nutrients', 2, 'd0f9e929-a01a-42d0-9614-2c26a3f87a4a', '2026-03-09 22:37:58.342'),
('f55fb4c0-951d-4f34-9154-1f9d60d0d768', 'Standard Precautions and Isolation Practices in Infection Control', 5, 'f3ba9ddd-1dcc-4b8c-aa03-911a56f54d5f', '2026-03-09 22:32:59.884'),
('f6c7c9d7-a475-46f1-ac1c-50528d8dc48f', 'Assisting with Eyeglasses, Hearing Aids, and Finishing Up', 4, '73dbf1bd-2299-4b32-8768-3c001e8a6c32', '2026-03-09 22:17:09.525'),
('f6e0799a-6a64-45ff-ae17-75f9fc2070fa', 'How to Measure Urine Output, Incontinence, and Ostomy Care', 6, '2aae581c-7c9a-4651-aca0-c018e06d4f7c', '2026-03-04 20:48:23.781'),
('f8e93aa3-e15f-40db-996a-6be3273d6c34', 'Ways to Treat the Dying Resident and Their Families with Dignity', 6, '282d7811-acc0-41d1-83b9-618ef8f1ec84', '2026-03-07 04:33:41.221'),
('f9c54910-0f2e-47ef-b59f-810a02f7f026', 'Introduction, Patient Empathy, and Preparation Before Positioning Patients', 1, 'c08a4681-1b46-413d-ad58-fabf4d7b78cd', '2026-03-11 01:11:42.519'),
('fa5e83ed-a18d-4ebf-984b-7e92ef772fa1', 'Guidelines for Stress Management', 2, '1995a2fa-7ab2-4474-b2e3-e754efaac7ed', '2026-03-08 23:51:15.338');

-- --------------------------------------------------------

--
-- Table structure for table `Notification`
--

CREATE TABLE `Notification` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `userId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Notification`
--

INSERT INTO `Notification` (`id`, `title`, `message`, `type`, `read`, `userId`, `createdAt`) VALUES
('16a27145-8f11-467a-b7f9-4fc693227296', 'Certificate Approved!', 'Congratulations! Your certificate for \"Foundations of Nursing Assistant Care\" has been approved.', 'CERT_APPROVED', 0, 'a3c4cd28-09e1-4635-92e2-b89c4c579f0f', '2026-03-03 17:04:33.717'),
('2f4b5e2b-cdbf-406d-bca5-11f94bf503a0', 'Certificate Approved!', 'Congratulations! Your certificate for \"Foundations of Nursing Assistant Care\" has been approved.', 'CERT_APPROVED', 0, 'a3c4cd28-09e1-4635-92e2-b89c4c579f0f', '2026-03-03 17:04:36.799'),
('dcf31d7c-6432-44d9-966e-ee607826f343', 'Certificate Approval Required', 'Sabona Tafese has completed \"Foundations of Nursing Assistant Care\" and is waiting for certificate approval.', 'EXAM_COMPLETED', 1, NULL, '2026-03-03 17:03:45.255');

-- --------------------------------------------------------

--
-- Table structure for table `Question`
--

CREATE TABLE `Question` (
  `id` varchar(191) NOT NULL,
  `text` varchar(191) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `correctAnswer` int(11) NOT NULL,
  `quizId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Question`
--

INSERT INTO `Question` (`id`, `text`, `options`, `correctAnswer`, `quizId`) VALUES
('0047021b-72cf-44e5-bffc-393685bdf287', 'When providing a bed bath, how can a caregiver best balance the patient\'s need for warmth and privacy?', '[\"Using a bath blanket to cover the patient and exposing only the part being washed.\",\"Increasing the room temperature to 85∘  F so the patient can remain uncovered.\",\"Performing the bath with the lights off to ensure the patient feels less exposed.\",\"Washing the patient as quickly as possible to minimize the time they are exposed.\"]', 0, '58f43248-c356-4b5f-8e7b-a5cb3ea8f572'),
('00cc92cf-b3e0-4130-b7ef-e12df8717bb0', 'Which orientation is correct when using a fracture pan?', '[\"The narrow end toward the foot of the bed.\",\"The narrow end toward the head of the bed.\",\"The pan should be placed at a 90-degree angle to the spine.\",\"The handle of the pan should face toward the resident\'s side.\"]', 1, '0c41c501-a568-4252-80f6-58469c8d92e3'),
('0338f207-35d7-465d-b445-ef25922e5de5', 'What is the primary reason for encouraging patients to perform as much of their own hygiene care as possible?', '[\"To maintain the patient\'s self-esteem and sense of control.\",\"To finish the hygiene procedure in the shortest possible time.\",\"To reduce the amount of cleaning supplies used in the facility.\",\"To allow the caregiver to leave the room and attend to other tasks.\"]', 0, '16f33183-9e12-4966-91ce-e1c392366cf0'),
('0d82a264-5a01-43b0-8c05-16cef8b2aa44', 'Which of the following is a primary clinical reason for performing a bed bath rather than a tub bath?', '[\"A bed bath is faster to complete than transporting a patient to a shower room.\",\"The patient prefers to stay in their own room for all activities.\",\"Bed baths use less water and are more environmentally friendly for the facility.\",\"The patient is unable to leave the bed due to surgery, injury, or extreme weakness.\"]', 3, '58f43248-c356-4b5f-8e7b-a5cb3ea8f572'),
('10eecf06-86ac-480d-8e79-77340b023740', 'According to the course material, which condition is most likely to interfere with a resident\'s ability to manage elimination independently?', '[\"Increased dietary fiber\",\"Acute sense of thirst\",\"Dementia\",\"Improved physical mobility\"]', 2, '2b0f7229-c882-4862-bb94-3ae0c7c27293'),
('163b9e67-9787-40ea-91c5-7ec8eb932be1', 'If a caregiver is performing postmortem care and sees medical tubing, such as a catheter, still attached to the resident, what should be their first action?', '[\"Ask the family members if they would like the tubes removed\",\"Cut the tubing flush with the skin to make it less visible\",\"Remove all tubing immediately to ensure the body is clean\",\"Consult the nurse for specific instructions before removal\"]', 3, '2a797083-ca49-473f-8820-74f5b611bf72'),
('181c1c9b-033f-44e2-b554-2bd5b65fa1fa', 'What is the primary goal of palliative care when an individual is approaching the end of life?', '[\"Providing comfort, dignity, and emotional support\",\"Increasing the patient\'s physical strength through therapy\",\"Finding a cure for the terminal illness\",\"Implementing aggressive medical treatments\"]', 0, '20619e88-a53e-4daf-aa44-093add9aa3e8'),
('18d47f9b-270c-41f7-a148-97ba608e6f80', 'Which of the following urine characteristics is considered normal and does not require immediate reporting to a nurse?', '[\"Strong or unusual odor.\",\"Clear and amber color.\",\"Cloudy appearance.\",\"Presence of sediment or particles.\"]', 1, '5a74109d-97da-48ea-a1de-8f06d3ac3020'),
('1cdb82af-60dd-441f-8c6d-62a531a1af67', 'According to the recommended hand hygiene practices, when should a caregiver wash their hands?', '[\"After removing gloves and after contact with bodily fluids.\",\"Only at the very beginning of a shift.\",\"Whenever the caregiver enters the breakroom for a snack.\",\"Only when the hands are visibly covered in dirt or grime.\"]', 0, '16f33183-9e12-4966-91ce-e1c392366cf0'),
('1e495b86-528b-4e51-a618-78c6bf55b97d', 'A patient asks, \'Why did I get sick while others stay healthy?\' In which stage is this question most common?', '[\"Denial\",\"Bargaining\",\"Anger\",\"Acceptance\"]', 2, '2caa4bc3-730c-49f3-b3b3-0a3accf783f4'),
('22e87881-8312-4ee0-858b-47bca5d6a62e', 'In the context of end-of-life care, what is the core principle behind treating a resident with dignity?', '[\"Ensuring the resident remains productive within the care facility community.\",\"Recognizing the inherent value of every person regardless of their physical state.\",\"Focusing solely on the clinical management of physical symptoms.\",\"Prioritizing the facility\'s schedule over the resident\'s personal habits.\"]', 1, '19e64743-487d-444a-b5bf-56ce0517d437'),
('23154c73-05a9-4754-b017-1c31f9117c05', 'Which type of depression occurs when a person is grieving the loss of their independence and physical strength?', '[\"Chronic depression\",\"Preparatory depression\",\"Reactive depression\",\"Clinical depression\"]', 2, '2caa4bc3-730c-49f3-b3b3-0a3accf783f4'),
('23ae0cba-f5b7-4fa0-9963-e5f3de76ea86', 'What is the primary role of a caregiver when a terminally ill resident expresses fear or sadness about their situation?', '[\"To explain that these feelings are unnecessary\",\"To redirect the conversation to more positive topics\",\"To offer personal stories of other patients\' experiences\",\"To listen respectfully without judgment\"]', 3, '99446d88-6e2d-4025-994d-32eb4fcff5d1'),
('24331e53-dbb4-4f16-b57b-88e01e4288b0', 'Which system is responsible for the removal of solid waste from the body?', '[\"Neurological system\",\"Renal system\",\"Gastrointestinal system\",\"Urinary system\"]', 2, '2b0f7229-c882-4862-bb94-3ae0c7c27293'),
('2a439391-64e6-490d-a480-1e43a7a9899b', 'During a bed bath, what should a caregiver do if the patient is capable of washing their own face?', '[\"Encourage the patient to participate in their own care.\",\"Wait until the end of the bath and then let the patient redo the face.\",\"Discourage the patient to ensure the task is completed faster.\",\"Tell the patient it is against facility policy for them to assist.\"]', 0, '58f43248-c356-4b5f-8e7b-a5cb3ea8f572'),
('2ea0eb1f-7c16-48b5-9e22-3285925a050e', 'What causes the body temperature of a dying person to fluctuate between hot and cold?', '[\"The digestive system is processing food too quickly.\",\"The patient is experiencing an external environmental shift in the room.\",\"The body’s ability to regulate temperature weakens as systems fail.\",\"The heart is pumping too much blood to the skin\'s surface.\"]', 2, '7aa7fd72-2180-4763-b1c6-2e7fd3fb9057'),
('3070f18a-059d-4914-a2b7-a2591abf4d7f', 'A caregiver notices a purplish discoloration on the parts of the body that are pressed against the bed. Which term describes this change?\n\nA.\n\nB.\n\nC.\n\nD.\n', '[\"Livor Mortis\",\"Rigor Mortis\",\"Algor Mortis\",\"Postmortem Hyperpigmentation\"]', 0, '2a797083-ca49-473f-8820-74f5b611bf72'),
('3182dff3-05d7-4a54-ac6c-39115c2ff763', 'Which of the following actions best supports a patient\'s dignity during perineal care?', '[\"Keeping the room door open to ensure the caregiver\'s safety.\",\"Using cold water to ensure the patient remains alert during the process.\",\"Performing the procedure as quickly as possible without speaking.\",\"Exposing only the specific area being cleaned while covering the rest of the body.\"]', 3, '261e2390-7550-4ccf-a40a-139b110b1d8a'),
('3526196a-5950-4eaf-bb5a-d550873552fe', 'When emptying a urine drainage bag, why is a paper towel placed on the floor underneath the graduate?', '[\"To muffle the sound of urine draining into the container.\",\"To keep the graduate stable on an uneven floor surface.\",\"To mark the spot where the bag should be re-hung.\",\"To protect the floor surface from potential spills or drips.\"]', 3, '38284129-e4d6-4f08-81b7-f5abf00da0d2'),
('35df8a35-24a5-4b01-946a-344496d7d30e', 'Why might a dying patient experience blurred or failing vision?', '[\"The patient is experiencing a temporary allergic reaction to medications.\",\"Decreased circulation and a slowing nervous system affect sensory processing.\",\"The patient is intentionally avoiding visual contact with their surroundings.\",\"The eye muscles become overactive and cause strain.\"]', 1, '7aa7fd72-2180-4763-b1c6-2e7fd3fb9057'),
('3e386fd9-b9eb-40d0-9d75-9623cdc2398c', 'What is the primary reason for positioning the body in a natural alignment shortly after death occurs?', '[\"To prevent difficulties caused by rigor mortis\",\"To prevent the body from cooling down too quickly\",\"To restart the resident\'s circulation\",\"To reverse the effects of livor mortis\"]', 0, '2a797083-ca49-473f-8820-74f5b611bf72'),
('41fefd0f-b332-4d96-a24c-efb9ed7db315', 'Drainage bags are emptied and measured at the end of the shift and when the bag is\nfull', '[\"True\",\"False\",\"Sometimes\",\"None\"]', 0, 'f8080013-641d-4f45-ae9c-8ba6dc737d19'),
('47c8893d-69c0-42b7-af6f-b86c0d1bc2d2', 'Which statement is false?', '[\" Incontinence is embarrassing.\",\"Caring for persons with incontinence may be stressful.\",\"Incontinence is a personal choice.\",\"Be kind and patient to persons who are incontinent.\"]', 2, 'f8080013-641d-4f45-ae9c-8ba6dc737d19'),
('48a3eb89-25ee-431a-af25-50abce70ea6c', 'Why is it critical to gather all necessary supplies before entering the resident\'s room?', '[\"To prevent interruptions and contamination risks\",\"To follow the facility\'s billing protocols\",\"To minimize the amount of laundry generated\",\"To ensure the resident does not refuse care\"]', 0, '76786ec9-7861-4fd7-97ff-3300102378c4'),
('4bb3de3c-d4d4-4c01-b708-75b803f5bf55', 'What is considered the most effective method of infection control after completing the cleaning procedure?', '[\"Wearing gloves throughout the entire procedure.\",\"Reporting the care in the patient’s documentation.\",\"Properly disposing of the used washcloth in the trash.\",\"Thoroughly washing hands with soap and water.\"]', 3, '261e2390-7550-4ccf-a40a-139b110b1d8a'),
('4d31354c-8d54-4ee1-9a0b-d4c23d23cb74', 'Which of the following describes the primary reason the body must eliminate waste products?', '[\"To incrrease body\'s requirement for nutrition and oxygen\",\"To prevent the buildup of toxins that can couse organ dysfunction\",\"To ensure that the gastrointestinal system remains active during sleep\",\"To allow the kidneys to rest periodically throughout the day\"]', 1, '2b0f7229-c882-4862-bb94-3ae0c7c27293'),
('4e594b26-a613-4db9-b7ee-1eefc394d717', 'Which action is identified as the very first step in the preparation process?', '[\"Hand hygiene\",\"Identifying the resident\",\"Gathering supplies\",\"Explaining the procedure\"]', 0, '76786ec9-7861-4fd7-97ff-3300102378c4'),
('4e7bb1ec-cfb0-462e-80cf-f82465b5c13a', 'How should a healthcare worker demonstrate that they are treating a dying resident as a living person?', '[\"By speaking directly to the patient and explaining procedures\",\"By focusing strictly on medical vitals and equipment\",\"By avoiding difficult topics like death to keep them happy\",\"By speaking about the patient\'s condition to the family in the room\"]', 0, '99446d88-6e2d-4025-994d-32eb4fcff5d1'),
('4ef0a5f1-52a6-4d3e-abf5-060212e98e94', 'What is the primary reason for keeping the urinary drainage bag positioned lower than the level of the bladder?', '[\"To make it easier for the nursing assistant to monitor the volume of urine output.\",\"To prevent the backflow of urine, which can lead to contamination and infection.\",\"To prevent the weight of the full bag from pulling the catheter out of the urethra.\",\"To ensure the drainage bag is hidden from the resident\'s line of sight for privacy.\"]', 1, '09d7d56f-9fc6-4c5a-901b-f0c1ff0bd136'),
('500747fd-a4c2-49e5-9cd3-813216a872df', 'When assisting an elderly resident with a bedpan, why is special attention given to skin care?', '[\"Elderly residents are less likely to notice if they are soiled.\",\"Elderly skin is often thin and susceptible to tears or bruising.\",\"Elderly skin produces more oil, making the bedpan slide out of place.\",\"The bedpan must be heated to prevent skin shock.\"]', 1, '2b0f7229-c882-4862-bb94-3ae0c7c27293'),
('513fdf0e-919e-4c67-813a-cafdd1d035a5', 'Which observation does not need to be reported to the nurse promptly?', '[\"Complaints of urgency.\",\"Burning on urination.\",\"Painful or difficult urination.\",\" Clear amber urine.\"]', 3, 'f8080013-641d-4f45-ae9c-8ba6dc737d19'),
('5495b817-eb0e-4994-8c04-01fc2f91d053', 'Which of the following behaviors is considered a violation of professional conduct in a dying resident\'s room?', '[\"Offering a family member a chair or a glass of water.\",\"Sitting quietly with a resident who is unable to communicate.\",\"Adjusting the resident\'s pillows to improve their breathing.\",\"Discussing personal problems or gossiping with other staff members.\"]', 3, '19e64743-487d-444a-b5bf-56ce0517d437'),
('55bf8313-047f-4561-9fdf-a01c728fbb15', 'According to the systematic bathing procedure, which area should be cleaned last?', '[\"The perineal area\",\"The abdomen\",\"The back\",\"The feet\"]', 0, '58f43248-c356-4b5f-8e7b-a5cb3ea8f572'),
('5a30ce51-da23-4fa7-b28d-6ea8802355f9', 'What is the primary reason for gathering all necessary supplies before beginning the procedure?', '[\"To prevent interruptions and help maintain the resident\'s privacy.\",\"To follow the doctor\'s specific orders for supply management.\",\"To allow the caregiver to avoid washing their hands twice.\",\"To ensure the resident does not change his mind about voiding.\"]', 0, '5a74109d-97da-48ea-a1de-8f06d3ac3020'),
('5c911a7d-a7d6-4ca3-b4b2-904aa5bab1fe', 'When a resident is on intake and output (I&O) status, in what units should the urine be recorded?', '[\"Milliliters (ml) or cubic centimeters (cc).\",\"Grams (g).\",\"Ounces (oz).\",\"Cups or fractions of a liter (L).\"]', 0, '5a74109d-97da-48ea-a1de-8f06d3ac3020'),
('5cd94488-7574-454f-9501-8dde5482696b', 'What is described as the foundation of safe and professional elimination care?', '[\"The speed of the procedure\",\"The use of advanced technology\",\"Following a strict time schedule\",\"Preparation\"]', 3, '76786ec9-7861-4fd7-97ff-3300102378c4'),
('5e48b3e5-9fdf-4f6f-a21d-763dce423178', 'Where should the urinary drainage bag be secured when a resident is in bed?', '[\"The resident\'s ankle or calf.\",\"The bed frame.\",\"The bed frame.\",\"The floor next to the bed.\"]', 2, '09d7d56f-9fc6-4c5a-901b-f0c1ff0bd136'),
('6095e19d-e8a9-4286-9d9a-d82c17744080', 'What is the primary reason for maintaining strict oral hygiene in a healthcare setting?', '[\"To prevent the buildup of bacteria that can lead to infections.\",\"To eliminate the need for a specialized diet.\",\"To replace the need for professional dental cleanings.\",\"To ensure the patient\'s teeth remain perfectly white.\"]', 0, '7667318c-3dc5-45b7-bd2e-455e8ad5f3d8'),
('65faf95b-f574-4632-9a6b-387d278121d5', 'In the \'Knee-Bending Technique\' for bedpan placement, what should the resident be instructed to do?', '[\"Press their heels into the mattress and lift their buttocks.\",\"Roll onto their side while grabbing the side rail.\",\"Take a deep breath and hold it while the pan is pushed underneath.\",\"Keep their legs straight and lift from the waist.\"]', 0, '0c41c501-a568-4252-80f6-58469c8d92e3'),
('6847e530-034f-461f-9c7e-92adc700921f', 'How should a standard bedpan be oriented when placed under a resident?', '[\"The bedpan should be placed sideways to catch all output.\",\"The narrow end should be positioned toward the head of the bed.\",\"The narrow end should be positioned toward the foot of the bed.\",\"The wide, open end should face the foot of the bed.\"]', 2, '0c41c501-a568-4252-80f6-58469c8d92e3'),
('6bd2e14a-bab3-4a75-bc93-74aa4c6ab5c4', 'When preparing to place a bedpan, what is the recommended position for the head of the bed?', '[\"Locked at a 45-degree angle.\",\"As flat as the resident can tolerate.\",\"Placed in a slight Trendelenburg position.\",\"Raised to a high Fowler\'s position.\"]', 1, '0c41c501-a568-4252-80f6-58469c8d92e3'),
('70917f23-63b6-48e5-9658-a36113c4657d', 'Which safety precaution is most critical when providing oral care to an unconscious patient?', '[\"Turning the patient\'s head to the side.\",\"Brushing the teeth as quickly as possible.\",\"Ensuring the patient is lying completely flat.\",\"Using a large amount of mouthwash to ensure cleanliness.\"]', 0, '7667318c-3dc5-45b7-bd2e-455e8ad5f3d8'),
('718082c2-7663-4283-a103-c12f782068a3', 'In addition to cleaning the patient, what observation should a caregiver prioritize during perineal care?', '[\"The brand of clothing the patient is wearing.\",\"The patient\'s ability to hold a conversation.\",\"Signs of skin irritation, redness, or unusual discharge.\",\"The specific time the patient last used the restroom.\"]', 2, '261e2390-7550-4ccf-a40a-139b110b1d8a'),
('71b1d6c1-ec62-4bd2-b744-ad2680d1bde1', 'How does poor hygiene specifically impact the body\'s natural defense systems?', '[\"It can weaken protective barriers, allowing bacteria to enter through small cuts.\",\"It causes the skin to stop producing sweat entirely.\",\"It forces the immune system to relocate to the outer layers of the skin.\",\"It strengthens the mucous membranes by exposing them to more dirt.\"]', 0, '16f33183-9e12-4966-91ce-e1c392366cf0'),
('7290eab5-ffd5-4d54-b9f9-c0ee0833e5fa', 'What is a tube that is inserted into a person’s bladder to provide continuous urine\ndrainage?', '[\"Drainage bag.\",\"An indwelling catheter.\",\"Ostomy bag.\",\"Colostomy bag.\"]', 1, 'f8080013-641d-4f45-ae9c-8ba6dc737d19'),
('7306b5ba-4ba7-41bb-b101-a2a708a9200f', 'What is the primary psychological purpose of the Denial stage?', '[\"To convince doctors to change the medical diagnosis.\",\"To act as a buffer against the immediate shock of the situation.\",\"To allow the patient to ignore all medical symptoms entirely.\",\"To help family members feel better about the prognosis.\"]', 1, '2caa4bc3-730c-49f3-b3b3-0a3accf783f4'),
('736e923c-0d93-434a-bc13-1845f01e34e8', 'During the process of elimination and defecation, hand washing is maintained to\npromote…\n', '[\"Body mechanics.\",\"Infection control.\",\"Urine output.\",\"Defecation.\"]', 1, 'f8080013-641d-4f45-ae9c-8ba6dc737d19'),
('73ee0ef3-2153-4366-86bd-2253564613fa', 'Which emotional benefit is directly associated with a patient being clean and well-groomed?', '[\"Improved mood and increased self-confidence.\",\"The ability to ignore all hospital safety protocols.\",\"A total loss of the need for social interaction.\",\"Immediate cure of underlying chronic illnesses.\"]', 0, '16f33183-9e12-4966-91ce-e1c392366cf0'),
('7b53f99c-0994-46dc-9327-5e4c99956333', 'When cleaning the perineal area of a female resident with a catheter, which motion is correct?', '[\"Clean in a circular motion around the urethral opening.\",\"Scrub back and forth quickly to ensure all soap is removed.\",\"Clean from back to front, moving from the anus toward the vulva.\",\"Clean from front to back, moving from the vulva toward the anus.\"]', 3, '09d7d56f-9fc6-4c5a-901b-f0c1ff0bd136'),
('7c5c8185-9946-4a66-bc46-ac28b9e26f23', 'What is the primary reason for using a clean portion of the washcloth for every stroke?', '[\"To prevent the washcloth from becoming too heavy with water.\",\"To avoid spreading microorganisms back onto the patient.\",\"To keep the water in the wash basin from becoming soapy.\",\"To ensure the washcloth remains soft against the skin.\"]', 1, '261e2390-7550-4ccf-a40a-139b110b1d8a'),
('7d31e5a3-947b-49fc-a358-6184698208d3', 'When discussing urinary care for a resident, which term should be avoided to maintain the individual\'s dignity?', '[\"Incontinence pad\",\"Protective garment\",\"Diaper\",\"Incontinence brief\"]', 2, '38284129-e4d6-4f08-81b7-f5abf00da0d2'),
('7d8df22a-8386-4691-81df-f89b5ff8847e', 'What is the primary reason for ensuring that bed sheets are kept smooth and free of wrinkles?', '[\"To reduce the risk of infection from bacteria\",\"To prevent the creation of pressure points\",\"To make the room appear more professional for visitors\",\"To help the resident stay warm during the night\"]', 1, '60733c97-3fcd-4c68-a5e2-af906abc96b0'),
('7f34f922-6e7a-4b07-8c5d-e2d4c5d4e886', 'A caregiver is asked by a resident\'s friend about the resident\'s specific terminal diagnosis. Why must the caregiver refuse to share this information?', '[\"The diagnosis is likely to change\",\"Only doctors are allowed to know the diagnosis\",\"The information might upset the friend\",\"It violates professional confidentiality rules\"]', 3, '99446d88-6e2d-4025-994d-32eb4fcff5d1'),
('7f908314-1212-4fc7-943c-057390a0de7a', 'How should a caregiver communicate with a resident who is in the final stages of life and does not respond verbally?', '[\"Speak in a loud, clear voice to ensure they hear you.\",\"Limit speaking to avoid overstimulating the resident.\",\"Communicate only through touch to avoid confusion.\",\"Explain care procedures in a normal, calm tone.\"]', 3, '60733c97-3fcd-4c68-a5e2-af906abc96b0'),
('803e7743-dd98-4679-b129-e5e2b798fbc5', 'Which of the following is a recommended step for preventing irritation of the resident\'s nose and lips?', '[\"Wiping the area frequently with dry gauze\",\"Using alcohol-based swabs to clean the area\",\"Applying a small amount of lubricant or lip balm\",\"Increasing room humidity to maximum levels\"]', 2, '60733c97-3fcd-4c68-a5e2-af906abc96b0'),
('82004612-c88a-42f9-97b3-e9075bf77c30', 'Why is regular bathing considered a critical intervention for patients with limited mobility?', '[\"It is the only way to stimulate blood circulation in the extremities.\",\"It replaces the patient\'s need for daily physical exercise.\",\"It prevents the growth of microorganisms that cause skin infections.\",\"It eliminates the need for topical lotions or skin protectants\"]', 2, '58f43248-c356-4b5f-8e7b-a5cb3ea8f572'),
('890d1c17-73e6-4268-b57a-9d1c5dafc338', 'Which of the following is a primary reason a resident would require the use of a bedpan rather than a bathroom?', '[\"The resident prefers the privacy of their own bed for all activities.\",\"The nursing staff is busy and cannot assist the resident to the toilet.\",\"The resident is experiencing weakness or medical restrictions that prevent ambulation.\",\"Using a bedpan is the standard procedure for all residents in long-term care.\"]', 2, '0c41c501-a568-4252-80f6-58469c8d92e3'),
('8988c980-e1a2-4613-b78e-344ccd0b83ca', 'If a resident is capable of assisting, how should the caregiver handle the urinal during positioning?', '[\"Ask a second caregiver to assist with holding the device.\",\"Encourage the resident to hold the urinal himself.\",\"Hold the urinal for the resident to ensure it does not spill.\",\"Insist on placing it yourself to ensure a secure fit.\"]', 1, '5a74109d-97da-48ea-a1de-8f06d3ac3020'),
('8a0b9b44-c058-462d-bcf1-81f6c16b70de', 'According to the provided material, why should visitors be allowed even if a terminally ill resident is unconscious?', '[\"To help the caregiver monitor the patient\'s vitals\",\"To allow family to sign legal documents\",\"The patient may still sense or hear their presence\",\"It is required by state law for all residents\"]', 2, '99446d88-6e2d-4025-994d-32eb4fcff5d1'),
('8a1540ce-12e1-4bcf-b7d0-baae59c06a7b', 'Which of the following is the correct method for obtaining an accurate measurement of urine from a graduate?', '[\"Estimate the amount while the graduate is still on the floor.\",\"Place it on a level counter and read it at eye level.\",\"Read the measurement markings while pouring the urine into the toilet.\",\"Hold the graduate up to the light while standing.\"]', 1, '38284129-e4d6-4f08-81b7-f5abf00da0d2'),
('8b15e538-7561-4cc3-a41b-6ad78df8eb5a', 'What is the primary reason for regularly repositioning a patient who has lost muscle tone?', '[\"To prevent discomfort and the risk of pressure sores.\",\"To encourage the patient to begin speaking again.\",\"To stop the patient from experiencing confusion.\",\"To improve the patient\'s blood pressure levels.\"]', 0, '7aa7fd72-2180-4763-b1c6-2e7fd3fb9057'),
('8b9ff9e9-f1a7-481e-af62-05ccadf4d766', 'Beyond physical appearance, what is the primary health-related reason for maintaining cleanliness and hygiene?', '[\"To decrease the need for physical exercise.\",\"To ensure the facility meets administrative aesthetic standards.\",\"To reduce the time required for medical examinations.\",\"To protect health and prevent the spread of disease.\"]', 3, '16f33183-9e12-4966-91ce-e1c392366cf0'),
('8c82feba-06f9-446b-9e01-008f6bb03f56', 'What often motivates the behavior seen in the Bargaining stage?', '[\"A complete lack of understanding of the medical condition.\",\"A desire to regain a sense of control over a powerless situation.\",\"An attempt to hide the illness from friends and family.\",\"A physical reaction to the side effects of medication.\"]', 1, '2caa4bc3-730c-49f3-b3b3-0a3accf783f4'),
('9a2bbf83-ee95-4f74-8bce-5624083d5e50', 'When observing the eyes of a deceased individual, what physical sign is most commonly noted?', '[\"Eyes that automatically remain tightly shut\",\"Pupils that are fixed and dilated\",\"Rapid, involuntary eye movements\",\"Pupils that are constricted and non-reactive\"]', 1, '2a797083-ca49-473f-8820-74f5b611bf72'),
('9a6bee39-4308-4759-82ee-4ee0c348b1e7', 'Which action should the caregiver take first when beginning the process of assisting with a urinal?', '[\"Wash your hands.\",\"Adjust the resident\'s bed linens.\",\"Put on a clean pair of gloves.\",\"Provide privacy by closing the door.\"]', 0, '5a74109d-97da-48ea-a1de-8f06d3ac3020'),
('9be750a5-00b8-4f19-8d21-e8efdd309d0d', 'Which of the following is an approved method for identifying a resident before providing care?', '[\"Assuming the person in the bed is the correct resident\",\"Asking the resident to state their name and date of birth\",\"Looking at the name tag on the resident\'s door only\",\"Asking a roommate to confirm the person\'s name\"]', 1, '76786ec9-7861-4fd7-97ff-3300102378c4'),
('9d8a5306-222c-4196-acbb-c33dbdfe4bef', 'Which of the following statements best describes the progression through the five stages of dying?', '[\"Most people experience all five stages simultaneously.\",\"Individuals may skip stages or move back and forth between them.\",\"Every patient must complete each stage in a specific chronological order.\",\"Once a person reaches acceptance, they will not return to previous stages like anger.\"]', 1, '2caa4bc3-730c-49f3-b3b3-0a3accf783f4'),
('a1bf2fcf-e70f-4797-a48c-dd8639889835', 'What is the purpose of gently coiling the drainage tubing and securing it to the bed linens?', '[\"It prevents the tubing from kinking and blocking the flow of urine.\",\"It helps the resident remember that the catheter is in place.\",\"It allows the resident to have full range of motion in their legs.\",\"It keeps the tubing from coming into contact with the floor.\"]', 0, '09d7d56f-9fc6-4c5a-901b-f0c1ff0bd136'),
('a3c35d64-7653-48dc-9c2a-858ad0b459e7', 'Which sense is widely believed to be one of the last to fade as a person approaches death?', '[\"Smell\",\"Hearing\",\"Taste\",\"Sight\"]', 1, '20619e88-a53e-4daf-aa44-093add9aa3e8'),
('ada89541-b348-4990-8250-604544216853', 'As a person approaches the end of life, how does the body\'s shutdown process typically occur?', '[\"It usually happens suddenly across all systems at once.\",\"It follows a strict, identical sequence of signs for every patient.\",\"It occurs slowly as different body systems weaken and stop functioning.\",\"It is a process where the respiratory system always fails before any other system.\"]', 2, '7aa7fd72-2180-4763-b1c6-2e7fd3fb9057'),
('b62ad3e2-8018-4ea8-b598-1a76c0cdedd7', 'Which breathing pattern is characterized by cycles of deep breaths, shallow breaths, and brief pauses?', '[\"Rapid and shallow respiration\",\"Cheyne–Stokes respiration\",\"Slow and irregular respiration\",\"Death rattle\"]', 1, '7aa7fd72-2180-4763-b1c6-2e7fd3fb9057'),
('b7cc4e2a-29fc-4c3d-8ff6-f676453033d8', 'Why is the technique of cleaning from \'front to back\' emphasized during perineal care?', '[\"It prevents bacteria from the anal area from entering the urinary tract.\",\"It helps the skin dry more quickly after rinsing.\",\"It reduces the amount of soap needed for the procedure.\",\"It is more comfortable for patients with limited mobility.\"]', 0, '261e2390-7550-4ccf-a40a-139b110b1d8a'),
('bc0e2d36-ee57-4c62-a079-85e4ea13efca', 'Which principle serves as the legal basis for a terminally ill resident\'s right to decline life-extending chemotherapy?', '[\"Palliative necessity\",\"Patient autonomy\",\"Beneficence\",\"Informed consent\"]', 1, '99446d88-6e2d-4025-994d-32eb4fcff5d1'),
('c18bfe6a-765f-42bd-9477-ef4665315c4e', 'A caregiver notices a patient is restless and shifting constantly in bed. Based on nonverbal cues, what might this indicate?', '[\"The patient may be feeling discomfort or anxiety.\",\"The patient is experiencing improved energy levels.\",\"The patient is trying to signal that they want to exercise.\",\"The patient is entering a state of deep, restful sleep.\"]', 0, '20619e88-a53e-4daf-aa44-093add9aa3e8'),
('c3fcc7e6-3ecf-40ae-a8f2-04c512e33e99', 'Which of the statements is false?', '[\"The urine drainage system should hang from the bed frame or chair.\",\"The urine drainage system should hang from the bed rail.\",\"The drainage system must be off the floor.\",\"The urine drainage system must be kept lower than the person’s bladder.\"]', 1, 'f8080013-641d-4f45-ae9c-8ba6dc737d19'),
('c976e397-ab1a-4768-a405-8c9a6880aba9', 'What is the recommended frequency for performing mouth care for a dying resident?', '[\"Once every shift\",\"Only when the resident requests it\",\"Twice daily, similar to standard oral hygiene\",\"Every two hours or as needed\"]', 3, '60733c97-3fcd-4c68-a5e2-af906abc96b0'),
('c9801210-ef8c-42de-9b15-a96f7aa82a82', 'Which specific healthcare professional is typically authorized to officially pronounce that a resident has died?', '[\"A social worker or chaplain\",\"The legal next-of-kin\",\"The nursing assistant who first discovers the resident\",\"A licensed nurse or physician\"]', 3, '2a797083-ca49-473f-8820-74f5b611bf72'),
('cb2a2cff-69fb-46d6-ab86-99e5929e56e1', 'What is the primary risk for a resident who frequently experiences incontinence?', '[\"Permanent loss of kidney function.\",\"Increased risk of respiratory infections.\",\"Dehydration due to fluid loss.\",\"Skin problems such as rashes and pressure ulcers.\"]', 3, '38284129-e4d6-4f08-81b7-f5abf00da0d2'),
('d598f866-f894-428a-a5e5-f22abff6cf80', 'Which step is considered critical during the \'Preparation\' phase of assisting with elimination?', '[\"Washing hands to promote infection control\",\"Dispopsing of solid gloves in the proper receptacle\",\"Returning bed to its lowest position\",\"Documenting the output in resident\'s chart\"]', 0, '2b0f7229-c882-4862-bb94-3ae0c7c27293'),
('d5f6ccba-8a6d-4a64-ab20-4568eeee8835', 'Why is it important for a caregiver to communicate a resident\'s specific final wishes to the rest of the healthcare team?', '[\"To allow the facility to charge higher rates for specialized end-of-life services.\",\"To minimize the amount of time staff must spend in the resident\'s room.\",\"To ensure that all staff members provide consistent care that honors those preferences.\",\"To legally transfer all decision-making power from the family to the staff.\"]', 2, '19e64743-487d-444a-b5bf-56ce0517d437'),
('d6e13921-4344-41d6-805c-ea6a18205ada', 'When cleaning dentures, what is the purpose of lining the sink with a towel?', '[\"To absorb excess water and keep the area dry.\",\"To ensure the dentures stay sterile during the process.\",\"To keep the sink from getting stained by toothpaste.\",\"To provide a soft surface in case the dentures are dropped.\"]', 3, '7667318c-3dc5-45b7-bd2e-455e8ad5f3d8'),
('d7a0a8ea-0e07-48de-b92a-a9bb95ed7a62', 'Before repositioning a resident with an indwelling catheter, what step must the nursing assistant take first?', '[\"Unclip the tubing from the bed linens.\",\"Check the insertion site for signs of infection.\",\"Clamp the catheter to prevent leakage during the move.\",\"Drain the urine from the bag into a graduated cylinder.\"]', 0, '09d7d56f-9fc6-4c5a-901b-f0c1ff0bd136'),
('dc0b3eff-d5a3-42f3-b1c5-4837cfa5b5e4', 'How should a caregiver handle situations where they feel uncomfortable around the topic of death?', '[\"Only enter the room when performing specific medical tasks to remain professional.\",\"Wait for the resident to call for help before entering the room.\",\"Request to be permanently reassigned to a different wing of the facility.\",\"Continue to visit the resident regularly to provide comfort and human presence.\"]', 3, '19e64743-487d-444a-b5bf-56ce0517d437'),
('dc3f121d-42a1-4ef9-8b88-8203bed1390d', 'What is the primary reason for emptying a urine drainage bag whenever it becomes full, rather than waiting until the end of a shift?', '[\"To strictly adhere to the facility\'s hourly monitoring policy.\",\"To make the final shift measurement easier to calculate.\",\"To ensure the resident can move more easily in bed.\",\"To prevent backflow and reduce the risk of infection.\"]', 3, '38284129-e4d6-4f08-81b7-f5abf00da0d2'),
('dcd1d5d2-a3b1-479d-a10d-39018cfa6e78', 'What is a primary benefit of introducing yourself to the resident before starting a procedure?', '[\"It replaces the need to explain the procedure\",\"It reinforces accountability and reduces anxiety\",\"It ensures the caregiver can finish the task faster\",\"It fulfills a legal requirement for witness statements\"]', 1, '76786ec9-7861-4fd7-97ff-3300102378c4'),
('dcf45140-6faf-4bb6-9614-b98d2a543e3d', 'An indwelling urinary catheter is connected by a length of tubing to what?', '[\"Urinary drainage bag.\",\" Ostomy bag.\",\"Vital signs.\",\"All the above.\"]', 0, 'f8080013-641d-4f45-ae9c-8ba6dc737d19'),
('e23854cc-a6c5-4699-b3c9-332a613d3632', 'Where are pressure sores most likely to develop on a resident with decreased mobility?', '[\"The palms and inner forearms\",\"The abdomen and thighs\",\"The tops of the feet and shins\",\"The hips, heels, and elbows\"]', 3, '60733c97-3fcd-4c68-a5e2-af906abc96b0'),
('e7675ac3-c01b-4a5e-a0bb-79d11fea4f1c', 'What is the correct way to store dentures after they have been cleaned?', '[\"Inside an emesis basin for easy access.\",\"Wrapped in a dry towel on the bedside table.\",\"In a sealed plastic bag without any fluid.\",\"In a denture cup filled with water or solution.\"]', 3, '7667318c-3dc5-45b7-bd2e-455e8ad5f3d8'),
('e826d415-59ec-4055-89f9-a8b9d0c52390', 'What is the key indicator of fluid balance?', '[\"Drinking\",\"Eating\",\"Fluid output\",\"None\"]', 2, 'f8080013-641d-4f45-ae9c-8ba6dc737d19'),
('ecd47942-1329-4c60-96a9-39039598c974', 'Why is it necessary to brush a patient\'s tongue during oral care?', '[\"To strengthen the muscles used for swallowing.\",\"To prevent the patient from biting their tongue.\",\"To increase the production of saliva.\",\"To remove bacteria that contribute to bad breath.\"]', 3, '7667318c-3dc5-45b7-bd2e-455e8ad5f3d8'),
('f514a9d6-562f-4e6c-9c27-b264d6329a82', 'The process of elimination is a very private affair', '[\"True \",\"False\",\"Sometimes\",\"None\"]', 0, 'f8080013-641d-4f45-ae9c-8ba6dc737d19'),
('f6f1a121-99d5-48a9-9d74-c884dfade7f3', 'Why must caregivers be particularly cautious when using heat or cold pads on a dying patient?', '[\"Dying patients are typically allergic to temperature changes.\",\"The patient may have fragile skin and reduced sensitivity.\",\"These pads should only be used by licensed physicians.\",\"Heat and cold therapies interfere with pain medications.\"]', 1, '20619e88-a53e-4daf-aa44-093add9aa3e8'),
('fa3e08a7-9def-4c9b-8dad-9906b67302e8', 'What are the two primary ways that the body get rid of its waste?', '[\"Urination and defecation.\",\"Eating and drinking.\",\"Urinals and bedpans.\",\"Indwelling catheters.\"]', 0, 'f8080013-641d-4f45-ae9c-8ba6dc737d19'),
('fbc4f857-8755-4c35-9d76-645cfef82147', 'When a resident asks a difficult question about their condition that the caregiver cannot answer, what is the best approach?', '[\"Provide a guess based on general observations of other patients.\",\"Change the subject to a more cheerful topic to distract the resident.\",\"Offer a positive, generalized reassurance that everything will be fine.\",\"Tell the resident that the nurse or physician will provide them with more information.\"]', 3, '19e64743-487d-444a-b5bf-56ce0517d437'),
('fe1390f3-9e75-4253-a620-3040ef5308eb', 'When providing emotional support, why should a caregiver avoid saying \'Everything will be okay\'?', '[\"It may be perceived as dismissing the patient\'s actual feelings.\",\"Caregivers are legally required to be blunt about death.\",\"It is considered a medical diagnosis that only doctors can give.\",\"Patients at the end of life lose the ability to understand simple phrases.\"]', 0, '20619e88-a53e-4daf-aa44-093add9aa3e8');

-- --------------------------------------------------------

--
-- Table structure for table `Quiz`
--

CREATE TABLE `Quiz` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `moduleId` varchar(191) DEFAULT NULL,
  `passingScore` int(11) NOT NULL DEFAULT 70,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Quiz`
--

INSERT INTO `Quiz` (`id`, `title`, `courseId`, `moduleId`, `passingScore`, `createdAt`) VALUES
('09d7d56f-9fc6-4c5a-901b-f0c1ff0bd136', '', '2aae581c-7c9a-4651-aca0-c018e06d4f7c', '970d32a7-39ef-4ba9-9408-7f5cc185cf98', 50, '2026-03-04 21:55:31.406'),
('0c41c501-a568-4252-80f6-58469c8d92e3', '', '2aae581c-7c9a-4651-aca0-c018e06d4f7c', 'd393580a-e299-4b99-9cea-bd746cfca6a4', 50, '2026-03-04 21:42:41.202'),
('16f33183-9e12-4966-91ce-e1c392366cf0', '', '5213706d-b5e2-4dfa-97e2-7e0502a5a389', '98d8a5e3-2907-4334-926a-2d3dcd8b1f81', 50, '2026-03-05 21:45:34.255'),
('19e64743-487d-444a-b5bf-56ce0517d437', '', '282d7811-acc0-41d1-83b9-618ef8f1ec84', 'f8e93aa3-e15f-40db-996a-6be3273d6c34', 50, '2026-03-07 12:29:18.395'),
('20619e88-a53e-4daf-aa44-093add9aa3e8', '', '282d7811-acc0-41d1-83b9-618ef8f1ec84', 'a28ffb03-d91b-4c43-b3bd-e971cebfd5c1', 50, '2026-03-07 12:03:09.943'),
('261e2390-7550-4ccf-a40a-139b110b1d8a', '', '5213706d-b5e2-4dfa-97e2-7e0502a5a389', '48817eec-fa72-4e0b-b449-36cc4914ec8f', 50, '2026-03-07 11:48:59.390'),
('2a797083-ca49-473f-8820-74f5b611bf72', '', '282d7811-acc0-41d1-83b9-618ef8f1ec84', 'ce9c1e28-29dc-4389-8a0d-250bb3f11f0c', 50, '2026-03-07 11:38:59.626'),
('2b0f7229-c882-4862-bb94-3ae0c7c27293', '', '2aae581c-7c9a-4651-aca0-c018e06d4f7c', '20fb960e-559a-4333-a554-63091b7ecc4a', 40, '2026-03-04 21:28:59.851'),
('2caa4bc3-730c-49f3-b3b3-0a3accf783f4', '', '282d7811-acc0-41d1-83b9-618ef8f1ec84', 'e0a361ac-5ba2-4d54-a224-17fc26e51ffa', 50, '2026-03-07 11:58:09.423'),
('38284129-e4d6-4f08-81b7-f5abf00da0d2', '', '2aae581c-7c9a-4651-aca0-c018e06d4f7c', 'f6e0799a-6a64-45ff-ae17-75f9fc2070fa', 50, '2026-03-04 22:00:03.229'),
('58f43248-c356-4b5f-8e7b-a5cb3ea8f572', '', '5213706d-b5e2-4dfa-97e2-7e0502a5a389', '3f9e9498-a79b-4802-aae5-2ad6ebe25cc0', 50, '2026-03-07 11:29:17.492'),
('5a74109d-97da-48ea-a1de-8f06d3ac3020', '', '2aae581c-7c9a-4651-aca0-c018e06d4f7c', 'd375d014-f177-4d5f-a7d9-d5dda2bfefd3', 50, '2026-03-04 21:48:58.510'),
('60733c97-3fcd-4c68-a5e2-af906abc96b0', '', '282d7811-acc0-41d1-83b9-618ef8f1ec84', '6c68956d-535e-48d2-823f-1ee608b8afd1', 50, '2026-03-07 12:20:58.322'),
('7667318c-3dc5-45b7-bd2e-455e8ad5f3d8', '', '5213706d-b5e2-4dfa-97e2-7e0502a5a389', '83a6b5d8-ab92-4e11-b46c-fc2f53972a03', 50, '2026-03-07 11:23:41.385'),
('76786ec9-7861-4fd7-97ff-3300102378c4', '', '2aae581c-7c9a-4651-aca0-c018e06d4f7c', '84861509-9f2d-473d-9f09-e672c7359939', 50, '2026-03-04 21:35:23.434'),
('7aa7fd72-2180-4763-b1c6-2e7fd3fb9057', '', '282d7811-acc0-41d1-83b9-618ef8f1ec84', '443354bd-7e0b-4e48-8c11-e364a6d3c137', 50, '2026-03-07 12:07:19.079'),
('99446d88-6e2d-4025-994d-32eb4fcff5d1', '', '282d7811-acc0-41d1-83b9-618ef8f1ec84', '07625501-751b-4f5f-b068-8d9f10e84c37', 50, '2026-03-07 12:25:15.290'),
('f8080013-641d-4f45-ae9c-8ba6dc737d19', 'Final Test', '2aae581c-7c9a-4651-aca0-c018e06d4f7c', NULL, 50, '2026-03-04 22:15:35.914');

-- --------------------------------------------------------

--
-- Table structure for table `Result`
--

CREATE TABLE `Result` (
  `id` varchar(191) NOT NULL,
  `score` int(11) NOT NULL,
  `passed` tinyint(1) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `quizId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Result`
--

INSERT INTO `Result` (`id`, `score`, `passed`, `userId`, `quizId`, `createdAt`) VALUES
('98c3af31-e6a2-4d52-b478-d0960faf6b8a', 80, 1, 'd9553690-b64b-445c-9033-8a25734eac11', '2b0f7229-c882-4862-bb94-3ae0c7c27293', '2026-03-04 22:27:36.231');

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `role` enum('STUDENT','ADMIN') NOT NULL DEFAULT 'STUDENT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `createdAt`, `updatedAt`) VALUES
('150955cc-f53b-4ea6-b77e-c363aabd9e5e', 'admin@excelcommunity.com', '$2b$10$1Z0mhArZx2XsWMti2qth5OBHj8KQb5mjEAaJYOFRDwx5y4RQKbmRy', 'Admin User', 'ADMIN', '2026-03-03 16:59:49.593', '2026-03-03 16:59:49.593'),
('a20cc7f9-cee4-434f-a99d-1cbb97637bed', 'admin@excelcommunityliving.com', '$2b$10$DUwuWACZCN9vX8cX8Kae7.A2C0hAwJKKDM1Go8kA1xx6pGSH5Ve6m', 'emily', 'STUDENT', '2026-03-08 04:15:22.190', '2026-03-08 04:15:22.190'),
('d9553690-b64b-445c-9033-8a25734eac11', 'sabonawaktoletafese@gmailcom', '$2b$10$Gxj7jsB5wQJZUbONp0AXE.tUvxdjEmF.SUnj/0z.3UxzhnLBeYp2q', 'Sabona Waktole', 'STUDENT', '2026-03-04 22:18:11.257', '2026-03-04 22:18:11.257'),
('f85090cc-cba1-4f08-8b7a-2a87ce545305', 'admin@excecommunityliving.com', '$2b$10$aX1u6bTe3HHESbuZxrj84.aNTCLn92nXyTKzxxYnhkeTMhEyau6/G', 'Emily Kukiiriza', 'STUDENT', '2026-03-07 03:07:49.941', '2026-03-07 03:07:49.941');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Certificate`
--
ALTER TABLE `Certificate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Certificate_uniqueId_key` (`uniqueId`),
  ADD KEY `Certificate_userId_fkey` (`userId`),
  ADD KEY `Certificate_courseId_fkey` (`courseId`);

--
-- Indexes for table `Course`
--
ALTER TABLE `Course`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Course_instructorId_fkey` (`instructorId`);

--
-- Indexes for table `Enrollment`
--
ALTER TABLE `Enrollment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Enrollment_userId_courseId_key` (`userId`,`courseId`),
  ADD KEY `Enrollment_courseId_fkey` (`courseId`);

--
-- Indexes for table `Lesson`
--
ALTER TABLE `Lesson`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Lesson_moduleId_fkey` (`moduleId`);

--
-- Indexes for table `Module`
--
ALTER TABLE `Module`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Module_courseId_fkey` (`courseId`);

--
-- Indexes for table `Notification`
--
ALTER TABLE `Notification`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Question`
--
ALTER TABLE `Question`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Question_quizId_fkey` (`quizId`);

--
-- Indexes for table `Quiz`
--
ALTER TABLE `Quiz`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Quiz_courseId_fkey` (`courseId`),
  ADD KEY `Quiz_moduleId_fkey` (`moduleId`);

--
-- Indexes for table `Result`
--
ALTER TABLE `Result`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Result_userId_fkey` (`userId`),
  ADD KEY `Result_quizId_fkey` (`quizId`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Certificate`
--
ALTER TABLE `Certificate`
  ADD CONSTRAINT `Certificate_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Certificate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Course`
--
ALTER TABLE `Course`
  ADD CONSTRAINT `Course_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `User` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `Enrollment`
--
ALTER TABLE `Enrollment`
  ADD CONSTRAINT `Enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Enrollment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `Lesson`
--
ALTER TABLE `Lesson`
  ADD CONSTRAINT `Lesson_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Module`
--
ALTER TABLE `Module`
  ADD CONSTRAINT `Module_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Question`
--
ALTER TABLE `Question`
  ADD CONSTRAINT `Question_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Quiz`
--
ALTER TABLE `Quiz`
  ADD CONSTRAINT `Quiz_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Quiz_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Result`
--
ALTER TABLE `Result`
  ADD CONSTRAINT `Result_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Result_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
