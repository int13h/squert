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

CREATE TABLE IF NOT EXISTS iprep
(
  id		TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  list		VARCHAR(255),
  url		VARCHAR(255),
  weight	TINYINT(1) NOT NULL DEFAULT 0,
  user		VARCHAR(255),
  age           TIMESTAMP,		
  PRIMARY KEY (id)
);
