var pm2 = require('pm2');
var _ = require('lodash');
const cron = require("node-cron");
var SlackService = require('./services/slackService');
const config = require('./infrastructure/config');

const COOLING_PERIOD = 2 * 60 * 1000;
const APP_NAME = 'dfe-applications';
const envName = config.notifications.envName;

pm2.connect(function (err) {

    function scaleDown() {
        pm2.scale(APP_NAME, 2, (err, procs) => {
            if (err) {
                let msg = `${envName} - Error SCALING Application Instances to 2 instances, will try again`;
                SlackService.postMessage(msg);

                setTimeout(() => {
                    scaleDown();
                }, COOLING_PERIOD);
            } else {
                let msg = `${envName} - SCALED Application Instances to 2 instances`;
                SlackService.postMessage(msg);
            }
        });
    }

    function scaleUp() {
        pm2.scale(APP_NAME, '+2', (err, procs) => {
            if (err) {
                let msg = `${envName} - Error SCALING Application Instances to 4 instances. Will try again`;
                SlackService.postMessage(msg);

                setTimeout(() => {
                    scaleUp();
                }, COOLING_PERIOD);
            } else {
                let msg = `${envName} - SCALED Application Instances to 4 instances`;
                SlackService.postMessage(msg);

                setTimeout(() => {
                    scaleDown();
                }, COOLING_PERIOD);
            }
        });
    }

    function reloadCluster() {
        pm2.list((err, list) => {
            let instances = _.filter(list, (x) => {
                return x.name == APP_NAME;
            });

            if (instances.length <= 2) {
                scaleUp();
            }
        })
    }

    function monitorCluster() {
        cron.schedule("0 3 * * 1-5", () => {
            reloadCluster();
        });
    }

    if (err) {
        process.exit(2);
    }

    pm2.start({
        script: 'src/index.js',   // Script to be run DFE Application 
        name: APP_NAME,
        exec_mode: 'cluster',
        instances: 2,
    }, (err, apps) => {
        if (err) {
            throw err;
        } else {
            monitorCluster();
        }
    });
});