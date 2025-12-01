// /src/game.js

// === 1. CONFIGURACIÓN DEL JUEGO ===
const config = {
    type: Phaser.AUTO, 
    width: 320 * 2,    
    height: 240 * 2,   
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: {
        preload: preload,
        create: create,
        update: update 
    }
};

const game = new Phaser.Game(config);

// === 2. FASE DE CARGA DE RECURSOS ===
function preload ()
{
    // 1. Cargar el archivo de mapa de Tiled. 
    // ¡CORREGIDO! Apuntamos al archivo .json (.tmj)
    this.load.tilemapTiledJSON('mapa', 'assets/mapa_prueba.json');

    // 2. Cargar el Tileset de Terrenos (la clave es 'terreno')
    this.load.image('terreno', 'assets/sprites/Game Boy Advance - Advance Wars 2_ Black Hole Rising - Overworld - Overworld Tileset _ Buildings.png');
    
    // 3. Cargar el Spritesheet de Infantería
    this.load.spritesheet('infanteria', 
        'assets/sprites/Game Boy Advance - Advance Wars 2_ Black Hole Rising - Units - Orange Star Infantry & Mech.png',
        { 
            frameWidth: 16,    
            frameHeight: 16    
        }
    );
}

// === 3. FASE DE INICIALIZACIÓN DE LA ESCENA ===
// /src/game.js

// ... (código antes de create() queda igual, incluyendo preload() con .json) ...

function create ()
{
    const TILE_SIZE = 16;
    
    const map = this.make.tilemap({ key: 'mapa' }); 
    
    // --- ¡SOLUCIÓN FINAL DE NOMBRE! Usamos el nombre del archivo TSX (sin la extensión) ---
    // Este nombre coincide con el archivo TSX que Tiled le dice a Phaser que busque.
    const TILESET_NAME_IN_MAP_FILE = 'Game Boy Advance - Advance Wars 2_ Black Hole Rising - Overworld - Overworld Tileset _ Buildings';
    
    // La clave de precarga (la imagen que SÍ cargamos) sigue siendo 'terreno'.
    const KEY_CARGADO_EN_PRELOAD = 'terreno';

    const tileset = map.addTilesetImage(
        TILESET_NAME_IN_MAP_FILE, 
        KEY_CARGADO_EN_PRELOAD, 
        16,   // tileWidth
        16,   // tileHeight
        0,   // MARGEN (tileMargin)
        0     // Espaciado (tileSpacing)
    ); 
    
    // 3. Crear la capa de terreno
    // El nombre de la capa "Capa de patrones 1" es CORRECTO (lo confirmaste en el JSON).
    const LAYER_NAME_IN_MAP_FILE = 'terreno'; 
    const layer = map.createLayer(LAYER_NAME_IN_MAP_FILE, tileset, 0, 0); 
    
    // 4. POSICIONAMIENTO DE LA UNIDAD 
    const startX = 5;
    const startY = 5;

    this.add.sprite(
        startX * TILE_SIZE + TILE_SIZE / 2, 
        startY * TILE_SIZE + TILE_SIZE / 2, 
        'infanteria', 
        2
    )
    .setScale(2); 

    this.add.text(10, 10, 'BlakeWars: Tablero y Unidad OK', { fontSize: '16px', fill: '#FFF' });
}

// ... (todo el código de update() queda igual) ...

// === 4. BUCLE PRINCIPAL ===
function update ()
{
    // Lógica de juego
}