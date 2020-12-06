module.exports = function salchy(script) {

	let arcane_id = 330112;
	let sorc_job = 4;
	let sorc_enab = false;
	let job;
	let model;
	let enabled = false;
	let cid;
	let myPosition = null;
	let myAngle = null;
	let monsters = [];
	let aux = [];
	let arcaneSpamInt = null;
	var arcaneSpam_delay = 30;
	let arcane_packet = {};
	let endp;
	let zbug;
	let zval = 300;
	let bugme = false;
	let etarg;
	let focusboss = true;
	let bossfocused = false;
	const gidSearchFunc = function(gid) {
		return ((element) => element.gameId === gid);
	};	
	
	script.command.add('salchy', () => {
		if(!sorc_enab) return false;
		enabled = !enabled;
		script.command.message(`Salchy's sorc exploit is now ${(enabled) ? 'en' : 'dis'}abled.`);

	})
	script.command.add('boss', () => {
		if(!sorc_enab) return false;
		focusboss = !focusboss;
		script.command.message(`Salchy's focus boss mode is now ${(focusboss) ? 'en' : 'dis'}abled.`);
	})	
	script.hook('S_LOGIN', 14, (packet) => {
	cid = packet.gameId;
		model = packet.templateId;
		job = (model - 10101) % 100;
		sorc_enab = [sorc_job].includes(job);
		enabled = sorc_enab;
	})
	script.hook('S_LOAD_TOPO', 3, packet => {
		monsters = [];
		aux = [];
		bossfocused = false;
	});	
	script.hook('C_START_INSTANCE_SKILL', 7, (packet) => {
	if(!sorc_enab) return;	
	clearInterval(arcaneSpamInt);
			arcaneSpamInt = null;			
		
		if((packet.skill.id === 11200) && enabled && sorc_enab) {
		endp = packet.endpoints;
		etarg = packet.targets;
					{
						if(arcaneSpamInt != null) 
						{
							clearInterval(arcaneSpamInt);
								arcaneSpamInt = null;
						}else 
						{
							arcaneSpamInt = setInterval(arcaneSpam, arcaneSpam_delay);
							arcaneSpam();
						}
					}
			return false;
		}
	})
	script.hook('C_START_SKILL', 7, (packet) => {
			if(!sorc_enab) return;
			if(!enabled) return;
			clearInterval(arcaneSpamInt);
					arcaneSpamInt = null;
			if(bugme) {
				packet.loc.z = zbug;
				return true;
			}									
	})	
	script.hook('C_PLAYER_LOCATION', 5, (packet) => {
		if(!sorc_enab) return;
		myPosition = packet.loc;
		myAngle = packet.w;
		if(bugme) {
			return false;
		}
	})
	script.hook('S_SPAWN_NPC', 11, packet => {
		if(!sorc_enab) return;
		if(focusboss && bossfocused) return;
		monsters.push({ gameId: packet.gameId, loc: packet.loc });
	})
	script.hook('S_BOSS_GAGE_INFO', 3, packet => {
		if(!sorc_enab) return;
		if(!focusboss) return;
		if(bossfocused) return;
		aux = [];
		let monster = monsters.find(m => m.gameId === packet.id);
		if (monster) {
			aux.push({ gameId: monster.gameId, loc: monster.loc });
			monsters = aux;
			bossfocused = true;
				script.send("S_CUSTOM_STYLE_SYSTEM_MESSAGE", 1, {
					message: "Boss focused",
					style: 54
				});
				script.send("S_PLAY_SOUND", 1, {
					SoundID: 2023
				});				
		}
	})	
	script.hook('S_NPC_LOCATION', 3, packet => {
		if(!sorc_enab) return;
		let monster = monsters.find(m => m.gameId === packet.gameId);
		if (monster) monster.loc = packet.loc;		
	})
	script.hook('S_DESPAWN_NPC', 3, packet => {
		if(!sorc_enab) return;
		let monsterIndex = monsters.findIndex(gidSearchFunc(packet.gameId));
		if (monsterIndex != -1) {
			monsters.splice(monsterIndex, 1);
			if(focusboss && bossfocused) { 
				bossfocused = false; 
				script.send("S_CUSTOM_STYLE_SYSTEM_MESSAGE", 1, {
					message: "Boss despawned",
					style: 54
				});
				script.send("S_PLAY_SOUND", 1, {
					SoundID: 2023
				});			
			}
		}		
	})
	script.hook('S_ACTION_STAGE', 9, packet => {
		if(!sorc_enab) return;
		if(packet.gameId == cid && enabled && packet.skill.id == arcane_id && sorc_enab) return false;
	})
	script.hook('S_ACTION_END', 5, packet => {
		if(!sorc_enab) return;
		if(packet.gameId == cid && enabled && packet.skill.id == arcane_id && sorc_enab) return false;
	})	
	script.hook('S_START_USER_PROJECTILE', 9, packet => {
		if(!sorc_enab) return;
		if(!enabled) return;
		let targets = [];
		for(let monster of monsters) {
			targets.push({
				gameId: monster.gameId,
				unk: 0
			});
		}
		script.toClient('S_START_USER_PROJECTILE', 9, packet)
		script.send('C_HIT_USER_PROJECTILE', 4, {
			id: packet.id,
			end: packet.end,
			loc: packet.loc,
			targets
		});
		return false;	
	})
	script.hook('C_USE_ITEM', 3, packet => {
		if(!sorc_enab) return;
		if (!enabled) return;
		if (packet.id == 6560) {
			bugme = !bugme;
			if (bugme == true) {
				zbug = myPosition.z + zval;
				script.send('S_ABNORMALITY_BEGIN', 3, {
					target: cid,
					source: cid,
					id: 2060,
					duration: 0x7FFFFFFF,
					unk: 0,
					stacks: 1,
					unk2: 0,
					unk3: 0
				})
			}
			if (bugme == false) {
				script.send('S_ABNORMALITY_END', 1, {
					target: cid,
					id: 2060
				})
				script.toClient('S_INSTANT_MOVE', 3, {
					id: cid,
					x: myPosition.x,
					y: myPosition.y,
					z: myPosition.z,
					w: myAngle
				})
			}
			script.command.message('Invincible mode : ' + bugme);
			return false;
		}
	})	
    function arcaneSpam() {									
		arcane_packet = {
			
					skill: {
						reserved: 0,
						npc: false,
						type: 1,
						huntingZoneId: 0,
						id: arcane_id
					},
					loc: {
							x: myPosition.x,
							y: myPosition.y,
							z: bugme ? zbug : myPosition.z
						},
					w: myAngle,
					continue: false,
					targets: etarg,
					endpoints: endp
							}												
        script.toServer('C_START_INSTANCE_SKILL', 7, arcane_packet);
	}	
}
