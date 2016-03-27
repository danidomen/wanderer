// Define our player character classes
var Character = IgeEntity.extend({
	classId: 'Character',

	init: function () {
		var self = this;
		IgeEntity.prototype.init.call(this);

		if (!ige.isServer) {
			// Setup the entity
			self.addComponent(IgeAnimationComponent)
				.depth(1);
			
			// Load the character texture file
			this._characterTexture = new IgeCellSheet('../assets/textures/sprites/wanderer2.png', 9, 32);
	
			// Wait for the texture to load
			this._characterTexture.on('loaded', function () {
				self.texture(self._characterTexture)
					.dimensionsFromCell();
				
				//self.setType(1);
			}, false, true);


		}
		
		this._lastTranslate = this._translate.clone();
		
		// Was debugging so setting a trace - turned off now, found bug in path component
		// under specific conditions
		//ige.traceSet(this._translate, 'x', 5);
	},

	/**
	 * Sets the type of character which determines the character's
	 * animation sequences and appearance.
	 * @param {Number} type From 0 to 7, determines the character's
	 * appearance.
	 * @return {*}
	 */
	setType: function (type) {
		switch (type) {
			case 0:
				this.animation.define('S', [10,11,12,13,14,15,16,17,18], 8, -1)
					.animation.define('W', [28,29,30,31,32,33,34,35,36], 8, -1)
					.animation.define('E', [64, 65, 66, 67,68,69,70,71,72], 8, -1)
					.animation.define('N', [46, 47, 48, 49,50,51,52,53,54], 8, -1)
					.animation.define('NW', [37, 38, 39, 40,41,42,43,44,45], 8, -1) // Arriba
					.animation.define('NE', [55, 56,57,58,59,60,61,62,63], 8, -1) //Derecha
					.animation.define('SE', [1,2,3,4,5,6,7,8,9], 8, -1) // Abajo
					.animation.define('SW', [19,20,21,22,23,24,25,26,27], 8, -1)  // Izquierda
					.cell(1);

				this._restCell = 1;
				break;

			case 1:
                this.animation.define('S', [10,11,12,13,14,15,16,17,18], 8, -1)
                    .animation.define('W', [28,29,30,31,32,33,34,35,36], 8, -1)
                    .animation.define('E', [64, 65, 66, 67,68,69,70,71,72], 8, -1)
                    .animation.define('N', [46, 47, 48, 49,50,51,52,53,54], 8, -1)
                    .animation.define('NW', [46, 47, 48, 49,50,51,52,53,54], 8, -1)// Arriba
                    .animation.define('NE', [55, 56,57,58,59,60,61,62,63], 8, -1) //Derecha
                    .animation.define('SE', [10,11,12,13,14,15,16,17,18], 8, -1)// Abajo
                    .animation.define('SW', [19,20,21,22,23,24,25,26,27], 8, -1)  // Izquierda
                    .animation.define('K_S', [82,83,84,85,86,87,88,89,90], 16, 0) // KNIFE
                    .animation.define('K_SW', [91,92,93,94,95,96,97,98,99], 16, 0)
                    .animation.define('K_W', [100,101,102,103,104,105,106,107,108], 16, 0)
                    .animation.define('K_N', [117,118,119,120,121,122,123,124,125], 16, 0)
                    .animation.define('K_NE', [126,127,128,129,130,131,132,133,134], 16, 0)
                    .animation.define('K_E', [135,136,137,138,139,140,141,142,143], 16, 0)
                    .animation.define('H_S', [154,155,156,157,158,159], 16, 0) // HIT
                    .animation.define('H_SW', [163,164,165,166,167,168], 16, 0)
                    .animation.define('H_W', [172,173,174,175,176,177], 16, 0)
                    .animation.define('H_N', [190,191,192,193,194,195], 16, 0)
                    .animation.define('H_NE', [199,200,201,202,203,204], 16, 0)
                    .animation.define('H_E', [208,209,210,211,212,213], 16, 0)
                    .cell(1);

                this._restCell = 1;
            /*
            <?php

                $numbers = array();
                $start = 208;
                for($i=0;$i<6;$i++){
                    $numbers[] = $start + $i;
                }

                echo '['.implode(',',$numbers).']';*/

                break;

			case 2:
				this.animation.define('S', [7, 8, 9, 8], 8, -1)
					.animation.define('W', [19, 20, 21, 20], 8, -1)
					.animation.define('E', [31, 32, 33, 32], 8, -1)
					.animation.define('N', [43, 44, 45, 44], 8, -1)
					.cell(7);

				this._restCell = 7;
				break;

			case 3:
				this.animation.define('S', [10, 11, 12, 11], 8, -1)
					.animation.define('W', [22, 23, 24, 23], 8, -1)
					.animation.define('E', [34, 35, 36, 35], 8, -1)
					.animation.define('N', [46, 47, 48, 47], 8, -1)
					.cell(10);

				this._restCell = 10;
				break;

			case 4:
				this.animation.define('S', [49, 50, 51, 50], 8, -1)
					.animation.define('W', [61, 62, 63, 62], 8, -1)
					.animation.define('E', [73, 74, 75, 74], 8, -1)
					.animation.define('N', [85, 86, 87, 86], 8, -1)
					.cell(49);

				this._restCell = 49;
				break;

			case 5:
				this.animation.define('S', [52, 53, 54, 53], 8, -1)
					.animation.define('W', [64, 65, 66, 65], 8, -1)
					.animation.define('E', [76, 77, 78, 77], 8, -1)
					.animation.define('N', [88, 89, 90, 89], 8, -1)
					.cell(52);

				this._restCell = 52;
				break;

			case 6:
				this.animation.define('S', [55, 56, 57, 56], 8, -1)
					.animation.define('W', [67, 68, 69, 68], 8, -1)
					.animation.define('E', [79, 80, 81, 80], 8, -1)
					.animation.define('N', [91, 92, 93, 92], 8, -1)
					.cell(55);

				this._restCell = 55;
				break;

			case 7:
				this.animation.define('S', [58, 59, 60, 59], 8, -1)
					.animation.define('W', [70, 71, 72, 71], 8, -1)
					.animation.define('E', [82, 83, 84, 83], 8, -1)
					.animation.define('N', [94, 95, 96, 95], 8, -1)
					.cell(58);

				this._restCell = 58;
				break;
		}

		return this;
	},

	destroy: function () {
		// Destroy the texture object
		if (this._characterTexture) {
			this._characterTexture.destroy();
		}

		// Call the super class
		IgeEntity.prototype.destroy.call(this);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Character; }