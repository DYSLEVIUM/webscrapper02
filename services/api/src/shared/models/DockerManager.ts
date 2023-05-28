import Docker from 'dockerode';

export default class DockerManager {
    static readonly docker = new Docker({
        socketPath: '/var/run/docker.sock',
    });

    constructor() {
        return DockerManager;
    }
}
