import type { MessagePayload } from "discord.js";
import type { DiscordComponent } from "./DiscordComponent";

export type InteractionResponseData = Omit<MessagePayload, 'components'> & {
	components?: DiscordComponent[];
};