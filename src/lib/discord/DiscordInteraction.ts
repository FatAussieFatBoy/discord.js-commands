import type { InteractionReplyOptions, MessagePayload, WebhookEditMessageOptions } from "discord.js";
import type { DiscordComponent } from "./DiscordComponent";

export type InteractionResponse = string | MessagePayload | InteractionResponseEditOptions | InteractionResponseOptions;

export type InteractionResponseEditOptions = WebhookEditMessageOptions & {
	components?: DiscordComponent[] | undefined;
};

export type InteractionResponseOptions = InteractionReplyOptions & {
	components?: DiscordComponent[] | undefined;
}