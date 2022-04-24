import type { Client, MessageComponentInteraction } from "discord.js";
import { ButtonStyle, ComponentType } from "discord-api-types/v9";
import type { DiscordCommandResponder } from "./DiscordCommand";

export type DiscordComponentData = ActionRowComponentData | ButtonComponentData | LinkButtonComponentData | SelectMenuComponentData;

export interface ActionRowComponentData {
	type: ComponentType.ActionRow;
	components?: Exclude<DiscordComponentData, ActionRowComponentData>[];
}

interface BaseButtonComponentData {
	type: ComponentType.Button;
	label?: string | undefined;
	emoji?: {
		id: string;
		animated?: boolean | undefined;
	} | undefined;
	disabled?: boolean | undefined;
}

export interface ButtonComponentData extends BaseButtonComponentData {
	custom_id: string;
	style: Exclude<ButtonStyle, ButtonStyle.Link>;
}

export interface LinkButtonComponentData extends BaseButtonComponentData {
	url: string;
	style: ButtonStyle.Link
}

export interface SelectMenuComponentData {
	type: ComponentType.SelectMenu;
	custom_id: string;
	options: {
		label: string;
		value: string;
		description?: string | undefined;
		emoji?: {
			id: string;
			animated?: boolean | undefined;
		} | undefined;
		default?: boolean | undefined;
	}[];
	placeholder?: string | undefined;
	min_values?: number | undefined;
	max_values?: number | undefined;
	disabled?: boolean | undefined;
}

export function renderComponents(components: DiscordComponentData[]): DiscordComponentData[] {
	const grid: ActionRowComponentData[] = [];
	let i = 0;
	for (let row = 0; row < 5; row++) {
		if ((row * 5) > (components.length - 1)) break;
		if (components[i].type == ComponentType.ActionRow) {
			grid.push(components[i] as ActionRowComponentData);
			i++; continue;
		}

		grid.push({
			type: ComponentType.ActionRow,
			components: []
		});

		for (let column = 0; column < 5; column++) {
			if ((row * 5) + column < components.length) {
				grid[row].components?.push(components[i] as Exclude<DiscordComponentData, ActionRowComponentData>);
				i++;
			}
		}
	}

	return grid;
}

export abstract class DiscordComponent {
	public readonly custom_id: string;

	constructor(custom_id: string) {
		this.custom_id = custom_id;
	}

	abstract execute(client: Client, interaction: MessageComponentInteraction, responder: DiscordCommandResponder): Promise<any>;
}

export abstract class ButtonDiscordComponent extends DiscordComponent implements ButtonComponentData {
	public readonly type: ComponentType.Button;

	public style: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
	public label?: string | undefined;
	public emoji?: { 
		id: string; 
		animated?: boolean | undefined;
	} | undefined;
	public disabled?: boolean | undefined;
	
	constructor(data: ButtonComponentData) {
		super(data.custom_id);

		this.type = ComponentType.Button;
		this.style = data.style;
		this.label = data.label;
		this.emoji = data.emoji;
		this.disabled = data.disabled;
	}
}

export abstract class SelectMenuComponent extends DiscordComponent implements SelectMenuComponentData {
	public readonly type: ComponentType.SelectMenu;
	public options: { 
		label: string; 
		value: string; 
		description?: string | undefined; 
		emoji?: { 
			id: string; 
			animated?: boolean | undefined;
		} | undefined; 
		default?: boolean | undefined;
	}[];
	public placeholder?: string | undefined;
	public min_values?: number | undefined;
	public max_values?: number | undefined;
	public disabled?: boolean | undefined;
	
	constructor(data: SelectMenuComponentData) {
		super(data.custom_id);

		this.type = ComponentType.SelectMenu;
		this.options = data.options;
		this.placeholder = data.placeholder;
		this.min_values = data.min_values;
		this.max_values = data.max_values;
		this.disabled = data.disabled;
	}
}