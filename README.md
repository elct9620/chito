Chito
===

Chito（𨑨迌，tshit-thô）is an AI powered travel assistant. It is designed to help you to resolve the most common travel problems for Taiwanese travelers.

## Installation

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Felct9620%2Fchito)

After deployed, visit the `/register` endpoint to register the webhook for the bot.

> [!NOTE]
> The ACL will be added in the future. Currently, the admin feature is not available.

### Variables

| Name                  | Description                                                                 |
| ------------------    | --------------------------------------------------------------------------- |
| CLOUDFLARE_AI_GATEWAY | The URL of the Cloudflare AI Gateway.                                       |
| OPENAI_API_TOKEN      | The OpenAI API token.                                                       |
| TELEGRAM_BOT_DOMAIN   | The domain of the Telegram bot.                                             |
| TELEGRAM_BOT_TOKEN    | The Telegram bot token.                                                     |

> [!WARNING]
> The variables are configured as secret variables for now, you need to set them in the Cloudflare dashboard. It will be changed in the future.

## Usage

Create a new group in Telegram and add the bot to the group. You can use the bot in the group.

> [!NOTE]
> The private chat is working, but use group chat is recommended. The different travel can be managed in different groups and shared with your friends.

## Features

### Query

Chito is powered by OpenAI's GPT-4. It can help you to answer the most common travel questions.

> [!NOTE]
> The customize model / provider is not available for now. It will be added in the future.

### Receipt

To help you to manage your travel expenses, Chito can help you to recognize and translate receipts. It can also help you to split the receipts with your friends.

- [x] Receipt recognition
- [x] Receipt translation
- [ ] Receipt notes
- [ ] Receipt split

## Platform

| Platform | Available   |
| -------  | ----------- |
| Telegram | ✅          |
| LINE     | 🚧          |
| Discord  | 🚧          |

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
