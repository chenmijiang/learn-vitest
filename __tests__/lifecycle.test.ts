import {
  afterAll,
  afterEach,
  aroundAll,
  aroundEach,
  beforeAll,
  beforeEach,
  describe,
  test,
} from "vitest";

describe("outer", () => {
  aroundAll(async (runSuite) => {
    console.log("outer aroundAll before");
    await runSuite();
    console.log("outer aroundAll after");
  });

  beforeAll(() => console.log("outer beforeAll"));

  aroundEach(async (runTest) => {
    console.log("outer aroundEach before");
    await runTest();
    console.log("outer aroundEach after");
  });

  beforeEach(() => console.log("outer beforeEach"));

  test("outer test", () => console.log("outer test"));

  describe("inner", () => {
    aroundAll(async (runSuite) => {
      console.log("inner aroundAll before");
      await runSuite();
      console.log("inner aroundAll after");
    });

    beforeAll(() => console.log("inner beforeAll"));

    aroundEach(async (runTest) => {
      console.log("inner aroundEach before");
      await runTest();
      console.log("inner aroundEach after");
    });

    beforeEach(() => console.log("inner beforeEach"));

    test("inner test", () => console.log("inner test"));

    afterEach(() => console.log("inner afterEach"));
    afterAll(() => console.log("inner afterAll"));
  });

  afterEach(() => console.log("outer afterEach"));
  afterAll(() => console.log("outer afterAll"));
});

// 输出顺序:
// outer aroundAll before
//   outer beforeAll
//   outer aroundEach before
//     outer beforeEach
//       outer test
//     outer afterEach
//   outer aroundEach after
//   inner aroundAll before
//     inner beforeAll
//     outer aroundEach before
//       inner aroundEach before
//         outer beforeEach
//           inner beforeEach
//             inner test
//           inner afterEach
//         outer afterEach
//       inner aroundEach after
//     outer aroundEach after
//     inner afterAll
//   inner aroundAll after
//   outer afterAll
// outer aroundAll after
