module.exports = function salchy(script) {
	
	let config= reloadModule('./config.js');
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
	let bosses = [];
	let people = [];
	let arcaneSpamInt = null;
	let arcane_packet = {};
	let mb_packet = {};
	let endp;
	let zbug;
	let zval = 300;
	let bugme = false;
	let etarg;
	let party = [];
	let mana_boost_cd = false;
	let CD_mana;
	let cancelanim = false;

	let arcaneSpam_delay = config[0].arcaneSpam_delay;
	let focusguild = config[0].focusguild;
	let blockguild = config[0].blockguild;
	let guilds_to_focus = config[0].guilds_to_focus;
	let guilds_to_block = config[0].guilds_to_block;
	let ignore_impregnable = config[0].ignore_impregnable;
	let focusplayer = config[0].focusplayer;
	let players_to_focus = config[0].players_to_focus;
	let pvp = config[0].pvp;
	let pve = config[0].pve;
	let focusboss = config[0].focusboss;
	let pvx = config[0].pvx;

	const impregnable_weapon_ids = [90401, 90402, 90403, 90404, 90405, 90406, 90407, 90408, 90409, 90410, 90411, 90412, 90413];	
	
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

	script.command.add('pvp', () => {
		if(!sorc_enab) return false;
		pvp = true;
		pve = false;
		pvx = false;
		script.command.message(`Arcane pulse will now hit only players.`);
	})
	script.command.add('pve', () => {
		if(!sorc_enab) return false;
		pve = true;
		pvp = false;
		pvx = false;
		script.command.message(`Arcane pulse will now hit only mobs.`);
	})
	script.command.add('pvx', () => {
		if(!sorc_enab) return false;
		pvx = true;
		pvp = false;
		pve = false;
		script.command.message(`Arcane pulse will now hit both mobs and players.`);
	})	

	script.command.add('blockguild', (arg) => {
		if(!sorc_enab) return false;
		if(arg){
		guilds_to_block.push(arg);
		script.command.message("Guild " + arg + " added to the list of guilds to block. List: " + guilds_to_block);
		} else {
		blockguild = !blockguild;
		script.command.message(`Block guild mode is now ${(blockguild) ? 'en' : 'dis'}abled.`);
		}

	})
	script.command.add('focusguild', (arg) => {
		if(!sorc_enab) return false;
		if(arg){
		guilds_to_focus.push(arg);
		script.command.message("Guild " + arg + " added to the list of guilds to focus. List: " + guilds_to_focus);
		} else {
		focusguild = !focusguild;
		script.command.message(`Focus guild mode is now ${(focusguild) ? 'en' : 'dis'}abled.`);
		}
	})	

	script.command.add('focusplayer', (arg) => {
		if(!sorc_enab) return false;
		if(arg){
		players_to_focus.push(arg);
		script.command.message("Player " + arg + " added to the list of players to focus. List: " + players_to_focus);
		} else {
		focusplayer = !focusplayer;
		script.command.message(`Focus player mode is now ${(focusplayer) ? 'en' : 'dis'}abled.`);
		}
	})

	script.command.add('reload', () => {
		if(!sorc_enab) return false;
		config= reloadModule('./config.js');
		arcaneSpam_delay = config[0].arcaneSpam_delay;
		focusguild = config[0].focusguild;
		blockguild = config[0].blockguild;
		guilds_to_focus = config[0].guilds_to_focus;
		guilds_to_block = config[0].guilds_to_block;
		ignore_impregnable = config[0].ignore_impregnable;
		focusplayer = config[0].focusplayer;
		players_to_focus = config[0].players_to_focus;
		pvp = config[0].pvp;
		pve = config[0].pve;
		focusboss = config[0].focusboss;
		pvx = config[0].pvx;
		script.command.message(`Configuration reloaded.`);
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
		bosses = [];
		people = [];
	});	
	script.hook('C_START_INSTANCE_SKILL', 7, (packet) => {
	if(!sorc_enab) return;	
	clearInterval(arcaneSpamInt);
			arcaneSpamInt = null;
	cancelanim = false;
		
		if((packet.skill.id === 11200) && enabled && sorc_enab) {
		endp = packet.endpoints;
		etarg = packet.targets;
		cancelanim = true;
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
			cancelanim = false;		
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
		monsters.push({ gameId: packet.gameId, loc: packet.loc });
	})
	script.hook('S_BOSS_GAGE_INFO', 3, packet => {
		if(!sorc_enab) return;
		if(!focusboss) return;
		let boss = bosses.find(m => m.gameId === packet.id);
		if(boss) return;
		let monster = monsters.find(m => m.gameId === packet.id);
		if (monster) {
			bosses.push({ gameId: monster.gameId, loc: monster.loc });
				script.send("S_CUSTOM_STYLE_SYSTEM_MESSAGE", 1, {
					message: "Boss detected",
					style: 54
				});
				script.send("S_PLAY_SOUND", 1, {
					SoundID: 2023
				});				
		}
	})
	script.hook('S_SPAWN_USER', 16, (packet) => {
		if(!sorc_enab) return;
		if (party.length != 0) {
			let member = party.find(m => m.gameId == packet.gameId);
			if (member) {
				member.gameId = packet.gameId;
				member.loc = packet.loc;
				return;
			}
		}
		people.push({
			gameId: packet.gameId,
			loc: packet.loc,
			w: packet.w,
			guild: packet.guildName,
			name: packet.name,
			weapon: packet.weapon
		})
	})	

	script.hook('S_USER_LOCATION', 5, (packet) => {
		if(!sorc_enab) return;
		let member = party.find(m => m.gameId === packet.gameId);
		if (member) member.loc = packet.loc;
		let jugador = people.find(m => m.gameId === packet.gameId);
		if (jugador) jugador.loc = packet.loc;
	});
	script.hook('S_USER_EXTERNAL_CHANGE', 7, (packet) => {
		let jugador = people.find(m => m.gameId === packet.gameId);
		if (jugador) jugador.weapon = packet.weapon;
	});	
	script.hook('S_NPC_LOCATION', 3, packet => {
		if(!sorc_enab) return;
		let monster = monsters.find(m => m.gameId === packet.gameId);
		if (monster) monster.loc = packet.loc;		
		let boss = bosses.find(m => m.gameId === packet.gameId);
		if (boss) boss.loc = packet.loc;			
	})
	script.hook('S_DESPAWN_NPC', 3, packet => {
		if(!sorc_enab) return;
		monsters = monsters.filter(m => m.gameId != packet.gameId);
		bosses = bosses.filter(m => m.gameId != packet.gameId);		
	})
	script.hook('S_DESPAWN_USER', 3, (packet) => {
		people = people.filter(m => m.gameId != packet.gameId);
	})	
	script.hook('S_ACTION_STAGE', 9, packet => {
		if(!sorc_enab) return;
		let monster = monsters.find(m => m.gameId === packet.gameId);
		if (monster) monster.loc = packet.loc;		
		let boss = bosses.find(m => m.gameId === packet.gameId);
		if (boss) boss.loc = packet.loc;		
		let jugador = people.find(m => m.gameId === packet.gameId);
		if (jugador) jugador.loc = packet.loc;		
		if(packet.gameId == cid && enabled && packet.skill.id == arcane_id && sorc_enab && cancelanim) return false;
		if(packet.gameId == cid && enabled && sorc_enab && bugme) {
			packet.loc.z = zbug - zval;
			return true;
		}
		
	})
	script.hook('S_ACTION_END', 5, packet => {
		if(!sorc_enab) return;
		let monster = monsters.find(m => m.gameId === packet.gameId);
		if (monster) monster.loc = packet.loc;		
		let boss = bosses.find(m => m.gameId === packet.gameId);
		if (boss) boss.loc = packet.loc;
		let jugador = people.find(m => m.gameId === packet.gameId);
		if (jugador) jugador.loc = packet.loc;			
		if(packet.gameId == cid && enabled && packet.skill.id == arcane_id && sorc_enab && cancelanim) return false;
		if(packet.gameId == cid && enabled && sorc_enab && bugme) {
			packet.loc.z = zbug - zval;
			return true;
		}		
	})
	script.hook('S_PARTY_MEMBER_LIST', 7, (packet) => {
		const copy = party;
		party = packet.members.filter(m => m.playerId != script.game.me.playerId);
		if (copy) {
			for (let i = 0; i < party.length; i++) {
				const copyMember = copy.find(m => m.playerId == party[i].playerId);
				if (copyMember) {
					party[i].gameId = copyMember.gameId;
					if (copyMember.loc) party[i].loc = copyMember.loc;
				}
			}
		}
	})
	script.hook('S_LEAVE_PARTY', 1, (packet) => {
		party = [];
	})
	script.hook('S_LEAVE_PARTY_MEMBER', 2, (packet) => {
		party = party.filter(m => m.playerId != packet.playerId);
	})	
	script.hook('S_START_USER_PROJECTILE', 9, packet => {
		if(!sorc_enab) return;
		if(!enabled) return;
		if(packet.gameId != cid) return;
		let targets = [];
		if(pve) {
			if(focusboss) {
				for(let boss of bosses) {
					targets.push({
						gameId: boss.gameId,
						unk: 0
					});
				}		
			} else {
				for(let monster of monsters) {
					targets.push({
						gameId: monster.gameId,
						unk: 0
					});
			}
			}
		}
		if(pvp) {
				for(let person of people) {
					if (focusplayer) {
						if (!players_to_focus.includes(person.name)) continue;
					}					
					if (blockguild) {
						if (guilds_to_block.includes(person.guild)) continue;
					}
					if (focusguild) {
						if (!guilds_to_focus.includes(person.guild)) continue;
					}
					if (ignore_impregnable) {
						if (impregnable_weapon_ids.includes(person.weapon)) continue;
					}					
					targets.push({
						gameId: person.gameId,
						unk: 0
					});
				}
		}		
		if(pvx) {
			if(focusboss) {
				for(let boss of bosses) {
					targets.push({
						gameId: boss.gameId,
						unk: 0
					});
				}
				for(let person of people) {
					if (focusplayer) {
						if (!players_to_focus.includes(person.name)) continue;
					}					
					if (blockguild) {
						if (guilds_to_block.includes(person.guild)) continue;
					}
					if (focusguild) {
						if (!guilds_to_focus.includes(person.guild)) continue;
					}
					if (ignore_impregnable) {
						if (impregnable_weapon_ids.includes(person.weapon)) continue;
					}						
					targets.push({
						gameId: person.gameId,
						unk: 0
					});
				}				
			} else {
				for(let monster of monsters) {
					targets.push({
						gameId: monster.gameId,
						unk: 0
					});					
				}
				for(let person of people) {
					if (focusplayer) {
						if (!players_to_focus.includes(person.name)) continue;
					}					
					if (blockguild) {
						if (guilds_to_block.includes(person.guild)) continue;
					}
					if (focusguild) {
						if (!guilds_to_focus.includes(person.guild)) continue;
					}
					if (ignore_impregnable) {
						if (impregnable_weapon_ids.includes(person.weapon)) continue;
					}					
					targets.push({
						gameId: person.gameId,
						unk: 0
					});
				}				
			}
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
	
	script.hook('S_START_COOLTIME_SKILL', 3, packet => {
		if (packet.skill.id == 340200 && sorc_enab && !mana_boost_cd) {
			mana_boost_cd = true;
			CD_mana = packet.cooldown;
			setTimeout(function () {
				mana_boost_cd = false;
			}, CD_mana);
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
		mb_packet = {
			skill: {
				reserved: 0,
				npc: false,
				type: 1,
				huntingZoneId: 0,
				id: 340200
			},
			loc: {
				x: myPosition.x,
				y: myPosition.y,
				z: bugme ? zbug : myPosition.z
			},
			w: myAngle,
			continue: false,
			targets: [{
				arrowId: 0,
				gameId: 0,
				hitCylinderId: 0
			}],
			endpoints: endp
		}
		if (mana_boost_cd) script.toServer('C_START_INSTANCE_SKILL', 7, arcane_packet);    
		if (!mana_boost_cd) script.toServer('C_START_INSTANCE_SKILL', 7, mb_packet);
	}
	function reloadModule(mod_to_reload){
		delete require.cache[require.resolve(mod_to_reload)]
		console.log('Arcane Pulse Spam : Reloading ' + mod_to_reload + "...");
		return require(mod_to_reload)
	}	
}
