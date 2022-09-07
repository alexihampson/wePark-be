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
        .get('/api/spots/1')
        .expect(200)
        .then(({ body }) => {
          expect(typeof body).toBe("object"); 
          expect(body.spot_id).toEqual(expect.any(Number)); 
          expect(body.name).toEqual(expect.any(String)); 
          expect(body.description).toEqual(expect.any(String)); 
          expect(body.coords).toEqual(expect.any(String)); 
          expect(body.opening_time).toBeOneOf([expect.any(String), null]); 
          expect(body.closing_time).toBeOneOf([expect.any(String), null]); 
          expect(body.time_limit).toBeOneOf([expect.any(Number), null]); 
          expect(body.parking_type).toEqual(expect.any(String)); 
          expect(body.upvotes).toEqual(expect.any(Number)); 
          expect(body.downvotes).toEqual(expect.any(Number)); 
          expect(body.creator).toEqual(expect.any(String)); 
          expect(body.created_at).toEqual(expect.any(String)); 
          expect(body.isbusy).toEqual(expect.any(Boolean)); 
          expect(body.lastchanged).toEqual(expect.any(String)); 
          expect(body.images).toEqual(expect.any(String)); 
        })
      });

      test('404: Returns error for non-existent spot', () => {
        return request(app)
        .get('/api/spots/1000')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Spot not found")
        })
      });

      test('400: Returns error for bad data type in request', () => {
        return request(app)
        .get('/api/spots/doglord')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request"); 
        })
      });
    });
});

describe("/api/spots", () => {
  describe("GET", () => {
    test("200: Returns list of articles", () => {
      return request(app)
        .get("/api/spots")
        .expect(200)
        .then((res) => {
          expect(res.body.spots.length).toBe(10);
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
});
