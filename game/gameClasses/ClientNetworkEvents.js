var ClientNetworkEvents = {
    /**
     * The server sent us a login packet which carries either
     * success or failure.
     * @param data
     * @private
     */
    _login: function (data) {
        if (data.success) {
            // Our login was successful!
            ige.client.log('Server accepted our login request...');
            ige.client.startClient();
            ige.manualRender();
        } else {
            ige.client.log('Server rejected our login request!');
        }
    },
	/**
	 * Is called when a network packet with the "playerEntity" command
	 * is received by the client from the server. This is the server telling
	 * us which entity is our player entity so that we can track it with
	 * the main camera!
	 * @param data The data object that contains any data sent from the server.
	 * @private
	 */
	_onPlayerEntity: function (data) {
		if (ige.$(data)) {
			// Add the player control component
			ige.$(data).addComponent(PlayerComponent);
			
			// Track our player with the camera
			ige.client.vp1.camera.trackTranslate(ige.$(data), 50);
		} else {
			// The client has not yet received the entity via the network
			// stream so lets ask the stream to tell us when it creates a
			// new entity and then check if that entity is the one we
			// should be tracking!
			var self = this;
			self._eventListener = ige.network.stream.on('entityCreated', function (entity) {
				if (entity.id() === data) {
					// Add the player control component
					ige.$(data).addComponent(PlayerComponent);
					
					// Tell the camera to track out player entity
					ige.client.vp1.camera.trackTranslate(ige.$(data), 50);

					// Turn off the listener for this event now that we
					// have found and started tracking our player entity
					ige.network.stream.off('entityCreated', self._eventListener, function (result) {
						if (!result) {
							this.log('Could not disable event listener!', 'warning');
						}
					});
				}
			});
		}
	},

    _onShowChatMessageOnPlayer:function(data){

        /*ige.$(data).sayText = data.text;
        a = new CharacterContainer(data.id);
        a.chatBar.width(data.text.length * 10);
        a.chatBar.translateTo(-((data.text.length * 10) / 2), -75, 1);
        a.sayText = data.text;*/
    },
    /**
     * The server sent us our map data so loop it and create
     * the appropriate buildings.
     * @param data
     * @private
     */
    _getMap: function (data) {
        ige.client.log('Map data received...');

        var i, item, entity;

        // Loop the map data and create the buildings
        for (i = 0; i < data.length; i++) {
            item = data[i];

            // Create the new building entity
            entity = ige.client.createTemporaryItem(item.classId)
                .data('tileX', item.tileX)
                .data('tileY', item.tileY)
                .translateToTile(item.tileX + 0.5, item.tileY + 0.5, 0);

            if (item.classId === 'SkyScraper') {
                entity.addFloors(item.buildFloors);
            }

            entity.place();
        }

        //ige.manualRender();
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }