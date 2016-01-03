// Define our player character container classes
var CharacterContainer = IgeEntity.extend({
	classId: 'CharacterContainer',

	init: function () {
		var self = this;



		IgeEntity.prototype.init.call(this);

		if (!ige.isServer) {
			// Setup the entity 3d bounds
			self.size3d(20, 20, 40);
	
			// Create a character entity as a child of this container
			self.character = new Character()
				.id(self.id() + '_character')
				.setType(3)
				.drawBounds(false)
				.drawBoundsData(false)
				.originTo(0.5, 0.6, 0.5)
				.mount(self);

            ige.network.on('igeChatMsg',function(e) {
                self.chatBar.width(e.text.length * 10);
                self.chatBar.translateTo(-((e.text.length * 10) / 2), -75, 1);
                self.sayText = e.text;
            });

            self.sayText = '';
            self.healthBar = new IgeEntity();
            self.chatBar = new IgeEntity();
            this._healthTexture = new IgeTexture('../assets/textures/smartTextures/healthBar.js');
            this._chatTexture = new IgeTexture('../assets/textures/smartTextures/chatBar.js');
            // Wait for the texture to load
            this._healthTexture.on('loaded', function () {
                var healthBarWidth = ige.client.textureMap1.tileWidth()*1.5;
                self.healthBar = new IgeEntity()
                    .texture(self._healthTexture)
                    .id(this.id() + '_healthBar')
                    .width(healthBarWidth)
                    .height(11)
                    .translateTo(-(healthBarWidth / 2), -60, 1)
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
                    .height(11)
                    //.translateTo(-(100 / 2), -85, 1)
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
		}
		
		// Define the data sections that will be included in the stream
		this.streamSections(['transform', 'direction']);
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
				return this._streamDir;
			}
		} else {
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
		} else {

			// Set the depth to the y co-ordinate which basically
			// makes the entity appear further in the foreground
			// the closer they become to the bottom of the screen
			this.depth(this._translate.y);
			
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
				this.character.animation.stop();
			}
		}
		
		IgeEntity.prototype.update.call(this, ctx);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = CharacterContainer; }