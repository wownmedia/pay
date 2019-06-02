# ARK Pay

##About
ARK Pay is a service that (will) provide(s) a full 2nd layer payment system for ARK and bridgechains.

Currently ARK Pay is functional on Reddit, multiple platfarms are scheduled to be added in the near future.

##Installation / Configuration

-   Install the Reddit Listener from the NPMjs repository:
    `yarn global add @cryptology.hk/pay-reddit`

-   Copy the example configuration file `example.pay-config.json` to `~/.config/ark-pay/pay-config.json` and edit it to match your configuration.

-   Create a Postgresql database based on the `database.sql` file.

-   Add the `reddit-listener` to your path:

```
echo 'export PATH=$(yarn global bin):$PATH' >> ~/.bashrc
export PATH=$(yarn global bin):$PATH
```

-   Start the Reddit Listener with pm2: `pm2 start reddit-listener`

##Add a BridgeChain
You can add a BridgeChain by editing the configuration file.

add a BridgeChain to `arkEcosystem` in the configuration file as:

```$xslt
"token-name": {
          "networkVersion": xx,
          "minValue": 2000000,
          "transactionFee": 1000000,
          "epoch":"2019-05-24T11:48:58.165Z",
          "nodes": [{
              "host": "ip-of-node",
              "port": 4003
          }],
          "explorer": "https://your-explorer.com"
      }
```
