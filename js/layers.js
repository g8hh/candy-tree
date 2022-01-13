addLayer("c", {
    startData() { return {
        points: new Decimal(0),
        unlockedTree: false,
        eaten: new Decimal(0),
        thrown: false,
    }},
    color: "#00bfbf",
    requires() {return new Decimal(10)}, // Can be a function that takes requirement increases into account
    resource: "lollipops", // Name of prestige currency
    baseResource: "candies", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
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
        11: {
            description: "Gain twice as many candies.",
            currencyDisplayName: "candies",
            currencyInternalName: "points",
            cost: new Decimal(10),
            unlocked() { return player.totalPoints.gte(10)},
        },
        12: {
            description: "Discover the power of Lollipops.",
            currencyDisplayName: "candies",
            currencyInternalName: "points",
            cost: new Decimal(5),
            unlocked() { return player.c.upgrades.includes(11) },
        },
        13: {
            description: "Candy generation is faster based on your unspent lollipops.",
            cost: new Decimal(1),
            unlocked() { return player.c.upgrades.includes(12) },
            effect() {
                let ret = player.c.points.add(2).pow(0.5)
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            description: "Unspent lollipops boost lollipop gain.",
            cost: new Decimal(5),
            unlocked() { return player.c.upgrades.includes(13) },
            effect() {
                let ret = player.c.points.add(2).pow(0.25) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },

        21: {
            description: "Candies boost candy production.",
            cost: new Decimal(100),
            currencyDisplayName: "candies", // Use if using a nonstandard currency
            currencyInternalName: "points", // Use if using a nonstandard currency
            unlocked() { return player.c.upgrades.includes(13) },
            effect() {
                let ret = player.points.add(1).log10().add(1).pow(1.5)
                return ret;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        22: {
            description: "Double both lollipop and candy gain.",
            cost: new Decimal(25),
            unlocked() { return player.c.upgrades.includes(21) },
        },
        23: {
            description: "Unlock the World Tree.",
            cost: new Decimal(100),
            unlocked() { return player.c.upgrades.includes(21) },
            onPurchase() {player.navTab = "tree-tab"}
        },
        24: {
            description: "Wooden Sword: does 1 damage per second.",
            currencyDisplayName: "candies", // Use if using a nonstandard currency
            currencyInternalName: "points", // Use if using a nonstandard currency
            cost() {return new Decimal(5000)},
            unlocked() { return player.c.upgrades.includes(23)},
        },
    },
    doReset(layer){
        if (layer == "c") return
        layerDataReset("c")
    },
    update(diff) {
    }, // Do any gameloop things (e.g. resource generation) inherent to this layer
    eatCandies() {
        player.c.eaten = player.c.eaten.add(player.points).floor()
        player.points = new Decimal(0)
    },
    tabFormat: [
                ["row", 
                    [["column", [["display-text", function() {return 'You have ' + formatWhole(player.points) + ' candies'}],
                        "blank", "blank",
                        ["raw-html", function() {return "<button onclick='layers.c.eatCandies()'>Eat all the candies!</button>"}],
                        "blank",
                        ["display-text", function(){return (player.c.eaten.equals(0) ? "\xa0" : ("You have eaten " + formatWhole(player.c.eaten) + " candies!"))}],
                        "blank", "blank",
                        ["raw-html", function() {return "<button onclick='player.c.thrown=true'>Throw 10 candies on the floor</button>"}],
                        "blank",
                        ["display-text", function(){return (player.c.thrown ? "No. \\O_O/" : "\xa0")}],
                        "blank", "blank",]],
                    function() {return hasUpgrade("c", 12) ? ["v-line", "250px", {'margin-left': "15px", 'margin-right': "15px"}] : "blank"
                    },

                    function() {return hasUpgrade("c", 12) ? ["column",
                        ["main-display",
                         ["prestige-button",  "Trade all of your candies for "],
                        "blank",]
                    ] : "blank"}]
                ],
                "blank", "blank", "upgrades", "blank",
                ["display-text", function(){return (player.totalPoints.gte(10) ? candyMerchant : "\xa0")}, {"font-family": "monospace", "white-space": "pre"}],
                ],
})


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
The candy merchant\n\n\n"
