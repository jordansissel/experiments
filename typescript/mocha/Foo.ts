export enum Bar {
  Baz = "baz"
}

export function Foo() {
  console.log(`Foo: Bar.Baz=${Bar.Baz}`);
  return Bar.Baz;
}

if (typeof process !== 'undefined' && import.meta.filename === process.argv[1]) {
  Foo();
}
