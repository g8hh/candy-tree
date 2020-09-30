var layers = {
    c: {
        startData() { return {
            unl: true,
			points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            upgrades: [],
            unlockedTree: false,
            eaten: new Decimal(0),
            thrown: false,
        }},
        color: "#4BEC13",
        requires() {return new Decimal(10)}, // Can be a function that takes requirement increases into account
        resource: "lollipops", // Name of prestige currency
        baseResource: "candies", // Name of resource prestige is based on
        baseAmount() {return player.points},
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        base: 5, // Only needed for static layers, base of the formula (b^(x^exp))
        resCeil: false, // True if the resource needs to be rounded up
        canBuyMax() {}, // Only needed for static layers
        gainMult() {
            mult = new Decimal(1)
            if (player.c.upgrades.includes(21)) mult = mult.times(2)
			if (player.c.upgrades.includes(23)) mult = mult.times(LAYER_UPGS.c[23].currently())
            return mult
        },
        gainExp() {
            return new Decimal(1)
        },
        row: 0,
        upgrades: {
            rows: 1,
            cols: 4,
            11: {
                desc: "Gain twice as many candies.",
                currencyDisplayName: "candies",
                currencyInternalName: "points",
                cost: new Decimal(10),
                unl() { return player.totalPoints.gte(10)},
            },
            12: {
                desc: "Candy generation is faster based on your unspent lollipops.",
                cost: new Decimal(1),
                unl() { return player.c.upgrades.includes(11) },
                effect() {
                    let ret = player.c.points.add(1).pow(0.5)
                    if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                    return ret;
                },
                effDisp(x) { return format(x)+"x" },
            },
            13: {
                desc: "Unspent lollipops boost lollipop gain.",
                cost: new Decimal(2),
                unl() { return player.c.upgrades.includes(12) },
                effect() {
                    let ret = player.c.points.add(1).pow(0.25) 
                    if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                    return ret;
                },
                effDisp(x) { return format(x)+"x" },
            },
            14: {
                desc: "Unlock the World Tree.",
                cost: new Decimal(3),
                unl() { return player.c.upgrades.includes(12) },
                onPurchase() {player.c.unlockedTree=true}
            },
        },
        doReset(layer){
            if(layers[layer].row > layers["c"].row) fullLayerReset('c') // This is actually the default behavior
        },
        convertToDecimal() {
            // Convert any layer-specific values (besides points, total, and best) to Decimal
            player.c.eaten = new Decimal(player.c.eaten)
        },
        layerShown() {return true}, // Condition for when layer appears
        update(diff) {
            gain = tmp.pointGen.times(diff).max(0)
            if (true){
                player.points = player.points.add(gain).max(0)
                player.totalPoints = player.totalPoints.add(gain).max(0)
                player.bestPoints = player.points.max(player.bestPoints)
            } 
        }, // Do any gameloop things (e.g. resource generation) inherent to this layer
        automate() {
        }, // Do any automation inherent to this layer if appropriate
        updateTemp() {
        }, // Do any necessary temp updating
        resetsNothing() {return false},
        incr_order: [], // Array of layer names to have their order increased when this one is first unlocked
        eatCandies() {
            player.c.eaten = player.c.eaten.add(player.points).floor()
            player.points = new Decimal(0)
        },
        // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
        tabFormat: [
                    ["display-text", function() {return 'You have ' + formatWhole(player.points) + ' candies'}],
                    "blank", "blank",
                    ["raw-html", function() {return "<button onclick='layers.c.eatCandies()'>Eat all the candies</button>"}],
                    "blank",
                    ["display-text", function(){return (player.c.eaten.equals(0) ? "\xa0" : ("You have eaten " + formatWhole(player.c.eaten) + " candies!"))}],
                    "blank", "blank",
                    ["raw-html", function() {return "<button onclick='player.c.thrown=true'>Throw 10 candies on the floor</button>"}],
                    "blank",
                    ["display-text", function(){return (player.c.thrown ? "No. \\O_O/" : "\xa0")}],
                    "blank", "blank",
                    ["main-display" , function(){return player.bestPoints.gte(15)}],
                    ["prestige-button", function(){return "Trade all of your candies for "}, function(){return player.bestPoints.gte(15)}],
                    "blank",
                    "blank", "blank", "upgrades", "blank",
                    ["display-text", function(){return (player.totalPoints.gte(10) ? candyMerchant : "\xa0")}, {"font-family": "monospace", "white-space": "pre"}],
                    ],

    }, 

    f: {
        startData() { return {
            unl: false,
			points: new Decimal(0),
            boop: false,
        }},
        color: "#FE0102",
        requires() {return new Decimal("1e1000")}, 
        resource: "farm points", 
        baseResource: "lollipops", 
        baseAmount() {return player.c.points},
        type: "static", 
        canBuyMax() {return false},
        base: 3,
        exponent: 0.5, 
        resCeil: false, 
        gainMult() {
            return new Decimal(1)
        },
        gainExp() {
            return new Decimal(1)
        },
        row: 1,
        layerShown() {return true}, 
        branches: [["c", 1]] // Each pair corresponds to a line added to the tree when this node is unlocked. The letter is the other end of the line, and the number affects the color, 1 is default
    }, 
} 

function layerShown(layer){
    return layers[layer].layerShown();
}

var LAYERS = Object.keys(layers);

var ROW_LAYERS = {}
for (layer in layers){
    row = layers[layer].row
    if(!ROW_LAYERS[row]) ROW_LAYERS[row] = {}

    ROW_LAYERS[row][layer]=layer;
}

function addLayer(layerName, layerData){ // Call this to add layers from a different file!
    layers[layerName] = layerData
    LAYERS = Object.keys(layers);
    ROW_LAYERS = {}
    for (layer in layers){
        row = layers[layer].row
        if(!ROW_LAYERS[row]) ROW_LAYERS[row] = {}
    
        ROW_LAYERS[row][layer]=layer;
    }
}

var candyMerchant = "  \
.---.\xa0\xa0\xa0\xa0\xa0\xa0\n\
|   '.|  __\n\
\xa0| ___.--'  )\n\
_.-'_` _%%%_/\xa0\xa0\n\
\xa0\xa0.-'%%% a: a %%%\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\n\
\xa0\xa0\xa0\xa0\xa0\xa0%%  L   %%_\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\n\
\xa0\xa0\xa0\xa0\xa0\xa0_%\\'-' |  /-.__\xa0\xa0\xa0\xa0\n\
\xa0\xa0\xa0.-' / )--' #/     '\\\xa0\xa0\n\
\xa0\xa0/'  /  /---'(    :   \\\xa0\n\
\xa0/   |  /( /|##|  \\     |\n\
/   ||# | / | /|   \\    \\\n\
|   ||##| I \\/ |   |   _|\n\
|   ||: | o  |#|   |  / |\n\
|   ||  / I  |:/  /   |/\xa0\n\
|   ||  | o   /  /    /\xa0\xa0\n\
|   \\|  | I  |. /    /\xa0\xa0\xa0\n\
\xa0\\  /|##| o  |.|    /\xa0\xa0\xa0\xa0\n\
\xa0\xa0\\/ \::|/\\_ /  ---'|\xa0\xa0\xa0\xa0\xa0\n\
\n\
The candy merchant\n"