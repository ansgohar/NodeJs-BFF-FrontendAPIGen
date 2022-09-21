const inputYML = 'utils/example.yml';
const yaml = require('js-yaml');
const fs = require('fs');

var routesDir = 'routes';
const routerTemplate = fs.readFileSync(`${__dirname}/utils/routerTemplate.txt`, { encoding: 'utf-8' });
const methodNameREGEXP = new RegExp(/"\*\*METHOD_NAME\*\*"/, 'g');
const pathREGEXP = new RegExp(/"\*\*PATH\*\*"/, 'g');
// const statusCodeREGEXP = new RegExp(/"\*\*STATUS_CODE\*\*"/, 'g');
const routersImportREGEXP = new RegExp(/"\*\*Routers_IMPORT\*\*"/, 'g');
const appUseREGEXP = new RegExp(/"\*\*APP_USE\*\*"/, 'g');



(() => {
    const convertedJson = convertYamlToJson();
    const paths = convertedJson.paths;
    generateRoutesFiles(paths);
    generateRoutes(paths);
})();

function convertYamlToJson() {
    return yaml.load(fs.readFileSync(inputYML, { encoding: 'utf-8' }));
}

function generateRoutesFiles(paths) {
    const keys = Object.keys(paths);
    const routesFilesSet = new Set();
    keys.forEach(k => routesFilesSet.add(k.split('/')[1]));
    const importsAndExports = "var express = require('express');\nvar router = express.Router();\nmodule.exports = router;\n\n"
    if (!fs.existsSync(routesDir)) {
        fs.mkdirSync(routesDir);
    }
    let routerImports = '';
    let appUseString = '';
    for (const item of routesFilesSet) {
        fs.writeFileSync(`routes/${item}.js`, importsAndExports);
        routerImports = routerImports.concat(`var ${item}Router = require('./routes/${item}');\n`)
        appUseString = appUseString.concat(`app.use('/${item}', ${item}Router);\n`)
    }
    //need input here
    // const appFile = fs.readFileSync(`${__dirname}/app.js`, { encoding: 'utf-8' }).replace(routersImportREGEXP, routerImports).replace(appUseREGEXP, appUseString);
    // fs.writeFileSync(`${__dirname}/app.js`, appFile);
    fs.appendFileSync(`${__dirname}/app.js`, `${routerImports}\n\n${appUseString}`);

}

function generateRoutes(paths) {
    for (const path in paths) {
        const pathNameArray = path.split('/');
        const routeFileName = pathNameArray[1];
        pathNameArray.splice(0, 2);
        let routePathName;
        if (pathNameArray.length == 0) {
            routePathName = '/';
        }
        else {
            routePathName = `/${pathNameArray.join('/')}`;
            routePathName = routePathName.replace('/{', '/:').replace('}', '');
        }
        for (const method in paths[path]) {
            const route = routerTemplate.replace(methodNameREGEXP, method).replace(pathREGEXP, routePathName);
            fs.appendFileSync(`routes/${routeFileName}.js`, route);
        }
    }
}