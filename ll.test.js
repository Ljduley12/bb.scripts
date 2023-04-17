/**
 * @name LibLoad Test Plugin
 * @authorId 4073318
 * @version 1.0.0
 * @description Test for LibLoad.
 */

`@lib.precheck
    Test = https://raw.githubusercontent.com/VillainsRule/BB-Plugins/main/crammar/crammar.plugin.js
`;

console.log(@lib.get(blacket.fix));

@lib.export(test, {
    test: "test"
})
