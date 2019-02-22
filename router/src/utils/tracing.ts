// tslint:disable-next-line: class-name
export abstract class tracing {

    public static LOG_LEVEL = "INFO";

    public static log(severity: string, message: string, details?: any) {
        // Invalid Log Level Configured --> Use INFO
        let level: string = this.LOG_LEVEL;
        if (!(this.logLevels[level])) {
            console.log("ERROR: Invalid Log Level \'%s\' set. Using default (\'INFO\').", level);
            level = "INFO";
        }

        // Invalid severity given in log call --> only log in DEBUG or higher, suppres otherwise
        // tslint:disable-next-line: no-string-literal
        if (!(this.logLevels[severity]) && this.logLevels[level] >= this.logLevels["DEBUG"]) {
            console.log("DEBUG: (ERROR) tracing.log call with invalid severity: %s", severity);
            console.log("DEBUG: (%s) %s", severity, message);
        }

        if (this.logLevels[level] >= this.logLevels[severity]) {
            console.log("%s: %s", severity, message);

            if (details) {
                console.log("%s: (DETAILS) Object:", severity);
                console.log(details);

                if (details.responseText) {
                    console.log("%s: (Response Text):", severity);
                    console.log(details.responseText);
                }

                if (details.stack) {
                    console.log("%s: (Stack Trace):", severity);
                    console.log(details.stack);
                }
            }
        }
    }

    // tslint:disable: object-literal-sort-keys
    private static logLevels: {[id: string]: number} = {
        CRITICAL: 1,
        ERROR: 2,
        WARNING: 3,
        INFO: 4,
        VERBOSE: 5,
        DEBUG: 6,
        SILLY: 7,
    };
    // tslint:enable: object-literal-sort-keys
}
