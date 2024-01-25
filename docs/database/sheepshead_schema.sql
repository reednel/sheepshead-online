CREATE DATABASE sheepshead;
USE sheepshead;

CREATE TABLE users (
  user_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  password VARCHAR(256) NOT NULL,
  display_name VARCHAR(32),
  games_played INT UNSIGNED DEFAULT 0,
  lifetime_score INT DEFAULT 0,
  private_lifetime_score BOOLEAN DEFAULT FALSE,
  display_city VARCHAR(64),
  display_region VARCHAR(64),
  display_country VARCHAR(64),
  datetime_created DATETIME DEFAULT (now())
);

CREATE TABLE friends (
  user_1_id INT UNSIGNED,
  user_2_id INT UNSIGNED,
  datetime_created DATETIME DEFAULT (now()),
  PRIMARY KEY (user_1_id, user_2_id)
);

CREATE TABLE friend_requests (
  from_user_id INT UNSIGNED,
  to_user_id INT UNSIGNED,
  datetime_created DATETIME DEFAULT (now()),
  PRIMARY KEY (from_user_id, to_user_id)
);

CREATE TABLE games (
  game_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  gamemode_id INT UNSIGNED NOT NULL,
  called_ace TINYINT UNSIGNED,
  good_guys_win BOOLEAN NOT NULL,
  winning_score TINYINT UNSIGNED NOT NULL,
  datetime_created DATETIME DEFAULT (now())
);

CREATE TABLE gamemodes (
  gamemode_id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  gamemode_code VARCHAR(8) UNIQUE NOT NULL,
  player_count TINYINT UNSIGNED NOT NULL,
  blind_size TINYINT UNSIGNED,
  leaster BOOLEAN
);

CREATE TABLE players (
  user_id INT UNSIGNED,
  game_id INT UNSIGNED,
  player_index TINYINT UNSIGNED NOT NULL,
  good_guy BOOLEAN NOT NULL DEFAULT FALSE,
  picker BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, game_id)
);

CREATE TABLE rounds (
  game_id INT UNSIGNED,
  round_id TINYINT UNSIGNED AUTO_INCREMENT,
  round_index TINYINT UNSIGNED NOT NULL,
  winner INT UNSIGNED NOT NULL,
  points_won TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (game_id, round_id)
);

CREATE TABLE turns (
  game_id INT UNSIGNED,
  round_id TINYINT UNSIGNED,
  turn_id TINYINT UNSIGNED AUTO_INCREMENT,
  turn_index TINYINT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  card_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (game_id, round_id, turn_id)
);

CREATE TABLE cards (
  card_id TINYINT UNSIGNED PRIMARY KEY,
  suit CHAR(1) NOT NULL,
  power TINYINT UNSIGNED NOT NULL,
  points TINYINT UNSIGNED NOT NULL
);

ALTER TABLE gamemodes ADD FOREIGN KEY (gamemode_id) REFERENCES games (gamemode_id);

ALTER TABLE cards ADD FOREIGN KEY (card_id) REFERENCES games (called_ace);

ALTER TABLE users ADD FOREIGN KEY (user_id) REFERENCES players (user_id);

ALTER TABLE games ADD FOREIGN KEY (game_id) REFERENCES players (game_id);

ALTER TABLE users ADD FOREIGN KEY (user_id) REFERENCES friends (user_1_id);

ALTER TABLE users ADD FOREIGN KEY (user_id) REFERENCES friends (user_2_id);

ALTER TABLE users ADD FOREIGN KEY (user_id) REFERENCES friend_requests (from_user_id);

ALTER TABLE users ADD FOREIGN KEY (user_id) REFERENCES friend_requests (to_user_id);

ALTER TABLE games ADD FOREIGN KEY (game_id) REFERENCES rounds (game_id);

ALTER TABLE players ADD FOREIGN KEY (user_id) REFERENCES rounds (winner);

ALTER TABLE rounds ADD FOREIGN KEY (game_id) REFERENCES turns (game_id);

ALTER TABLE rounds ADD FOREIGN KEY (round_id) REFERENCES turns (round_id);

ALTER TABLE players ADD FOREIGN KEY (user_id) REFERENCES turns (user_id);

ALTER TABLE cards ADD FOREIGN KEY (card_id) REFERENCES turns (card_id);
