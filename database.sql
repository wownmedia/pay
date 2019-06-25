#Setup the following tables in your database
#Currently the system uses a table like users per bridgechain, that will change as soon as it is confirmed all is stable.

CREATE TABLE IF NOT EXISTS users (
  username varchar(30) NOT NULL,
  address varchar(34) NOT NULL,
  seed text NOT NULL,
  platform varchar(8) NOT NULL,
  token varchar(6) NOT NULL,
  PRIMARY KEY(username, platform, token)
);

CREATE TABLE IF NOT EXISTS submissions (
  submission varchar(32) PRIMARY KEY
);
