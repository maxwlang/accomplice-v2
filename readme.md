# Accomplice V2
Discord Leaderboards and Starboards done right

## TODO & Issues
https://trello.com/b/3e2lA442/accomplice-v2

## Commands (Complete)
- /debug - Debug commands for the bot, tied to owner snowflake id.
    - show-timers - Shows all timers stored in memory.
    - clear-timer - Clears a timer from memory and stops it.
    - eval - Evaluates a string of code.
    - eval-sql - Evaluates a string of SQL code.
    - list-embeds - Lists all embeds by name.
    - show-embed <embed-name> (constructor-args?, embed-args?) - Shows an embed with optional JSON arguments.
    - show-stats - Shows bot stats.
- /invite - Makes the bot reply with an invite link and correct permissions.
- /leaderboard - Leaderboards display the top reacted users in your guild using Trackers. Leaderboards are different from starboards.
    - create <channel> (delete-user-messages?, default-tracker-timeout?) - Creates a Leaderboard.
    - destroy <channel> <confirm> - Destroys a Leaderboard.
    - track <channel> <tracker-id> (is-default?) - Assigns a Tracker to a Leaderboard. You may have a Tracker on multiple Leaderboards and Starboards.
    - untrack <channel> <tracker-id> - Removes a Tracker from a Leaderboard.
    - trackers <channel> - Shows all Trackers associated with a Leaderboard.
    - list - Shows all Leaderboards on the guild.
- /ping - Makes the bot reply with pong.
- /tracker - Trackers are used to track reaction events.
    - create - Creates a reaction Tracker.
    - destroy - Destroys a reaction Tracker and removes it from all Leaderboards and Starboards.
    - list - Shows all Trackers on the guild.

## Commands (Incomplete)
- /leaderboard
    - synchronize (channel?, confirm?) - (guild admin) Re-synchronizes message history for the guild or a specific channel.
- /priority - Configures guild priority. High priority guilds are serviced first under load.
    - set - Sets a guild as priority.
    - remove - Removes a guild from priority.
    - list - Lists all priority guilds.
- /starboard - Starboards watch for a specific amount of reactions using Trackers, then mirror messages in a dedicated channel.
    - create - Creates a Starboard.
    - destroy - Destroys a Starboard.
    - list - Shows all Starboards on the guild.
    - trackers - Shows all Trackers associated with a Starboard.
    - track - Assigns a Tracker to a Starboard. You may have a Tracker on multiple Starboards and Leaderboards. You may have multiple Trackers on a Starboard.
    - untrack - Removes a Tracker from a Starboard.

## Features
- Certain data is cached in memory using Redis for better responsiveness
- Scalable, more instances may be created to scale out when under load
- Configurable, built out of the box to be configurable
- Leaderboards
- Starboards

### Leaderboards
Leaderboards are a way to track the top reacted users in your guild. Leaderboards are different from Starboards. Leaderboards are not tied to a specific reaction or emojji, and can track multiple reaction types. You may only have one Leaderboard per channel.

- Unlimited Leaderboards per guild
- Leaderboards can track multiple reaction types
- Leaderboards update automatically
- Leaderboards are configurable:
    - Amount of users displayed on Leaderboard
    - Ignoring reacts from bots
    - Ignoring reacts to bots
    - Ignoring self reacts
    - Automatically deleting messages in Leaderboard channels
    - Automatically switching the Leaderboard embed back to the default Tracker after a certain amount of time (default 2 minutes)

### Starboards
Starboards are a way to mirror messages in a dedicated channel after a certain amount of reactions. Starboards are different from Leaderboards. Starboards are tied to a specific reaction or emojji, and can only track one reaction type. You are however, able to have multiple Starboards per channel.

- Unlimited Starboards per guild
- Starboards can only track one reaction type
- Messages that are mirrored in the Starboard channel are updated automatically to reflect the latest state of the message
  - If they fall below the threshold, they are removed from the Starboard channel
- Starboards are configurable:
    - Amount of reactions required to mirror a message
    - Ignoring reacts from bots
    - Ignoring reacts to bots
    - Ignoring self reacts
    - Automatically deleting messages in Starboard channels
