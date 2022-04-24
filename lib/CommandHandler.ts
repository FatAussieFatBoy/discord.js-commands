import { Client, Collection, Interaction, Constants } from "discord.js";
import { PathOrFileDescriptor, PathLike, readFileSync, readdirSync } from "fs";
import { ComponentHandler } from "./ComponentHandler";
import { DiscordCommand, DiscordCommandResponder } from "./discord/DiscordCommand";
import type { DiscordComponent } from "./discord/DiscordComponent";
import { Config, Configuration } from "./utils/Configuration";

const { Events, WSEvents } = Constants;

export class CommandHandler extends Collection<string, DiscordCommand> {
	public readonly client: Client;
	public config: Config;

	public components: ComponentHandler;

	constructor (client: Client, config?: Config) {
		super();

		this.client = client;
		this.config = config ?? Configuration.DefaultConfig();
		this.components = new ComponentHandler(this);

		this.client.ws.on(WSEvents.INTERACTION_CREATE as never, async (interaction: Interaction) => {
			if (interaction.isCommand() || interaction.isMessageComponent()) {
				const responder = new DiscordCommandResponder(this.client, interaction);
				try {
					if (interaction.isCommand()) {
						const command_name = interaction.commandName.toLowerCase();
						if (!(this.has(command_name))) return responder.reply(`The command \` ${command_name} \` could not be recognised.`);
						else await (this.get(command_name) as DiscordCommand).execute(this.client, interaction, responder);
					} else {
						if (!(this.components.has(interaction.customId))) return responder.reply(`The component \` ${interaction.customId} \`could not be recognised.`);
						else await (this.components.get(interaction.customId) as DiscordComponent).execute(this.client, interaction, responder);
					}
				} catch (e) {
					console.error(e);
					return responder.reply(`The bot encountered an \` ${(e as Error).name} \` error when attempting to resolve the interaction.`);
				}
			}
		});
	}

	registerCommand(command: DiscordCommand | PathOrFileDescriptor): void {
		if (!(command instanceof DiscordCommand)) command = JSON.parse(readFileSync(command).toString());
		if (command instanceof DiscordCommand) {
			this.set(command.name, command);
		} else console.error(`Constructor ${command.constructor.name} is not a valid DiscordCommand class.`);
		return;
	}

	registerCommands(directory: PathLike): Promise<void[]> {
		const valid = [];
		const commands = readdirSync(directory);
		for (let command of commands) {
			try {
				let json = JSON.parse(readFileSync(command).toString());
				if (!(json instanceof DiscordCommand)) {
					this.client.emit(Events.WARN, `File ${command} is not a valid DiscordCommand. Continuing..`);
					continue;
				}

				valid.push(json);

			} catch (e) { 
				console.error(e); 
				this.client.emit(Events.WARN, `File ${command} has throw an error. Continuing..`); 
				continue; 
			}
		}

		return Promise.all(valid.map(v => this.registerCommand(v)));
	}
}