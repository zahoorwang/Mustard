import { MustardRegistry } from "./Registry";
import { MustardUtils } from "./Utils";
import uniqBy from "lodash.uniqby";

import type { CommandRegistryPayload } from "../Typings/Command.struct";
import type { Nullable } from "../Typings/Shared.struct";

interface SharedInfo {
  name: string;
  alias?: Nullable<string>;
  description?: Nullable<string>;
}

export interface ParsedCommandUsage extends SharedInfo {
  options: ParsedOptionInfo[];
  variadicOptions: ParsedOptionInfo[];
  input?: ParsedOptionInfo;
}

interface ParsedOptionInfo extends SharedInfo {
  defaultValue: unknown;
}

export class UsageInfoGenerator {
  public static collectCompleteAppUsage() {
    const completeRegistration = MustardRegistry.provide();

    const commands: ParsedCommandUsage[] = uniqBy(
      Array.from(completeRegistration.values()).map((c) =>
        UsageInfoGenerator.collectSpecificCommandUsage(c)
      ),
      "name"
    );

    return commands;
  }

  public static collectSpecificCommandUsage(
    registration: CommandRegistryPayload
  ): ParsedCommandUsage {
    const { commandInvokeName, instance } = registration;

    const decoratedFields = MustardUtils.filterDecoratedInstanceFields(
      instance!
    ).map((option) => {
      return {
        name: option.key,
        alias: option.value.optionAlias,
        description: option.value.description,
        defaultValue: option.value.initValue,
        type: option.type,
      };
    });

    const options: ParsedOptionInfo[] = decoratedFields.filter(
      (o) => o.type === "Option"
    ) as ParsedOptionInfo[];

    const variadicOptions: ParsedOptionInfo[] = decoratedFields.filter(
      (o) => o.type === "VariadicOption"
    ) as ParsedOptionInfo[];

    const input: ParsedOptionInfo = decoratedFields.find(
      (o) => o.type === "Input"
    ) as ParsedOptionInfo;

    const command: ParsedCommandUsage = {
      name: commandInvokeName,
      alias: registration.commandAlias,
      description: registration.description,
      options,
      input,
      variadicOptions,
    };

    return command;
  }

  public static commandBinaryName: Nullable<string> = null;

  // FIXME: if root command is registered, only usage info of root command will be displayed
  public static printHelp(bin: string, registration?: CommandRegistryPayload) {
    UsageInfoGenerator.commandBinaryName = bin;

    registration
      ? registration.root
        ? // print usage info for RootCommand only
          console.log(
            UsageInfoGenerator.formatRootCommandUsage(
              UsageInfoGenerator.collectSpecificCommandUsage(registration)
            )
          )
        : // print usage info for specific command only
          console.log(
            UsageInfoGenerator.formatCommandUsage(
              UsageInfoGenerator.collectSpecificCommandUsage(registration)
            )
          )
      : // print usage info for complete application
        console.log(
          UsageInfoGenerator.batchfFormatCommandUsage(
            UsageInfoGenerator.collectCompleteAppUsage()
          )
        );
  }

  public static formatCommandUsage(collect: ParsedCommandUsage): string {
    return `
Usage:

  $ ${UsageInfoGenerator.commandBinaryName} ${collect.name}

${UsageInfoGenerator.formatCommandUsageInternal(collect)}`;
  }

  public static formatCommandUsageInternal(
    collect: ParsedCommandUsage
  ): string {
    const commandPart = `Command:\n  ${collect.name}${
      collect.alias ? `, ${collect.alias},` : ""
    } ${collect.description ? collect.description + "\n" : "\n"}`;

    let optionsPart = "Options:\n";

    [...collect.options, ...collect.variadicOptions].forEach((o) => {
      optionsPart += `  --${o.name}${o.alias ? `, -${o.alias}` : ""}${
        o.description ? `, ${o.description}` : ""
      }${
        o.defaultValue
          ? `, default: ${JSON.stringify(o.defaultValue, null, 2)}`
          : ""
      }`;
      optionsPart += "\n";
    });

    return `
${commandPart}
${optionsPart}`;
  }

  public static formatRootCommandUsage(collect: ParsedCommandUsage): string {
    let optionsPart = "";

    optionsPart += "\n";

    [...collect.options, ...collect.variadicOptions].forEach((o) => {
      optionsPart += `  --${o.name}${o.alias ? ` -${o.alias}` : ""}${
        o.description ? `, ${o.description}` : ""
      }${
        o.defaultValue
          ? `, default: ${JSON.stringify(o.defaultValue, null, 2)}`
          : ""
      }`;
      optionsPart += "\n";
    });

    const inputPrePart = collect.input
      ? `[${collect.input.name}${
          collect.input.description ? `, ${collect.input.description}` : ""
        }${
          collect.input.defaultValue
            ? `, default: ${JSON.stringify(
                collect.input.defaultValue,
                null,
                2
              )}`
            : ""
        }]`
      : "";

    return `
Usage:

  $ ${UsageInfoGenerator.commandBinaryName} ${inputPrePart}

Options: ${optionsPart}`;
  }

  public static batchfFormatCommandUsage(
    collect: ParsedCommandUsage[]
  ): string {
    const { commandBinaryName: bin } = UsageInfoGenerator;

    let result = "";

    collect.forEach((c) => {
      result += UsageInfoGenerator.formatCommandUsageInternal(c);
    });

    result = `
Usage:

  $ ${bin} [command] [--options]
${result}`;

    return result;
  }
}
