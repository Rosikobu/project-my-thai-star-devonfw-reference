INSERT INTO UserRole(id, modificationCounter, name, active) VALUES (0, 1, 'Customer', true);
INSERT INTO UserRole(id, modificationCounter, name, active) VALUES (1, 1, 'Waiter', true);
INSERT INTO UserRole(id, modificationCounter, name, active) VALUES (2, 1, 'Manager', true);
INSERT INTO UserRole(id, modificationCounter, name, active) VALUES (3, 1, 'Admin', true);

INSERT INTO User(id, modificationCounter, username, password, twoFactorStatus, email, idRole) VALUES (0, 1, 'norbert', '{bcrypt}$2a$10$qPM1WjcRKAffHxWXYEfPJOh2vGPlT/Fdv.hJX/LaZjzg/Wtj2csqO', false, 'norbert-roemer@gmx.net', 0);
INSERT INTO User(id, modificationCounter, username, password, twoFactorStatus, email, idRole) VALUES (4, 1, 'emma', '{bcrypt}$2a$10$qPM1WjcRKAffHxWXYEfPJOh2vGPlT/Fdv.hJX/LaZjzg/Wtj2csqO', false, 'emma-maier@gmx.net', 0);
INSERT INTO User(id, modificationCounter, username, password, twoFactorStatus, email, idRole) VALUES (1, 1, 'alex.r', '{bcrypt}$2a$10$1CAKyUHbX6RJqT5cUP6/aOMTIlYYvGIO/a3Dt/erbYKKgmbgJMGsG', false, 'alex-rodriguez@gmx.net', 1);
INSERT INTO User(id, modificationCounter, username, password, twoFactorStatus, email, idRole) VALUES (2, 1, 'tilo.p', '{bcrypt}$2a$10$IsTlZemkiPKE2gjtnSMlJOX5.uitNHXNRpLYyvyxNbHEhjpY.XdTq', false, 'tilo-pade@gmx.net', 2);
INSERT INTO User(id, modificationCounter, username, password, twoFactorStatus, email, idRole) VALUES (3, 1, 'manfred.m', '{bcrypt}$2a$10$dGGXbvbs5/vg/Xf.KEzikekrePUxyDilEJ6TsVIao9elLHosNT/yq', false, 'manfred-muehe@gmx.net', 3);
INSERT INTO User(id, modificationCounter, username, password, twoFactorStatus, email, idRole) VALUES (999, 1, 'UnregisteredUser', '{bcrypt}$2a$10$qPM1WjcRKAffHxWXYEfPJOh2vGPlT/Fdv.hJX/LaZjzg/Wtj2csqO', false, 'anonym@mail.com', 0);

INSERT INTO "Table"(id, modificationCounter, seatsNumber) VALUES (0, 1, 4);
INSERT INTO "Table"(id, modificationCounter, seatsNumber) VALUES (1, 1, 4);
INSERT INTO "Table"(id, modificationCounter, seatsNumber) VALUES (2, 1, 4);
INSERT INTO "Table"(id, modificationCounter, seatsNumber) VALUES (3, 1, 4);
INSERT INTO "Table"(id, modificationCounter, seatsNumber) VALUES (4, 1, 6);
INSERT INTO "Table"(id, modificationCounter, seatsNumber) VALUES (5, 1, 6);
INSERT INTO "Table"(id, modificationCounter, seatsNumber) VALUES (6, 1, 6);
INSERT INTO "Table"(id, modificationCounter, seatsNumber) VALUES (7, 1, 8);
INSERT INTO "Table"(id, modificationCounter, seatsNumber) VALUES (8, 1, 8);



-- Common Booking with already created orders
INSERT INTO Booking(id, modificationCounter, idUser, name, bookingToken, comment, email, bookingDate, expirationDate, creationDate, canceled, delivery, bookingType, idTable, idOrder, assistants) VALUES(0, 1, 0, 'norbert', 'CB_20170509_123502555Z', 'Booking Type CSR', 'norbert-roemer@gmx.net', DATEADD('DAY', 5, CURRENT_TIMESTAMP), DATEADD('DAY', 5, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)), CURRENT_TIMESTAMP, false, false, 0, 0, 0, 3);
INSERT INTO Booking(id, modificationCounter, idUser, name, bookingToken, comment, email, bookingDate, expirationDate, creationDate, canceled, delivery, bookingType, idTable, idOrder, assistants) VALUES(1, 1, 0, 'marvin', 'CB_20170510_123502575Z', 'Booking Type GSR', 'user1@mail.com', DATEADD('DAY', 5, CURRENT_TIMESTAMP), DATEADD('DAY', 5, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)), CURRENT_TIMESTAMP, false, false, 1, 1, 1, null);
-- Common Booking without orders
INSERT INTO Booking(id, modificationCounter, idUser, name, bookingToken, comment, email, bookingDate, expirationDate, creationDate, canceled, delivery, bookingType, idTable, idOrder, assistants) VALUES(2, 1, 0, 'emma', 'CB_20170510_123502595Z', 'Booking Type GSR', 'emma-maier@gmx.net', '2021-06-23 14:10:37.74471', DATEADD('DAY', 5, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)), '2021-06-22 14:37:37.74471', false, false, 0, 2, null, 5);

-- Guest Booking
INSERT INTO Booking(id, modificationCounter, idUser, name, bookingToken, comment, email, bookingDate, expirationDate, creationDate, canceled, delivery, bookingType, idTable, idOrder) VALUES(3, 1, 0, 'anja', 'CB_20170510_123502655Z', 'Booking Type GSR', 'host1@mail.com', DATEADD('DAY', 6, CURRENT_TIMESTAMP), DATEADD('DAY', 6, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)), CURRENT_TIMESTAMP, false, false, 1, 3, null);
-- guests for booking with id 3
INSERT INTO InvitedGuest(id, modificationCounter, idBooking, guestToken, email, accepted, modificationDate) VALUES(0, 1, 3, 'GB_20170510_02350266501Z', 'guest0@mail.com', true, DATEADD('DAY', 5, CURRENT_TIMESTAMP));
INSERT INTO InvitedGuest(id, modificationCounter, idBooking, guestToken, email, accepted, modificationDate) VALUES(1, 1, 3, 'GB_20170510_12350266501Z', 'guest1@mail.com', true, DATEADD('DAY', 5, CURRENT_TIMESTAMP));
INSERT INTO InvitedGuest(id, modificationCounter, idBooking, guestToken, email, accepted, modificationDate) VALUES(2, 1, 3, 'GB_20170510_22350266501Z', 'guest2@mail.com', false, DATEADD('DAY', 5, CURRENT_TIMESTAMP));
INSERT INTO InvitedGuest(id, modificationCounter, idBooking, guestToken, email, accepted, modificationDate) VALUES(3, 1, 3, 'GB_20170510_32350266501Z', 'guest3@mail.com', true, DATEADD('DAY', 5, CURRENT_TIMESTAMP));
INSERT INTO InvitedGuest(id, modificationCounter, idBooking, guestToken, email, accepted, modificationDate) VALUES(4, 1, 3, 'GB_20170510_42350266501Z', 'guest4@mail.com', false, DATEADD('DAY', 5, CURRENT_TIMESTAMP));

---- Guest Booking
INSERT INTO Booking(id, modificationCounter, idUser, name, bookingToken, comment, email, bookingDate, expirationDate, creationDate, canceled, delivery, bookingType, idTable, idOrder) VALUES(4, 1, 0, 'hubert', 'CB_20170510_123503600Z', 'Booking Type GSR', 'host1@mail.com', DATEADD('DAY', 7, CURRENT_TIMESTAMP), DATEADD('DAY', 7, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)), CURRENT_TIMESTAMP, false, false, 1, 3, null);
---- guests for booking with id 4
INSERT INTO InvitedGuest(id, modificationCounter, idBooking, guestToken, email, accepted, modificationDate) VALUES(5, 1, 4, 'GB_20170510_52350266501Z', 'guest5@mail.com', true, DATEADD('DAY', 5, CURRENT_TIMESTAMP));
INSERT INTO InvitedGuest(id, modificationCounter, idBooking, guestToken, email, accepted, modificationDate) VALUES(6, 1, 4, 'GB_20170510_62350266501Z', 'guest6@mail.com', false, DATEADD('DAY', 5, CURRENT_TIMESTAMP));
INSERT INTO InvitedGuest(id, modificationCounter, idBooking, guestToken, email, accepted, modificationDate) VALUES(7, 1, 4, 'GB_20170510_72350266501Z', 'guest7@mail.com', true, DATEADD('DAY', 5, CURRENT_TIMESTAMP));
INSERT INTO InvitedGuest(id, modificationCounter, idBooking, guestToken, email, accepted, modificationDate) VALUES(8, 1, 4, 'GB_20170510_82350266501Z', 'guest0@mail.com', true, DATEADD('DAY', 5, CURRENT_TIMESTAMP));
INSERT INTO InvitedGuest(id, modificationCounter, idBooking, guestToken, email, accepted, modificationDate) VALUES(9, 1, 4, 'GB_20170510_92350266501Z', 'guest1@mail.com', false, DATEADD('DAY', 5, CURRENT_TIMESTAMP));
