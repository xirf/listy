import { CommandGroup } from "@grammyjs/commands";
import type { ListyContext } from "../types";
import help from "./help";
import reset from "./reset";
import setlimit from "./setlimit";
import start from "./start";

export const userCommands = new CommandGroup<ListyContext>().add([
    help,
    reset,
    setlimit,
    start
]);