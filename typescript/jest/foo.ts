
import * as exec from "@actions/exec"
import * as core from "@actions/core"

export async function foo() {
  await exec.exec("echo", ["hello world"]);

  console.log(typeof core.getInput);
  console.log("Foo says hello");
}
