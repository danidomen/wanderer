// Define our player character container classes
var CharacterContainer = IgeEntity.extend({
	classId: 'CharacterContainer',

	init: function () {
		var self = this;

		self.maxHealth = 100;
		self.currentHealth = 100;
        self.isMelee = true;
        self.nickname = false;

		IgeEntity.prototype.init.call(this);

		if (!ige.isServer) {
			// Setup the entity 3d bounds
			self.size3d(10, 10, 40);

            //self.width(100);
            //self.height(100);
			// Create a character entity as a child of this container
			self.character = new Character()
				.id(self.id() + '_character')
				.setType(1)
				.drawBounds(false)
				.drawBoundsData(false)
				.originTo(0.5, 0.6, 0.5)
				.mount(self);


            self.sayText = '';
            self.healthBar = new IgeEntity();
            self.chatBar = new IgeEntity();
            self.nameBar = new IgeEntity();

            this._healthTexture = new IgeTexture('../assets/textures/smartTextures/healthBar.js');
            this._chatTexture = new IgeTexture('../assets/textures/smartTextures/chatBar.js');
            this._nameTexture = new IgeTexture('../assets/textures/smartTextures/nameBar.js');
            // Wait for the texture to load
            this._healthTexture.on('loaded', function () {
                var healthBarWidth = ige.client.textureMap1.tileWidth()*1.5;
                self.healthBar = new IgeEntity()
                    .texture(self._healthTexture)
                    .id(this.id() + '_healthBar')
                    .width(healthBarWidth)
                    .height(11)
                    .translateTo(-(healthBarWidth / 2), -50, 1)
                    .drawBounds(false)
                    .drawBoundsData(false)
                    .originTo(0.5, 0.5, 0.5)
                    .mount(self);

            }, false, true);

            this._chatTexture.on('loaded', function () {

                self.chatBar = new IgeEntity()
                    .texture(self._chatTexture)
                    .id(this.id() + '_chatBar')
                    .width(0)
                    .height(0)
                    .translateTo(0, -10, 1)
                    .drawBounds(false)
                    .drawBoundsData(false)
                    .originTo(0.5, 0.5, 0.5)
                    .mount(self);
            }, false, true);

            this._nameTexture.on('loaded', function () {

                self.nameBar = new IgeEntity()
                    .texture(self._nameTexture)
                    .id(this.id() + '_nameBar')
                    .width(0)
                    .height(11)
                    .translateTo(0, -65, 1)
                    .drawBounds(false)
                    .drawBoundsData(false)
                    .originTo(0.5, 0.5, 0.5)
                    .mount(self);
            }, false, true);


            // Set the co-ordinate system as isometric
			this.isometric(true);
		}
		
		if (ige.isServer) {
			this.addComponent(IgePathComponent);
            this.addComponent(IgePathComponentNew);
		}

		self.mouseUp(function(){
            //console.log('Se ha pulsado sobre CharacterContainer '+self.id());
            ige.network.send('touchCharacterContainer', self.id());
        });
		// Define the data sections that will be included in the stream
		this.streamSections(['transform', 'direction','chat','health','customanim','playernames']);
	},
	
	/**
	 * Override the default IgeEntity class streamSectionData() method
	 * so that we can check for the custom1 section and handle how we deal
	 * with it.
	 * @param {String} sectionId A string identifying the section to
	 * handle data get / set for.
	 * @param {*=} data If present, this is the data that has been sent
	 * from the server to the client for this entity.
	 * @return {*}
	 */
	streamSectionData: function (sectionId, data) {
		// Check if the section is one that we are handling


		if (sectionId === 'direction') {
			// Check if the server sent us data, if not we are supposed
			// to return the data instead of set it
			if (!ige.isServer) {
				if (data) {
					// We have been given new data!
					this._streamDir = data;
				} else {
					this._streamDir = 'stop';
				}
			} else {
				// Return current data
                this._streamDir;
				return this._streamDir;
			}
		} else if (sectionId === 'chat'){

			if (!ige.isServer) {
				if (data) {
					this._streamChat = data;
				}
				else{
                    this._streamChat = '';
				}
			}
			else {
				// Return current data
				return this._streamChat;
			}

		} else if (sectionId === 'customanim'){

            if (!ige.isServer) {
                if (data) {
                    this._streamCustomanim = data;
                }
                else{
                    this._streamCustomanim = false;
                    //return this._streamCustomanim;
                }
            }
            else {
                // Return current data
                this._streamCustomanim;
                return this._streamCustomanim;
            }

        } else if (sectionId === 'playernames'){

            if (!ige.isServer) {
                if (data) {
                    this._streamPlayernames = data;
                }
                else{
                    this._streamPlayernames = false;
                    //return this._streamCustomanim;
                }
            }
            else {
                // Return current data
                this._streamPlayernames;
                return this._streamPlayernames;
            }

        } else if (sectionId === 'health'){

			if (!ige.isServer) {
				if (data) {
					this._streamHealth = data;
				}
				else{
					return this._streamHealth;
				}
			}
			else {
				// Return current data
				return this._streamHealth;
			}

		}

		else {
			// The section was not one that we handle here, so pass this
			// to the super-class streamSectionData() method - it handles
			// the "transform" section by itself
			return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
		}
	},

	update: function (ctx) {
		if (ige.isServer) {
			// Make sure the character is animating in the correct
			// direction - this variable is actually streamed to the client
			// when it's value changes!
			this._streamDir = this.path.currentDirection();
            if(!this._streamDir){
                this._streamDir = this.pathnew.getDirection();
            }
            //this._streamCustomanim = false;
		} else {

			// Set the depth to the y co-ordinate which basically
			// makes the entity appear further in the foreground
			// the closer they become to the bottom of the screen
			this.depth(this._translate.y);
			var message = this._streamChat;
			if(message) {
				this.chatBar.width(message.length * 10);
                this.chatBar.height(11);
				this.chatBar.translateTo(-((message.length * 10) / 2), -75, 1);
				this.sayText = message;
			}else{
                this.chatBar.width(0);
                this.chatBar.height(0);
                this.sayText = '';
            }
            var playerNames = this._streamPlayernames;
            if(playerNames){
                this.nickname = playerNames;
            }
			var health = this._streamHealth;
			if(health){
				this.currentHealth = health;
			}
            var customAnim = this._streamCustomanim;
            if(customAnim && !this.character.animation.playing()){
                console.log(customAnim);
                this.character.animation.start(customAnim);
                this._streamCustomanim = false;
            }

			if (this._streamDir) {
				if ((this._streamDir !== this._currentDir || !this.character.animation.playing())) {
					this._currentDir = this._streamDir;
					
					var dir = this._streamDir;
					// The characters we are using only have four directions
					// so convert the NW, SE, NE, SW to N, S, E, W
					// IF ONLY HAVE 4 DIRECTIONS
                                        /*switch (this._streamDir) {
						case 'S':
							dir = 'W';
							break;
						
						case 'E':
							dir = 'E';
							break;
						
						case 'N':
							dir = 'E';
							break;
						
						case 'W':
							dir = 'W';
							break;
					}*/



					if (dir && dir !== 'stop') {
						this.character.animation.start(dir);

					} else {
						this.character.animation.stop();

					}
				}
			} else {
				//this.character.animation.stop();
			}
		}
		
		IgeEntity.prototype.update.call(this, ctx);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = CharacterContainer; }