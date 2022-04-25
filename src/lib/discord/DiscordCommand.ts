import type { Client, CommandInteraction, InteractionDeferReplyOptions, InteractionDeferUpdateOptions, MessageComponentInteraction } from "discord.js";
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "discord-api-types/v9";
import type { InteractionResponse, InteractionResponseEditOptions, InteractionResponseOptions } from "./DiscordInteraction";

export type DiscordCommandData = SlashCommandData | ContextMenuCommandData;
export type SlashCommandOptionData = SubCommandOptionData | SubCommandGroupOptionData;

interface BaseOptionData {
	name: string;
	description: string;
	required?: boolean | undefined;
}

export interface SubCommandOptionData extends BaseOptionData {
	type: ApplicationCommandOptionType.Subcommand;
	options?: BasicOptionData[] | undefined;
}

export interface SubCommandGroupOptionData extends BaseOptionData {
	type: ApplicationCommandOptionType.SubcommandGroup;
	options?: SubCommandOptionData[] | undefined;
}

type BasicOptionData = StringOptionData | NumberOptionData | ChannelTypeOptionData | BaseOptionData;

interface ChoicesOptionData extends BaseOptionData {
	type: ApplicationCommandOptionType.String | ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number;
	choices?: {
		name: string;
		value: string | number;
	}[] | undefined;
}

export interface StringOptionData extends ChoicesOptionData {
	type: ApplicationCommandOptionType.String;
	autocomplete?: boolean | undefined;
}

export interface NumberOptionData extends ChoicesOptionData {
	type: ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number;
	min_value?: number | undefined;
	max_value?: number | undefined;
	autocomplete?: boolean | undefined;
}

export interface ChannelTypeOptionData extends BaseOptionData {
	type: ApplicationCommandOptionType.Channel;
	channel_types?: ChannelType;
}

export interface SlashCommandData {
	type?: ApplicationCommandType.ChatInput;
	name: string;
	description: string;
	options?: [ SubCommandOptionData | SubCommandGroupOptionData ] | undefined;
	default_permission?: boolean | undefined;
}

export interface ContextMenuCommandData {
	type: ApplicationCommandType.Message | ApplicationCommandType.User;
	name: string;
}

export abstract class DiscordCommand {
	public readonly name: string;

	constructor(data: DiscordCommandData) {
		this.name = data.name;
	}

	abstract execute(client: Client, interaction: CommandInteraction, responder: DiscordCommandResponder): Promise<any>;
}

export abstract class SlashCommand extends DiscordCommand implements SlashCommandData {
	public readonly type: ApplicationCommandType.ChatInput;
	public description: string;
	public options?: [SubCommandOptionData | SubCommandGroupOptionData] | undefined;
	public default_permission?: boolean | undefined;

	constructor(data: SlashCommandData) {
		super(data);

		this.type = data.type || ApplicationCommandType.ChatInput;
		this.description = data.description;
		this.options = data.options;
		this.default_permission = data.default_permission;
	}
}

export abstract class ContextMenuCommand extends DiscordCommand implements ContextMenuCommandData {
	public type: ApplicationCommandType.Message | ApplicationCommandType.User;
	constructor(data: ContextMenuCommandData) {
		super(data);
		this.type = data.type;
	}
}

export class DiscordCommandResponder {
	public readonly client: Client;
	public readonly interaction: CommandInteraction | MessageComponentInteraction;

	constructor(client: Client, interaction: CommandInteraction | MessageComponentInteraction) {
		this.client = client;
		this.interaction = interaction;
	}

	async reply(data: InteractionResponseOptions | string) {
		return DiscordCommandResponder.sendInteractionCallback(this.interaction, data);
	}

	async defer(options?: InteractionDeferReplyOptions | InteractionDeferUpdateOptions): Promise<void> {
		if (this.interaction.deferred) return;
		if (this.interaction.isMessageComponent()) return this.interaction.deferUpdate(options);
		else return this.interaction.deferReply(options);
	}

	async edit(data: string | InteractionResponseEditOptions) {
		return DiscordCommandResponder.sendInteractionCallback(this.interaction, data);
	}

	static async sendInteractionCallback(interaction: CommandInteraction | MessageComponentInteraction, data: InteractionResponse) {
		if (interaction.replied || interaction.deferred) return interaction.editReply(data);
		else return interaction.reply(data);
	}
}