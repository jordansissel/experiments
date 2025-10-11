import { jest, describe, it } from "@jest/globals"
import * as foo from "./foo"

describe("foo", () => {
  it("should be fun", async () => {
    const spy = jest.spyOn(foo, "foo")

    await foo.foo()

    console.log(spy.mock.calls)
  })
})
