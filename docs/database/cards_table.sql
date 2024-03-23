INSERT INTO cards
  (card_id, suit, power, points)
VALUES
  ('QC', 'T', 14, 3),
  ('QS', 'T', 13, 3),
  ('QH', 'T', 12, 3),
  ('QD', 'T', 11, 3),
  ('JC', 'T', 10, 2),
  ('JS', 'T', 9, 2),
  ('JH', 'T', 8, 2),
  ('JD', 'T', 7, 2),
  ('AD', 'T', 6, 11),
  ('XD', 'T', 5, 10),
  ('KD', 'T', 4, 4),
  ('9D', 'T', 3, 0),
  ('8D', 'T', 2, 0),
  ('7D', 'T', 1, 0),
  ('AC', 'C', 6, 11),
  ('XC', 'C', 5, 10),
  ('KC', 'C', 4, 4),
  ('9C', 'C', 3, 0),
  ('8C', 'C', 2, 0),
  ('7C', 'C', 1, 0),
  ('AS', 'S', 6, 11),
  ('XS', 'S', 5, 10),
  ('KS', 'S', 4, 4),
  ('9S', 'S', 3, 0),
  ('8S', 'S', 2, 0),
  ('7S', 'S', 1, 0),
  ('AH', 'H', 6, 11),
  ('XH', 'H', 5, 10),
  ('KH', 'H', 4, 4),
  ('9H', 'H', 3, 0),
  ('8H', 'H', 2, 0),
  ('7H', 'H', 1, 0);

-- Make this table read-only for the webapp
REVOKE ALL PRIVILEGES ON cards FROM user_webapp;
GRANT SELECT ON cards TO user_webapp;