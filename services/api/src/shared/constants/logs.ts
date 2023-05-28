export const enum ExpressServer {
    SUCCESSFUL_START = 'Express server running.',
    ERROR_START = 'Error starting express server.',
}

export const enum WSServer {
    SUCCESSFUL_START = 'WS server running.',
    ERROR_START = 'Error starting WS server.',
}

export const enum Script {
    NOT_FOUND = 'Script not found.',
    SUCCESSFUL_START = 'Script running.',
    ERROR_START = 'Error starting Script.',
    SUCCESSFUL_STOP = 'Script stopped.',
    ERROR_STOP = 'Error stopping script.',
    EXECUTION_STOP = 'Error executing script.',
}
