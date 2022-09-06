DROP DATABASE IF EXISTS wepark_test;
DROP DATABASE IF EXISTS wepark;

CREATE DATABASE wepark_test;
CREATE DATABASE wepark;

\c wepark_test
CREATE EXTENSION postgis;
\c wepark
CREATE EXTENSION postgis;