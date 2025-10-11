
import * as exec from "@actions/exec"

export async function foo() {
  await exec.exec("echo", ["hello world"]);
  console.log("Foo says hello");
}
