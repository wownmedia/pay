export interface TwitterConfig {
    admin: string;
    userId: string;
    environment: string;
    serverUrl: string;
    route: string;
    consumerKey: string;
    consumerSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    networks: string[];
    accountApiPort: number;
}

export interface TwitterKnownWebhooks {
    environments: TwitterEnvironments[];
}

export interface TwitterEnvironments {
    environment_name: string;
    webhooks: TwitterWebhooks[];
}

export interface TwitterWebhooks {
    id: string;
    url: string;
    valid: boolean;
    created_timestamp: string;
}
