import { parse } from 'yaml';
import { readFile } from 'fs/promises';

export type Config = {
    userAgent: string;
    requestDelayMs: number;
    verbose: boolean;
}

type YamlConfig = {
    user_agent?: string;
    request_delay_ms?: number;
    verbose?: boolean;
}

const validateConfig = (config: YamlConfig): config is Required<YamlConfig> => {
    if (!config.user_agent) {
        throw new Error('Missing config.user_agent');
    }

    if (!config.request_delay_ms || isNaN(+config.request_delay_ms) || +config.request_delay_ms < 1) {
        throw new Error('Missing config.request_delay_ms');
    }

    if (config.verbose === undefined || config.verbose === null) {
        throw new Error('Missing config.verbose');
    }

    return true;
}

export const loadConfig = async (): Promise<Config> => {
    const contents = await readFile('config.yaml', 'utf-8');
    const yamlConfig = parse(contents) as YamlConfig;

    if (!validateConfig(yamlConfig)) {
        throw new Error()
    }

    return {
        userAgent: yamlConfig.user_agent,
        requestDelayMs: Number(yamlConfig.request_delay_ms),
        verbose: Boolean(yamlConfig.verbose),
    }
}

