
require("dotenv").config();

const {
    Client,
    GatewayIntentBits
} = require("discord.js");

console.log("🔧 Loading command handler...");
const { loadCommands } = require("./handlers/commandHandler");

console.log("🔧 Loading interaction handler...");
const {
    handleInteraction
} = require("./events/interactionHandler");

console.log("🔧 Loading database...");
const {
    initializeDatabase
} = require("../database/database");

const {
    initializeDatabase: initializeSchema
} = require("../database/schema");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

async function startBot() {
    try {
        console.log("🗄️ Initializing database...");

        await initializeDatabase();

        initializeSchema();

        console.log("📦 Loading commands...");

        loadCommands(client);

        console.log("📡 Setting up Discord events...");

        client.once("clientReady", () => {
            console.log(
                `♟️ Chess Society Bot is online as ${client.user.tag}`
            );
        });

        client.on("interactionCreate", async interaction => {
            try {
                // Handle buttons first
                if (interaction.isButton()) {
                    const handled = await handleInteraction(interaction);

                    if (handled) return;
                }

                // Ignore anything that isn't a slash command
                if (!interaction.isChatInputCommand()) {
                    return;
                }

                const command = client.commands.get(
                    interaction.commandName
                );

                if (!command) {
                    console.warn(
                        `⚠️ Unknown command: ${interaction.commandName}`
                    );
                    return;
                }

                await command.execute(interaction);

            } catch (error) {
                console.error(
                    `❌ Error handling interaction:`,
                    error
                );

                try {
                    if (
                        interaction.isRepliable() &&
                        !interaction.replied &&
                        !interaction.deferred
                    ) {
                        await interaction.reply({
                            content:
                                "❌ Something went wrong while processing that.",
                            ephemeral: true
                        });
                    }
                } catch (replyError) {
                    console.error(
                        "❌ Could not send error message:",
                        replyError
                    );
                }
            }
        });

        console.log("🔑 Logging into Discord...");

        await client.login(process.env.DISCORD_TOKEN);

    } catch (error) {
        console.error(
            "❌ Failed to start Chess Society Bot:"
        );

        console.error(error);

        process.exit(1);
    }
}

startBot();

