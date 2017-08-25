var ServerNetworkEvents = {
    _clientStore: {},
    /**
     * Called when we receive a request from a client to login
     * to the server. This is where we would usually check their
     * login credentials and send a response of either success
     * or failure.
     * @param data
     * @param clientId
     * @private
     */
    _login: function (data, clientId) {
        var self = ige.server;

        // TODO: Actually create a login system... at the moment we just accept the login from bob123
        console.log('Login request received', data);

        ige.mysql.query('SELECT * FROM user WHERE nickname = '+ige.mysql.escape(data.username), function (err, rows, fields) {
            console.log('SELECT * FROM user WHERE nickname = '+ige.mysql.escape(data.username));
            if (!err) {
                console.log(rows[0]);
                if(typeof rows[0] != 'undefined'){
                    console.log('Sending login accepted...');
                    self._clientStore[clientId] = self._clientStore[clientId] || {};
                    self._clientStore[clientId] = rows[0];
                    ige.network.send('login', {success: true}, clientId);
                }else{
                    console.log('Sending login denied - no user exists...');
                    ige.network.send('login', {success: false}, clientId);
                }
            } else {
                console.log('Sending login denied...');
                ige.network.send('login', {success: false}, clientId);
                console.log('Error', err);
            }
        });

        /*if (data.username === 'bob123' && data.password === 'moo123') {
            // Store the username in the client store
            self._clientStore[clientId] = self._clientStore[clientId] || {};
            self._clientStore[clientId].username = data.username;

            console.log('Sending login accepted...');
            ige.network.send('login', {success: true}, clientId);
        } else {
            console.log('Sending login denied...');
            ige.network.send('login', {success: false}, clientId);
        }*/
    },
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
				.mount(ige.server.foregroundMap)
                .translateTo(ige.server._clientStore[clientId].last_x, ige.server._clientStore[clientId].last_y, 0);

            ige.server.players['npc_'+clientId] = new CharacterContainer('npc_'+clientId)
                .addComponent(PlayerComponent)
                .addComponent(NPCComponent)
                //.mode(1)
                .streamMode(1)
                .mount(ige.server.foregroundMap)
                .translateTo(400, 400,0);

            /*newPath = ige.server.pathFinder.aStar(ige.server.collisionMap, new IgePoint(5, 5, 0), new IgePoint(18, 18, 0), function (tileData, tileX, tileY) {
                // If the map tile data is set to 1, don't allow a path along it
                return tileData !== 1;
            }, true, true, false,true);


            if (newPath.length > 0) {
                // Start movement along the new path
                ige.server.players['npc_'+clientId]
                    .path.clear()
                    .path.add(newPath)
                    .path.start();

            }*/



            // Assign the path to the player
            ige.server.players['npc_'+clientId].pathnew
                .finder(ige.server.pathFinder2)
                .tileMap(ige.server.collisionMap)
                .tileChecker(function (tileData, tileX, tileY) {
                    // If the map tile data is set to 1, don't allow a path along it
                    return tileData !== 1;
                })
                .drawPath(true); // Enable debug drawing the paths
                //.drawPathGlow(true); // Enable path glowing (eye candy)



            // Some error events from the path finder (these are for debug console logging so you
            // know what events are emitted by the path finder class and what they mean)
            ige.server.pathFinder2.on('noPathFound', function () { console.log('Could not find a path to the destination!'); });
            ige.server.pathFinder2.on('exceededLimit', function () { console.log('Path finder exceeded allowed limit of nodes!'); });
            ige.server.pathFinder2.on('pathFound', function () { console.log('Path to destination calculated...'); });

            // Start traversing the path!
            ige.server.players['npc_'+clientId].pathnew
                //.allowDiagonal(true)
                //.allowSquare(false)
                .set(0, 0, 0, 0, 4, 0)
                .add(2, 4, 0)
                .add(5, 4, 0)
                .add(6, 2, 0)
                .add(0, 0, 0)
                .speed(1)
                .start();

            var playerEntity = ige.server.players[clientId];
            playerEntity._streamPlayernames = ige.server._clientStore[clientId].nickname;

            //playerEntity.path.on('pointComplete',function(e) {
            playerEntity.path.on('pathComplete',function(e) {
                //console.log(playerEntity.forcedDirection);
                if(playerEntity.forcedDirection) {
                    playerEntity._streamDir = playerEntity.forcedDirection;
                    playerEntity.forcedDirection = false;
                }
                tileX = playerEntity._translate.x /  ige.server.collisionMap.tileWidth();
                tileY = playerEntity._translate.y /  ige.server.collisionMap.tileHeight();
                ige.mysql.query('UPDATE user SET last_x = '+ige.mysql.escape(parseInt(playerEntity._translate.x))+', last_y = '+ige.mysql.escape(parseInt(playerEntity._translate.y))+' WHERE id_user = '+ige.mysql.escape(ige.server._clientStore[clientId].id_user), function (err, rows, fields) {
                    //console.log(ige.mysql.query.sql);
                });
                return false;

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
                            }, true, true, false,false);


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

            //ige.network.send('playerEntity', ige.server.npcs[clientId].id(), clientId);
		}
	},

	_onPlayerControlToTile: function (data, clientId) {
        var playerEntity = ige.server.players[clientId],
            newPath,
            currentPosition = playerEntity._translate,
            startTile,
            continuum = true;

        playerEntity._streamCustomanim = false;
        playerTileX = playerEntity._translate.x /  ige.server.collisionMap.tileWidth();
        playerTileY = playerEntity._translate.y /  ige.server.collisionMap.tileHeight();
        for(var id_player in ige.server.players){
            anotherPlayer = ige.server.players[id_player];
            //ESTO NO SE QUE POLLAS DA, PORQUE DA NUMEROS QUE LE SALE DEL CIPOTE
            //tileAnother = anotherPlayer.overTiles()[0];
            anotherTileX = anotherPlayer._translate.x /  ige.server.collisionMap.tileWidth();
            anotherTileY = anotherPlayer._translate.y /  ige.server.collisionMap.tileHeight();
            if(parseInt(data[0]) == anotherTileX && parseInt(data[1]) == anotherTileY){
                playerEntity.lookAtDir = getDirectionByCalculatedXY((playerTileX-anotherTileX),(playerTileY-anotherTileY));
                playerEntity._streamDir = playerEntity.lookAtDir;
                //console.log(playerEntity._streamDir);
                continuum = false;
                //return false;
            }
            //console.log('LO QUE MANDA:'+parseInt(data[0])+';'+parseInt(data[1])+'---'+anotherTileX+','+anotherTileY);
        }
        //console.log('Path to: ', data);

        if(continuum) {
            // Calculate the start tile from the current position by using the collision map
            // as a tile map (any map will do with the same tileWidth and height).
            startTile = playerEntity._parent.pointToTile(currentPosition.toIso());

            //console.log('startTile', startTile);

            // Generate a path to the destination tile and then start movement
            // along the path
            newPath = ige.server.pathFinder.aStar(ige.server.collisionMap, startTile, new IgePoint(parseInt(data[0]), parseInt(data[1]), 0), function (tileData, tileX, tileY) {
                // If the map tile data is set to 1, don't allow a path along it
                return tileData !== 1;
            }, true, true, false, false); //El último parametro es para meter las 6 direcciones


            if (newPath.length > 0) {
                // Start movement along the new path
                playerEntity
                    .path.clear()
                    .path.add(newPath)
                    .path.start();

            }
        }
	},

    _onShowChatMessageOnPlayer:function(data,clientId){
        var playerEntity = ige.server.players[clientId];
        //playerEntity.sayText = data;
        //ige.server.players[clientId].sayText = data.text;
        //playerEntity.streamSectionData('chat',data.text);
        playerEntity._streamChat = data.text;

        setTimeout(function(){
            //if(data.text != '') {
                //data.text = '';
                //console.log('borrar '+data.text+' '+clientId);
                playerEntity._streamChat = '';
                //IgeChatServer.sendToRoom('lobby','',null,clientId);
                //ige.server._onShowChatMessageOnPlayer(data, clientId);
            //}
        },3000);
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

        var playerEntity = ige.server.players[clientId];
        playerTileX = playerEntity._translate.x /  ige.server.collisionMap.tileWidth();
        playerTileY = playerEntity._translate.y /  ige.server.collisionMap.tileHeight();

        //console.log(playerEntity.path.currentDirection());


        for(var id_player in ige.server.players){

            if(id_player!=clientId) {
                anotherPlayer = ige.server.players[id_player];

                if(data == anotherPlayer.id()){
                    anotherTileX = anotherPlayer._translate.x /  ige.server.collisionMap.tileWidth();
                    anotherTileY = anotherPlayer._translate.y /  ige.server.collisionMap.tileHeight();
                    if(playerEntity.isMelee){
                        if((Math.abs(playerTileX-anotherTileX) <= 1 && Math.abs(playerTileY-anotherTileY) <= 1)){
                            playerEntity.lookAtDir = getDirectionByCalculatedXY((playerTileX-anotherTileX),(playerTileY-anotherTileY));

                                //console.log('eooo');
                            playerEntity._streamCustomanim = 'K_'+playerEntity.lookAtDir;

                            //playerEntity._streamCustomanim = 'K_S';
                            playerEntity._streamDir = playerEntity.lookAtDir;
                            anotherPlayer._streamHealth = anotherPlayer.currentHealth-=10;
                            anotherPlayer._streamCustomanim = 'H_'+getDirectionInverseByString(playerEntity.lookAtDir);
                        }
                    }

                }

            }
        }

    },

    /**
     * Called when we receive a request from a client to load
     * the user's current map data and send it to them.
     * @param data
     * @param clientId
     * @private
     */
    _getMap: function (data, clientId) {
        // Grab all the data on the user's map
        var self = ige.server,
            searchData = {
                username: self._clientStore[clientId].username
            };

        /*var results = [];
        results[0] = [];
        results[0].classId = 'Bank';
        results[0].tileX = 100;
        results[0].tileY = 100;*/
        var results = new Object();
        results.classId = 'Bank';
        results.tileX = 1;
        results.tileY = 1;
        var pluginArrayArg = new Array();
        pluginArrayArg.push(results);
        //console.log(JSON.parse(JSON.stringify(pluginArrayArg)));

        var i, item, entity;

        // Loop the map data and create the buildings
        for (i = 0; i < pluginArrayArg.length; i++) {
            item = pluginArrayArg[i];
            //console.log(item.classId);
            // Create the new building entity
            //console.log(GameObject.Bank.classId);
            ige.server.collisionMap.occupyTile(item.tileX, item.tileY, 3, 3, 1);

            //Otros puntos bloqueados
            //ige.server.collisionMap.occupyTile(1, 4, 3, 3, 1);
            //ige.server.collisionMap.occupyTile(2, 2, 3, 3, 1);
            /*entity = ige.server.createTemporaryItem(item.classId)
                .data('tileX', item.tileX)
                .data('tileY', item.tileY)
                .translateToTile(item.tileX + 0.5, item.tileY + 0.5, 0);

            if (item.classId === 'SkyScraper') {
                entity.addFloors(item.buildFloors);
            }

            entity.place();*/
        }

        ige.network.send('getMap', JSON.parse(JSON.stringify(pluginArrayArg)));
        /*ige.mongo.findAll('buildings', searchData, function (err, results) {
            console.log(results);
            if (results && results.length) {
                ige.network.send('getMap', results);
            }
        });*/
    }

};

function getDirectionByCalculatedXY(X,Y){
    //console.log('X:'+X+' Y:'+Y);
    if(X > 0){
        if(Y > 0){
            return 'N';
        }else if(Y == 0){
            return 'W'
        }else{
            return 'SW';
        }
    }else if(X == 0){
        if(Y > 0){
            return 'N';
        }else if(Y == 0){
            return 'N'
        }else{
            return 'S';
        }
    }else{
        if(Y > 0){
            return 'NE';
        }else if(Y == 0){
            return 'E'
        }else{
            return 'S';
        }
    }
    return 'NE';
}

function getDirectionInverseByString(dir){
    var inverse = '';
    switch(dir){
        case 'N': inverse = 'S'; break;
        case 'S': inverse = 'N'; break;
        case 'W': inverse = 'E'; break;
        case 'E': inverse = 'W'; break;
        case 'NE': inverse = 'SW'; break;
        case 'NW': inverse = 'SE'; break;
        case 'SW': inverse = 'NE'; break;
        case 'SE': inverse = 'NW'; break;
    }
    return inverse;
}

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }