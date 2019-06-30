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
