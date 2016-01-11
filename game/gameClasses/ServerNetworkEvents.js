var ServerNetworkEvents = {
	/**
	 * Is called when the network tells us a new client has connected
	 * to the server. This is the point we can return true to reject
	 * the client connection if we wanted to.
	 * @param data The data object that contains any data sent from the client.
	 * @param clientId The client id of the client that sent the message.
	 * @private
	 */
	_onPlayerConnect: function (socket) {
		// Don't reject the client connection
		return false;
	},

	_onPlayerDisconnect: function (clientId) {
		if (ige.server.players[clientId]) {
			// Remove the player from the game
			ige.server.players[clientId].destroy();

			// Remove the reference to the player entity
			// so that we don't leak memory
			delete ige.server.players[clientId];
		}
	},

	_onPlayerEntity: function (data, clientId) {
		if (!ige.server.players[clientId]) {
			ige.server.players[clientId] = new CharacterContainer(clientId)
				.addComponent(PlayerComponent)
                //.mode(1)
				.streamMode(1)
				.mount(ige.server.foregroundMap);

            var playerEntity = ige.server.players[clientId];


            //playerEntity.path.on('pointComplete',function(e) {
            playerEntity.path.on('pathComplete',function(e) {
                //console.log(playerEntity.forcedDirection);
                if(playerEntity.forcedDirection) {
                    playerEntity._streamDir = playerEntity.forcedDirection;
                    playerEntity.forcedDirection = false;
                }
                return false;
                tileX = playerEntity._translate.x /  ige.server.collisionMap.tileWidth();
                tileY = playerEntity._translate.y /  ige.server.collisionMap.tileHeight();
                //console.log('MIOS :'+tileX+','+tileY);
                rect1 = new IgeRect()
                    .init(tileX,tileY,1,1);
                for(var id_player in ige.server.players){
                    if(id_player!=clientId) {
                        anotherPlayer = ige.server.players[id_player];
                        //ESTO NO SE QUE POLLAS DA, PORQUE DA NUMEROS QUE LE SALE DEL CIPOTE
                        //tileAnother = anotherPlayer.overTiles()[0];
                        anotherTileX = anotherPlayer._translate.x /  ige.server.collisionMap.tileWidth();
                        anotherTileY = anotherPlayer._translate.y /  ige.server.collisionMap.tileHeight();
                        //console.log('MIOS :'+tileX+','+tileY+' - DEL OTRO POLLO:'+anotherTileX+','+anotherTileY);
                        rect2 = new IgeRect()
                            .init(anotherTileX,anotherTileY,1,1);
                        /*if(tileX == anotherTileX && tileY == anotherTileY){
                            console.log('cooollision');
                            playerEntity
                                .path.stop();
                        }*/
                        if(rect1.rectIntersect(rect2)){
                            b = playerEntity.path.currentTargetCell();
                            //startTile = playerEntity._parent.pointToTile(b.toIso());
                            startTile = b;
                            console.log('startTile', startTile);
                            console.log(b);
                            // Generate a path to the destination tile and then start movement
                            // along the path
                            newPath = ige.server.pathFinder.aStar(ige.server.collisionMap, startTile, new IgePoint(parseInt(b.link.x), parseInt(b.link.y), 0), function (tileData, tileX, tileY) {
                                // If the map tile data is set to 1, don't allow a path along it
                                return tileData !== 1;
                            }, true, true, false);


                            if (newPath.length > 0) {
                                // Start movement along the new path
                                playerEntity
                                    .path.clear()
                                    .path.add(newPath)
                                    .path.start();

                            }
                        }
                        /*if(playerEntity.aabb().rectIntersect(anotherPlayer.aabb())) {
                         console.log('aaaaaaa');
                         playerEntity
                         .path.stop()

                         }*/
                    }
                }
            });

            playerEntity.path.on('pointOnMove',function(e) {
                //check tile
                //tile = playerEntity.overTiles()[0];
                tileX = e.x /  ige.server.collisionMap.tileWidth();
                tileY = e.y /  ige.server.collisionMap.tileHeight();
                b = playerEntity.path.currentTargetCell();
                tileX = b.x;
                tileY = b.y;
                //console.log(tileX+','+tileY);
                rect1 = new IgeRect()
                    .init(tileX,tileY,1,1);
                for(var id_player in ige.server.players){
                    if(id_player!=clientId) {
                        anotherPlayer = ige.server.players[id_player];
                        //ESTO NO SE QUE POLLAS DA, PORQUE DA NUMEROS QUE LE SALE DEL CIPOTE
                        //tileAnother = anotherPlayer.overTiles()[0];
                        anotherTileX = anotherPlayer._translate.x /  ige.server.collisionMap.tileWidth();
                        anotherTileY = anotherPlayer._translate.y /  ige.server.collisionMap.tileHeight();
                        //console.log('MIOS :'+tileX+','+tileY+' - DEL OTRO POLLO:'+anotherTileX+','+anotherTileY);
                        rect2 = new IgeRect()
                            .init(anotherTileX,anotherTileY,1,1);
                        /*if(tileX == anotherTileX && tileY == anotherTileY){
                            console.log('cooollision');
                            playerEntity
                                .path.stop();

                        }*/

                        if(rect1.rectIntersect(rect2)){
                            b = playerEntity.path.currentTargetCell();
                            //startTile = playerEntity._parent.pointToTile(b.toIso());
                            startTile = b;
                            // Generate a path to the destination tile and then start movement
                            // along the path
                            newPath = ige.server.pathFinder.aStar(ige.server.collisionMap, startTile, new IgePoint(parseInt(b.link.x), parseInt(b.link.y), 0), function (tileData, tileX, tileY) {
                                // If the map tile data is set to 1, don't allow a path along it
                                return tileData !== 1;
                            }, true, true, false,true);


                            if (newPath.length > 0) {
                                playerEntity.forcedDirection = playerEntity.path.currentDirection();
                                // Start movement along the new path
                                playerEntity
                                    .path.clear()
                                    .path.add(newPath)
                                    .path.start();


                            }
                        }
                        /*if(playerEntity.aabb().rectIntersect(anotherPlayer.aabb())) {
                            console.log('aaaaaaa');
                            playerEntity
                                .path.stop()

                        }*/
                    }
                }
                 /*b = playerEntity.path.currentTargetCell();
                 object = ige.server.collisionMap.isTileOccupied(b.x,b.y,1,1);
                 if(!object) {
                    ige.server.collisionMap.occupyTile(b.x, b.y, 1, 1, 1);// Mark tile area as occupied with a value of 1 (x, y, width, height, value);
                    //a = playerEntity.path.previousTargetPoint();
                    ige.server.collisionMap.unOccupyTile(b.link.x, b.link.y,1,1);
                 }
                 console.log(b);
                 console.log(object);*/
            });

            //playerEntity.path.on('started',function(e){
                //a = playerEntity.path.currentTargetPoint();
                //console.log(a);
            //});
			// Tell the client to track their player entity
			ige.network.send('playerEntity', ige.server.players[clientId].id(), clientId);
		}
	},

	_onPlayerControlToTile: function (data, clientId) {
        var playerEntity = ige.server.players[clientId],
            newPath,
            currentPosition = playerEntity._translate,
            startTile;

        for(var id_player in ige.server.players){
            anotherPlayer = ige.server.players[id_player];
            //ESTO NO SE QUE POLLAS DA, PORQUE DA NUMEROS QUE LE SALE DEL CIPOTE
            //tileAnother = anotherPlayer.overTiles()[0];
            anotherTileX = anotherPlayer._translate.x /  ige.server.collisionMap.tileWidth();
            anotherTileY = anotherPlayer._translate.y /  ige.server.collisionMap.tileHeight();
            if(parseInt(data[0]) == anotherTileX && parseInt(data[1]) == anotherTileY){
                return false;
            }
            //console.log('LO QUE MANDA:'+parseInt(data[0])+';'+parseInt(data[1])+'---'+anotherTileX+','+anotherTileY);
        }
        //console.log('Path to: ', data);

        // Calculate the start tile from the current position by using the collision map
        // as a tile map (any map will do with the same tileWidth and height).
        startTile = playerEntity._parent.pointToTile(currentPosition.toIso());

        //console.log('startTile', startTile);

        // Generate a path to the destination tile and then start movement
        // along the path
        newPath = ige.server.pathFinder.aStar(ige.server.collisionMap, startTile, new IgePoint(parseInt(data[0]), parseInt(data[1]), 0), function (tileData, tileX, tileY) {
            // If the map tile data is set to 1, don't allow a path along it
            return tileData !== 1;
        }, true, true, false,true);


        if (newPath.length > 0) {
            // Start movement along the new path
            playerEntity
                .path.clear()
                .path.add(newPath)
                .path.start();

        }
	},

    _onShowChatMessageOnPlayer:function(data,clientId){
        var playerEntity = ige.server.players[clientId];
        //playerEntity.sayText = data;
        //ige.server.players[clientId].sayText = data.text;
        //playerEntity.streamSectionData('chat',data.text);
        playerEntity._streamChat = data.text;

        if(data.text == 'HIT'){
            for(var id_player in ige.server.players){
                if(id_player!=clientId) {
                    playerAttacked = ige.server.players[id_player];
                    playerAttacked._streamHealth = playerAttacked.currentHealth-=10;
                }
            }

/*

            ige.server.players.forEach(function(player,id){
                if(id!=clientId) {
                    playerAttacked = ige.server.players[id];
                    playerAttacked._streamHealth = playerAttacked.currentHealth-=10;
                }
            });*/

            //playerEntity._streamHealth = playerEntity.currentHealth-=10;
        }

        //console.log(playerEntity._id);
        //ige.network.send('showChatMessageOnPlayer', {id:ige.server.players[clientId].id(),text:data.text,playerEntity:playerEntity._id}, clientId);

    },

    _onTouchCharacterContainer:function(data,clientId){
        for(var id_player in ige.server.players){
            if(id_player!=clientId) {
                anotherPlayer = ige.server.players[id_player];
                if(data == anotherPlayer.id()){
                    anotherPlayer._streamHealth = anotherPlayer.currentHealth-=10;
                }

            }
        }
    }


};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }