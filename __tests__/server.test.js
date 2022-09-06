const request = require("supertest");
const app = require("../server");

beforeEach(() => {});

afterAll(() => {});

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
