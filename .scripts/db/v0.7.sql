ALTER TABLE user_info
ADD password VARCHAR(42),
ADD email VARCHAR(320) NOT NULL DEFAULT 'none',
ADD type ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
ADD timeout SMALLINT UNSIGNED NOT NULL DEFAULT '1200';
INSERT INTO user_info (username, password, type) VALUES ('squert', 'JDe87cda7f862e379884e035b22c1ace78b0acdfcc', 'ADMIN');
