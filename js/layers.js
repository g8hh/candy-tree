addLayer("c", {
        layer: "c", // This is assigned automatically, both to the layer and all upgrades, etc. Shown here so you know about it
        startData() { return {
            unl: true,
			points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            upgrades: [],
            unlockedTree: false,
            eaten: new Decimal(0),
            thrown: false,
            unlockedLollipops: false,
        }},
        color:() => "#00bfbf",
        requires() {return new Decimal(10)}, // Can be a function that takes requirement increases into account
        resource: "lollipops", // Name of prestige currency
        baseResource: "candies", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        base: 5, // Only needed for static layers, base of the formula (b^(x^exp))
        gainMult() {
            mult = new Decimal(1)
            if (player.c.upgrades.includes(22)) mult = mult.times(2)
			if (player.c.upgrades.includes(14)) mult = mult.times(layers.c.upgrades[14].effect())
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 0,
        upgrades: {
            rows: 2,
            cols: 5,
            11: {
                desc:() => "Gain twice as many candies.",
                currencyDisplayName: "candies",
                currencyInternalName: "points",
                cost:() => new Decimal(10),
                unl() { return player.totalPoints.gte(10)},
            },
            12: {
                desc:() => "Discover the power of Lollipops.",
                currencyDisplayName: "candies",
                currencyInternalName: "points",
                cost:() => new Decimal(5),
                onPurchase() {player.c.unlockedLollipops=true},
                unl() { return player.c.upgrades.includes(11) },
            },
            13: {
                desc:() => "Candy generation is faster based on your unspent lollipops.",
                cost:() => new Decimal(1),
                unl() { return player.c.upgrades.includes(12) },
                effect() {
                    let ret = player.c.points.add(2).pow(0.5)
                    if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                    return ret;
                },
                effectDisplay(fx) { return format(fx)+"x" }, // Add formatting to the effect
            },
            14: {
                desc:() => "Unspent lollipops boost lollipop gain.",
                cost:() => new Decimal(5),
                unl() { return player.c.upgrades.includes(13) },
                effect() {
                    let ret = player.c.points.add(2).pow(0.25) 
                    if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                    return ret;
                },
                effDisp(x) { return format(x)+"x" },
            },
            15: {
                desc:() => "Dummy upgrade.",
                cost:() => new Decimal(0),
                unl() { return false}
            },
            21: {
                desc:() => "Candies boost candy production.",
                cost:() => new Decimal(100),
                currencyDisplayName: "candies", // Use if using a nonstandard currency
                currencyInternalName: "points", // Use if using a nonstandard currency
                unl() { return player.c.upgrades.includes(14) },
                effect() {
                    let ret = player.points.add(1).log10().add(1).pow(1.5)
                    return ret;
                },
                effDisp(x) { return format(x)+"x" },
            },
            22: {
                desc:() => "Double both lollipop and candy gain.",
                cost:() => new Decimal(25),
                unl() { return player.c.upgrades.includes(21) },
            },
            23: {
                desc:() => "Unlock the World Tree.",
                cost:() => new Decimal(100),
                unl() { return player.c.upgrades.includes(21) },
                onPurchase() {player.c.unlockedTree=true}
            },
            24: {
                desc:() => "Wooden Sword: does 1 damage per second.",
                currencyDisplayName: "candies", // Use if using a nonstandard currency
                currencyInternalName: "points", // Use if using a nonstandard currency
                cost:() => new Decimal(5000),
                unl() { return player.c.upgrades.includes(21) && player.a.order == 0},
            },
            25: {
                desc:() => "Wooden Sword: does 1 damage per second.",
                currencyDisplayName: "candies", // Use if using a nonstandard currency
                currencyInternalName: "points", // Use if using a nonstandard currency
                cost:() => new Decimal(1e10),
                unl() { return player.c.upgrades.includes(21) && player.a.order == 1},
            },
        },
        doReset(layer){
            if (layer == "c") return
			player.c.points = new Decimal(0)
            player.c.best= new Decimal(0)
            player.c.total= new Decimal(0)
            player.c.upgrades= []
            player.c.eaten= new Decimal(0)
        },
        convertToDecimal() {
            player.c.eaten = new Decimal(player.c.eaten)
        },
        layerShown() {return true}, // Condition for when layer appears on the tree
        update(diff) {
            gain = tmp.pointGen.times(diff).max(0)
            if (true){
                player.points = player.points.add(gain).max(0)
                player.totalPoints = player.totalPoints.add(gain).max(0)
                player.bestPoints = player.points.max(player.bestPoints)
            } 
        }, // Do any gameloop things (e.g. resource generation) inherent to this layer
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
                    ["main-display" , function(){return player.c.unlockedLollipops}],
                    ["prestige-button", [function(){return "Trade all of your candies for "}, function(){return player.c.unlockedLollipops}]],
                    "blank",
                    "blank", "blank", "upgrades", "blank",
                    ["display-text", function(){return (player.totalPoints.gte(10) ? candyMerchant : "\xa0")}, {"font-family": "monospace", "white-space": "pre"}],
                    ],

    })

addLayer("f", {
        startData() { return {
            unl: false,
            points: new Decimal(0),
            order: 0,
        }},
        color:() => "#B81F28",
        requires() {return new Decimal("1e1000")}, 
        resource: "farm points", 
        baseResource: "lollipops", 
        baseAmount() {return player.c.points},
        type: "static", 
        canBuyMax() {return false},
        base: 3,
        exponent: 0.5, 
        gainMult() {
            return new Decimal(1)
        },
        gainExp() {
            return new Decimal(1)
        },
        row: 1,
        layerShown() {return true}, 
        branches: [["c", 1]], // Each pair corresponds to a line added to the tree when this node is unlocked. The letter is the other end of the line, and the number affects the color, 1 is default
        incr_order: ["a"], // Array of layer names to have their order increased when this one is first unlocked

    })

addLayer("a", {
        startData() { return {
            unl: false,
			points: new Decimal(0),
            damage: new Decimal(0),
            order: 0,
        }},
        color:() => "#F7E833",
        requires() {return new Decimal("1e1000")}, 
        resource: "victories", 
        baseResource: "damage", 
        baseAmount() {return player.a.damage},
        type: "static", 
        canBuyMax() {return false},
        base: 3,
        exponent: 0.5, 
        update(diff) {
            gain = new Decimal(0)
            if (player.c.upgrades.includes(24) || player.c.upgrades.includes(25)) gain = gain.add(1);
            if (true){
                gain = gain.times(diff)
                player.a.damage = player.a.damage.add(gain).max(0)
            } 
        }, // Do any gameloop things (e.g. resource generation) inherent to this layer
        doReset(layer){
            if (layer == "c") return
            else if (layers[layer].row == 1)
                player.a.damage = new Decimal(0)
            else
                fullLayerReset("a")
        },

        gainMult() {
            return new Decimal(1)
        },
        gainExp() {
            return new Decimal(1)
        },
        row: 1,
        layerShown() {return true}, 
        convertToDecimal() {
            player.a.damage = new Decimal(player.a.damage)
        },
        branches: [["c", 1]], // Each pair corresponds to a line added to the tree when this node is unlocked. The letter is the other end of the line, and the number affects the color, 1 is default
        incr_order: ["f"], // Array of layer names to have their order increased when this one is first unlocked

    }, 
)

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
