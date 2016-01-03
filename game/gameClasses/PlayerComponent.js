var PlayerComponent = IgeEntity.extend({
	classId: 'PlayerComponent',
	componentId: 'playerControl',

	init: function (entity, options) {
		var self = this;

		// Store the entity that this component has been added to
		this._entity = entity;

		// Store any options that were passed to us
		this._options = options;

		if (!ige.isServer) {
            ige.chat.joinRoom('lobby');
			// Listen for mouse events on the texture map
			ige.client.textureMap1.mouseUp(function (tileX, tileY, event) {
				// Send a message to the server asking to path to this tile
				ige.network.send('playerControlToTile', [tileX, tileY]);
			});

            ige.client.ctInput.on('enter',function(e){
                ige.client.ctInput.value('');
                ige.client.ctInput._value = '';
                //self.ctInput.setAttribute('value','');
                console.log('Message:'+e);
                ige.client.ctInput.blur();
                ige.client.ctInput.focus();
                ige.chat.sendToRoom('lobby',e,null);
            });

            ige.network.on('igeChatMsg',function(e){
                //console.log(e);
                ige.client.ctBox.value(ige.client.ctBox.value()+'\n'+ e.text);
            })
		}
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerComponent; }