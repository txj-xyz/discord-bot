import 'dotenv/config';
import { Client, ClientOptions } from 'discord.js';
import { UtilityHandler, LoggingHandler, EventHandler, InteractionHandler } from './handlers';

export default interface Bot {
    color: number;
    util: UtilityHandler;
    quitting: boolean;
    location: string;
    logger: LoggingHandler;
    interactions: InteractionHandler;
    events: EventHandler;
    commandsRun: number;
    login(): Promise<string>;
    exit(): void;
}

export default class Bot extends Client implements Bot {
    constructor(options: ClientOptions) {
        super(options);
        this.color = 0x7e686c;
        this.commandsRun = 0;
        this.util = new UtilityHandler(this);
        this.quitting = false;
        this.location = process.cwd();
        this.logger = new LoggingHandler();
        this.interactions = new InteractionHandler(this).build();
        this.events = new EventHandler(this).build();
        ['beforeExit', 'SIGUSR1', 'SIGUSR2', 'SIGINT', 'SIGTERM'].map((event: string) => process.once(event, this.exit.bind(this)));
    }

    async login(): Promise<string> {
        await super.login(process.env.TOKEN);
        return this.constructor.name;
    }

    exit(): void {
        if (this.quitting) return;
        this.quitting = true;
        this.destroy();
    }
}
