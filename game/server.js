var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {

        ige.addComponent(IgeMySqlComponent, options.db).mysql.connect(function (err, db) {
            // Check if we connected to mysql correctly
            if (!err) {
                // Query the database
                ige.mysql.query('SELECT * FROM user', function (err, rows, fields) {
                    if (!err) {
                        console.log(rows[0]);
                    } else {
                        console.log('Error', err);
                    }
                });
            } else {
                console.log(err);
            }
        });
		var self = this;
		ige.timeScale(1);

		// Define an object to hold references to our player entities
		this.players = {};
        this.npcs = {};
		// Define an array to hold our tile data
		this.tileData = [];


		// Add the server-side game methods / event handlers
        this.implement(GameItem);
        this.implement(GameObject);
        this.implement(ServerNetworkEvents);


		// Add the networking component
		ige.addComponent(IgeNetIoComponent);
		ige.addComponent(IgeChatComponent)
			// Start the network server
			.network.start(2000, function () {
				// Networking has started so start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {
						// Create some network commands we will need
						ige.network.define('gameTiles', function (data, clientId, requestId) {
							console.log('Client gameTiles command received from client id "' + clientId + '" with data:', data);
							
							// Send the tile data back
							ige.network.response(requestId, self.tileData);
						});

                        ige.network.define('login', self._login);
                        ige.network.define('getMap', self._getMap);
						ige.network.define('playerEntity', self._onPlayerEntity);
						ige.network.define('playerControlToTile', self._onPlayerControlToTile);
                        ige.network.define('touchCharacterContainer', self._onTouchCharacterContainer);

						ige.network.on('connect', self._onPlayerConnect); // Defined in ./gameClasses/ServerNetworkEvents.js
						ige.network.on('disconnect', self._onPlayerDisconnect); // Defined in ./gameClasses/ServerNetworkEvents.js

                        ige.network.on('igeChatMsg',self._onShowChatMessageOnPlayer);
                        ige.network.define('showChatMessageOnPlayer', self._onShowChatMessageOnPlayer);

						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(30) // Send a stream update once every 30 milliseconds
							.stream.start(); // Start the stream

						// Accept incoming network connections
						ige.network.acceptConnections(true);

						// Create a new chat room
						ige.chat.createRoom('The Lobby', {}, 'lobby');

						// Create the scene
						self.mainScene = new IgeScene2d()
							.id('mainScene');

						self.backgroundScene = new IgeScene2d()
							.id('backgroundScene')
							.layer(0)
							.mount(self.mainScene);
						
						self.foregroundScene = new IgeScene2d()
							.id('foregroundScene')
							.layer(1)
							.mount(self.mainScene);
						
						self.foregroundMap = new IgeTileMap2d()
							.id('foregroundMap')
							.isometricMounts(true)
							.tileWidth(40)
							.tileHeight(40)
							.mount(self.foregroundScene);

						// Create the main viewport and set the scene
						// it will "look" at as the new scene1 we just
						// created above
						self.vp1 = new IgeViewport()
							.id('vp1')
							.autoSize(true)
							.scene(self.mainScene)
							.drawBounds(true)
							.mount(ige);
						
						// Create a tile map to use as a collision map. Basically if you set
						// a tile on this map then it will be "impassable".
						self.collisionMap = new IgeTileMap2d()
							.tileWidth(40)
							.tileHeight(40)
                            .isometricMounts(true)
							.translateTo(0, 0, 0)
							.occupyTile(-1, -1, 1, 1, 1);// Mark tile area as occupied with a value of 1 (x, y, width, height, value);

						// Generate some random data for our background texture map
						// this data will be sent to the client when the server receives
						// a "gameTiles" network command
						var rand, x, y;
						for (x = 0; x < 20; x++) {
							for (y = 0; y < 20; y++) {
								rand = Math.ceil(Math.random() * 4);
								self.tileData[x] = self.tileData[x] || [];
								
								// We assign [0, rand] here as we are assuming that the
								// tile will use the textureIndex 0. If you assign different
								// textures to the client-side textureMap then want to use them
								// you will need to alter the 0 to whatever texture you want to use
								self.tileData[x][y] = [0, rand];
							}
						}

                        var nTiles = (self.collisionMap.tileWidth()/2);
                        for (x = 0; x <= nTiles; x++) {
                            self.collisionMap.occupyTile(x, -1, 1, 1, 1);
                            self.collisionMap.occupyTile(x, nTiles, 1, 1, 1);
                            self.collisionMap.occupyTile(-1, x, 1, 1, 1);
                            self.collisionMap.occupyTile(nTiles, x, 1, 1, 1);
                        }
						
						// Create a pathFinder instance that we'll use to find paths
						self.pathFinder = new IgePathFinder()
							.neighbourLimit(100);
                        self.pathFinder2 = new IgePathFinder2()
                            .neighbourLimit(100)
					}
				});
			});
	},
    createTemporaryItem: function (type) {
        // Create a new item at a far off tile position - it will
        // be moved to follow the mouse cursor anyway but it's cleaner
        // to create it off-screen first.
        console.log(this.foregroundMap);
        return new this[type](this.foregroundMap, 100, 100);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }