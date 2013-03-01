CREATE TABLE IF NOT EXISTS ip2c
(
  registry	VARCHAR(7),
  cc		VARCHAR(2),
  c_long	VARCHAR(255),
  type		VARCHAR(4),
  start_ip	INT UNSIGNED NOT NULL DEFAULT 0,
  end_ip	INT UNSIGNED NOT NULL DEFAULT 0,
  date		DATETIME,
  status	VARCHAR(25),
  INDEX registry (registry),
  INDEX cc (cc),
  INDEX c_long (c_long),
  INDEX type (type),
  INDEX start_ip (start_ip),
  INDEX end_ip (end_ip)
);  

INSERT IGNORE INTO ip2c (registry,cc,c_long,type,start_ip,end_ip,date,status)
VALUES ('RFC1918','LO','RFC1918','ipv4','167772160','184549375','1996-02-01','allocated');

INSERT IGNORE INTO ip2c (registry,cc,c_long,type,start_ip,end_ip,date,status)
VALUES ('RFC1918','LO','RFC1918','ipv4','2886729728','2886795263','1996-02-01','allocated');

INSERT IGNORE INTO ip2c (registry,cc,c_long,type,start_ip,end_ip,date,status)
VALUES ('RFC1918','LO','RFC1918','ipv4','3232235520','3232301055','1996-02-01','allocated');

CREATE TABLE IF NOT EXISTS mappings
(
  registry       VARCHAR(7),
  cc             VARCHAR(2),
  c_long         VARCHAR(255),
  type           VARCHAR(4),
  ip             INT UNSIGNED NOT NULL DEFAULT 0,
  date           DATETIME,
  status         VARCHAR(25),
  age            TIMESTAMP,
  PRIMARY KEY (ip),
  INDEX registry (registry),
  INDEX cc (cc),
  INDEX c_long (c_long),
  INDEX age (age)
);

ALTER TABLE user_info
ADD email VARCHAR(320) NOT NULL DEFAULT 'none',
ADD type ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
ADD timeout SMALLINT UNSIGNED NOT NULL DEFAULT '5000';

CREATE TABLE IF NOT EXISTS filters
(
  name           VARCHAR(255),
  alias		 VARCHAR(8),
  username       VARCHAR(16),
  filter         BLOB,
  notes		 VARCHAR(255) NOT NULL DEFAULT 'None.',
  global	 TINYINT(1) NOT NULL DEFAULT 0,
  age            TIMESTAMP,
  PRIMARY KEY (username,alias)
);
