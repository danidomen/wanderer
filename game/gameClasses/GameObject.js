/**
 * Created by danidomen on 24/03/2016.
 */
var GameObject = {
    Bank: GameItem.extend({
        classId: 'Bank',

        init: function (parent, tileX, tileY) {
            GameItem.prototype.init.call(this, tileX, tileY, 2, 2);
            var self = this;

            // Setup the 3d bounds container (this)
            //.triggerPolygon('bounds3dPolygon')
            //.bounds3d(2 * parent._tileWidth, 2 * parent._tileHeight, parent._tileHeight * 1.25)
            this.isometric(true)
                .mount(parent)
                .translateToTile((tileX) + 0.5, (tileY) + 0.5, 0);
                //.drawBounds(false)
                //.drawBoundsData(false)
                //.occupyTile(tileX, tileY, 2, 2);
            //.mouseOver(function () { this.drawBounds(true); this.drawBoundsData(true); })
            //.mouseOut(function () { this.drawBounds(false); this.drawBoundsData(false); })

            if (!ige.isServer) {
                // Create the "image" entity
                this.imageEntity = new IgeEntity()
                    .texture(ige.client.textures.bank)
                    .dimensionsFromCell()
                    //.scaleTo(0.3, 0.3, 1)
                    .drawBounds(false)
                    .drawBoundsData(false)
                    .mount(this);
            }
        }
    })
}