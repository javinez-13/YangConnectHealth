-- Insert sample providers
INSERT INTO providers (first_name, last_name, specialty, bio, email, phone) VALUES
('Sarah', 'Johnson', 'Cardiology', 'Dr. Johnson has over 15 years of experience in cardiovascular medicine.', 'sarah.johnson@healthcare.com', '555-0101'),
('Michael', 'Chen', 'Pediatrics', 'Dr. Chen specializes in pediatric care and child development.', 'michael.chen@healthcare.com', '555-0102'),
('Emily', 'Rodriguez', 'Dermatology', 'Dr. Rodriguez is board-certified in dermatology with expertise in skin conditions.', 'emily.rodriguez@healthcare.com', '555-0103'),
('David', 'Kim', 'Primary Care', 'Dr. Kim provides comprehensive primary care services.', 'david.kim@healthcare.com', '555-0104'),
('Lisa', 'Anderson', 'OB/GYN', 'Dr. Anderson specializes in women''s health and obstetrics.', 'lisa.anderson@healthcare.com', '555-0105')
ON CONFLICT DO NOTHING;

-- Insert sample facilities
INSERT INTO facilities (name, address, phone, hours, latitude, longitude) VALUES
('Main Medical Center', '123 Healthcare Blvd, City, State 12345', '555-1000', 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM', 40.7128, -74.0060),
('Northside Clinic', '456 Wellness Ave, City, State 12345', '555-1001', 'Mon-Fri: 9AM-5PM', 40.7589, -73.9851),
('Downtown Health Hub', '789 Care Street, City, State 12345', '555-1002', 'Mon-Fri: 7AM-7PM', 40.7505, -73.9934)
ON CONFLICT DO NOTHING;

-- Link providers to facilities
INSERT INTO provider_facilities (provider_id, facility_id) VALUES
(1, 1), (1, 2),
(2, 1), (2, 3),
(3, 2),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 3)
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, event_date, event_time, event_type, location, online_link, capacity) VALUES
('Diabetes Management Workshop', 'Learn about managing diabetes through diet and lifestyle changes.', CURRENT_DATE + INTERVAL '7 days', '10:00:00', 'class', 'Main Medical Center - Conference Room A', NULL, 30),
('Flu Shot Clinic', 'Free flu vaccinations for all patients. Walk-ins welcome.', CURRENT_DATE + INTERVAL '3 days', '09:00:00', 'screening', 'Northside Clinic', NULL, 100),
('Heart Health Webinar', 'Understanding cardiovascular health and prevention strategies.', CURRENT_DATE + INTERVAL '14 days', '18:00:00', 'webinar', NULL, 'https://zoom.us/webinar/example', 200),
('Prenatal Yoga Class', 'Gentle yoga for expecting mothers. All trimesters welcome.', CURRENT_DATE + INTERVAL '5 days', '11:00:00', 'class', 'Downtown Health Hub - Wellness Room', NULL, 15),
('Blood Pressure Screening', 'Free blood pressure checks and health consultations.', CURRENT_DATE + INTERVAL '10 days', '13:00:00', 'screening', 'Main Medical Center - Lobby', NULL, 50)
ON CONFLICT DO NOTHING;

