import assert from "node:assert";
import * as Foo from "./Foo";

describe("Foo", () => {
  describe("#Bar", () => {
    it("should have property .Baz == 'baz'", () => {
      assert.equal(Foo.Bar.Baz, "baz")
    })
  })
});
