var mongodbUri = require('mongodb-uri');

export function getParameter(name:string, defaultValue?): string|boolean {
    var nameToSearch = '--'+name;
    for (var i = 0; i<process.argv.length; i++) {
        if (process.argv[i].indexOf(nameToSearch)==0) {
            var par = process.argv[i].substring(nameToSearch.length);
            //check if the parameter is only a flag
            if (par.length==0) return true;
            //otherwise, we can extract the argument
            if (par.indexOf('=')!=0) continue; //if the first char is not the =, then it isn't the parameter!
            par = par.substring(1);
            return par;
        }
    }
    if (typeof defaultValue !== 'undefined') return defaultValue;
    return false;
}


export function getDBParameter(name:string, defaultValue) {
    var obj = mongodbUri.parse(defaultValue);
    //different possibility:
    // complete url -> --<name>=....
    var p = getParameter(name);
    if (p) return p;

    // username -> --<name>-username=...
    p = getParameter(name+'-username');
    if (p) obj.username = p;

    // password -> --<name>-password=...
    p = getParameter(name+'-password');
    if (p) obj.password = p;

    // database -> --<name>-database=...
    p = getParameter(name+'-database');
    if (p) obj.database = p;

    // host -> --<name>-host=...
    p = getParameter(name+'-host');
    if (p) obj.hosts[0].host = p;

    // port -> --<name>-post=...
    p = getParameter(name+'-port');
    if (p) obj.hosts[0].port = p;

    return mongodbUri.format(obj);
}
