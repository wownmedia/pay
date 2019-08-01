#Setup the following tables in your database

CREATE TABLE IF NOT EXISTS users (
  username varchar(30) NOT NULL,
  address varchar(34) NOT NULL,
  seed text NOT NULL,
  platform varchar(8) NOT NULL,
  token varchar(6) NOT NULL,
  PRIMARY KEY(username, platform, token)
);

CREATE TABLE IF NOT EXISTS submissions (
  submission varchar(32) PRIMARY KEY,
  public_key varchar(66),
  signature varchar
);

CREATE TABLE IF NOT EXISTS platforms (
  platform varchar(30) PRIMARY KEY,
  address varchar(34) NOT NULL
);
