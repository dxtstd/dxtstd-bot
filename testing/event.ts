import { logger } from '../src/Utils/logger'

namespace WhatsApp {
    export type Listener = (...args: any[]) => void;
    export type ListenerArgs<L> = L extends Listener ? Parameters<L> : any[];
    export interface EventMap {
        [P: string]: Listener;
    }
    export interface ListenerObject {
        [P: string]: Listener[];
    }
}

export class Events<O extends {} = WhatsApp.EventMap> {
    public maxListenerSize: number = 250;
    public listeners: WhatsApp.ListenerObject = {};

    emit<K extends keyof O>(event: K, ...args: WhatsApp.ListenerArgs<O[K]>) {
        if (!this.listeners.hasOwnProperty(event)) return false;
        const listeners = this.listeners[event as string];
        if (!listeners.length) return false;
        for (let i = 0; i < listeners.length; i++) {
            (() => {
                    listeners[i](...args);
            })();
        }
        return true;
    }

    setMaxListeners(count: number) {
        if (count === -1) console.warn(
            `Regard:${process.pid}) Notice: You have set the count to \`-1\`, this is not recommended and can cause callstack errors.`,
        );

        this.maxListenerSize = count;
        return this;
    }

    on<K extends keyof O>(event: K, listener: O[K]) {
            const listeners = this.listeners?.[event as string] ?? [];
        if (
            this.maxListenerSize !== -1 &&
            listeners.length > this.maxListenerSize
        ) return logger.error(
            `Reached the maximum amount of listeners to append (event=)`,
        );

        listeners.push(listener as any);
        this.listeners[event as string] = listeners;

        return this;
    }

    once<K extends keyof O>(event: K, listener: O[K]) {
        const onceListener: any = (...args: any[]) => {
              (listener as any)(...args);
              return this.removeListener(event, onceListener);
        };

        return this.on(event, onceListener);
    }

    removeListener<K extends keyof O>(event: K, listener: O[K]) {
        if (!this.listeners.hasOwnProperty(event)) return false;

        const listeners = this.listeners[event as string];
        if (!listeners.length) return false;

        const index = listeners.indexOf(listener as any);
        if (index !== -1) listeners.splice(index, 1);

        this.listeners[event as string] = listeners;
        return true;
    }

    size<K extends keyof O>(event: K): number;
    size(): number;
    size(event?: string) {
        if (event !== undefined) {
        const listeners = this.listeners[event];
        if (!listeners) return 0
        if (!listeners.length) return 0;

        return listeners.length;
    }

        return Object.keys(this.listeners).length;
    }

    removeAllListeners() {
        this.listeners = {};
        return this;
    }

    addListener<K extends keyof O>(event: K, listener: O[K]) {
        return this.on(event, listener);
    }
}