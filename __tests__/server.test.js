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
            expect(spot.coords).toEqual(expect.any(String));
            expect(spot.opening_time).toBeOneOf([expect.any(String), null]);
            expect(spot.closing_time).toBeOneOf([expect.any(String), null]);
            expect(spot.time_limit).toBeOneOf([expect.any(Number), null]);
            expect(spot.parking_type).toEqual(expect.any(String));
            expect(spot.votes).toEqual(expect.any(Number));
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
  });

  describe("POST", () => {
    test("201: Returns new spot", () => {
      const body = {
        name: "test",
        description: "test",
        coords: "0,0",
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
          expect(spot.coords).toEqual(expect.any(String));
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
          expect(spot.images).toEqual(expect.any(Array));
        });
    });

    test("201: Ignores irrevelent keys", () => {
      const body = {
        name: "test",
        description: "test",
        coords: "0,0",
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
          expect(spot.coords).toEqual(expect.any(String));
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
          expect(spot.images).toEqual(expect.any(Array));
        });
    });

    test("400: Invalid body from missing keys", () => {
      const body = {
        name: "test",
        description: "test",
        coords: "0,0",
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
        coords: "cat",
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
        coords: "0,0",
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
