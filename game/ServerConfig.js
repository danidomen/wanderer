var config = {
	include: [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},
		{name: 'Character', path: './gameClasses/Character'},
		{name: 'CharacterContainer', path: './gameClasses/CharacterContainer'},
		{name: 'PlayerComponent', path: './gameClasses/PlayerComponent'},
        {name: 'GameItem', path: './gameClasses/GameItem'},
        {name: 'GameObject', path: './gameClasses/GameObject'},
        {name: 'NPCComponent', path: './gameClasses/NPCComponent'}
	],
    db: {
        type: 'mysql',
        host: 'localhost',
        user: 'root',
        pass: '',
        dbName: 'wanderer'
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = config; }