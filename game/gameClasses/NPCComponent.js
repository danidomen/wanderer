var NPCComponent = IgeEntity.extend({
    classId: 'NPCComponent',
    componentId: 'npcControl',

    init: function (entity, options) {
        var self = this;

        // Store the entity that this component has been added to
        this._entity = entity;

        // Store any options that were passed to us
        this._options = options;

        if (!ige.isServer) {
            /*ige.chat.joinRoom('lobby');
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
            })*/
        }

        if(ige.isServer){
            this.registerPathFunctions();
        }
    },

    registerPathFunctions: function () {
        // Register some event listeners for the path (these are for debug console logging so you
        // know what events are emitted by the path component and what they mean)
        var selfEntity = this._entity;
        this._entity.pathnew.on('started', function () { console.log('Pathing started...'); });
        this._entity.pathnew.on('stopped', function () { console.log('Pathing stopped.'); });
        this._entity.pathnew.on('cleared', function () { console.log('Path data cleared.'); });
        this._entity.pathnew.on('pointComplete', function () { console.log('Path point reached...'); });
        this._entity.pathnew.on('pathComplete', function () {
            selfEntity.pathnew
            .set(0, 0, 0, 0, 4, 0)
            .add(2, 4, 0)
            .add(5, 4, 0)
            .add(6, 2, 0)
            .add(0, 0, 0)
            .speed(2)
            .start();
            console.log('Path completed...'); });
        //ige.server.players['npc_'+clientId].pathnew.on('traversalComplete', function () { this._entity.animation.stop(); console.log('Traversal of all paths completed.'); });
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = NPCComponent; }
/**
 * Created by danidomen on 28/03/2016.
 */
