var Client = IgeClass.extend({
	classId: 'Client',

	init: function () {
        var login_user = prompt('tu usuario');
		//ige.timeScale(0.1);
		ige.showStats(1);
		ige.globalSmoothing(true);
		// Load our textures
		var self = this;

		// Enable networking
		ige.addComponent(IgeNetIoComponent);

        this.obj = [];
		// Implement our game methods
		this.implement(ClientNetworkEvents);

		// Create the HTML canvas
		ige.createFrontBuffer(true);

		// Load the textures we want to use
		this.textures = {
			grassSheet: new IgeCellSheet('../assets/textures/tiles/grassSheet.png', 4, 1),
            dirtSheet: new IgeCellSheet('../assets/textures/tiles/dirtSheet.png', 4, 1),
            tileSheet: new IgeCellSheet('../assets/textures/tiles/iso-64x64-outside.png', 10, 32),
            bank: new IgeTexture('../assets/textures/buildings/bank1.png')
		};

        this.implement(GameItem);
        this.implement(GameObject);

		ige.on('texturesLoaded', function () {
			// Ask the engine to start
			ige.start(function (success) {
				// Check if the engine started successfully
				if (success) {
					// Start the networking (you can do this elsewhere if it
					// makes sense to connect to the server later on rather
					// than before the scene etc are created... maybe you want
					// a splash screen or a menu first? Then connect after you've
					// got a username or something?
					ige.network.start('http://localhost:2000', function () {
						ige.addComponent(IgeChatComponent);
						// Setup the network command listeners
                        ige.network.define('login', self._login);
                        ige.network.define('getMap', self._getMap);
						ige.network.define('playerEntity', self._onPlayerEntity); // Defined in ./gameClasses/ClientNetworkEvents.js
                        ige.network.define('showChatMessageOnPlayer',self._onShowChatMessageOnPlayer);
						// Setup the network stream handler
						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(80) // Render the simulation 160 milliseconds in the past
							// Create a listener that will fire whenever an entity
							// is created because of the incoming stream data
							.stream.on('entityCreated', function (entity) {
								self.log('Stream entity created with ID: ' + entity.id());

							});



                        ige.network.send('login', {
                            username:login_user,
                            password: 'moo123'
                        });

						
						// We don't create any entities here because in this example the entities
						// are created server-side and then streamed to the clients. If an entity
						// is streamed to a client and the client doesn't have the entity in
						// memory, the entity is automatically created. Woohoo!
					});
				}
			});
		});
	},
    /**
     * Called by the server sending us a successful login
     * packet. See ClientNetworkEvents.js
     */
    startClient: function () {
        this.log('Starting game...');

        // Create the basic scene, viewport etc
        this.setupScene();

        // Create the UI entities
        //this.setupUi();

        // Setup the initial entities
        this.setupEntities();
    },

    setupScene: function(){
        this.mainScene = new IgeScene2d()
            .id('mainScene');


        this.backgroundScene = new IgeScene2d()
            .id('backgroundScene')
            .layer(0)

            .mount(this.mainScene);

        this.foregroundScene = new IgeScene2d()
            .id('foregroundScene')
            .layer(1)
            .mount(this.mainScene);

        this.foregroundMap = new IgeTileMap2d()
            .id('foregroundMap')
            .tileWidth(40)
            .tileHeight(40)
            .isometricMounts(true)
            .mount(this.foregroundScene);

        this.uiScene = new IgeScene2d()
            .id('uiScene')
            .layer(2)
            .ignoreCamera(true)
            .mount(this.mainScene);

        ige.ui.style('.myStyle',{
            'width':'90%',
            'height': '90%',
            'borderColor':'#FFFFFF',
            'borderWidth': 1,
            'borderRadius': 15
        });

        ige.ui.style('.chattingInput',{
            'width':'70%',
            'height':30,
            'borderColor':'#FFFFFF',
            'borderWidth': 1,
            'borderRadius': 15,
            'bottom': 15,
            'left':10
        });

        ige.ui.style('.chattingText',{
            'width':'20%',
            'height':300,
            'borderColor':'#FFFFFF',
            'borderWidth': 1,
            'borderRadius': 15,
            'bottom': 15,
            'right':10
        });

        ige.ui.style('.chattingInput:focus',{
            'borderColor':'#FFFF00',
            'borderWidth': 2
        });

        /*ige.ui.style('.myStyle:hover',{
         'backgroundColor':'#ff0000'
         });*/

        /*new IgeUiElement()
         .id('div1')
         .mount(self.uiScene);*/

        this.ctBox = new IgeUiTextBox()
            .id('ctBox')
            .styleClass('chattingText')
            //.placeHolder('write something and press ENTER to chat...')
            .mount(this.uiScene);

        this.ctBox._fontEntity
            .nativeFont('Verdana 12px')
            .colorOverlay('#ffffff');

        this.ctInput = new IgeUiTextBox()
            .id('ctInput')
            .styleClass('chattingInput')
            //.placeHolder('write something and press ENTER to chat...')
            .mount(this.uiScene);

        this.ctInput._fontEntity
            .nativeFont('Verdana 12px')
            .colorOverlay('#ffffff');



        this.ctInput.on('focus',function(){
            //ige.input.stopPropagation();
        });

        // Create the main viewport and set the scene
        // it will "look" at as the new scene1 we just
        // created above
        this.vp1 = new IgeViewport()
            .id('vp1')
            .autoSize(true)
            .scene(this.mainScene)
            .drawBounds(false)
            .mount(ige);

        // Create the texture map that will work as our "tile background"
        // Create the texture maps
        this.textureMap1 = new IgeTextureMap()
            .depth(0)
            .tileWidth(40)
            .tileHeight(40)
            //.drawGrid(20)
            .drawMouse(true)
            .translateTo(0, 0, 0)
            .drawBounds(false)
            //.autoSection(10) //This make some artifacts on Firefox
            .drawSectionBounds(false)
            .isometricMounts(true)
            .highlightOccupied(false)
            //.translateTo(300, 300, 0)
            .mount(this.backgroundScene);

        var texIndex = this.textureMap1.addTexture(this.textures.dirtSheet);

        this.textureMap2 = new IgeTextureMap()
            .depth(1)
            .tileWidth(40)
            .tileHeight(40)
            //.drawGrid(20)
            .drawMouse(true)
            .translateTo(0, 0, 0)
            .drawBounds(false)
            .autoSection(10)
            .drawSectionBounds(false)
            .isometricMounts(true)
            .highlightOccupied(false)
            //.translateTo(300, 300, 0)
            .mount(this.backgroundScene);

        var texIndex2 = this.textureMap2.addTexture(this.textures.tileSheet);
    },

    setupEntities: function(){
        // Ask the server to send us the tile data
        ige.network.request('gameTiles', {}, function (commandName, data) {
            console.log('gameTiles response', data);

            // Paint the texture map based on the data sent from the server
            var x, y, tileData;

            for (x = 0; x < data.length; x++) {
                for (y = 0; y < data[x].length; y++) {
                    tileData = data[x][y];
                    ige.client.textureMap1.paintTile(x, y, tileData[0], tileData[1]);
                }
            }
            /*for (x = 0; x < data.length; x++) {
                for (y = 0; y < data[x].length; y++) {
                    tileData = data[x][y];
                    ige.client.textureMap2.paintTile(x, y, tileData[0], tileData[1]+32);
                }
            }*/


            // Now set the texture map's cache data to dirty so it will
            // be redrawn
            ige.client.textureMap2.cacheDirty(true);
            ige.client.textureMap1.cacheDirty(true);

        });

        // Ask the server to create an entity for us
        ige.network.send('playerEntity');
        ige.network.send('getMap');
    },
    /**
     * Creates and returns a temporary item that can be used
     * to indicate to the player where their item will be built.
     * @param type
     */
    createTemporaryItem: function (type) {
        // Create a new item at a far off tile position - it will
        // be moved to follow the mouse cursor anyway but it's cleaner
        // to create it off-screen first.
        return new this[type](this.foregroundMap, 100, 100);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }