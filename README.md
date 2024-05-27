# membership-drop

The list of addresses that will receive the $FU airdrop.

For the last Snapshot:

Get latest:
https://thegraph.com/hosted-service/subgraph/bowsernet/open-season-staging

Use the following query:

{
users(first: 1000, skip: 0, where:{ numTokens_gt: 0}) {
id
numTokens
}
}

There is a 1000 limit query so it needs to be done again until all 6,000 NFTs are populated.

Aggregate the results and extract the correct format here:
https://jsoneditoronline.org/#left=local.jidiwi&right=local.mevebi
