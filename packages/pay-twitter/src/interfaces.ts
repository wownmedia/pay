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

export interface TwitterDirectMessage {
    type: string;
    id: string;
    created_timestamp: string;
    message_create: {
        target: {
            recipient_id: string;
        };
        sender_id: string;
        message_data: {
            text: string;
            entities: {
                hashtags: string[];
                symbols: string[];
                user_mentions: string[];
                urls: string[];
            };
        };
    };
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

export interface TwitterAPIRequestOptions extends TwitterOauthJSON {
    url?: string;
    uri?: string;
    method: string;
    auth?: {
        user: string;
        pass: string;
    };
    headers?: any;
    form?: any;
}

export interface TwitterAPIUserContext {
    userId: string;
    accessToken: string;
    accessTokenSecret: string;
}

export interface TwitterOauthJSON {
    json?: boolean;
    oauth?: {
        consumer_key: string;
        consumer_secret: string;
        token: string;
        token_secret: string;
        timestamp: string;
    };
}
