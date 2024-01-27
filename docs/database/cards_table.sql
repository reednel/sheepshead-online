INSERT INTO cards
  (card_id, suit, power, points)
VALUES
  (1, 'T', 14, 3),
  (2, 'T', 13, 3),
  (3, 'T', 12, 3),
  (4, 'T', 11, 3),
  (5, 'T', 10, 2),
  (6, 'T', 9, 2),
  (7, 'T', 8, 2),
  (8, 'T', 7, 2),
  (9, 'T', 6, 11),
  (10, 'T', 5, 10),
  (11, 'T', 4, 4),
  (12, 'T', 3, 0),
  (13, 'T', 2, 0),
  (14, 'T', 1, 0),
  (15, 'C', 6, 11),
  (16, 'C', 5, 10),
  (17, 'C', 4, 4),
  (18, 'C', 3, 0),
  (19, 'C', 2, 0),
  (20, 'C', 1, 0),
  (21, 'S', 6, 11),
  (22, 'S', 5, 10),
  (23, 'S', 4, 4),
  (24, 'S', 3, 0),
  (25, 'S', 2, 0),
  (26, 'S', 1, 0),
  (27, 'H', 6, 11),
  (28, 'H', 5, 10),
  (29, 'H', 4, 4),
  (30, 'H', 3, 0),
  (31, 'H', 2, 0),
  (32, 'H', 1, 0);

-- Make this table read-only for the webapp
REVOKE ALL PRIVILEGES ON cards FROM user_webapp;
GRANT SELECT ON cards TO user_webapp;