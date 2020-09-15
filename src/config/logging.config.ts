


import { Configuration, configure, getLogger, addLayout } from "log4js";
import * as config from "config";


addLayout('logstash', function (logConfig) {
  return function (logEvent) {
    return `[${logEvent.level.levelStr}] [${config.get('app.service_id')}] ${logEvent.categoryName} - ${logEvent.data[0]}`
  }
});

const logConfig: Configuration = {
  appenders: config.get('log4js.appenders'),
  categories: config.get('log4js.categories')
}

configure(logConfig);
export const logger = getLogger();

logger.level = config.get('app.log_level');
