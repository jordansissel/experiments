import { exec } from "@actions/exec"

export enum Bar {
  Baz = "baz"
}

export function Foo() {
  console.log(`Foo: Bar.Baz=${Bar.Baz}`);
  exec("date");
  return Bar.Baz;
}
