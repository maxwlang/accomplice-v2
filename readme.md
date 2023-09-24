# Accomplice V2
Discord Leaderboards and Starboards done right

## TODO & Issues
https://trello.com/b/3e2lA442/accomplice-v2

## Commands (Complete)
- /tracker - Trackers are used to track reaction events.
    - create - Creates a reaction Tracker.
    - destroy - Destroys a reaction Tracker and removes it from all Leaderboards and Starboards.
    - list - Shows all Trackers on the guild.
- /leaderboard - Leaderboards display the top reacted users in your guild using Trackers. Leaderboards are different from starboards.
    - create - Creates a Leaderboard.
    - destroy - Destroys a Leaderboard.
    - list - Shows all Leaderboards on the guild.
    - trackers - Shows all Trackers associated with a Leaderboard.
    - track - Assigns a Tracker to a Leaderboard. You may have a Tracker on multiple Leaderboards and Starboards.
    - untrack - Removes a Tracker from a Leaderboard.
- /ping - Makes the bot reply with pong.

## Commands (Incomplete)
- /leaderboard
    - synchronize - (guild admin) Removes all indexed message states for the guild and re-gathers it. Useful if data is incorrect.
- /priority - Configures guild priority. High priority guilds are serviced first under load.
    - set - Sets a guild as priority.
    - unset - Removes a guild from priority.
    - list - Lists all priority guilds.
- /starboard - Starboards watch for a specific amount of reactions using Trackers, then mirror messages in a dedicated channel.
    - create - Creates a Starboard.
    - destroy - Destroys a Starboard.
    - list - Shows all Starboards on the guild.
    - trackers - Shows all Trackers associated with a Starboard.
    - track - Assigns a Tracker to a Starboard. You may have a Tracker on multiple Starboards and Leaderboards. You may have multiple Trackers on a Starboard.
    - untrack - Removes a Tracker from a Starboard.

## Features
- Unlimited Starboards and Leaderboards per guild
- Multiple Starboards per channel (Track multiple reactions)
- Leaderboards can track multiple reaction types
- Leaderboards update automatically
- Leaderboards are configurable:
    - Amount of users displayed on leaderboard
    - Display name of leaderboard
    - Ignoring reactions by certain users
    - Ignoring messages by certain users
    - Ignoring bot users
- Starboards are configurable:
    - Ignoring reactions by certain users
    - Ignoring messages by certain users
    - Ignoring bot users
- Certain data is cached in memory using Redis for better responsiveness
- Scalable, more instances may be created to scale out when under load