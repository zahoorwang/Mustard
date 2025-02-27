#!/usr/bin/env node

import { MustardFactory } from "mustard-cli";
import {
  Command,
  RootCommand,
  Option,
  VariadicOption,
  App,
  Input,
  Options,
} from "mustard-cli/decorator";
import { Validator } from "mustard-cli/validator";
import { CommandStruct, MustardApp } from "mustard-cli/cli";

import path from "path";

@RootCommand()
class RootCommandHandle implements CommandStruct {
  @Option("d")
  public msg = "default value of msg";

  public run(): void {
    console.log("Root Command! ", this.msg);
  }
}

@Command("update", "u", "update project dependencies")
class UpdateCommand implements CommandStruct {
  @Option("depth", Validator.Number().Gte(1))
  public depth = 10;

  @Option(Validator.Boolean())
  public dry = false;

  @Options()
  public completeOptions: unknown;

  @Input()
  public input: string[];

  @VariadicOption()
  public packages: string[] = [];

  public run(): void {}
}

@App({
  name: "LinbuduLab CLI",
  commands: [RootCommandHandle, UpdateCommand],
  configurations: {
    allowUnknownOptions: true,
    enableVersion: require(path.resolve("./package.json")).version,
  },
  providers: [],
})
class Project implements MustardApp {
  onStart() {}

  onComplete() {}
}

MustardFactory.init(Project).start();
