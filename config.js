module.exports = [
{
arcaneSpam_delay: 30, //delay in ms for arcane pulse spam
focusguild: false, //memeslash only selected guilds
blockguild: false, //don't memeslash selected guilds
guilds_to_focus: ["a", "b", "c"], //names of the guilds to memeslash
guilds_to_block: ["a", "b", "c"], //names of the guilds to avoid memeslashing
ignore_impregnable: false, //don't memeslash people with impregnable gear
focusplayer: false, //memeslash only selected players
players_to_focus: ["a", "b", "c"], //names of the players to memeslash
pvp: false,//hit only players
pve: true,//hit only monsters
focusboss: true,//hit only bosses (need to set pve or pvx to true)
pvx: false //hit both platers and monsters
}
]
