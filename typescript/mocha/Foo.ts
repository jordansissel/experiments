export enum Bar {
  Baz = "baz"
}

export function Foo() {
  console.log(`Foo: Bar.Baz=${Bar.Baz}`);
  return Bar.Baz;
}
