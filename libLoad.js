/**
 * @name LibLoad
 * @authorId 4073318
 * @version 1.0.0
 * @description Loads and patches libraries from a specified URL.
 */

function formatErrReport(auth, type, err) {
  return `LibLoad Exception, report this to ${auth}:
${type}: ${err}`;
}

var disableEval = false;
var ev = window.eval;
window.eval = (data) => {
    if (disableEval) {
        if (data.match(/@lib(.*)/g)) {
            var plugins = JSON.parse(window.localStorage.getItem("bb_plugins"));
            for (var x of plugins) {
                if (x.code === data) return x.enabled = false;
            }
        }
    } else {
        return ev(data);
    }
}

window.addEventListener("storage", async (e) => {
  if (e.key === "bb_plugins") {
    disableEval = true;
    const plugins = JSON.parse(e.newValue);
    const plugin = plugins.filter((x) => !e.oldValue.includes(x))[0];
    var llAttributes = comment.matchAll(
      /`@ll\.precheck(?:\s+)?((.|\n)*)(?:\s+)`;/g
    );
    var parsed = llAttributes.split("\n").map((x) => {
      var trimmed = x.trim();
      return [x.split("=")[0].trim(), x.split("=").slice(1).join("=").trim()];
    });
    llAttributes = Object.fromEntries(parsed);
    plugin.code = plugin.code.replace(/@lib.get\((.*)\)/g, 'window.$1').replace(/@lib.export\((.*), (.*)\)/g, 'if (!window["'+plugin.name+'"]) window["'+plugin.name+'"] = {}; window["'+plugin.name+'"]["$1"] = $2;');
    for (var x of llAttributes) {
      var name = x[0];
      var url = x[1];
      if (plugins.filter((x) => x.name === name).length > 0) return;
      var code = await (await fetch(url)).text();
      var meta = code.matchAll(/\/\*((.|\n)*)\*\//g)[1];
      if (!meta)
        return window.alert(
          formatErrReport(
            plugin.authorId,
            "LL.Runtime.Precheck",
            "The library, defined as " + name + ", does not have metadata."
          )
        );
      var metaParsed = Object.fromEntries(
        meta.split("\n").map((x) => {
          return [
            x.split(" ")[0].trim(),
            x.split(" ").slice(1).join(" ").trim(),
          ];
        })
      );
      if (
        !metaParsed.authorId ||
        !metaParsed.name ||
        !metaParsed.version ||
        !metaParsed.description
      )
        return window.alert(
          formatErrReport(
            plugin.authorId,
            "LL.Runtime.Precheck",
            "The library, defined as " +
              name +
              ", does not have valid metadata."
          )
        );
      window.localStorage.setItem(
        "bb_plugins",
        JSON.stringify([
          ...plugins,
          {
            name: metaParsed.name,
            authorId: metaParsed.authorId,
            version: metaParsed.version,
            description: metaParsed.description,
            code: code.replace(/@lib.get\((.*)\)/g, 'window.$1').replace(/@lib.export\((.*), (.*)\)/g, 'if (!window["'+plugin.name+'"]) window["'+plugin.name+'"] = {}; window["'+plugin.name+'"]["$1"] = $2;')
                .replace(/\/\/(.*)\n/g, "")
                .replace(/\/\*((.|\n)*)\*\//g, ""),
            enabled: true,
            url: url,
          },
        ])
      );
      disableEval = false;
      window.location.reload();
    }
  }
});
