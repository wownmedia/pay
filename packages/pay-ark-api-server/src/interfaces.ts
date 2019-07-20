export interface Webhook {
    id: string;
    target: string;
}

export interface WebhookToken {
    token32: string;
    token64: string;
}

export interface WebhookConfig {
    id: string;
    event: string;
    target: string;
    token: string;
    enabled: boolean;
    conditions?: any;
}
