const request = require("supertest");
const app = require("../server");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");

beforeEach(() => seed(data));

afterAll(() => {
  db.end();
});

describe("/api", () => {
  describe("GET", () => {
    test("200: Return hello message", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then((res) => {
          expect(res.body.msg).toBe("Hello");
        });
    });
  });
});

describe("/api/spots/:spot_id", () => {
  describe("GET", () => {
    test("200: Returns spot information", () => {
      return request(app)
        .get("/api/spots/1")
        .expect(200)
        .then(({ body: { spot } }) => {
          expect(typeof spot).toBe("object");
          expect(spot.spot_id).toEqual(expect.any(Number));
          expect(spot.name).toEqual(expect.any(String));
          expect(spot.description).toEqual(expect.any(String));
          expect(spot.longitude).toEqual(expect.any(Number));
          expect(spot.latitude).toEqual(expect.any(Number));
          expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
          expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
          expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
          expect(spot.parking_type).toEqual(expect.any(String));
          expect(spot.upvotes).toEqual(expect.any(Number));
          expect(spot.downvotes).toEqual(expect.any(Number));
          expect(spot.creator).toEqual(expect.any(String));
          expect(spot.created_at).toEqual(expect.any(String));
          expect(spot.isbusy).toEqual(expect.any(Boolean));
          expect(spot.lastchanged).toEqual(expect.any(String));
          expect(spot.images).toEqual(expect.any(String));
        });
    });

    test("404: Returns error for non-existent spot", () => {
      return request(app)
        .get("/api/spots/1000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Spot Not Found");
        });
    });

    test("400: Returns error for bad data type in request", () => {
      return request(app)
        .get("/api/spots/doglord")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });

  describe("DELETE", () => {
    test("204: Returns no content", () => {
      const body = {
        name: "test-delete",
        description: "test",
        longitude: "0",
        latitude: "0",
        creator: "test-1",
        parking_type: "street",
        opening_time: "07:30",
        closing_time: "21:00",
        time_limit: 120,
      };
      return request(app)
        .post("/api/spots")
        .send(body)
        .then(() => {
          return request(app).delete("/api/spots/12").expect(204);
        });
    });

    test("404: Returns error for non-existent spot", () => {
      return request(app)
        .delete("/api/spots/1000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Spot Not Found");
        });
    });

    test("400: Returns error for bad data type in request", () => {
      return request(app)
        .delete("/api/spots/doglord")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });

  describe("PATCH", () => {
    test("200: Returns updated spot when upvotes incremented", () => {
      return request(app)
        .patch("/api/spots/1")
        .send({
          inc_upvotes: 1,
          inc_downvotes: 0,
        })
        .expect(200)
        .then(({ body: { spot } }) => {
          expect(typeof spot).toBe("object");
          expect(spot.spot_id).toEqual(expect.any(Number));
          expect(spot.name).toEqual(expect.any(String));
          expect(spot.description).toEqual(expect.any(String));
          expect(spot.longitude).toEqual(expect.any(Number));
          expect(spot.latitude).toEqual(expect.any(Number));
          expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
          expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
          expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
          expect(spot.parking_type).toEqual(expect.any(String));
          expect(spot.upvotes).toEqual(1);
          expect(spot.downvotes).toEqual(0);
          expect(spot.creator).toEqual(expect.any(String));
          expect(spot.created_at).toEqual(expect.any(String));
          expect(spot.isbusy).toEqual(expect.any(Boolean));
          expect(spot.lastchanged).toEqual(expect.any(String));
        });
    });

    test("200: Returns updated spot when downvotes incremented", () => {
      return request(app)
        .patch("/api/spots/1")
        .send({
          inc_upvotes: 0,
          inc_downvotes: 1,
        })
        .expect(200)
        .then(({ body: { spot } }) => {
          expect(typeof spot).toBe("object");
          expect(spot.spot_id).toEqual(expect.any(Number));
          expect(spot.name).toEqual(expect.any(String));
          expect(spot.description).toEqual(expect.any(String));
          expect(spot.longitude).toEqual(expect.any(Number));
          expect(spot.latitude).toEqual(expect.any(Number));
          expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
          expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
          expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
          expect(spot.parking_type).toEqual(expect.any(String));
          expect(spot.upvotes).toEqual(0);
          expect(spot.downvotes).toEqual(1);
          expect(spot.creator).toEqual(expect.any(String));
          expect(spot.created_at).toEqual(expect.any(String));
          expect(spot.isbusy).toEqual(expect.any(Boolean));
          expect(spot.lastchanged).toEqual(expect.any(String));
        });
    });

    test("400: Returns error if missing required fields", () => {
      return request(app)
        .patch("/api/spots/1")
        .send({
          inc_upvotes: 0,
          inc_downvotes: 0,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing required fields");
        });
    });

    test("400: Returns error if fields are of incorrect type ", () => {
      return request(app)
        .patch("/api/spots/1")
        .send({
          inc_upvotes: "cat",
          inc_downvotes: "dog",
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });

    test("404: Returns error if spot does not exist", () => {
      return request(app)
        .patch("/api/spots/1000")
        .send({
          inc_upvotes: 1,
          inc_downvotes: 0,
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Spot Not Found");
        });
    });

    test("200: ignores irrelevant keys", () => {
      return request(app)
        .patch("/api/spots/1")
        .send({
          inc_upvotes: 0,
          inc_downvotes: 1,
          fish_fingers: 6,
        })
        .expect(200)
        .then(({ body: { spot } }) => {
          expect(typeof spot).toBe("object");
          expect(spot.spot_id).toEqual(expect.any(Number));
          expect(spot.name).toEqual(expect.any(String));
          expect(spot.description).toEqual(expect.any(String));
          expect(spot.longitude).toEqual(expect.any(Number));
          expect(spot.latitude).toEqual(expect.any(Number));
          expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
          expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
          expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
          expect(spot.parking_type).toEqual(expect.any(String));
          expect(spot.upvotes).toEqual(0);
          expect(spot.downvotes).toEqual(1);
          expect(spot.creator).toEqual(expect.any(String));
          expect(spot.created_at).toEqual(expect.any(String));
          expect(spot.isbusy).toEqual(expect.any(Boolean));
          expect(spot.lastchanged).toEqual(expect.any(String));
        });
    });
  });
});

describe("/api/spots", () => {
  describe("GET", () => {
    test("200: Returns list of spots", () => {
      return request(app)
        .get("/api/spots")
        .expect(200)
        .then((res) => {
          expect(res.body.spots.length).toBeLessThanOrEqual(20);
          res.body.spots.forEach((spot) => {
            expect(spot.spot_id).toEqual(expect.any(Number));
            expect(spot.name).toEqual(expect.any(String));
            expect(spot.longitude).toEqual(expect.any(Number));
            expect(spot.latitude).toEqual(expect.any(Number));
            expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
            expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
            expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
            expect(spot.parking_type).toEqual(expect.any(String));
            expect(spot.vote_count).toEqual(expect.any(Number));
          });
        });
    });

    test("200: Returns list of spots filtered by spot type", () => {
      return request(app)
        .get("/api/spots?type=street")
        .expect(200)
        .then((res) => {
          res.body.spots.forEach((spot) => {
            expect(spot.parking_type).toBe("street");
          });
        });
    });

    test("200: Returns list of spots filtered by creator", () => {
      const username = "test-1";
      const output = data.spotData
        .filter((spot) => spot.creator === username)
        .map((spot) => spot.name);
      return request(app)
        .get(`/api/spots?creator=${username}&radius=100`)
        .expect(200)
        .then((res) => {
          res.body.spots.forEach((spot, index) => {
            expect(spot.name).toBeOneOf(output);
          });
          expect(res.body.spots.length).toBe(output.length);
        });
    });

    test("400: Returns error for bad radius", () => {
      return request(app)
        .get("/api/spots?radius=cat")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Query Error");
        });
    });

    test("400: Returns error for bad coords", () => {
      return request(app)
        .get("/api/spots?coords=cat")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad Geometry");
        });
    });

    test("404: User Not Found", () => {
      const username = "IDontExist";
      return request(app)
        .get(`/api/spots?creator=${username}`)
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("User Not Found");
        });
    });
  });

  describe("POST", () => {
    test("201: Returns new spot", () => {
      const body = {
        name: "test",
        description: "test",
        longitude: "0",
        latitude: "0",
        creator: "test-1",
        parking_type: "street",
        opening_time: "07:30",
        closing_time: "21:00",
        time_limit: 120,
      };
      return request(app)
        .post("/api/spots")
        .send(body)
        .expect(201)
        .then((res) => {
          let spot = res.body.spot;
          expect(spot.spot_id).toEqual(expect.any(Number));
          expect(spot.name).toEqual(expect.any(String));
          expect(spot.longitude).toEqual(expect.any(Number));
          expect(spot.latitude).toEqual(expect.any(Number));
          expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
          expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
          expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
          expect(spot.parking_type).toEqual(expect.any(String));
          expect(spot.upvotes).toEqual(expect.any(Number));
          expect(spot.downvotes).toEqual(expect.any(Number));
          expect(spot.creator).toEqual(expect.any(String));
          expect(spot.created_at).toEqual(expect.any(String));
          expect(spot.isbusy).toEqual(expect.any(Boolean));
          expect(spot.lastchanged).toEqual(expect.any(String));
          expect(spot.images).toEqual(expect.any(String));
        });
    });

    test("201: Ignores irrevelent keys", () => {
      const body = {
        name: "test",
        description: "test",
        longitude: "0",
        latitude: "0",
        creator: "test-1",
        parking_type: "street",
        cats: "cats",
      };
      return request(app)
        .post("/api/spots")
        .send(body)
        .expect(201)
        .then((res) => {
          let spot = res.body.spot;
          expect(spot.spot_id).toEqual(expect.any(Number));
          expect(spot.name).toEqual(expect.any(String));
          expect(spot.longitude).toEqual(expect.any(Number));
          expect(spot.latitude).toEqual(expect.any(Number));
          expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
          expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
          expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
          expect(spot.parking_type).toEqual(expect.any(String));
          expect(spot.upvotes).toEqual(expect.any(Number));
          expect(spot.downvotes).toEqual(expect.any(Number));
          expect(spot.creator).toEqual(expect.any(String));
          expect(spot.created_at).toEqual(expect.any(String));
          expect(spot.isbusy).toEqual(expect.any(Boolean));
          expect(spot.lastchanged).toEqual(expect.any(String));
          expect(spot.images).toEqual(expect.any(String));
        });
    });

    test("201: Ignores empty string times", () => {
      const body = {
        name: "test",
        description: "test",
        longitude: "0",
        latitude: "0",
        creator: "test-1",
        parking_type: "street",
        opening_time: "",
        closing_time: "12:00",
      };
      return request(app)
        .post("/api/spots")
        .send(body)
        .expect(201)
        .then((res) => {
          let spot = res.body.spot;
          expect(spot.spot_id).toEqual(expect.any(Number));
          expect(spot.name).toEqual(expect.any(String));
          expect(spot.longitude).toEqual(expect.any(Number));
          expect(spot.latitude).toEqual(expect.any(Number));
          expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
          expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
          expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
          expect(spot.parking_type).toEqual(expect.any(String));
          expect(spot.upvotes).toEqual(expect.any(Number));
          expect(spot.downvotes).toEqual(expect.any(Number));
          expect(spot.creator).toEqual(expect.any(String));
          expect(spot.created_at).toEqual(expect.any(String));
          expect(spot.isbusy).toEqual(expect.any(Boolean));
          expect(spot.lastchanged).toEqual(expect.any(String));
          expect(spot.images).toEqual(expect.any(String));
        });
    });

    test("400: Invalid body from missing keys", () => {
      const body = {
        name: "test",
        description: "test",
        longitude: "0",
        latitude: "0",
      };
      return request(app)
        .post("/api/spots")
        .send(body)
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Body Invalid");
        });
    });

    test("400: Bad Geom from invalid coords", () => {
      const body = {
        name: "test",
        description: "test",
        longitude: "cat",
        latitude: "cat",
        creator: "test-1",
        parking_type: "street",
      };
      return request(app)
        .post("/api/spots")
        .send(body)
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad Geometry");
        });
    });

    test("400: Invalid Body from invalid user", () => {
      const body = {
        name: "test",
        description: "test",
        longitude: "0",
        latitude: "0",
        creator: "test-100",
        parking_type: "street",
      };
      return request(app)
        .post("/api/spots")
        .send(body)
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Body Invalid");
        });
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    test("200: Gets list of users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then((res) => {
          res.body.users.forEach((user) => {
            expect(user.username).toEqual(expect.any(String));
            expect(user.avatar_url).toEqual(expect.any(String));
          });
        });
    });
  });

  describe("POST", () => {
    test("201: Creates new user", () => {
      const body = {
        username: "test-upload-1",
        about: "Hello I am a real human person",
        email: "test@test.test",
      };
      return request(app)
        .post("/api/users")
        .send(body)
        .expect(201)
        .then((res) => {
          const user = res.body.user;
          expect(user.username).toBe(body.username);
          expect(user.about).toBe(body.about);
          expect(user.email).toBe(body.email);
          expect(user.created_at).toEqual(expect.any(String));
          expect(user.avatar_url).toEqual(expect.any(String));
          expect(user.karma).toEqual(expect.any(Number));
        });
    });

    test("201: Ignores other keys", () => {
      const body = {
        username: "test-upload-1",
        about: "Hello I am a real human person",
        email: "test@test.test",
        cat: "cat",
      };
      return request(app)
        .post("/api/users")
        .send(body)
        .expect(201)
        .then((res) => {
          const user = res.body.user;
          expect(user.username).toBe(body.username);
          expect(user.about).toBe(body.about);
          expect(user.email).toBe(body.email);
          expect(user.created_at).toEqual(expect.any(String));
          expect(user.avatar_url).toEqual(expect.any(String));
          expect(user.karma).toEqual(expect.any(Number));
        });
    });

    test("201: Handles missing unneccesary keys", () => {
      const body = {
        username: "test-upload-1",
      };
      return request(app)
        .post("/api/users")
        .send(body)
        .expect(201)
        .then((res) => {
          const user = res.body.user;
          expect(user.username).toBe(body.username);
          expect(user.about).toBeNull();
          expect(user.email).toBeNull();
          expect(user.created_at).toEqual(expect.any(String));
          expect(user.avatar_url).toEqual(expect.any(String));
          expect(user.karma).toEqual(expect.any(Number));
        });
    });

    test("400: Body Invalid when missing required keys", () => {
      const body = {
        about: "Hello I am a real human person",
        email: "test@test.test",
      };
      return request(app)
        .post("/api/users")
        .send(body)
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Body Invalid");
        });
    });

    test("400: Username Invalid if duplicate", () => {
      const body = {
        username: "test-1",
        about: "Hello I am a real human person",
        email: "test@test.test",
      };
      return request(app)
        .post("/api/users")
        .send(body)
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Invalid Key");
        });
    });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    test("200: Returns expected user", () => {
      const username = "test-1";
      const [test] = data.userData.filter((user) => user.username === username);
      return request(app)
        .get(`/api/users/${username}`)
        .expect(200)
        .then((res) => {
          const user = res.body.user;
          expect(user.username).toBe(test.username);
          expect(user.avatar_url).toBe(test.avatar_url);
          expect(user.about).toBe(test.about);
          expect(user.email).toBe(test.email);
          expect(user.karma).toEqual(expect.any(Number));
          expect(user.created_at).toEqual(expect.any(String));
        });
    });

    test("404: User not found", () => {
      const username = "IDontExist";
      return request(app)
        .get(`/api/users/${username}`)
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("User Not Found");
        });
    });
  });
});

describe("/api/spots/:spot_id/comments", () => {
  describe("GET", () => {
    test("200: Returns list of comments", () => {
      return request(app)
        .get("/api/spots/1/comments")
        .expect(200)
        .then((res) => {
          res.body.comments.forEach((comment) => {
            expect(comment.comment_id).toEqual(expect.any(Number));
            expect(comment.author).toEqual(expect.any(String));
            expect(comment.body).toEqual(expect.any(String));
            expect(comment.upvotes).toEqual(expect.any(Number));
            expect(comment.downvotes).toEqual(expect.any(Number));
            expect(comment.created_at).toEqual(expect.any(String));
          });
        });
    });

    test("404: Spot Not Found", () => {
      return request(app)
        .get("/api/spots/100/comments")
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Spot Not Found");
        });
    });

    test("400: Spot Not Found", () => {
      return request(app)
        .get("/api/spots/cat/comments")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad Request");
        });
    });
  });

  describe("POST", () => {
    test("201: Returns list of comments", () => {
      const test = {
        author: "test-1",
        body: "This is a test",
      };
      return request(app)
        .post("/api/spots/1/comments")
        .send(test)
        .expect(201)
        .then((res) => {
          const comment = res.body.comment;
          expect(comment.comment_id).toEqual(expect.any(Number));
          expect(comment.author).toEqual(test.author);
          expect(comment.body).toEqual(test.body);
          expect(comment.upvotes).toEqual(expect.any(Number));
          expect(comment.downvotes).toEqual(expect.any(Number));
          expect(comment.created_at).toEqual(expect.any(String));
        });
    });

    test("201: Ignores irrelevent keys", () => {
      const test = {
        author: "test-1",
        body: "This is a test",
        cat: "cat",
      };
      return request(app)
        .post("/api/spots/1/comments")
        .send(test)
        .expect(201)
        .then((res) => {
          const comment = res.body.comment;
          expect(comment.comment_id).toEqual(expect.any(Number));
          expect(comment.author).toEqual(test.author);
          expect(comment.body).toEqual(test.body);
          expect(comment.upvotes).toEqual(expect.any(Number));
          expect(comment.downvotes).toEqual(expect.any(Number));
          expect(comment.created_at).toEqual(expect.any(String));
        });
    });

    test("400: Body Invalid by missing required key", () => {
      const test = {
        author: "test-1",
      };
      return request(app)
        .post("/api/spots/1/comments")
        .send(test)
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Body Invalid");
        });
    });

    test("400: Body Invalid by invalid user", () => {
      const test = {
        author: "test-100",
        body: "This is a test",
      };
      return request(app)
        .post("/api/spots/1/comments")
        .send(test)
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Body Invalid");
        });
    });

    test("400: Spot ID Invalid", () => {
      const test = {
        author: "test-1",
        body: "This is a test",
      };
      return request(app)
        .post("/api/spots/cat/comments")
        .send(test)
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad Request");
        });
    });

    test("404: Spot ID Not Found", () => {
      const test = {
        author: "test-1",
        body: "This is a test",
      };
      return request(app)
        .post("/api/spots/100/comments")
        .send(test)
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Spot Not Found");
        });
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("204: Deletes comment by id", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });

    test("404: Comment Not Found", () => {
      return request(app)
        .delete("/api/comments/100")
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Comment Not Found");
        });
    });

    test("400: Id Invalid", () => {
      return request(app)
        .delete("/api/comments/cat")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad Request");
        });
    });
  });

  describe("PATCH", () => {
    test("200: Returns updated comment", () => {
      const test = {
        inc_upvotes: 5,
        inc_downvotes: 12,
      };
      return request(app)
        .patch("/api/comments/1")
        .send(test)
        .expect(200)
        .then((res) => {
          expect(res.body.comment.upvotes).toBe(5);
          expect(res.body.comment.downvotes).toBe(12);
        });
    });

    test("200: Accepts only upvotes", () => {
      const test = {
        inc_upvotes: 5,
      };
      return request(app)
        .patch("/api/comments/1")
        .send(test)
        .expect(200)
        .then((res) => {
          expect(res.body.comment.upvotes).toBe(5);
          expect(res.body.comment.downvotes).toBe(0);
        });
    });

    test("200: Accepts only downvotes", () => {
      const test = {
        inc_downvotes: 12,
      };
      return request(app)
        .patch("/api/comments/1")
        .send(test)
        .expect(200)
        .then((res) => {
          expect(res.body.comment.upvotes).toBe(0);
          expect(res.body.comment.downvotes).toBe(12);
        });
    });

    test("200: Ignores irrelevent keys", () => {
      const test = {
        inc_upvotes: 5,
        inc_downvotes: 12,
        cat: "cat",
      };
      return request(app)
        .patch("/api/comments/1")
        .send(test)
        .expect(200)
        .then((res) => {
          expect(res.body.comment.upvotes).toBe(5);
          expect(res.body.comment.downvotes).toBe(12);
        });
    });

    test("404: Comment Id Not Found", () => {
      const test = {
        inc_upvotes: 5,
        inc_downvotes: 12,
      };
      return request(app)
        .patch("/api/comments/100")
        .send(test)
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Comment Not Found");
        });
    });

    test("400: Id Invalid", () => {
      const test = {
        inc_upvotes: 5,
        inc_downvotes: 12,
      };
      return request(app)
        .patch("/api/comments/cat")
        .send(test)
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad Request");
        });
    });

    test("400: Body Invalid", () => {
      const test = {
        cat: "cat",
      };
      return request(app)
        .patch("/api/comments/1")
        .send(test)
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Body Invalid");
        });
    });
  });
});

describe("/api/comments", () => {
  describe("GET", () => {
    test("200: Returns list of comments", () => {
      return request(app)
        .get("/api/comments")
        .expect(200)
        .then((res) => {
          res.body.comments.forEach((comment) => {
            expect(comment.body).toEqual(expect.any(String));
            expect(comment.author).toEqual(expect.any(String));
            expect(comment.created_at).toEqual(expect.any(String));
            expect(comment.comment_id).toEqual(expect.any(Number));
            expect(comment.spot_id).toEqual(expect.any(Number));
            expect(comment.vote_count).toEqual(expect.any(Number));
          });
        });
    });

    test("200: Filters By author", () => {
      return request(app)
        .get("/api/comments?author=test-1")
        .expect(200)
        .then((res) => {
          res.body.comments.forEach((comment) => {
            expect(comment.body).toEqual(expect.any(String));
            expect(comment.author).toEqual("test-1");
            expect(comment.created_at).toEqual(expect.any(String));
            expect(comment.comment_id).toEqual(expect.any(Number));
            expect(comment.spot_id).toEqual(expect.any(Number));
            expect(comment.vote_count).toEqual(expect.any(Number));
          });
        });
    });

    test("404: Author Not Found", () => {
      return request(app)
        .get("/api/comments?author=test-100")
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Author Not Found");
        });
    });

    test("400: Order invalid", () => {
      return request(app)
        .get("/api/comments?order=cat")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad Query");
        });
    });

    test("400: sort_by invalid", () => {
      return request(app)
        .get("/api/comments?sort_by=cat")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad Query");
        });
    });
  });
});

describe("/api/users/:username/favourites", () => {
  describe("GET", () => {
    test("200: Returns list of spots", () => {
      return request(app)
        .get("/api/users/test-1/favourites")
        .expect(200)
        .then((res) => {
          expect(res.body.spots.length).toBeLessThanOrEqual(20);
          res.body.spots.forEach((spot) => {
            expect(spot.spot_id).toEqual(expect.any(Number));
            expect(spot.name).toEqual(expect.any(String));
            expect(spot.longitude).toEqual(expect.any(Number));
            expect(spot.latitude).toEqual(expect.any(Number));
            expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
            expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
            expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
            expect(spot.parking_type).toEqual(expect.any(String));
            expect(spot.vote_count).toEqual(expect.any(Number));
          });
        });
    });

    test("404: User not Found", () => {
      return request(app)
        .get("/api/users/cat/favourites")
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("User Not Found");
        });
    });
  });

  describe("POST", () => {
    test("201: Returns new favourite spot", () => {
      return request(app)
        .post("/api/users/test-1/favourites")
        .send({ spot_id: 9 })
        .expect(201)
        .then(({ body: { spot } }) => {
          expect(typeof spot).toBe("object");
          expect(spot.spot_id).toEqual(expect.any(Number));
          expect(spot.name).toEqual(expect.any(String));
          expect(spot.description).toEqual(expect.any(String));
          expect(spot.longitude).toEqual(expect.any(Number));
          expect(spot.latitude).toEqual(expect.any(Number));
          expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
          expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
          expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
          expect(spot.parking_type).toEqual(expect.any(String));
          expect(spot.upvotes).toEqual(expect.any(Number));
          expect(spot.downvotes).toEqual(expect.any(Number));
          expect(spot.creator).toEqual(expect.any(String));
          expect(spot.created_at).toEqual(expect.any(String));
          expect(spot.isbusy).toEqual(expect.any(Boolean));
          expect(spot.lastchanged).toEqual(expect.any(String));
        });
    });

    test("201: Ignores Irrelevent Keys", () => {
      return request(app)
        .post("/api/users/test-1/favourites")
        .send({ spot_id: 9, cats: "cats" })
        .expect(201)
        .then(({ body: { spot } }) => {
          expect(typeof spot).toBe("object");
          expect(spot.spot_id).toEqual(expect.any(Number));
          expect(spot.name).toEqual(expect.any(String));
          expect(spot.description).toEqual(expect.any(String));
          expect(spot.longitude).toEqual(expect.any(Number));
          expect(spot.latitude).toEqual(expect.any(Number));
          expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
          expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
          expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
          expect(spot.parking_type).toEqual(expect.any(String));
          expect(spot.upvotes).toEqual(expect.any(Number));
          expect(spot.downvotes).toEqual(expect.any(Number));
          expect(spot.creator).toEqual(expect.any(String));
          expect(spot.created_at).toEqual(expect.any(String));
          expect(spot.isbusy).toEqual(expect.any(Boolean));
          expect(spot.lastchanged).toEqual(expect.any(String));
        });
    });

    test("404: User Not Found", () => {
      return request(app)
        .post("/api/users/test-100/favourites")
        .send({ spot_id: 9 })
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("User Not Found");
        });
    });

    test("404: Spot Not Found", () => {
      return request(app)
        .post("/api/users/test-1/favourites")
        .send({ spot_id: 100 })
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("ID Not Found");
        });
    });

    test("400: Spot Invalid Type", () => {
      return request(app)
        .post("/api/users/test-100/favourites")
        .send({ spot_id: "cat" })
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad Request");
        });
    });

    test("400: Body Missing Key", () => {
      return request(app)
        .post("/api/users/test-100/favourites")
        .send({ cat: "cat" })
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Body Invalid");
        });
    });
  });
});

describe("/api/favourites/:favourite_id", () => {
  describe("DELETE", () => {
    test("204: Removes favourite", () => {
      return request(app).delete("/api/favourites/1").expect(204);
    });

    test("404: Favourite ID not found", () => {
      return request(app)
        .delete("/api/favourites/100")
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("ID Not Found");
        });
    });
  });
});
