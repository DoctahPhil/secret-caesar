'use strict';

import SH from './secrethitler';

class Behavior
{
	constructor(type){
		this.type = type;
	}

	awake(obj){
		this.object3D = obj;
	}

	start(){ }

	update(dT){ }

	dispose(){ }
}

class BSync extends Behavior
{
	constructor(eventName)
	{
		super('BSync');
		this._s = SH.socket;

		// listen for update events
		this.hook = this._s.on(eventName, this.updateFromServer.bind(this));
		this.eventName = eventName;
		this.owner = 0;
	}

	updateFromServer(data)
	{
		this.object3D.position.fromArray(data, 0);
		this.object3D.rotation.fromArray(data, 3);
	}

	takeOwnership()
	{
		if(SH.localUser && SH.localUser.userId)
			this.owner = SH.localUser.userId;
	}

	update(dT)
	{
		if(SH.localUser && SH.localUser.skeleton && SH.localUser.id === this.owner)
		{
			let j = SH.localUser.skeleton.getJoint('Head');
			this._s.emit(this.eventName, [...j.position.toArray(), ...j.rotation.toArray()]);
		}
	}

}

export { Behavior, BSync };
