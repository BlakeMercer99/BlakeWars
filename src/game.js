// /src/game.js

// === 1. CONFIGURACIÓN DEL JUEGO ===
const config = {
    type: Phaser.AUTO, 
    width: 320 * 2,     // 640px
    height: 240 * 2,    // 480px
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

// Variables de la escena (se usarán en create y update)
let cursors; 
let cursorSprite;
let map; // Referencia al mapa para usar sus dimensiones en update

// === 2. FASE DE CARGA DE RECURSOS ===
function preload ()
{
    // 1. Cargar el archivo de mapa de Tiled (¡Con Tileset empotrado!)
    this.load.tilemapTiledJSON('mapa', 'assets/mapa_prueba.json');

    // 2. Cargar el Tileset de Terrenos (la clave es 'terreno')
    this.load.image('terreno', 'assets/sprites/Game Boy Advance - Advance Wars 2_ Black Hole Rising - Overworld - Overworld Tileset _ Buildings.png');
    
    // 3. Cargar el Spritesheet de Infantería
    this.load.spritesheet('infanteria', 
        'assets/sprites/infanteria_en_el_mapa.png',
        { 
            frameWidth: 17,     
            frameHeight: 16,
            startFrame: 0,
            endFrame: 15,
            margin: 0,
            spacing: 0     
        }
    );
}

// === 3. FASE DE INICIALIZACIÓN DE LA ESCENA ===
function create ()
{
    const TILE_SIZE = 16;
    
    // 1. Inicializar el mapa
    map = this.make.tilemap({ key: 'mapa' }); 
    
    // El nombre del Tileset DEBE coincidir con el nombre interno que usó Tiled.
    const TILESET_NAME_IN_MAP_FILE = 'Game Boy Advance - Advance Wars 2_ Black Hole Rising - Overworld - Overworld Tileset _ Buildings';
    const KEY_CARGADO_EN_PRELOAD = 'terreno';

    const tileset = map.addTilesetImage(
        TILESET_NAME_IN_MAP_FILE, 
        KEY_CARGADO_EN_PRELOAD, 
        16,   // tileWidth
        16,   // tileHeight
        0,    // MARGEN (margin) -> Usamos 0 porque el tileset está empotrado
        0     // Espaciado (spacing) -> Usamos 0 porque el tileset está empotrado
    ); 
    
    // 2. Crear la capa de terreno
    const LAYER_NAME_IN_MAP_FILE = 'terreno'; 
    const layer = map.createLayer(LAYER_NAME_IN_MAP_FILE, tileset, 0, 0); 
    
    // 3. POSICIONAMIENTO Y ALMACENAMIENTO DE LA UNIDAD (Ejemplo en 5, 5)
    const UNIT_START_X = 5;
    const UNIT_START_Y = 5;
    const SCALE_FACTOR = 2; // Factor de escala para todos los sprites

    this.player = this.add.sprite(
        UNIT_START_X * TILE_SIZE * SCALE_FACTOR + TILE_SIZE, // Posicion X (Centro)
        UNIT_START_Y * TILE_SIZE * SCALE_FACTOR + TILE_SIZE, // Posicion Y (Centro)
        'infanteria', 
        3
    )
    .setScale(SCALE_FACTOR); 

    this.add.text(10, 10, 'BlakeWars: Tablero y Unidad OK', { fontSize: '16px', fill: '#FFF' });

    // === NUEVO: 4. CONFIGURAR EL CURSOR DE SELECCIÓN ===
    
    // Creamos un cuadrado rojo semi-transparente para actuar como cursor
    cursorSprite = this.add.rectangle(
        UNIT_START_X * TILE_SIZE * SCALE_FACTOR, 
        UNIT_START_Y * TILE_SIZE * SCALE_FACTOR, 
        TILE_SIZE * SCALE_FACTOR,           
        TILE_SIZE * SCALE_FACTOR,           
        0xFF0000,                
        0.5                      
    ).setOrigin(0, 0); 
    
    // Guardaremos la posición actual del cursor en términos de cuadrícula (tile index)
    // Usamos 'this' para que estas variables sean accesibles dentro del update()
    this.cursorX = UNIT_START_X;
    this.cursorY = UNIT_START_Y;
    
    this.selectedUnit = null; // Para la lógica de selección futura

    // 5. CONFIGURAR TECLAS DE ENTRADA
    cursors = this.input.keyboard.createCursorKeys();
    
    // Tecla de Acción (por ejemplo, Espacio para seleccionar/confirmar)
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Variable para controlar la cadencia de movimiento del cursor (evitar movimiento demasiado rápido)
    this.lastCursorMoveTime = 0;
}

// === 6. BUCLE PRINCIPAL (Lógica de Movimiento del Cursor) ===
function update (time)
{
    const MOVE_COOLDOWN = 150; // Retraso en milisegundos entre movimientos de cursor
    const TILE_SIZE = 16;
    const SCALE_FACTOR = 2;

    if (time > this.lastCursorMoveTime)
    {
        let moved = false;
        
        // Mover hacia la izquierda (comprobar límites del mapa)
        if (cursors.left.isDown && this.cursorX > 0)
        {
            this.cursorX--;
            moved = true;
        } 
        // Mover hacia la derecha (comprobar límites del mapa)
        else if (cursors.right.isDown && this.cursorX < map.width - 1)
        {
            this.cursorX++;
            moved = true;
        }
        // Mover hacia arriba (comprobar límites del mapa)
        else if (cursors.up.isDown && this.cursorY > 0)
        {
            this.cursorY--;
            moved = true;
        }
        // Mover hacia abajo (comprobar límites del mapa)
        else if (cursors.down.isDown && this.cursorY < map.height - 1)
        {
            this.cursorY++;
            moved = true;
        }

        if (moved) {
            // Actualizar la posición del sprite del cursor (Posición en pixeles)
            cursorSprite.x = this.cursorX * TILE_SIZE * SCALE_FACTOR;
            cursorSprite.y = this.cursorY * TILE_SIZE * SCALE_FACTOR; 

            // Establecer el tiempo de retardo para el siguiente movimiento
            this.lastCursorMoveTime = time + MOVE_COOLDOWN; 
        }
    }

    // Lógica de Selección/Acción con la tecla ESPACIO
    if (Phaser.Input.Keyboard.JustDown(this.keySpace))
    {
        // === LÓGICA DE SELECCIÓN ===
        
        // La posición de la unidad es (5, 5) en la cuadrícula
        const UNIT_X = 5;
        const UNIT_Y = 5;

        // 1. ¿El cursor está sobre la unidad del jugador?
        if (this.cursorX === UNIT_X && this.cursorY === UNIT_Y) {
            
            if (this.selectedUnit === this.player) {
                // Si ya está seleccionada -> Deseleccionar
                this.selectedUnit = null;
                this.player.setTint(0xFFFFFF); // Color normal (blanco)
                console.log("Unidad deseleccionada.");
            } else {
                // Si no está seleccionada -> Seleccionar
                this.selectedUnit = this.player;
                this.player.setTint(0x00FF00); // Tinte verde (seleccionado)
                console.log("Unidad seleccionada. ¡Lista para moverse!");
            }
        } else if (this.selectedUnit) {
            // 2. Si hay una unidad seleccionada, pero el cursor no está sobre ella,
            // (Aquí irá la lógica de movimiento)
            console.log(`Unidad seleccionada, preparándose para mover a: (${this.cursorX}, ${this.cursorY})`);
        }
    }
}