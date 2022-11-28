import {
  Command,
  RootCommand,
  Option,
  Options,
  Context,
  Input,
} from "./Impls/Decorators";
import { CLI } from "./Impls/CommandLine";
import { BaseCommand } from "./Impls/BaseCommand";
import { CommandStruct } from "./Impls/types/Command.struct";
import { Validator } from "./Impls/Validator";

@Command("sync")
class RunSyncCommand extends BaseCommand implements CommandStruct {
  constructor() {
    super();
  }

  @Option("dry")
  public dryOption;

  @Input()
  public input;

  static usage() {
    return `run sync --dry`;
  }

  public run(): void {
    console.log("Nested! ", this.dryOption);
    console.log("this.input: ", this.input);
  }
}

@Command("run", "r", "run command", [RunSyncCommand])
class RunCommand extends BaseCommand implements CommandStruct {
  constructor() {
    super();
  }

  static usage() {
    return `run xxx --dry`;
  }

  // @Option("dry", "d")
  @Option("dry", Validator.Boolean())
  public dryOption;

  @Options()
  public allOptions;

  @Context()
  public context;

  @Input()
  public input;

  public run(): void {
    console.log("this.input: ", this.input);
    console.log("this.context: ", this.context);
    console.log("Hello World! ", this.dryOption);
    console.log("All Options! ", this.allOptions);
  }
}

@Command("check")
class CheckCommand extends BaseCommand {
  constructor() {
    super();
  }

  @Option("dry")
  public dry;

  static usage() {
    return `check --dry`;
  }

  public run(): void {
    console.log("Check Command! ", this.dry);
  }
}

@RootCommand()
class RootCommandHandle extends BaseCommand {
  constructor() {
    super();
  }

  @Option("dry", "dry option")
  public dry = "default value of dry";

  static usage() {
    return `x-cli --dry`;
  }

  public run(): void {
    console.log("Root Command! ", this.dry);
  }
}

const cli = new CLI("LinbuduLab CLI", [RootCommandHandle, RunCommand]);

cli.registerCommand([CheckCommand]);

cli.start();

cli.configure({});
