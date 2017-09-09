'use strict';

import AM from './assetmanager';
import SH from './secrethitler';
import Animate from './animate';
import {LiberalPolicyCard, FascistPolicyCard, VetoCard} from './card';

export default class GameTable extends THREE.Object3D
{
	constructor()
	{
		super();

		// table state
		this.liberalCards = 0;
		this.fascistCards = 0;
		this.failedVotes = 0;
		this.cards = [];

		// add table asset
		this.model = AM.cache.models.table;
		this.model.scale.setScalar(1.25);
		this.add(this.model);

		// save references to the textures
		this.textures = [
			AM.cache.textures.board_small,
			AM.cache.textures.board_med,
			AM.cache.textures.board_large
		];
		this.textures.forEach(tex => tex.flipY = false);
		this.setTexture(this.textures[0], true);
		
		// position table
		this.position.set(0, 0.88, 0);

		SH.addEventListener('update_turnOrder', this.changeMode.bind(this));
		SH.addEventListener('update_liberalPolicies', this.updatePolicies.bind(this));
		SH.addEventListener('update_fascistPolicies', this.updatePolicies.bind(this));
		SH.addEventListener('update_failedVotes', this.updatePolicies.bind(this));
	}

	changeMode({data: {game: {state, turnOrder}}})
	{
		if(turnOrder.length >= 9)
			this.setTexture(this.textures[2]);
		else if(turnOrder.length >= 7)
			this.setTexture(this.textures[1]);
		else
			this.setTexture(this.textures[0]);
	}

	setTexture(newTex, switchLightmap)
	{
		this.model.traverse(o => {
			if(o instanceof THREE.Mesh)
			{
				if(switchLightmap)
					o.material.lightMap = o.material.map;

				o.material.map = newTex;
			}
		});
	}

	updatePolicies({data: {game: {liberalPolicies, fascistPolicies, failedVotes, hand, state}}})
	{
		let cardsInUpdate = liberalPolicies + fascistPolicies - this.liberalCards - this.fascistCards;
		let animate = cardsInUpdate === 1;

		let promises = [];

		for(var i=this.liberalCards; i<liberalPolicies; i++){
			let card = new LiberalPolicyCard();
			this.cards.push(card);
			this.add(card);
			promises.push(card.goToPosition(i, animate));
		}
		this.liberalCards = liberalPolicies;

		for(var i=this.fascistCards; i<fascistPolicies; i++){
			let card = new FascistPolicyCard();
			this.cards.push(card);
			this.add(card);
			promises.push(card.goToPosition(i, animate));
		}
		this.fascistCards = fascistPolicies;

		if(state === 'aftermath' && hand === 1){
			let card = new VetoCard();
			card.position.set(0,1,0);
			this.add(card);
			promises.push(Animate.wait(1000).then(() => {
				this.remove(card);
				return SH.electionTracker.anim;
			}));
		}

		if(state === 'aftermath'){
			Promise.all(promises).then(() => {
				SH.dispatchEvent({
					type: 'policyAnimDone',
					bubbles: false
				});
			});
		}

		if(liberalPolicies === 0 && fascistPolicies === 0){
			this.cards.forEach(c => this.remove(c));
		}
	}
};
