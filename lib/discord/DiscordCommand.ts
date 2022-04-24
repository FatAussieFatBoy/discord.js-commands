import type { Client, CommandInteraction, InteractionDeferReplyOptions, InteractionDeferUpdateOptions, MessageComponentInteraction } from "discord.js";
import type { InteractionResponseData } from "./DiscordInteraction";

export abstract class DiscordCommand {
	public readonly name: string;

	constructor(name: string) {
		this.name = name;
	}

	abstract execute(client: Client, interaction: CommandInteraction, responder: DiscordCommandResponder): any;
}

export class DiscordCommandResponder {
	public readonly client: Client;
	public readonly interaction: CommandInteraction | MessageComponentInteraction;

	constructor(client: Client, interaction: CommandInteraction | MessageComponentInteraction) {
		this.client = client;
		this.interaction = interaction;
	}

	async reply(data: InteractionResponseData | string) {
		return DiscordCommandResponder.sendInteractionCallback(this.interaction, data);
	}

	async defer(options?: InteractionDeferReplyOptions | InteractionDeferUpdateOptions): Promise<void> {
		if (this.interaction.deferred) return;
		if (this.interaction.isMessageComponent()) return this.interaction.deferUpdate(options);
		else return this.interaction.deferReply(options);
	}

	async edit(data: InteractionResponseData | string) {
		return DiscordCommandResponder.sendInteractionCallback(this.interaction, data);
	}

	static async sendInteractionCallback(interaction: CommandInteraction | MessageComponentInteraction, data: InteractionResponseData | string) {
		if (interaction.replied || interaction.deferred) return interaction.editReply(data);
		else return interaction.reply(data);
	}
}