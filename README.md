# wePark Backend

## [Live Backend](https://wepark-be.herokuapp.com/api)

## [Front End Repo](https://github.com/jakewilliams33/wePark-fe)

This is a backend for wePark - our free parking finder app. It was built using `PostgreSQL v12` and `Node.JS v18` along with the packeges included in the `package.json` file and `PostGIS v3`. To be able to run this repo all of those packages will need to be installed, it may work on earlier versions of the stated packages but this cannot be guaranteed. To ensure cloning this repo succeeds please make sure that you have at minimum the versions of `PSQL`, `Node`, and `PostGIS` and then run `npm install` to install the required packages.

The current live version of this repo is hosted using Heroku. [Heroku's Guides](https://devcenter.heroku.com/articles/getting-started-with-nodejs) are very helpful for setting up your own version.

To run the database when working on this repo you will need 2 environment variable files; `.env.test` and `.env.development` the format for which can be found in the `.env-pg-backup` file. You will also need to set up an [AWS S3 Bucket](https://s3.console.aws.amazon.com/s3/) and the information for that will also need to have data stored in a file called `.env.aws_config` with the format given in `.env-aws-example`.

## Endpoints

### /api/

#### GET

Returns a JSON file listing all available endpoints.

### /api/spots

#### GET

Delivers a json object listing up to 200 spots withing the location given. Can take multiple queries such as `coords` - a spot to centre the response from, `radius` - the distance from the `coord` to search within, `type` - filters by the type of parking, `creator` - filters by creator, and `area` - a series of co-ordinates to create a polygon.

#### POST

Takes a multipart form to create a new spot. Takes a body of multiple keys including `name`_ - name of the spot, `description` - longer description of the location, `longitude`_ - longitude of the spot, `latitude`_ - latitude of the spot, `creator`_ - creator of the spot and references a user from the db, `parking_type`\* - gives a type of parking, `opening_time` - opening time of the spot, `closing_time` - closing time of the spot, `time_limit` - time limit of staying at the spot, and `images` - a series of image file blobs to be uploaded.

### /api/spots/random

#### GET

Delivers a json object containing a single spot pulled at random from spots that have the best engagement and info.

### /api/spots/:spot_id

#### GET

Delivers a json object for the spot given.

#### DELETE

Deletes the spot given.

#### PATCH

Creates a new spot with the info given and returns that new spot.

### /api/spots/:spot_id/data

#### GET

Delviers a json object on the usage of the spot given.

### /api/spots/:spot_id/comments

#### GET

Delivers a json object that lists the comments linked to the given spot.

#### POST

Creates a new comment with the info given and returns the new comment.

### /api/comments

#### GET

Delivers a json object listing all comments.

### /api/comments/:comment_id

#### DELETE

Deletes the comment given.

#### PATCH

Takes upvotes and downvotes to update the votes on the given comment.

### /api/users

#### GET

Delivers a json object listing all users.

#### POST

Created a new user with the info given and returns the user.

### /api/users/:username

#### GET

Deilvers a json object giving information about the given user.

#### PATCH

Updated the user with the given info

#### POST

Operates similar to the GET request but also takes a body containing a password and only returns the details if the password is correct.

### /api/users/:username/favourites

#### GET

Delivers a json object listing all spots that are linked to the given user in the favourites table.

#### POST

Adds the given spot to the favourites list and returns the spot.

### /api/users/:username/favourites/:spot_id

#### DELETE

Removes the link between the given username and spot in the favourites table.

### /api/favourites/:favourite_id

#### DELETE

Removes the link defined by the unique id in the favourites table.

## Available Scripts

There are some scripts within the `package.json` file that will help with setting up the required databases, testing any modifications, and running your own production version.
