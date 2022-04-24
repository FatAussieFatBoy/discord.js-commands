import { Client, Collection, Constants } from "discord.js";
import { PathOrFileDescriptor, PathLike, readFileSync, readdirSync } from "fs";
import type { CommandHandler } from "./CommandHandler";
import { DiscordComponent } from "./discord/DiscordComponent";

const { Events } = Constants;

export class ComponentHandler extends Collection<string, DiscordComponent> {
	public readonly client: Client;
	public readonly commands: CommandHandler;

	constructor(handler: CommandHandler) {
		super();

		this.client = handler.client;
		this.commands = handler;
	}

	registerComponent(component: DiscordComponent | PathOrFileDescriptor): void {
		if (!(component instanceof DiscordComponent)) component = JSON.parse(readFileSync(component).toString());
		if (component instanceof DiscordComponent) {
			this.set(component.custom_id, component);
		} else console.error(`Constructor ${component.constructor.name} is not a valid DiscordComponent class.`);
		return;
	}

	registerCommands(directory: PathLike): Promise<void[]> {
		const valid = [];
		const components = readdirSync(directory);
		for (let component of components) {
			try {
				let json = JSON.parse(readFileSync(component).toString());
				if (!(json instanceof DiscordComponent)) {
					this.client.emit(Events.WARN, `File ${component} is not a valid DiscordCommand. Continuing..`);
					continue;
				}

				valid.push(json);

			} catch (e) { 
				console.error(e); 
				this.client.emit(Events.WARN, `File ${component} has throw an error. Continuing..`); 
				continue; 
			}
		}

		return Promise.all(valid.map(v => this.registerComponent(v)));
	}
}