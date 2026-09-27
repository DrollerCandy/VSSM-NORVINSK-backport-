"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = void 0;
const Money_1 = require("C:/snapshot/project/obj/models/enums/Money");
let db;
class NREVEX {
    container;
    postSptLoad(container) {
        this.container = container;
    }
    postDBLoad(container) {
        const thisMod = "vssm";
        const jsonUtil = container.resolve("JsonUtil");
        const databaseServer = container.resolve("DatabaseServer");
        const tables = databaseServer.getTables();
        const locales = Object.values(tables.locales.global);
        const items = tables.templates.items;
        const importerUtil = container.resolve("ImporterUtil");
        const modLoader = container.resolve("PreSptModLoader");
        db = importerUtil.loadRecursive(`${modLoader.getModPath(thisMod)}db/`);
        const customItems = importerUtil.loadRecursive(`${modLoader.getModPath(thisMod)}db/nerv_inv/`);
        const customItemsArray = Object.values(customItems);
        if (Array.isArray(customItemsArray)) {
            customItemsArray.forEach((item) => {
                if (!this.isCorrectFile(item)) {
                    console.error("Invalid injetion file: %s\n", item);
                    return;
                }
                else
                    this.processInjectionItemTemplate(item, items, jsonUtil, tables);
            });
        }
        else
            console.error("customItems cannot be converted to an array\n");
        for (const locale of locales)
            for (const [idIndex, idName] of Object.entries(db.locales.global.en.itemids))
                for (const [des, value] of Object.entries(idName))
                    locale[`${idIndex} ${des}`] = value;
        for (const localeID in db.locales.global)
            if (localeID != "en")
                for (const [idIndex, idName] of Object.entries(db.locales.global[localeID].itemids))
                    for (const [des, value] of Object.entries(idName))
                        tables.locales.global[localeID][`${idIndex} ${des}`] = value;
    }
    processInjectionItemTemplate(customInjection, items, jsonUtil, table) {
        // console.log("\nAdding Items: %s\n", customInjection.overwriteProperties.overrideProperties.Prefab.path);
        if (customInjection.slotsToAdd) {
            customInjection.slotsToAdd.targetID.forEach((value, index) => {
                const slot = items[value]._props.Slots.find(slot => slot._name === customInjection.slotsToAdd.slotName[index]);
                if (slot) {
                    slot._props.filters[0].Filter.push(customInjection.overwriteProperties.newId);
                }
            });
        }
        table.templates.handbook.Items.push({
            "Id": customInjection.overwriteProperties.newId,
            "ParentId": customInjection.overwriteProperties.handbookParentId,
            "Price": customInjection.overwriteProperties.handbookPriceRoubles
        });
        if (customInjection.overwriteProperties) {
            const newItem = jsonUtil.clone(items[customInjection.overwriteProperties.itemTplToClone]);
            newItem._id = customInjection.overwriteProperties.newId;
            if (customInjection.overwriteProperties.overrideProperties !== null && customInjection.overwriteProperties.overrideProperties !== undefined) {
                for (const [key, value] of Object.entries(customInjection.overwriteProperties.overrideProperties)) {
                    if (key in items[customInjection.overwriteProperties.itemTplToClone]._props) {
                        newItem._props[key] = value;
                        // console.log("Overwriting %s with %s\n", key, value);
                    }
                    else {
                        console.log("Key %s not found in item %s\n", key, customInjection.overwriteProperties.itemTplToClone);
                    }
                }
                items[customInjection.overwriteProperties.newId] = newItem;
            }
            else {
                console.log("customInjection.overwriteProperties is not an object or null");
            }
        }
        if (customInjection.traderToAdd) {
            if (customInjection.traderToAdd.traderID) {
                const trader = table.traders[customInjection.traderToAdd.traderID];
                trader.assort.items.push({
                    "_id": customInjection.overwriteProperties.newId,
                    "_tpl": customInjection.overwriteProperties.newId,
                    "parentId": "hideout",
                    "slotId": "hideout",
                    "upd": {
                        "UnlimitedCount": false,
                        "StackObjectsCount": customInjection.traderToAdd.BuyRestrictionMax * 11,
                        "BuyRestrictionMax": customInjection.traderToAdd.BuyRestrictionMax,
                        "BuyRestrictionCurrent": 0
                    }
                });
                let traderCurrency = customInjection.traderToAdd.barter_scheme;
                switch (customInjection.traderToAdd.barter_scheme) {
                    case "DOLLARS":
                        traderCurrency = Money_1.Money.DOLLARS;
                        break;
                    case "ROUBLES":
                        traderCurrency = Money_1.Money.ROUBLES;
                        break;
                    case "EUROS":
                        traderCurrency = Money_1.Money.EUROS;
                        break;
                }
                trader.assort.barter_scheme[customInjection.overwriteProperties.newId] = [
                    [{
                        "count": customInjection.traderToAdd.barter_scheme_value,
                        "_tpl": traderCurrency
                    }]
                ];
                trader.assort.loyal_level_items[customInjection.overwriteProperties.newId] = customInjection.traderToAdd.loyal_level_items;
            }
        }
        if (customInjection.chamberToAdd) {
            customInjection.chamberToAdd.weaponID.forEach((value, index) => {
                // console.log("Adding to chamber of %s\n", value);
                if (items[value]._props.Chambers[0]) {
                    items[value]._props.Chambers[0]._props.filters[0].Filter.push(customInjection.overwriteProperties.newId);
                }
            });
        }
        if (customInjection.catridgeToAdd) {
            // console.log("Found catridge to add", customInjection.catridgeToAdd);
            customInjection.catridgeToAdd.magazineID.forEach((value, index) => {
                // console.log("Adding to catridge of %s\n", value);
                if (items[value]._props.Cartridges[0]) {
                    items[value]._props.Cartridges[0]._props.filters[0].Filter.push(customInjection.overwriteProperties.newId);
                }
            });
        }
    }
    isCorrectFile(obj) {
        return (obj.overwriteProperties !== undefined
            // &&
            // obj.slotsToAdd !== undefined &&
            // obj.traderToAdd !== undefined
        );
    }
}
exports.mod = new NREVEX();
//# sourceMappingURL=nervex.js.map