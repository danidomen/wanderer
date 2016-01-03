/**
 * Created by danidomen on 03/01/2016.
 */
// Smart texture
var image = {
    render: function (ctx, entity, tickTime) {
        var character = entity.parent();


        var offsetX = 0;
        var offsetY = 0;
        var entityWidth = entity.width();
        var entityHeight = entity.height();

        // Drawing the bar background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX, offsetY, entityWidth, entityHeight);

        // Drawing a border around the progress bar
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(offsetX, offsetY, entityWidth, entityHeight);

        // Drawing the health text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(offsetX + (entityWidth / 2), offsetY + (entityHeight / 2));
        ctx.fillStyle = '#000000';
        ctx.fillText(character.sayText, 0, 0);
    }
}